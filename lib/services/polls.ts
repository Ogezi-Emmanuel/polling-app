import { getSupabaseClientAuto } from '@/lib/supabase';
import { DatabaseError } from '@/lib/errors';
import { unstable_cache, revalidateTag } from 'next/cache';

export interface Poll {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  user_email?: string;
  title?: string;
  closing_date?: string | null;
}

export interface PollWithOptions extends Poll {
  options: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  votes: number;
}

export class PollsService {
  private static async getSupabase() {
    return await getSupabaseClientAuto();
  }

  static async createPoll(
    question: string,
    options: string[],
    userId: string,
    closingDate: string | null,
  ): Promise<Poll> {
    const supabase = await this.getSupabase();

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({ question, user_id: userId, closing_date: closingDate })
      .select()
      .single();

    if (pollError) {
      console.error('Error creating poll:', pollError);
      throw new DatabaseError('Failed to create poll.');
    }

    const optionsData = options.map((option) => ({
      poll_id: poll.id,
      text: option,
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optionsError) {
      console.error('Error creating poll options:', optionsError);
      throw new DatabaseError('Failed to create poll options.');
    }

    return poll;
  }

  static async getPollById(pollId: string): Promise<PollWithOptions | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('polls')
      .select(
        `
        *,
        users(email),
        options:poll_options(*)
        `,
      )
      .eq('id', pollId)
      .single();

    if (error) {
      console.error('Error fetching poll by ID:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const pollWithOptions: PollWithOptions = {
      ...data,
      options: data.options || [],
      user_email: data.users?.email || undefined,
      title: data.question,
      closing_date: data.closing_date, // Include closing_date
    };

    return pollWithOptions;
  }

  static async getPollsByUserId(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<{ polls: PollWithOptions[]; totalCount: number }> {
    const supabase = await this.getSupabase();
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data: polls, error: pollsError, count } = await supabase
      .from('polls')
      .select(
        `
        *,
        users(email),
        options:poll_options(*)
        `,
        { count: 'exact' },
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(start, end);

    if (pollsError) {
      console.error('Error fetching polls by user ID:', pollsError);
      throw new DatabaseError('Failed to fetch polls.');
    }

    const pollsWithOptions: PollWithOptions[] = polls.map((poll: any) => ({
      ...poll,
      options: poll.options || [],
      user_email: poll.users?.email || undefined,
      title: poll.question,
      closing_date: poll.closing_date,
    }));

    return { polls: pollsWithOptions, totalCount: count || 0 };
  }

  static async getPolls(page: number, pageSize: number): Promise<{ polls: PollWithOptions[]; totalCount: number }> {
    const supabase = await this.getSupabase();
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data: polls, error: pollsError, count } = await supabase
      .from('polls')
      .select(
        `
        *,
        users(email),
        options:poll_options(*)
        `,
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(start, end);

    if (pollsError) {
      console.error('Error fetching polls:', pollsError);
      throw new DatabaseError('Failed to fetch polls.');
    }

    const pollsWithOptions: PollWithOptions[] = polls.map((poll: any) => ({
      ...poll,
      options: poll.options || [],
      user_email: poll.users?.email || undefined,
      title: poll.question,
      closing_date: poll.closing_date,
    }));

    return { polls: pollsWithOptions, totalCount: count || 0 };
  }

  static async getLatestPolls(limit: number): Promise<PollWithOptions[]> {
    const supabase = await this.getSupabase();
    const { data: polls, error } = await supabase
      .from('polls')
      .select(
        `
        *,
        users(email),
        options:poll_options(*)
        `,
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching latest polls:', error);
      throw new DatabaseError('Failed to fetch latest polls.');
    }

    const pollsWithOptions: PollWithOptions[] = polls.map((poll: any) => ({
      ...poll,
      options: poll.options || [],
      user_email: poll.users?.email || undefined,
      title: poll.question,
      closing_date: poll.closing_date,
    }));

    return pollsWithOptions;
  }

  static async getPopularPolls(limit: number): Promise<PollWithOptions[]> {
    const supabase = await this.getSupabase();
    const { data: polls, error } = await supabase
      .from('polls')
      .select(
        `
        *,
        users(email),
        options:poll_options(*)
        `,
      )
      .order('total_votes', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular polls:', error);
      throw new DatabaseError('Failed to fetch popular polls.');
    }

    const pollsWithOptions: PollWithOptions[] = polls.map((poll: any) => ({
      ...poll,
      options: poll.options || [],
      user_email: poll.users?.email || undefined,
      title: poll.question,
      closing_date: poll.closing_date,
    }));

    return pollsWithOptions;
  }

  static async deletePoll(pollId: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.from('polls').delete().eq('id', pollId);

    if (error) {
      console.error('Error deleting poll:', error);
      throw new DatabaseError('Failed to delete poll.');
    }
  }

  static async incrementPollView(pollId: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase.rpc('increment_poll_view', { poll_id: pollId });

    if (error) {
      console.error('Error incrementing poll view:', error);
      throw new DatabaseError('Failed to increment poll view.');
    }
  }
}