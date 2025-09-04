'use server';

import { getSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { rateLimit, getUserIdentifier, RATE_LIMIT_CONFIGS } from './rate-limit';
import { createPollSchema } from './validation';
import { ValidationError, RateLimitError, DatabaseError, createErrorResponse } from './errors';

export async function createPoll(question: string, options: string[], userId: string) {
  // Validate input
  const validationResult = createPollSchema.safeParse({ question, options, userId });
  if (!validationResult.success) {
    return createErrorResponse(new ValidationError(validationResult.error.format()._errors[0] || 'Invalid input'));
  }
  // Check rate limit for poll creation
  const userIdentifier = await getUserIdentifier();
  const rateLimitResult = await rateLimit(userIdentifier, RATE_LIMIT_CONFIGS.POLL_CREATION);
  
  if (!rateLimitResult.success) {
    return createErrorResponse(new RateLimitError(rateLimitResult.message));
  }

  const supabase = await getSupabaseClient('server');

  // Create the poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ question, user_id: userId })
    .select('id')
    .single();

  if (pollError) {
    console.error('Error creating poll:', pollError);
    return createErrorResponse(new DatabaseError('Failed to create poll'));
  }

  // Create the options
  const optionsToInsert = options.map((text) => ({
    poll_id: poll.id,
    text: text.trim(),
  }));

  const { error: optionsError } = await supabase
    .from('options')
    .insert(optionsToInsert);

  if (optionsError) {
    console.error('Error creating options:', optionsError);
    
    // Clean up the poll if options creation fails
    await supabase.from('polls').delete().eq('id', poll.id);
    
    return createErrorResponse(new DatabaseError('Failed to create poll options'));
  }

  revalidatePath('/my-polls');
  return { success: true, pollId: poll.id };
}