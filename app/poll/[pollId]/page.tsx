import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

interface Option {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: Option[];
  user_id: string;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fetchPollAndUser(pollId: string, userId: string | null): Promise<{ poll: Poll | null; isOwner: boolean }> {
  const { data: pollData, error: pollError } = await supabase
    .from('polls')
    .select('*, options(*)')
    .eq('id', pollId)
    .single();

  if (pollError) {
    console.error('Error fetching poll:', pollError);
    return { poll: null, isOwner: false };
  }

  const isOwner = userId === pollData.user_id;
  return { poll: pollData, isOwner };
}

export default function PollPage({ params }: { params: { pollId: string } }) {
  const router = useRouter();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadPoll() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { poll: fetchedPoll, isOwner: fetchedIsOwner } = await fetchPollAndUser(params.pollId, user?.id || null);
      if (fetchedPoll) {
        setPoll(fetchedPoll);
        setIsOwner(fetchedIsOwner);
      } else {
        setError('Poll not found or an error occurred.');
      }
      setLoading(false);
    }
    loadPoll();
  }, [params.pollId]);

  const handleSubmitVote = async () => {
    if (!selectedOption || !poll) return;

    const { error } = await supabase.rpc('increment_vote', {
      option_id: selectedOption,
      poll_id: poll.id,
    });

    if (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote. Please try again.');
    } else {
      router.push(`/poll/${poll.id}/thank-you`);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading poll...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  if (!poll) {
    return <div className="flex justify-center items-center min-h-screen">Poll not found.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{poll.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''}>
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleSubmitVote} disabled={!selectedOption} className="w-full">
            Submit Vote
          </Button>
          {isOwner && (
            <Link href={`/poll/${poll.id}/share`} className="w-full">
              <Button variant="outline" className="w-full">
                Share Poll
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}