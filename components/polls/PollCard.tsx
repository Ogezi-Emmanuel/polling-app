'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    user_id: string;
    created_at: string;
  };
  onDelete: (pollId: string) => void;
}

export default function PollCard({ poll, onDelete }: PollCardProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      onDelete(poll.id);
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
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}