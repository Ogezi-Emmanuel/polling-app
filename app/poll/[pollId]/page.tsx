import { redirect } from 'next/navigation';
import { supabaseServerReadOnly } from '@/lib/supabase/server';
import { PollsService } from '@/lib/services/polls';
import { CommentsService } from '@/lib/services/comments';
import PollClientPage from './PollClientPage';

interface PollPageProps {
  params: { pollId: string };
}

export default async function PollPage({ params: { pollId } }: PollPageProps) {
  const supabase = await supabaseServerReadOnly();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const poll = await PollsService.getPollById(pollId);
  const comments = await CommentsService.getCommentsByPollId(pollId);

  if (!poll) {
    return <div className="flex justify-center items-center min-h-screen">Poll not found.</div>;
  }

  const isOwner = poll.user_id === user.id;

  return <PollClientPage poll={poll} comments={comments} userId={user.id} isOwner={isOwner} />;
}