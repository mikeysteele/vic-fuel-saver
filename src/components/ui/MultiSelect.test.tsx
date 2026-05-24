import { fireEvent, render, screen } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./MultiSelect.tsx";

const options = ["U91", "P95", "P98", "E10"];

describe("MultiSelect", () => {
  it("renders placeholder when nothing selected", () => {
    render(() => (
      <MultiSelect
        id="test-multiselect"
        options={options}
        selected={[]}
        onChange={() => {}}
        placeholder="All Fuel Types"
      />
    ));
    expect(screen.getByText("All Fuel Types")).toBeInTheDocument();
  });

  it("renders single selected value", () => {
    render(() => (
      <MultiSelect
        id="test-multiselect"
        options={options}
        selected={["U91"]}
        onChange={() => {}}
        placeholder="All Fuel Types"
      />
    ));
    expect(screen.getByText("U91")).toBeInTheDocument();
  });

  it("renders count label when multiple selected", () => {
    render(() => (
      <MultiSelect
        id="test-multiselect"
        options={options}
        selected={["U91", "P95"]}
        onChange={() => {}}
        placeholder="All Fuel Types"
      />
    ));
    expect(screen.getByText("2 Selected")).toBeInTheDocument();
  });

  it("opens dropdown on button click", () => {
    render(() => (
      <MultiSelect
        id="test-select"
        options={options}
        selected={[]}
        onChange={() => {}}
        placeholder="All Fuel Types"
      />
    ));
    const trigger = screen.getByRole("button", { name: /All Fuel Types/ });
    fireEvent.click(trigger);
    // All options should now be visible
    expect(screen.getByText("P95")).toBeInTheDocument();
    expect(screen.getByText("P98")).toBeInTheDocument();
  });

  it("calls onChange with newly selected option added", () => {
    const onChange = vi.fn();
    render(() => (
      <MultiSelect
        id="test-multiselect"
        options={options}
        selected={["U91"]}
        onChange={onChange}
        placeholder="All Fuel Types"
      />
    ));
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    // Find and click the P95 checkbox (index 1 in options array)
    const checkboxes = screen.getAllByRole("checkbox");
    const p95Index = options.indexOf("P95");
    fireEvent.click(checkboxes[p95Index]);
    expect(onChange).toHaveBeenCalledWith(["U91", "P95"]);
  });

  it("calls onChange with option removed when already selected", () => {
    const onChange = vi.fn();
    render(() => (
      <MultiSelect
        id="test-multiselect"
        options={options}
        selected={["U91", "P95"]}
        onChange={onChange}
        placeholder="All Fuel Types"
      />
    ));
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    const checkboxes = screen.getAllByRole("checkbox");
    // U91 is first (index 0) and currently selected — clicking it should remove it
    fireEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledWith(["P95"]);
  });

  it("calls onChange with empty array when Clear is clicked", () => {
    const onChange = vi.fn();
    render(() => (
      <MultiSelect
        id="test-multiselect"
        options={options}
        selected={["U91"]}
        onChange={onChange}
        placeholder="All Fuel Types"
      />
    ));
    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("renders labelMap display names", () => {
    const labelMap = { BP001: "BP", SHELL001: "Shell" };
    render(() => (
      <MultiSelect
        id="test-multiselect"
        options={["BP001"]}
        selected={["BP001"]}
        onChange={() => {}}
        labelMap={labelMap}
        placeholder="All Brands"
      />
    ));
    expect(screen.getByText("BP")).toBeInTheDocument();
  });
});
