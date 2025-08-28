import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import VoteForm from '../VoteForm';

export default async function PollPage({ params }: { params: { pollId: string } }) {
  const supabase = createServerComponentClient({ cookies });

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*, options(*)')
    .eq('id', params.pollId)
    .single();

  if (pollError || !poll) {
    console.error('Error fetching poll:', pollError);
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{poll.question}</h1>
      <VoteForm poll={poll} />
    </div>
  );
}