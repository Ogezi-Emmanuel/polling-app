import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { submitVote, hasUserVoted, getVoteCountsForPoll } from "./services/votes";
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are not loaded');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let serviceRoleClient: SupabaseClient;

beforeAll(() => {
  serviceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
});

describe('submitVote (Integration)', () => {
  let pollId: string;
  let optionId: number;

  beforeAll(async () => {
    await serviceRoleClient.from('votes').delete().neq('id', '0');
    await serviceRoleClient.from('options').delete().neq('id', '0');
    await serviceRoleClient.from('polls').delete().neq('id', '0');

    const { data: poll, error: pollError } = await serviceRoleClient.from('polls').insert({
      question: 'Integration Test Poll',
    }).select().single();

    if (pollError) {
      throw pollError;
    }
    pollId = poll.id;

    const { data: option, error: optionError } = await serviceRoleClient
      .from('options')
      .insert({ poll_id: pollId, text: 'Option 1' })
      .select()
      .single();

    if (optionError) {
      throw optionError;
    }
    optionId = option.id;
  });

  afterAll(async () => {
    await serviceRoleClient.from('votes').delete().neq('id', '0');
    await serviceRoleClient.from('options').delete().neq('id', '0');
    await serviceRoleClient.from('polls').delete().neq('id', '0');
  });

  beforeEach(async () => {
    await serviceRoleClient.from('votes').delete().neq('id', '0');
  });

  test('should successfully insert a new vote into the database', async () => {
    // No need to mock createServerActionClient or getSupabaseClient here
    // as submitVote now handles user authentication internally.

    const result = await submitVote(optionId.toString(), pollId, 'dummy-user-id');

    expect(result).toEqual({ success: true });

    const { data: votes, error } = await serviceRoleClient.from('votes').select('*').eq('option_id', optionId).eq('poll_id', pollId);

    expect(error).toBeNull();
    expect(votes).toHaveLength(1);
    expect(votes![0].poll_id).toBe(pollId);
    expect(votes![0].option_id).toBe(optionId);
    // The user_id is now handled internally by submitVote, so we don't assert a specific ID here.
  });
});