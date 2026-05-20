import Redis from "ioredis";
import "dotenv/config";

// Note: Ensure your REDIS_URI uses rediss:// if you are using Upstash/Redis Cloud for TLS.
const redisUri = process.env.REDIS_URI || "";

// If the password contains special characters like @, they might need URL encoding (%40)
export const redis = new Redis(redisUri, {
  connectTimeout: 5000, // 5 seconds timeout
  maxRetriesPerRequest: 1, // Don't hang requests if connection fails
  retryStrategy(times) {
    if (times > 3) {
      console.error("Redis retry limit reached. Disabling Redis.");
      return null; // Stop retrying
    }
    return Math.min(times * 100, 2000);
  }
});

redis.on("connect", () => {
  console.log("Redis connected successfully!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message || err);
});

/**
 * Generic caching utility
 * @param {string} key - The Redis key
 * @param {number} ttl - Time to live in seconds
 * @param {function} fetcher - Async function to fetch data if cache misses
 */
export const getOrSetCache = async (key, ttl, fetcher) => {
  try {
    // If Redis is not connected, gracefully fallback to DB immediately
    if (redis.status !== "ready") {
      return await fetcher();
    }

    const cachedData = await redis.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const freshData = await fetcher();
    if (freshData) {
      await redis.set(key, JSON.stringify(freshData), "EX", ttl);
    }
    return freshData;
  } catch (error) {
    console.error(`Redis Cache Error on key ${key}:`, error);
    // Fallback to fetching directly if Redis fails
    return await fetcher();
  }
};

/**
 * Helper to delete a key from Redis
 * @param {string} key - The Redis key to delete
 */
export const invalidateCache = async (key) => {
  try {
    if (redis.status !== "ready") return;
    await redis.del(key);
  } catch (error) {
    console.error(`Redis Invalidation Error on key ${key}:`, error.message || error);
  }
};
