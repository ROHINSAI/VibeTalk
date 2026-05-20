import Redis from "ioredis";
import "dotenv/config";

// Note: Ensure your REDIS_URI uses rediss:// if you are using Upstash/Redis Cloud for TLS.
const redisUri = process.env.REDIS_URI || "";

// If the password contains special characters like @, they might need URL encoding (%40)
export const redis = new Redis(redisUri);

redis.on("connect", () => {
  console.log("Redis connected successfully!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

/**
 * Generic caching utility
 * @param {string} key - The Redis key
 * @param {number} ttl - Time to live in seconds
 * @param {function} fetcher - Async function to fetch data if cache misses
 */
export const getOrSetCache = async (key, ttl, fetcher) => {
  try {
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
    await redis.del(key);
  } catch (error) {
    console.error(`Redis Invalidation Error on key ${key}:`, error);
  }
};
