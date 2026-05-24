import { describe, expect, it, vi } from "vitest";

// Mock ~/env to prevent t3-env validation from crashing in the test environment
// (VIC_FUEL_CONSUMER_ID and VITE_LOGO_DEV_TOKEN are not available during tests)
vi.mock("~/env", () => ({
  env: {
    VIC_FUEL_CONSUMER_ID: "test-consumer-id",
    VITE_LOGO_DEV_TOKEN: "test-logo-token",
  },
}));

import { BRAND_DOMAIN_MAP, getBrandLogoUrl } from "./brandLogo.ts";

// Provide a stub token so env lookup doesn't fail in test environment
// The module tries import.meta.env which vitest makes available as {}
// We test structure rather than actual token value
describe("BRAND_DOMAIN_MAP", () => {
  it("has entries for major Australian fuel brands", () => {
    expect(BRAND_DOMAIN_MAP["BP"]).toBe("bp.com.au");
    expect(BRAND_DOMAIN_MAP["Ampol"]).toBe("ampol.com.au");
    expect(BRAND_DOMAIN_MAP["7-Eleven"]).toBe("7eleven.com");
  });
});

describe("getBrandLogoUrl", () => {
  it("returns null for an unknown brand", () => {
    expect(getBrandLogoUrl("UnknownBrand")).toBeUndefined();
  });

  it("returns a URL string for a known brand", () => {
    const url = getBrandLogoUrl("BP", 64);
    expect(url).not.toBeNull();
    expect(url).not.toBeUndefined();
    expect(url).toContain("bp.com.au");
    expect(url).toContain("size=64");
    expect(url).toMatch(/^https:\/\/img\.logo\.dev\//);
  });

  it("includes the correct size parameter", () => {
    const url = getBrandLogoUrl("Shell", 128);
    expect(url).toContain("size=128");
  });

  it("uses default size of 64 when no size is specified", () => {
    const url = getBrandLogoUrl("Ampol");
    expect(url).toContain("size=64");
  });
});
