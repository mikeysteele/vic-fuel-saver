import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { AppOverlays } from "./AppOverlays.tsx";

describe("AppOverlays", () => {
  const defaultProps = {
    loading: () => false,
    error: () => null,
    refetch: vi.fn(),
  };

  it("shows loading spinner when loading is true", () => {
    render(() => <AppOverlays {...defaultProps} loading={() => true} />);
    expect(screen.getByText(/Scanning live prices/i)).toBeInTheDocument();
  });

  it("shows error message when error is provided", () => {
    const error = new Error("Failed to fetch");
    render(() => <AppOverlays {...defaultProps} error={() => error} />);

    expect(screen.getByText(/Connection Disturbed/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
  });

  it("calls refetch when 'Try Again' is clicked", () => {
    const refetch = vi.fn();
    const error = new Error("Error");
    render(() => (
      <AppOverlays
        {...defaultProps}
        error={() => error}
        refetch={refetch}
      />
    ));

    const button = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(button);

    expect(refetch).toHaveBeenCalled();
  });

  it("shows nothing when not loading and no error", () => {
    const { container } = render(() => <AppOverlays {...defaultProps} />);
    expect(container.firstChild).toBeNull();
  });
});
