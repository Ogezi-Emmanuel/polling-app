import { config } from "dotenv";
import { vi } from "vitest";

config({ path: ".env.test" });

console.log('NEXT_PUBLIC_SUPABASE_URL in vitest.setup.ts:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY in vitest.setup.ts:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY in vitest.setup.ts:', process.env.SUPABASE_SERVICE_ROLE_KEY);

// Mock the cookies function from next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name) => {
      if (name === "sb-access-token") {
        return {
          name: "sb-access-token",
          value: "mock-access-token",
        };
      }
      if (name === "sb-refresh-token") {
        return {
          name: "sb-refresh-token",
          value: "mock-refresh-token",
        };
      }
      return undefined;
    }),
  })),
}));