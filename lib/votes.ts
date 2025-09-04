'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { rateLimit, getUserIdentifier, RATE_LIMIT_CONFIGS } from './rate-limit';
import { voteSchema } from './validation';
import { ValidationError, RateLimitError, DatabaseError, createErrorResponse } from './errors';
import { VotesService } from '@/lib/services/votes';
import { getSupabaseClient } from '@/lib/supabase';

export async function submitVote(optionId: string, pollId: string) {
  // Validate input
  const validationResult = voteSchema.safeParse({ optionId, pollId });
  if (!validationResult.success) {
    return createErrorResponse(new ValidationError(validationResult.error.format()._errors[0] || 'Invalid input'));
  }

  // Check rate limit for voting
  const userIdentifier = await getUserIdentifier();
  const rateLimitResult = await rateLimit(userIdentifier, {
    max: 10,
    windowMs: 60 * 1000,
    message: 'Too many votes. Please try again later.'
  });
  
  if (!rateLimitResult.success) {
    return createErrorResponse(new RateLimitError(rateLimitResult.message));
  }

  const supabase = await getSupabaseClient('server');

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  console.log('User ID from submitVote:', user.id);

  // Check if the user has already voted for this poll
  const { data: existingVote, error: existingVoteError } = await supabase
    .from('votes')
    .select('*')
    .eq('poll_id', pollId)
    .eq('user_id', user.id)
    .single();

  if (existingVoteError && existingVoteError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking existing vote:', existingVoteError);
    return { error: 'Failed to check existing vote.' };
  }

  if (existingVote) {
    return { error: 'You have already voted in this poll.' };
  }

  // Insert the new vote using VotesService
  await VotesService.submitVote(optionId, pollId);

  revalidatePath(`/poll/${pollId}/results`);
  return { success: true };
}