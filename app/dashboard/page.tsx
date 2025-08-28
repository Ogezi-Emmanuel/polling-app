import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome to Your Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-4">Hello, {data.user.email}!</p>
          <p className="text-md text-gray-700 mb-6">
            This is your personalized dashboard. Here you can manage your polls and view results.
          </p>
          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/create-poll">Create New Poll</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/my-polls">View My Polls</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/profile">Manage Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}