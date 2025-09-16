import { supabaseServerReadOnly } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PollCard from '@/components/polls/PollCard';

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  user_id: string;
  created_at: string;
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = await supabaseServerReadOnly();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: polls, error } = await supabase
    .from('polls')
    .select(`
      id,
      question,
      user_id,
      created_at,
      options ( id, text )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching polls:', error);
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error loading polls.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls?.map((poll: Poll) => (
          <PollCard key={poll.id} poll={poll} />
        ))}
      </div>
      {polls?.length === 0 && (
        <p className="mt-8 text-xl">You haven't created any polls yet. Create one to get started!</p>
      )}
    </div>
  );
}