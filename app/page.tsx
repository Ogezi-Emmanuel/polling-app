import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">Welcome to Polling App</h1>
      <p className="text-xl text-gray-700 mb-8 text-center max-w-2xl">
        Create, share, and participate in polls effortlessly. Get instant insights from your audience.
      </p>
      <div className="flex space-x-4">
        <Button asChild size="lg">
          <Link href="/signup">Get Started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}
