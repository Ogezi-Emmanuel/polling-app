import { createClient } from '@supabase/supabase-js';
import { submitVote } from './votes';
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { loadEnvConfig } from '@next/env';

// Load environment variables directly in the test file
loadEnvConfig(process.cwd());

// Environment variables for the test database
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase environment variables are not loaded');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

describe('submitVote (Integration)', () => {
  let pollId: string;
  let optionId: number;

  beforeAll(async () => {
    // Clean up any existing test data
    await supabase.from('votes').delete().neq('id', '0');
    await supabase.from('options').delete().neq('id', '0');
    await supabase.from('polls').delete().neq('id', '0');

    // Create a mock poll
    const { data: poll, error: pollError } = await supabase.from('polls').insert({
      question: 'Integration Test Poll',
    }).select().single();

    if (pollError) throw pollError;
    pollId = poll.id;

    // Create a mock option for the poll
    const { data: option, error: optionError } = await supabase
      .from('options')
      .insert({ poll_id: pollId, text: 'Option 1' })
      .select()
      .single();

    if (optionError) throw optionError;
    optionId = option.id;
  });

  afterAll(async () => {
    // Clean up test data after all tests are done
    await supabase.from('votes').delete().neq('id', '0');
    await supabase.from('options').delete().neq('id', '0');
    await supabase.from('polls').delete().neq('id', '0');
  });

  beforeEach(async () => {
    // Clear votes before each test to ensure a clean state
    await supabase.from('votes').delete().neq('id', '0');
  });

  test('should successfully insert a new vote into the database', async () => {
    // Mock the createServerActionClient to properly handle the row-level security policy
    vi.mock('@supabase/auth-helpers-nextjs', async () => {
      const actual = await vi.importActual('@supabase/auth-helpers-nextjs');
      return {
        ...actual,
        createServerActionClient: vi.fn(() => ({
          auth: {
            getUser: async () => ({ data: { user: { id: 'a0e2b8c4-9d1e-4f7a-8b0c-1d2e3f4a5b6c' } }, error: null }),
          },
          from: (tableName: string) => supabase.from(tableName),
        })),
      };
    });

    const result = await submitVote(optionId.toString(), pollId);

    expect(result).toEqual({ success: true });

    // Verify the vote was inserted into the database using service role client to bypass RLS
    const serviceRoleClient = createClient(
      SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
    );
    const { data: votes, error } = await serviceRoleClient.from('votes').select('*').eq('option_id', optionId).eq('poll_id', pollId).eq('user_id', 'a0e2b8c4-9d1e-4f7a-8b0c-1d2e3f4a5b6c');

    expect(error).toBeNull();
    expect(votes).toHaveLength(1);
    expect(votes![0].poll_id).toBe(pollId);
    expect(votes![0].option_id).toBe(optionId);
    expect(votes![0].user_id).toBe('a0e2b8c4-9d1e-4f7a-8b0c-1d2e3f4a5b6c');
  });
});