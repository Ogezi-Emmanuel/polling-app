import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function supabaseServer() {
  const cookieStore = await cookies(); // await re-added
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie: any) => ({ name: cookie.name, value: cookie.value }))
        },
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return supabase
}

export async function supabaseServerReadOnly() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie: any) => ({ name: cookie.name, value: cookie.value }))
        },
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return supabase
}