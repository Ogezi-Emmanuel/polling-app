import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PollCard from '@/components/polls/PollCard';

export default async function MyPollsPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: polls, error } = await supabase
      .from('polls') // Added comment to force schema refresh
    .select(`
      id,
      question,
      options ( id, text, votes )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching polls:', error);
    return <p>Error loading polls.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">My Polls</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {polls?.map((poll: any) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
}