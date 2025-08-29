import { revalidatePath } from 'next/cache';
import PollCard from '@/components/polls/PollCard';
import { createServerClient, CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MyPollsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
         getAll: () => cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value })),
         setAll: (cookiesToSet: Array<{ name: string; value: string; options: any }>) => {
           cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
         },
       }
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: polls, error } = await supabase
    .from('polls')
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
          <PollCard key={poll.id} poll={poll} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

async function handleDelete(pollId: string) {
  'use server';
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
         getAll: () => cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value })),
         setAll: (cookiesToSet: Array<{ name: string; value: string; options: any }>) => {
           cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
         },
       }
    }
  );
  const { error: optionsError } = await supabase.from('options').delete().eq('poll_id', pollId);

  if (optionsError) {
    console.error('Error deleting options:', optionsError);
    return;
  }

  const { error } = await supabase.from('polls').delete().eq('id', pollId);

  if (error) {
    console.error('Error deleting poll:', error);
  } else {
    revalidatePath('/my-polls');
  }
}