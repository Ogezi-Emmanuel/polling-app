'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/lib/supabase';
import { submitVote } from '@/lib/votes';

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export default function PollPage({ params }: { params: { pollId: string } }) {
  const router = useRouter();
  const { pollId } = params;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const initSupabase = async () => {
      const client = await getSupabaseClient();
      setSupabase(client);
    };
    initSupabase();
  }, []);

  useEffect(() => {
    async function fetchPoll() {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          question,
          options ( id, text )
        `)
        .eq('id', pollId)
        .single();

      if (error) {
        console.error('Error fetching poll:', error);
        setError('Failed to load poll.');
      } else if (data) {
        setPoll(data);
      } else {
        setError('Poll not found.');
      }
      setLoading(false);
    }

    if (supabase) {
      fetchPoll();
    }
  }, [pollId, supabase]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading poll...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold">Poll Not Found</h1>
        <p className="mt-3 text-xl">The poll you are looking for does not exist.</p>
      </div>
    );
  }

  const handleVote = async () => {
    if (!selectedOption || !poll) return;

    const result = await submitVote(selectedOption, poll.id);
    const success = 'success' in result && result.success;
    const voteError = 'error' in result ? result.error : undefined;

    if (success) {
      router.push(`/poll/${poll.id}/thank-you`);
    } else {
      console.error('Error casting vote:', voteError);
      setError('Failed to cast vote.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">{poll.question}</h1>
      <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''} className="mb-4">
        {poll.options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id}>{option.text}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={handleVote} disabled={!selectedOption || loading}>
        {loading ? 'Voting...' : 'Vote'}
      </Button>
    </div>
  );
}