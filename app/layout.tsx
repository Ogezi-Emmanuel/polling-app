import './globals.css';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type CookieOptions } from '@supabase/ssr';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'Polling App',
  description: 'A simple polling application built with Next.js and Supabase',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {


  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  const { data: { user: session } } = await supabase.auth.getUser();

  // Extract only serializable data to pass to client components
  const serializableSession = session ? {
    id: session.id,
    email: session.email,
    // Add other serializable properties as needed
  } : null;

  return (
    <html lang="en">
      <body className="bg-blue-100">
        <Header session={serializableSession?.email ? { id: serializableSession.id, email: serializableSession.email } : null} />
        {children}
      </body>
    </html>
  );
}
