import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getSupabaseClientAuto, CustomUser } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';

const commentSchema = z.object({
  pollId: z.string().uuid(),
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long'),
});

export async function submitComment(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await getSupabaseClientAuto();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const parsed = commentSchema.safeParse({
    pollId: formData.get('pollId'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { pollId, content } = parsed.data;

  const { error } = await supabase.from('comments').insert({
    poll_id: pollId,
    user_id: user.id,
    content,
  });

  if (error) {
    throw new DatabaseError('Failed to submit comment');
  }

  revalidatePath(`/poll/${pollId}`);
}

export async function deleteComment(commentId: string) {
  const supabase = await getSupabaseClientAuto();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id, poll_id')
    .eq('id', commentId)
    .single();

  if (fetchError || !comment) {
    throw new DatabaseError('Comment not found or failed to fetch');
  }

  // Check if the user is the owner of the comment or has an admin role
  if (user.id !== comment.user_id && (user as CustomUser).role !== 'admin') {
    throw new Error('Unauthorized to delete this comment');
  }

  const { error: deleteError } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (deleteError) {
    throw new DatabaseError('Failed to delete comment');
  }

  revalidatePath(`/poll/${comment.poll_id}`);
}