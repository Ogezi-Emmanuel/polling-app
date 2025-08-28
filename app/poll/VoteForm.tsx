'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function VoteForm({ poll }: { poll: any }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      alert('Please select an option to vote.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('votes')
      .insert({ option_id: selectedOption, poll_id: poll.id });

    if (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } else {
      alert('Vote submitted successfully!');
      router.refresh(); // Refresh to show updated results or redirect
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RadioGroup onValueChange={setSelectedOption} value={selectedOption || ''}>
        {poll.options.map((option: any) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id}>{option.text}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button type="submit" disabled={isSubmitting || !selectedOption}>
        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
      </Button>
    </form>
  );
}