import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize clients from environment variables:
// UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
// See: https://console.upstash.com/ for values
const redis = Redis.fromEnv();

// 10 requests per minute per key (sliding window)
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 request per min
  analytics: true,
  prefix: "tx",
});
