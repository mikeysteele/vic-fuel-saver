import { describe, expect, it, vi } from "vitest";
import { render } from "@solidjs/testing-library";
import { ThemeProvider, useTheme } from "./theme.tsx";

vi.mock("../server/theme.ts", () => ({
  setThemeCookie: vi.fn(),
}));

describe("ThemeProvider", () => {
  it("should provide initial theme", () => {
    let currentTheme = "";
    const TestComponent = () => {
      const { theme } = useTheme();
      currentTheme = theme();
      return <div>Test</div>;
    };
    render(() => (
      <ThemeProvider initialTheme="light">
        <TestComponent />
      </ThemeProvider>
    ));
    expect(currentTheme).toBe("light");
  });
});
