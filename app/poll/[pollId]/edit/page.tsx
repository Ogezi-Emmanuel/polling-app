'use client';

import { createBrowserClient } from '@supabase/ssr';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter, useParams } from 'next/navigation';
// import { getSupabaseClient } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export default function EditPollPage() {
  const router = useRouter();
  const { pollId } = useParams<{ pollId: string }>();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [originalOptions, setOriginalOptions] = useState<PollOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  useEffect(() => {
    async function fetchPoll() {
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
        console.log('Fetched poll data:', data);
        setPoll(data);
        setOriginalOptions(data.options);
      }
      setLoading(false);
    }

    fetchPoll();
  }, [pollId]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (poll) {
      setPoll({ ...poll, question: e.target.value });
    }
  };

  const handleOptionChange = (id: string, newText: string) => {
    if (poll) {
      setPoll({
        ...poll,
        options: poll.options.map((option) =>
          option.id === id ? { ...option, text: newText } : option
        ),
      });
    }
  };

  const handleAddOption = () => {
    if (poll) {
      setPoll({
        ...poll,
        options: [...poll.options, { id: uuidv4(), text: '' }],
      });
    }
  };

  const handleRemoveOption = (id: string) => {
    if (poll) {
      setPoll({
        ...poll,
        options: poll.options.filter((option) => option.id !== id),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;

    setLoading(true);
    setError(null);

    // const { error: updatePollError } = await supabase
    //   .from('polls')
    //   .update({ question: poll.question })
    //   .eq('id', poll.id);

    // if (updatePollError) {
    //   console.error('Error updating poll question:', updatePollError);
    //   setError('Failed to update poll question.');
    //   setLoading(false);
    //   return;
    // }

    // // First, upsert all current options
    // for (const option of poll.options) {
    //   const { error: upsertOptionError } = await supabase
    //     .from('options')
    //     .upsert({ id: option.id, text: option.text, poll_id: poll.id }, { onConflict: 'id' });

    //   if (upsertOptionError) {
    //     console.error('Error upserting option:', upsertOptionError);
    //     setError(`Failed to update option ${option.text}.`);
    //     setLoading(false);
    //     return;
    //   }
    // }

    // // Then, delete any options that were removed
    // const removedOptions = originalOptions.filter(
    //   originalOption => !poll.options.some(option => option.id === originalOption.id)
    // );

    // for (const option of removedOptions) {
    //   const { error: deleteError } = await supabase
    //     .from('options')
    //     .delete()
    //     .eq('id', option.id);

    //   if (deleteError) {
    //     console.error('Error deleting removed option:', deleteError);
    //     setError(`Failed to delete removed option ${option.text}.`);
    //     setLoading(false);
    //     return;
    //   }
    // }

    setLoading(false);
    router.push('/my-polls');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading poll...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!poll) {
    return <div className="flex justify-center items-center min-h-screen">Poll not found.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Edit Poll</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <Label htmlFor="question">Poll Question</Label>
          <Input
            id="question"
            type="text"
            value={poll.question}
            onChange={handleQuestionChange}
            required
          />
        </div>
        <div className="mb-4">
          <Label>Options</Label>
          {poll.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2 mb-2">
              <Input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                required
              />
              <Button type="button" variant="destructive" onClick={() => handleRemoveOption(option.id)}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={handleAddOption} className="mt-2">
            Add Option
          </Button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}