import { loadEnvConfig } from '@next/env';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

console.log('process.env in vitest.setup.ts:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// This is a workaround for a Vitest issue where process.env is not correctly populated
// when using loadEnvConfig in setupFiles.
// loadEnvConfig(process.cwd());
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Any global setup for tests can go here
});

afterAll(() => {
  // Any global teardown for tests can go here
});