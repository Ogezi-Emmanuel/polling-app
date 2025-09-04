import { getSupabaseClient } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';

export class VotesService {
  static async submitVote(optionId: string, pollId: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient();
      
      const { error } = await supabase
        .from('votes')
        .insert({ option_id: optionId, poll_id: pollId });

      if (error) {
        throw new DatabaseError('Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw new DatabaseError('Failed to submit vote');
    }
  }

  static async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseClient();
      
      const { data: options } = await supabase
        .from('poll_options')
        .select('id')
        .eq('poll_id', pollId);

      if (!options || options.length === 0) {
        return false;
      }

      const optionIds = options.map(option => option.id);
      
      const { data: vote, error } = await supabase
        .from('votes')
        .select('*')
        .in('option_id', optionIds)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        throw new DatabaseError('Failed to check user vote');
      }

      return !!vote;
    } catch (error) {
      console.error('Error checking user vote:', error);
      throw new DatabaseError('Failed to check user vote');
    }
  }

  static async getVoteCountsForPoll(pollId: string): Promise<Record<string, number>> {
    try {
      const supabase = await getSupabaseClient();
      
      const { data: options, error: optionsError } = await supabase
        .from('poll_options')
        .select('id')
        .eq('poll_id', pollId);

      if (optionsError) {
        throw new DatabaseError('Failed to fetch poll options');
      }

      if (!options || options.length === 0) {
        return {};
      }

      const voteCounts: Record<string, number> = {};
      
      for (const option of options) {
        const { count, error: voteError } = await supabase
          .from('votes')
          .select('*', { count: 'exact' })
          .eq('option_id', option.id);

        if (voteError) {
          throw new DatabaseError('Failed to fetch vote counts');
        }

        voteCounts[option.id] = count || 0;
      }

      return voteCounts;
    } catch (error) {
      console.error('Error fetching vote counts:', error);
      throw new DatabaseError('Failed to fetch vote counts');
    }
  }
}