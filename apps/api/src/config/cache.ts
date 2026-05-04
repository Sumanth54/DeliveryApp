import { createClient, type RedisClientType } from "redis";
import { env } from "./env.js";

type CacheEntry = {
  value: string;
  expiresAt: number | null;
};

const memoryStore = new Map<string, CacheEntry>();
let redisClient: RedisClientType | null = null;
let usingRedis = false;

function cleanupExpiredMemoryEntry(key: string) {
  const entry = memoryStore.get(key);

  if (entry && entry.expiresAt && entry.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  return entry;
}

export async function connectCache() {
  if (!env.redisUrl || redisClient) {
    return;
  }

  try {
    redisClient = createClient({
      url: env.redisUrl
    });

    redisClient.on("error", (error: Error) => {
      usingRedis = false;
      console.error("Redis connection error:", error.message);
    });

    await redisClient.connect();
    usingRedis = true;
    console.log("Redis cache connected.");
  } catch (error) {
    usingRedis = false;
    redisClient = null;
    console.warn("Falling back to in-memory cache because Redis is unavailable.");
    console.warn(error);
  }
}

export async function disconnectCache() {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }

  usingRedis = false;
  memoryStore.clear();
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (usingRedis && redisClient) {
    const cached = await redisClient.get(key);
    return cached ? (JSON.parse(cached) as T) : null;
  }

  const entry = cleanupExpiredMemoryEntry(key);
  return entry ? (JSON.parse(entry.value) as T) : null;
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 60) {
  const serialized = JSON.stringify(value);

  if (usingRedis && redisClient) {
    await redisClient.set(key, serialized, {
      EX: ttlSeconds
    });
    return;
  }

  memoryStore.set(key, {
    value: serialized,
    expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null
  });
}

export async function deleteCacheByPrefix(prefix: string) {
  if (usingRedis && redisClient) {
    const keys = await redisClient.keys(`${prefix}*`);

    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    return;
  }

  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}

export function getCacheHealth() {
  return {
    provider: usingRedis ? "redis" : "memory",
    ready: usingRedis || !env.redisUrl
  };
}
