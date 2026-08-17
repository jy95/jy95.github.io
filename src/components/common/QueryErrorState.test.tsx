import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `translated:${key}`,
}));

import QueryErrorState from "./QueryErrorState";

describe("QueryErrorState", () => {
  it("renders the translated generic error message", () => {
    render(<QueryErrorState />);
    expect(screen.getByText("translated:generic")).toBeInTheDocument();
  });

  it("shows a retry button when onRetry is provided and calls it on click", () => {
    const onRetry = vi.fn();
    render(<QueryErrorState onRetry={onRetry} />);

    // Button should show the translated label
    const button = screen.getByRole("button", { name: "translated:retry" });
    expect(button).toBeInTheDocument();

    // Clicking the button calls the callback
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render a retry button when onRetry is not provided", () => {
    render(<QueryErrorState />);
    expect(screen.queryByRole("button", { name: "translated:retry" })).toBeNull();
  });
});
