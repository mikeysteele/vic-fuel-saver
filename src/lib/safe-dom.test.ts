import { describe, expect, it, vi } from "vitest";
import { withDocument, withLocation, withWindow } from "./safe-dom.ts";

describe("safe-dom utilities", () => {
  describe("withDocument", () => {
    it("should call the callback if document is defined", () => {
      const cb = vi.fn();
      // In vitest/jsdom, document is defined by default
      withDocument(cb);
      expect(cb).toHaveBeenCalledWith(document);
    });

    it("should not call the callback if document is undefined", () => {
      const cb = vi.fn();
      const originalDocument = globalThis.document;
      // @ts-ignore: Deleting document to simulate environment without DOM
      delete (globalThis as Record<string, unknown>).document;

      try {
        withDocument(cb);
        expect(cb).not.toHaveBeenCalled();
      } finally {
        (globalThis as Record<string, unknown>).document = originalDocument;
      }
    });
  });

  describe("withWindow", () => {
    it("should call the callback if window is defined", () => {
      const cb = vi.fn();
      withWindow(cb);
      expect(cb).toHaveBeenCalledWith(window);
    });

    it("should not call the callback if window is undefined", () => {
      const cb = vi.fn();
      const originalWindow = globalThis.window;
      // @ts-ignore: Deleting window to simulate environment without DOM
      delete globalThis.window;

      try {
        withWindow(cb);
        expect(cb).not.toHaveBeenCalled();
      } finally {
        globalThis.window = originalWindow;
      }
    });
  });

  describe("withLocation", () => {
    it("should call the callback if location is defined", () => {
      const cb = vi.fn();
      withLocation(cb);
      expect(cb).toHaveBeenCalledWith(location);
    });

    it("should not call the callback if location is undefined", () => {
      const cb = vi.fn();
      const originalLocation = globalThis.location;
      // @ts-ignore: Deleting location to simulate environment without DOM
      delete globalThis.location;

      try {
        withLocation(cb);
        expect(cb).not.toHaveBeenCalled();
      } finally {
        globalThis.location = originalLocation;
      }
    });
  });
});
