import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreatePollForm from '@/components/polls/CreatePollForm';

export default async function CreatePollPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Create New Poll</h1>
      <CreatePollForm userId={user.id} />
    </div>
  );
}