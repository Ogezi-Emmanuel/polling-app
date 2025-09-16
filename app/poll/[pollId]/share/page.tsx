import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseServerReadOnly } from '@/lib/supabase/server';
import { SharePollCard } from '@/components/polls/SharePollCard';
import { generateShareablePollUrl } from '@/lib/utils';

interface SharePollPageProps {
  params: { pollId: string };
}

export default async function SharePollPage({ params: { pollId } }: SharePollPageProps) {
  const supabase = await supabaseServerReadOnly();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: poll, error } = await supabase
    .from('polls')
    .select('id, question, user_id')
    .eq('id', pollId)
    .single();

  if (error || !poll) {
    // Handle error or poll not found
    return <p>Error loading poll or poll not found.</p>;
  }

  if (poll.user_id !== user.id) {
    // Redirect or show error if user is not the owner of the poll
    redirect('/dashboard'); // Or a more specific unauthorized page
  }

  const shareUrl = generateShareablePollUrl(poll.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Share Your Poll</h1>
      <SharePollCard pollQuestion={poll.question} shareUrl={shareUrl} />
    </div>
  );
}