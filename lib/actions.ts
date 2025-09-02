'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

export async function submitVote(optionId: string, pollId: string) {
  const supabase = await supabaseServer();

  const { error } = await supabase
    .from('votes')
    .insert({ option_id: optionId, poll_id: pollId });

  if (error) {
    console.error('Error casting vote:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/poll/${pollId}/results`);
  return { success: true };
}