'use server';

import { revalidatePath } from 'next/cache';
import { deletePollSchema } from '@/lib/validation';
import { ValidationError, RateLimitError, DatabaseError } from '@/lib/errors';
import { rateLimit, getUserIdentifier } from '@/lib/rate-limit';
import { PollsService } from '@/lib/services/polls';
import { sendEmail, EmailError } from '@/lib/email';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';
import { z } from 'zod';
import { getSupabaseClientAuto } from '@/lib/supabase';
import { CustomUser } from '@/lib/supabase';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
});

export async function createPoll(
  question: string,
  options: string[],
  closingDate: string | null,
) {
  const supabase = await getSupabaseClientAuto();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip!);

  if (!success) {
    return { error: 'Rate limit exceeded' };
  }

  try {
    const poll = await PollsService.createPoll(question, options, user.id, closingDate);
    revalidatePath('/dashboard');
    return { success: true, pollId: poll.id };
  } catch (error) {
    console.error('Error creating poll:', error);
    return { error: 'Failed to create poll' };
  }
}

export async function deletePoll(pollId: string) {
  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip!);

  if (!success) {
    return { error: 'Rate limit exceeded' };
  }

  try {
    const supabase = await getSupabaseClientAuto();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Unauthorized' };
    }

    const poll = await PollsService.getPollById(pollId);

    if (!poll) {
      return { error: 'Poll not found' };
    }

    // Check if the user is the owner of the poll or has an admin role
    if (user.id !== poll.user_id && (user as CustomUser).role !== 'admin') {
      return { error: 'Unauthorized to delete this poll' };
    }

    await PollsService.deletePoll(pollId);
    revalidatePath('/dashboard');

    try {
      await sendEmail({
        to: poll.user_email as string,
        subject: `Your poll \'${poll.title}\' has been deleted`,
        from: process.env.EMAIL_FROM_ADDRESS as string,
        text: `Your poll \'${poll.title}\' has been deleted. You can create a new poll at ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        html: `<p>Your poll <strong>${poll.title}</strong> has been deleted.</p><p>You can create a new poll <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">here</a>.</p>`,
      });
    } catch (emailError) {
      if (emailError instanceof EmailError) {
        console.error('Failed to send email notification:', emailError.message);
      } else {
        console.error('An unexpected error occurred while sending email:', emailError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting poll:', error);
    return { error: 'Failed to delete poll' };
  }
}