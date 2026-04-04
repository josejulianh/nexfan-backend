import Redis from "ioredis";
import { config } from "../../config/env";

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  tls: config.redis.tls ? {} : undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", () => {});

export const cache = {
  get: <T>(key: string): Promise<T | null> =>
    redis.get(key).then((v) => (v ? JSON.parse(v) : null)),
  set: (key: string, value: unknown, ttlSeconds?: number) =>
    ttlSeconds
      ? redis.setex(key, ttlSeconds, JSON.stringify(value))
      : redis.set(key, JSON.stringify(value)),
  del: (...keys: string[]) => redis.del(...keys),
  incr: (key: string) => redis.incr(key),
  expire: (key: string, ttl: number) => redis.expire(key, ttl),
};
