import { beforeEach, describe, expect, it, vi } from "vitest";

// We need to test the MemoryCache directly — it's a private class so we test it
// by importing getCache() and using it with a clean state each test via module reset.
// Alternatively we duplicate the MemoryCache logic. We use isolation via vi.resetModules().

describe("MemoryCache", () => {
  let cache: Awaited<ReturnType<typeof import("./cache.ts").getCache>>;

  beforeEach(async () => {
    // Reset module so singleton is cleared between tests
    vi.resetModules();
    // Ensure we don't trigger CloudflareKV path
    const mod = await import("./cache.ts");
    cache = mod.getCache();
    // Reset the global singleton for the next test
    return () => {
      vi.resetModules();
    };
  });

  it("returns null for a key that was never set", async () => {
    const result = await cache.get("missing-key");
    expect(result).toBeNull();
  });

  it("returns the stored value after set", async () => {
    await cache.set("key1", { data: "hello" });
    const result = await cache.get<{ data: string }>("key1");
    expect(result).toEqual({ data: "hello" });
  });

  it("returns null after the TTL has expired", async () => {
    vi.useFakeTimers();
    await cache.set("expiring", "value", 1000); // 1 second TTL
    vi.advanceTimersByTime(1001);
    const result = await cache.get("expiring");
    expect(result).toBeNull();
    vi.useRealTimers();
  });

  it("returns value before TTL expires", async () => {
    vi.useFakeTimers();
    await cache.set("active", "here", 5000); // 5 second TTL
    vi.advanceTimersByTime(4999);
    const result = await cache.get("active");
    expect(result).toBe("here");
    vi.useRealTimers();
  });

  it("deletes a key", async () => {
    await cache.set("toDelete", "bye");
    await cache.delete("toDelete");
    const result = await cache.get("toDelete");
    expect(result).toBeNull();
  });

  it("storing null-ish TTL treats key as non-expiring", async () => {
    vi.useFakeTimers();
    await cache.set("forever", "value"); // no TTL
    vi.advanceTimersByTime(999999999);
    const result = await cache.get("forever");
    expect(result).toBe("value");
    vi.useRealTimers();
  });
});
