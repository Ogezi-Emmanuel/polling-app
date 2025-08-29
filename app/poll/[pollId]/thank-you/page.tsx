'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function ThankYouPage() {
  const params = useParams();
  const pollId = params.pollId as string;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Thank you for voting!</h1>
      <Button onClick={() => window.location.href = `/poll/${pollId}/results`}>
        View Results
      </Button>
    </div>
  );
}