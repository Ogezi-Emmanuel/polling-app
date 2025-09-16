import './globals.css';
import { supabaseServerReadOnly } from '@/lib/supabase/server';
import Header from '@/components/layout/Header';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Polling App',
  description: 'A simple polling application built with Next.js and Supabase',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = await supabaseServerReadOnly();

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
