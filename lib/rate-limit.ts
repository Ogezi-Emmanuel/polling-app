import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests allowed in the window
  message?: string; // Custom error message
}

class RateLimiter {
  private static instance: RateLimiter;
  private requests: Map<string, { count: number; resetTime: number }>;

  private constructor() {
    this.requests = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public async checkRateLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / config.windowMs)}`;

    const current = this.requests.get(key);

    if (!current || now > current.resetTime) {
      // New time window or expired window
      this.requests.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { allowed: true, remaining: config.max - 1, resetTime: now + config.windowMs };
    }

    if (current.count >= config.max) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime };
    }

    // Increment count
    current.count++;
    this.requests.set(key, current);

    return {
      allowed: true,
      remaining: config.max - current.count,
      resetTime: current.resetTime,
    };
  }

  public cleanup() {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; message?: string; remaining?: number; resetTime?: number }> {
  const limiter = RateLimiter.getInstance();
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    limiter.cleanup();
  }

  const result = await limiter.checkRateLimit(identifier, config);

  if (!result.allowed) {
    return {
      success: false,
      message: config.message || 'Rate limit exceeded. Please try again later.',
      remaining: result.remaining,
      resetTime: result.resetTime,
    };
  }

  return { success: true, remaining: result.remaining, resetTime: result.resetTime };
}

// Helper function to get user identifier for rate limiting
export async function getUserIdentifier(): Promise<string> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('sb-access-token')
    return sessionCookie?.value || 'anonymous'
  } catch {
    return 'anonymous'
  }
}

// Pre-configured rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  VOTE: {
    max: 10,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Too many votes. Please try again later.'
  },
  POLL_CREATION: {
    max: 3,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Too many polls created. Please try again later.'
  },
  POLL_DELETION: {
    max: 5,
    windowMs: 60 * 1000, // 1 minute
    errorMessage: 'Too many poll deletions. Please try again later.'
  }
} as const;