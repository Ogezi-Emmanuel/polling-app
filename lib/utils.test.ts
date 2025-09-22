import { generateShareablePollUrl } from './utils';
import { describe, test, expect, vi, beforeEach, afterAll } from 'vitest';

describe('generateShareablePollUrl', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules(); // Most importantly - clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test('should generate a local URL if NEXT_PUBLIC_VERCEL_URL is not set', () => {
    process.env.NEXT_PUBLIC_VERCEL_URL = '';
    const pollId = 'test-poll-id';
    const url = generateShareablePollUrl(pollId);
    expect(url).toBe(`http://localhost:3000/poll/${pollId}`);
  });

  test('should generate a Vercel URL if NEXT_PUBLIC_VERCEL_URL is set', () => {
    process.env.NEXT_PUBLIC_VERCEL_URL = 'my-vercel-app.vercel.app';
    const pollId = 'test-poll-id';
    const url = generateShareablePollUrl(pollId);
    expect(url).toBe(`https://my-vercel-app.vercel.app/poll/${pollId}`);
  });
});