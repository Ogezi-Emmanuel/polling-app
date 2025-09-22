import { createClient } from '@/lib/supabase/client';
import { TablesInsert } from '@/lib/database.types';

export async function submitVote(optionId: string, pollId: string, userId: string) {
  const supabase = createClient();

  const vote: TablesInsert<'votes'> = {
    option_id: optionId,
    poll_id: pollId,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('votes')
    .insert(vote)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Increment vote count for the option
  const { error: rpcError } = await supabase.rpc(
    'increment_vote_count' as 'increment_vote_count',
    { option_id: optionId }
  );

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  return data;
}

export async function hasUserVoted(pollId: string, userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw new Error(error.message);
  }

  return !!data;
}

export async function getVoteCountsForPoll(pollId: string): Promise<Record<string, number>> {
  const supabase = createClient();

  const { data: poll_options, error } = await supabase
    .from('poll_options')
    .select('id, votes')
    .eq('poll_id', pollId);

  if (error) {
    throw new Error(error.message);
  }

  const formattedVoteCounts = poll_options.reduce((acc: Record<string, number>, option) => {
    acc[option.id] = option.votes || 0;
    return acc;
  }, {} as Record<string, number>);

  return formattedVoteCounts;
}