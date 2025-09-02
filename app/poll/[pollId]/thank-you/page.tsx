import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ThankYouPage({ params }: { params: { pollId: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Thank You for Voting!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Your vote has been successfully recorded.</p>
          <Link href={`/poll/${params.pollId}/results`}>
            <Button>View Results</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}