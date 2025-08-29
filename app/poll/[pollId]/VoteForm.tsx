'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Option {
  id: string;
  text: string;
}

interface PollData {
  question: string;
  options: Option[];
}



export default function VoteForm({ poll, pollId }: { poll: PollData; pollId: string }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const router = useRouter();

  // In a real application, you would fetch poll data based on pollId


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption) {
      // In a real application, you would submit the vote to your backend
      console.log(`Voted for option: ${selectedOption} in poll: ${pollId}`);
      setHasVoted(true);
    }
  };

  if (hasVoted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h2 className="text-2xl font-bold mb-4">Thank you for voting!</h2>
        <button
          onClick={() => router.push('/my-polls')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to My Polls
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h2 className="text-4xl font-bold mb-8">{poll.question}</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
        <div className="space-y-4">
          {poll.options.map((option) => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                id={option.id}
                name="pollOption"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={option.id} className="ml-3 block text-lg font-medium text-gray-700">
                {option.text}
              </label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={!selectedOption}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit Vote
        </button>
      </form>
    </div>
  );
}