import './globals.css';
import { createServerClient } from '@supabase/ssr';
import { type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';


import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';

export const metadata = {
  title: 'Polling App',
  description: 'A simple polling application built with Next.js and Supabase',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {


  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get: async (name: string) => (await cookies()).get(name)?.value,
        set: async (name: string, value: string, options: CookieOptions) => {
          (await cookies()).set(name, value, options);
        },
        remove: async (name: string) => {
          (await cookies()).delete(name);
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Polling App</h1>
          <nav>
            {!session ? (
              <>
                <Link href="/login" className="mr-4 hover:text-gray-300">Login</Link>
                <Link href="/signup" className="hover:text-gray-300">Sign Up</Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="mr-4 hover:text-gray-300">Dashboard</Link>
                <Link href="/profile" className="mr-4 hover:text-gray-300">Profile</Link>
                <LogoutButton />
              </>
            )}
          </nav>
        </header>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
