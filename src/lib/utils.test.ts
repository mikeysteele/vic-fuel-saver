import { describe, expect, it } from "vitest";
import { cn } from "./utils.ts";

describe("cn", () => {
  it("returns a single class string unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple classes", () => {
    expect(cn("text-red-500", "font-bold")).toBe("text-red-500 font-bold");
  });

  it("deduplicates conflicting Tailwind classes (last wins)", () => {
    // tailwind-merge should resolve text-red → text-blue
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("ignores falsy values", () => {
    expect(
      cn(
        "text-red-500",
        false,
        undefined,
        null as unknown as string,
        "font-bold",
      ),
    ).toBe(
      "text-red-500 font-bold",
    );
  });

  it("handles conditional classes via object syntax", () => {
    expect(cn({ "text-red-500": true, "font-bold": false })).toBe(
      "text-red-500",
    );
  });

  it("returns empty string when no args", () => {
    expect(cn()).toBe("");
  });

  it("merges p-4 and px-6 (more specific wins)", () => {
    // tailwind-merge: px-6 overrides the horizontal padding of p-4
    const result = cn("p-4", "px-6");
    expect(result).toBe("p-4 px-6");
  });
});
