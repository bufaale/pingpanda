import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

/** General API: 60 req/min */
export function createApiLimiter() {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "rl:api",
  });
}

/** AI generation: 10 req/min (free), 60 req/min (paid) */
export function createAiLimiter(plan: string) {
  const r = getRedis();
  if (!r) return null;
  const limit = plan === "free" || !plan ? 10 : 60;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(limit, "1 m"),
    prefix: `rl:ai:${plan === "free" ? "free" : "paid"}`,
  });
}

/** Auth endpoints: 5 req/min (brute force prevention) */
export function createAuthLimiter() {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    prefix: "rl:auth",
  });
}

/** Webhook endpoints: 100 req/min */
export function createWebhookLimiter() {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    prefix: "rl:webhook",
  });
}

/**
 * Apply rate limit. Returns error response if blocked, null if allowed.
 * Gracefully degrades if Redis is not configured.
 */
export async function applyRateLimit(
  identifier: string,
  limiter: Ratelimit | null,
): Promise<NextResponse | null> {
  if (!limiter) return null;

  const { success, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      },
    );
  }
  return null;
}
