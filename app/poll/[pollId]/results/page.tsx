import { unstable_noStore as noStore } from 'next/cache';

import { supabaseServerReadOnly } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cookies } from 'next/headers';

export const revalidate = 0;

export default async function PollResultsPage({ params }: { params: { pollId: string } }) {
  noStore();
  const cookieStore = cookies();
  const supabase = await supabaseServerReadOnly();

  const { data: poll } = await supabase
    .from('polls')
    .select('*, options(*)')
    .eq('id', params.pollId as string)
    .single();

  if (!poll) {
    redirect('/not-found');
  }

  const totalVotes = poll.options.reduce((sum: number, option: { votes: number }) => sum + option.votes, 0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{poll.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold mb-4">Results:</h3>
          {
            poll.options.map((option: { id: string; text: string; votes: number }) => (
              <div key={option.id} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-md">{option.text}</span>
                  <span className="text-md font-semibold">{option.votes} votes</span>
                </div>
                <Progress value={totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0} className="w-full" />
              </div>
            ))
          }
          <p className="text-center text-sm text-gray-500 mt-4">Total Votes: {totalVotes}</p>
        </CardContent>
      </Card>
    </div>
  );
}