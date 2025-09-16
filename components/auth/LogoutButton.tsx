'use client';

import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/actions/auth';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.error) {
      console.error("Logout failed:", result.error);
    } else {
      router.push('/'); // Redirect to home page after logout
      router.refresh();
    }
  };

  return (
    <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover" onClick={handleLogout}>
      Logout
    </button>
  );
}