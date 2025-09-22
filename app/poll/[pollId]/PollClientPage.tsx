'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import { PollWithOptions } from '@/lib/services/polls';
import { Comment } from '@/lib/services/comments';
import PollResultsChart from '@/components/polls/PollResultsChart';
import { submitVote } from '@/lib/votes'; // Import the server action

interface PollClientPageProps {
  poll: PollWithOptions;
  comments: Comment[];
  userId: string;
  isOwner: boolean;
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PollClientPage({
  poll: initialPoll,
  comments: initialComments,
  userId,
  isOwner,
}: PollClientPageProps) {
  const router = useRouter();
  const [poll, setPoll] = useState<PollWithOptions>(initialPoll);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmitVote = async () => {
    if (!selectedOption || !poll) return;

    const result = await submitVote(selectedOption, poll.id);

    if (result.success) {
      router.push(`/poll/${poll.id}/thank-you`);
    } else {
      console.error('Error submitting vote:', result.error);
      // Optionally, set a local error state to display a message to the user
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{poll.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''} aria-label="Poll options">
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={option.id} id={option.id} aria-labelledby={`option-label-${option.id}`} />
                <Label htmlFor={option.id} id={`option-label-${option.id}`}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleSubmitVote} disabled={!selectedOption} className="w-full" aria-label="Submit your vote">
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

      <div className="w-full max-w-md mt-8">
        <h2 className="text-xl font-bold mb-4">Poll Results</h2>
        <PollResultsChart pollId={poll.id} />
      </div>

      <div className="w-full max-w-md mt-8">
        <CommentList comments={comments} />
        <CommentForm pollId={poll.id} />
      </div>
    </div>
  );
}