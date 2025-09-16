'use server';

import { supabaseServerReadOnly } from '@/lib/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function signInWithPassword(values: z.infer<typeof loginSchema>) {
  const cookieStore = cookies();
  const supabase = await supabaseServerReadOnly();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user && !data.user.email_confirmed_at) {
    return { error: 'Please confirm your email address before logging in.' };
  }

  return { success: true };
}

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export async function signUp(values: z.infer<typeof signupSchema>) {
  const cookieStore = cookies();
  const supabase = await supabaseServerReadOnly();
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const cookieStore = cookies();
  const supabase = await supabaseServerReadOnly();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}