'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { rateLimit, getUserIdentifier, RATE_LIMIT_CONFIGS } from './rate-limit';
import { voteSchema } from './validation';
import { ValidationError, RateLimitError, DatabaseError, createErrorResponse } from './errors';
import { submitVote as votesServiceSubmitVote } from '@/lib/services/votes';
import { getSupabaseClient } from '@/lib/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _serviceRoleClient: SupabaseClient | null = null;

function getServiceRoleClient(): SupabaseClient {
  if (!_serviceRoleClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase service role environment variables are not set.');
    }
    _serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }
  return _serviceRoleClient;
}

export async function submitVote(optionId: string, pollId: string) {
  const serviceRoleClient = getServiceRoleClient();
  // Validate input
  const validationResult = voteSchema.safeParse({ optionId, pollId });
  if (!validationResult.success) {
    return { success: false, error: validationResult.error.issues[0].message };
  }

  // Check rate limit for voting
  const userIdentifier = await getUserIdentifier();
  const rateLimitResult = await rateLimit(userIdentifier, {
    max: 10,
    windowMs: 60 * 1000,
    message: 'Too many votes. Please try again later.'
  });
  
  if (!rateLimitResult.success) {
    return { success: false, error: rateLimitResult.message };
  }

  const supabase = await getSupabaseClient('server');

  const { data: { user } } = await supabase.auth.getUser();

  // Add a null check for user before accessing user.id
  if (!user || !user.id) {
    console.error('User or user ID is null/undefined.');
    return { success: false, error: 'User not authenticated.' };
  }

  // Check if the user has already voted for this poll using the service role client
  const { data: existingVote, error: existingVoteError } = await serviceRoleClient
    .from('votes')
    .select('*')
    .eq('poll_id', pollId)
    .eq('user_id', user.id)
    .single();

  if (existingVoteError && existingVoteError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking existing vote:', existingVoteError);
    return { success: false, error: 'Failed to check existing vote.' };
  }

  if (existingVote) {
    return { success: false, error: 'You have already voted in this poll.' };
  }

  // Insert the new vote using VotesService
  try {
    await votesServiceSubmitVote(optionId, pollId, user.id);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error submitting vote:', error.message, error.stack);
    } else {
      console.error('Unknown error submitting vote:', error);
    }
    return { success: false, error: 'Failed to submit vote.' };
  }

  revalidatePath(`/poll/${pollId}/results`);
  return { success: true };
}