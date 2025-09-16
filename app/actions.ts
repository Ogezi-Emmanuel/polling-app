'use server';

import { revalidatePath } from 'next/cache';
import { deletePollSchema } from '@/lib/validation';
import { ValidationError, RateLimitError, DatabaseError } from '@/lib/errors';
import { rateLimit, getUserIdentifier } from '@/lib/rate-limit';
import { PollsService } from '@/lib/services/polls';

// Helper function to get Supabase client with cookies, only called within server actions
async function getSupabaseServerClient() {
  const { createServerClient } = await import('@supabase/ssr');
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!, // Use SUPABASE_SECRET_KEY for server-side
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', options);
        },
      },
    }
  );
}

export async function deletePoll(pollId: string) {
  // Validate input
  const validationResult = deletePollSchema.safeParse({ pollId });
  if (!validationResult.success) {
    throw new ValidationError(validationResult.error.format()._errors[0] || 'Invalid input');
  }
  
  // Check rate limit for poll deletion
  const userIdentifier = await getUserIdentifier();
  const rateLimitResult = await rateLimit(userIdentifier, {
    max: 5,
    windowMs: 60 * 1000,
    message: 'Too many poll deletions. Please try again later.'
  });
  
  if (!rateLimitResult.success) {
    throw new RateLimitError(rateLimitResult.message);
  }

  const supabase = await getSupabaseServerClient(); // Use the helper function
  await PollsService.deletePoll(pollId);
  revalidatePath('/my-polls');
}