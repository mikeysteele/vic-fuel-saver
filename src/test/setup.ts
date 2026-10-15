import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock scrollIntoView as JSDOM doesn't support it
if (typeof Element !== "undefined") {
  Element.prototype.scrollIntoView = vi.fn();
}
