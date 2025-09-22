'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { deletePoll } from '@/app/actions';

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    user_id: string;
    created_at: string;
  };
}

export default function PollCard({ poll }: PollCardProps) {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      await deletePoll(poll.id);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
        <CardDescription>Created by: {poll.user_id}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Additional poll details can go here */}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/poll/${poll.id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
        <Button variant="destructive" onClick={handleDelete} aria-label={`Delete poll: ${poll.question}`}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}