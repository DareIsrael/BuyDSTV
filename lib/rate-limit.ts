import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

/**
 * MongoDB-backed rate limiter suitable for serverless/Vercel deployments.
 * Uses a `rate_limits` collection with a TTL index for automatic cleanup.
 */

const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, index: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

// Compound index for efficient lookups
RateLimitSchema.index({ key: 1, expiresAt: 1 });

const RateLimitModel =
  mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema);

interface RateLimitConfig {
  /** Unique prefix for this limiter (e.g., 'login', 'register') */
  prefix: string;
  /** Time window in seconds */
  windowSeconds: number;
  /** Max requests allowed in the window */
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

/**
 * Extract client IP from request headers (works on Vercel and standard proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

/**
 * Check and increment rate limit for a given identifier.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  await connectDB();

  const key = `${config.prefix}:${identifier}`;
  const now = new Date();
  const windowEnd = new Date(now.getTime() + config.windowSeconds * 1000);

  // Atomically find-and-increment, or create if doesn't exist
  const doc = await RateLimitModel.findOneAndUpdate(
    {
      key,
      expiresAt: { $gt: now }, // Only match non-expired entries
    },
    {
      $inc: { count: 1 },
    },
    {
      new: true,
      upsert: false,
    }
  );

  if (!doc) {
    // No active window — create a new one
    await RateLimitModel.create({
      key,
      count: 1,
      expiresAt: windowEnd,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
    };
  }

  if (doc.count > config.maxRequests) {
    const retryAfterSeconds = Math.ceil(
      (doc.expiresAt.getTime() - now.getTime()) / 1000
    );
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  return {
    allowed: true,
    remaining: Math.max(config.maxRequests - doc.count, 0),
  };
}

/**
 * Pre-configured rate limit configs for different endpoints.
 */
export const RATE_LIMITS = {
  login: { prefix: 'login', windowSeconds: 900, maxRequests: 10 },       // 10 per 15 min
  register: { prefix: 'register', windowSeconds: 3600, maxRequests: 5 }, // 5 per hour
  forgotPassword: { prefix: 'forgot-pwd', windowSeconds: 900, maxRequests: 3 }, // 3 per 15 min
  resetPassword: { prefix: 'reset-pwd', windowSeconds: 900, maxRequests: 5 },   // 5 per 15 min
  paymentInit: { prefix: 'pay-init', windowSeconds: 60, maxRequests: 5 },       // 5 per minute
  paymentVerify: { prefix: 'pay-verify', windowSeconds: 60, maxRequests: 10 },  // 10 per minute
  adminApi: { prefix: 'admin-api', windowSeconds: 60, maxRequests: 30 },        // 30 per minute
} as const;

/**
 * Helper: apply rate limiting to a request and return a Response if blocked, or null if allowed.
 */
export async function applyRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<Response | null> {
  const ip = getClientIp(request);
  const result = await checkRateLimit(ip, config);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfterSeconds: result.retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfterSeconds || 60),
        },
      }
    );
  }

  return null;
}
