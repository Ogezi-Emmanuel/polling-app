import { submitVote } from './votes';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';

// Mock the createServerActionClient function
vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerActionClient: vi.fn(),
}));

// Mock next/cache to prevent revalidatePath errors in tests
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('submitVote (Unit)', () => {
  const mockSupabase = {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    insert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the mock implementation
    (createServerActionClient as any).mockReturnValue(mockSupabase);
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    });
  });

  test('should successfully submit a vote when user is authenticated', async () => {
    const optionId = '1';
    const pollId = 'test-poll-id';

    // Mock the database operations
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);

    // Mock successful vote insertion
    mockSupabase.insert.mockResolvedValue({ error: null });

    const result = await submitVote(optionId, pollId);

    expect(result).toEqual({ success: true });
    expect(createServerActionClient).toHaveBeenCalled();
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('votes');
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      option_id: parseInt(optionId),
      poll_id: pollId,
      user_id: 'test-user-id',
    });
  });

  test('should return error when user is not authenticated', async () => {
    const optionId = '1';
    const pollId = 'test-poll-id';

    // Mock unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    });

    const result = await submitVote(optionId, pollId);

    expect(result).toEqual({ 
      success: false, 
      error: 'User not authenticated' 
    });
  });

  test('should return error when database insertion fails', async () => {
    const optionId = '1';
    const pollId = 'test-poll-id';

    // Mock database error
    mockSupabase.insert.mockResolvedValue({ 
      error: { message: 'Database error' } 
    });

    const result = await submitVote(optionId, pollId);

    expect(result).toEqual({ 
      success: false, 
      error: 'Failed to submit vote.' 
    });
  });

  test('should return error when optionId is invalid', async () => {
    const result = await submitVote('invalid', 'test-poll-id');

    expect(result).toEqual({ 
      success: false, 
      error: 'Invalid option ID' 
    });
  });
});