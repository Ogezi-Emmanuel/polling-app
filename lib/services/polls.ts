import { getSupabaseClient } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';
import { unstable_cache, revalidateTag } from 'next/cache';

export interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface PollOption {
  id: string;
  text: string;
  poll_id: string;
  created_at: string;
}

export interface PollWithVotes extends PollWithOptions {
  votes: number;
}

export class PollsService {
  static getPollById = unstable_cache(
    async (pollId: string): Promise<PollWithOptions | null> => {
      try {
        const supabase = await getSupabaseClient();
        
        const { data: poll, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('id', pollId)
          .single();

        if (pollError || !poll) {
          return null;
        }

        const { data: options, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .eq('poll_id', pollId)
          .order('created_at');

        if (optionsError) {
          throw new DatabaseError('Failed to fetch poll options');
        }

        return {
          ...poll,
          options: options || []
        };
      } catch (error) {
        console.error('Error fetching poll:', error);
        throw new DatabaseError('Failed to fetch poll');
      }
    },
    ['poll-by-id'],
    { revalidate: 60, tags: ['polls'] }
  );

  static getPollsByUserId = unstable_cache(
    async (userId: string, page: number = 1, pageSize: number = 10): Promise<{ polls: Poll[], totalCount: number }> => {
      try {
        const supabase = await getSupabaseClient();
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data: polls, error, count } = await supabase
          .from('polls')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          throw new DatabaseError('Failed to fetch user polls');
        }

        return {
          polls: polls || [],
          totalCount: count || 0
        };
      } catch (error) {
        console.error('Error fetching user polls:', error);
        throw new DatabaseError('Failed to fetch user polls');
      }
    },
    ['polls-by-user-id'],
    { revalidate: 30, tags: ['polls'] }
  );

  static async getPollWithVotes(pollId: string): Promise<PollWithVotes | null> {
    try {
      const supabase = await getSupabaseClient();
      
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError || !poll) {
        return null;
      }

      const { data: options, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('created_at');

      if (optionsError) {
        throw new DatabaseError('Failed to fetch poll options');
      }

      // Get vote counts for each option
      const optionsWithVotes = await Promise.all(
        (options || []).map(async (option) => {
          const { count, error: voteError } = await supabase
            .from('votes')
            .select('*', { count: 'exact' })
            .eq('option_id', option.id);

          if (voteError) {
            throw new DatabaseError('Failed to fetch vote counts');
          }

          return {
            ...option,
            votes: count || 0
          };
        })
      );

      return {
        ...poll,
        options: optionsWithVotes,
        votes: optionsWithVotes.reduce((total, option) => total + option.votes, 0)
      };
    } catch (error) {
      console.error('Error fetching poll with votes:', error);
      throw new DatabaseError('Failed to fetch poll with votes');
    }
  }

  static async deletePoll(pollId: string): Promise<void> {
    try {
      const supabase = await getSupabaseClient();
      
      // First delete votes
      const { error: votesError } = await supabase
        .from('votes')
        .delete()
        .eq('poll_id', pollId);

      if (votesError) {
        throw new DatabaseError('Failed to delete poll votes');
      }

      // Then delete options
      const { error: optionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', pollId);

      if (optionsError) {
        throw new DatabaseError('Failed to delete poll options');
      }

      // Finally delete the poll
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (pollError) {
        throw new DatabaseError('Failed to delete poll');
      }

      // Revalidate cache
      revalidateTag('polls');
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw new DatabaseError('Failed to delete poll');
    }
  }
}