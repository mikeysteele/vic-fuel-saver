import { env } from "cloudflare:workers";

export interface CacheStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

class MemoryCache implements CacheStorage {
  private cache = new Map<string, { value: unknown; expiry: number | null }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return await item.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const expiry = ttlMs ? Date.now() + ttlMs : null;
    this.cache.set(key, { value, expiry });
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.cache.delete(key);
    return Promise.resolve();
  }
}

interface KVNamespace {
  get(key: string, type: "json"): Promise<unknown>;
  put(
    key: string,
    value: string,
    options?: Record<string, unknown>,
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

class CloudflareKVCache implements CacheStorage {
  private getKV(): KVNamespace | null {
    return env?.FUEL_CACHE_KV || globalThis.FUEL_CACHE_KV || null;
  }

  async get<T>(key: string): Promise<T | null> {
    const kv = this.getKV();
    if (!kv) {
      console.warn(
        "CloudflareKVCache: KV namespace not found. Falling back to returning null.",
      );
      return null;
    }

    try {
      const value = await kv.get(key, "json");
      return value as T | null;
    } catch (e) {
      console.error("CloudflareKVCache: Failed to get key", e);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const kv = this.getKV();
    if (!kv) {
      console.warn("CloudflareKVCache: KV namespace not found. Skipping set.");
      return;
    }

    try {
      const options: Record<string, unknown> = {};
      if (ttlMs) {
        options.expirationTtl = Math.max(60, Math.floor(ttlMs / 1000));
      }
      await kv.put(key, JSON.stringify(value), options);
    } catch (e) {
      console.error("CloudflareKVCache: Failed to set key", e);
    }
  }

  async delete(key: string): Promise<void> {
    const kv = this.getKV();
    if (kv) {
      try {
        await kv.delete(key);
      } catch (_e) {
        // Ignored
      }
    }
  }
}

// Singleton cache instance
let globalCache: CacheStorage | null = null;

export function getCache(): CacheStorage {
  if (!globalCache) {
    const hasCloudflareKV = !!(env?.FUEL_CACHE_KV || globalThis.FUEL_CACHE_KV);

    if (hasCloudflareKV) {
      console.log("Using CloudflareKVCache");
      globalCache = new CloudflareKVCache();
    } else {
      console.log("Using MemoryCache");
      globalCache = new MemoryCache();
    }
  }
  return globalCache;
}
