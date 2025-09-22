'use server';

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User } from '@supabase/supabase-js'

export interface CustomUser extends User {
  role?: string;
}

export async function getSupabaseClient(context: 'client' | 'server' = 'client') {
  if (context === 'server') {
    const cookieStore = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((cookie: any) => ({ name: cookie.name, value: cookie.value }))
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        }
      }
    )
  }

  // Client context
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// Helper function to get the appropriate client based on execution context
export async function getSupabaseClientAuto() {
  // Check if we're in a server context by trying to access cookies
  try {
    const supabase = await getSupabaseClient('server');
    const { data: { user } } = await supabase.auth.getUser();
    return supabase;
  } catch {
    // If cookies() throws, we're in a client context
    return await getSupabaseClient('client');
  }
}