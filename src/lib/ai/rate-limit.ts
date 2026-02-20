const rateLimit = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_FREE = 5;
const MAX_REQUESTS_PRO = 100;

export function checkRateLimit(
  userId: string,
  plan: string,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit =
    plan === "free" || !plan ? MAX_REQUESTS_FREE : MAX_REQUESTS_PRO;
  const key = `${userId}:ai`;

  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count };
}
