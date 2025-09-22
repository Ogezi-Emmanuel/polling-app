import { createClient } from '@supabase/supabase-js';
import { submitVote } from './votes';
import { Database } from '@/lib/database.types';
import { describe, beforeAll, afterEach, it, expect } from 'vitest';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe('submitVote', () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let supabaseServiceRole: ReturnType<typeof createClient<Database>>;

  beforeAll(async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables not loaded for integration tests.');
    }
    supabase = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          storage: {
            getItem: () => Promise.resolve(null),
            setItem: () => Promise.resolve(),
            removeItem: () => Promise.resolve(),
          },
        },
      }
    );
    supabaseServiceRole = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          storage: {
            getItem: () => Promise.resolve(null),
            setItem: () => Promise.resolve(),
            removeItem: () => Promise.resolve(),
          },
        },
      }
    );

    // Clear all votes before running tests
    await supabaseServiceRole.from('votes').delete().neq('id', '0');
  });

  afterEach(async () => {
    // Clear all votes after each test
    await supabaseServiceRole.from('votes').delete().neq('id', '0');
  });

  it('should insert a vote into the database', async () => {
    const userId = 'test-user-id';
    const pollOptionId = 'test-option-id';

    await submitVote(userId, pollOptionId);

    const { data, error } = await supabaseServiceRole
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .eq('option_id', pollOptionId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].user_id).toBe(userId);
    expect(data![0].option_id).toBe(pollOptionId);
  });
});