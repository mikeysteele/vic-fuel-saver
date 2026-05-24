import { render, fireEvent, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal.tsx";

describe("Modal", () => {
  it("does not render when isOpen is false", () => {
    const { container } = render(() => (
      <Modal isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    ));
    expect(container.innerHTML).toBe(""); // Portal is not rendered
  });

  it("renders when isOpen is true", () => {
    render(() => (
      <Modal isOpen onClose={() => {}} title="Test Title">
        <div>Test Content</div>
      </Modal>
    ));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    render(() => (
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>
    ));
    const backdrop = document.querySelector('[aria-hidden="true"]');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(() => (
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>
    ));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(() => (
      <Modal isOpen onClose={onClose} title="Test Title">
        <div>Content</div>
      </Modal>
    ));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders close button without title and handles click", () => {
    const onClose = vi.fn();
    render(() => (
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>
    ));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when other keys are pressed", () => {
    const onClose = vi.fn();
    render(() => (
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>
    ));
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("adds and removes overflow hidden on body", () => {
    const { unmount } = render(() => (
      <Modal isOpen onClose={() => {}}>
        <div>Content</div>
      </Modal>
    ));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
