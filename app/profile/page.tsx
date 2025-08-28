import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <p className="text-lg mb-4">Welcome, {user.email}!</p>
      <LogoutButton />
    </div>
  );
}