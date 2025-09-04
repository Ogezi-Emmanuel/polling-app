'use client';

import { getSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = await getSupabaseClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover" onClick={handleLogout}>
      Logout
    </button>
  );
}