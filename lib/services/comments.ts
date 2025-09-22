import { getSupabaseClient } from '@/lib/supabase/index';
import { DatabaseError } from '@/lib/errors';
import { unstable_cache } from 'next/cache';

export interface Comment {
  id: string;
  poll_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_email?: string; // Optional, for displaying user info
}

export class CommentsService {
  static getCommentsByPollId = unstable_cache(
    async (pollId: string): Promise<Comment[]> => {
      try {
        const supabase = await getSupabaseClient();

        const { data: comments, error } = await supabase
          .from('comments')
          .select(`
            id,
            poll_id,
            user_id,
            content,
            created_at,
            users(email)
          `)
          .eq('poll_id', pollId)
          .order('created_at', { ascending: true });

        if (error) {
          throw new DatabaseError('Failed to fetch comments');
        }

        return comments.map(comment => ({
          ...comment,
          user_email: (comment.users as { email: string }[] | null)?.[0]?.email || 'Anonymous',
        })) as Comment[];
      } catch (error) {
        console.error('Error fetching comments:', error);
        throw new DatabaseError('Failed to fetch comments');
      }
    },
    ['comments-by-poll-id'],
    { revalidate: 60, tags: ['comments'] }
  );
}

