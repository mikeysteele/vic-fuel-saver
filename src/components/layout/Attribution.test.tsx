import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { Attribution } from "./Attribution.tsx";

describe("Attribution", () => {
  it("renders the Logo.dev link", () => {
    render(() => <Attribution />);
    const link = screen.getByRole("link", { name: /logo.dev/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://logo.dev");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
