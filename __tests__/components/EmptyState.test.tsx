import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EmptyState from "../../src/components/EmptyState";

jest.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      text: "rgba(0,0,0,0.88)",
      textSecondary: "rgba(0,0,0,0.50)",
      textTertiary: "rgba(0,0,0,0.30)",
      primary: "#5E5CE6",
      background: "#F8F8FA",
      card: "rgba(255,255,255,0.72)",
      cardSolid: "#FFFFFF",
      accent: "#FF9F0A",
      separator: "rgba(0,0,0,0.08)",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

describe("EmptyState", () => {
  it("should render title and message", () => {
    const { getByText } = render(
      <EmptyState title="No items" message="Nothing here yet" />
    );
    expect(getByText("No items")).toBeTruthy();
    expect(getByText("Nothing here yet")).toBeTruthy();
  });

  it("should not render action button when actionLabel and onAction are missing", () => {
    const { queryByText } = render(
      <EmptyState title="Title" message="Message" />
    );
    expect(queryByText("Add")).toBeNull();
  });

  it("should not render action button when only actionLabel is provided", () => {
    const { queryByText } = render(
      <EmptyState title="Title" message="Message" actionLabel="Add" />
    );
    expect(queryByText("Add")).toBeNull();
  });

  it("should not render action button when only onAction is provided", () => {
    const { queryByText } = render(
      <EmptyState title="Title" message="Message" onAction={jest.fn()} />
    );
    expect(queryByText("Add")).toBeNull();
  });

  it("should render action button when both actionLabel and onAction are provided", () => {
    const { getByText } = render(
      <EmptyState
        title="Title"
        message="Message"
        actionLabel="Create New"
        onAction={jest.fn()}
      />
    );
    expect(getByText("Create New")).toBeTruthy();
  });

  it("should call onAction when button is pressed", () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState
        title="Title"
        message="Message"
        actionLabel="Go"
        onAction={onAction}
      />
    );
    fireEvent.press(getByText("Go"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
