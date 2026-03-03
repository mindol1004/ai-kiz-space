import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "../error-handler";

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const rateLimitCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 1000,
});

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest): { limit: number; remaining: number; reset: number } {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const currentKey = `${ip}:${windowStart}`;

    const record = rateLimitCache.get(currentKey);
    
    if (!record) {
      rateLimitCache.set(currentKey, { count: 1, resetTime: windowStart + config.windowMs });
      return { limit: config.limit, remaining: config.limit - 1, reset: windowStart + config.windowMs };
    }

    if (now > record.resetTime) {
      rateLimitCache.set(currentKey, { count: 1, resetTime: windowStart + config.windowMs });
      return { limit: config.limit, remaining: config.limit - 1, reset: windowStart + config.windowMs };
    }

    record.count++;
    const remaining = Math.max(0, config.limit - record.count);

    if (record.count > config.limit) {
      throw new AppError("요청 횟수가 초과되었습니다.", "RATE_LIMIT_EXCEEDED", 429);
    }

    return { limit: config.limit, remaining, reset: record.resetTime };
  };
}

export const authRateLimit = createRateLimit({ limit: 5, windowMs: 60 * 1000 });
export const registerRateLimit = createRateLimit({ limit: 3, windowMs: 60 * 60 * 1000 });
export const generalRateLimit = createRateLimit({ limit: 100, windowMs: 60 * 1000 });
export const searchRateLimit = createRateLimit({ limit: 30, windowMs: 60 * 1000 });
export const adminRateLimit = createRateLimit({ limit: 200, windowMs: 60 * 1000 });

export function withRateLimit(rateLimitFn: ReturnType<typeof createRateLimit>) {
  return function (handler: (request: NextRequest) => Promise<Response>): (request: NextRequest) => Promise<Response> {
    return async (request: NextRequest) => {
      const { limit, remaining, reset } = rateLimitFn(request);
      
      const response = await handler(request);
      
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining.toString());
      response.headers.set("X-RateLimit-Reset", reset.toString());
      
      return response;
    };
  };
}