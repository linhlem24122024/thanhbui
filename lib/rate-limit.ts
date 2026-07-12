import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Upstash Redis — bắt buộc cho rate limit trên serverless (RULE-09), KHÔNG dùng Map()/{} in-memory.
let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error("Thiếu UPSTASH_REDIS_REST_URL/TOKEN trong biến môi trường (.env.local).");
    }
    redis = new Redis({ url, token });
  }
  return redis;
}

const limiters: Record<string, Ratelimit> = {};

/**
 * Rate limit theo key (thường là `${scope}:${ip}` hoặc `${scope}:${phone}`).
 * Mặc định: tối đa `limit` request trong `windowSeconds` giây — RULE-08.
 */
export async function rateLimit(
  scope: string,
  identifier: string,
  limit = 5,
  windowSeconds = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `${scope}:${windowSeconds}:${limit}`;
  if (!limiters[key]) {
    limiters[key] = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `phk_ratelimit:${scope}`,
    });
  }
  const result = await limiters[key].limit(identifier);
  return { success: result.success, remaining: result.remaining };
}

export function getClientIp(headers: Headers): string {
  // Ưu tiên x-real-ip (do Vercel/platform tự set, khó bị client giả mạo)
  // x-forwarded-for do client gửi được → có thể bị giả để né rate limit
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Dự phòng: dùng x-forwarded-for nếu x-real-ip không có
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
