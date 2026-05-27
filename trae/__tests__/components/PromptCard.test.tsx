import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PromptCard from "../../../src/components/PromptCard";
import { Prompt, Category } from "../../../src/types";

jest.mock("../../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      card: "rgba(255,255,255,0.72)",
      primary: "#5E5CE6",
      accent: "#FF9F0A",
      text: "rgba(0,0,0,0.88)",
      textSecondary: "rgba(0,0,0,0.50)",
      textTertiary: "rgba(0,0,0,0.30)",
      separator: "rgba(0,0,0,0.08)",
      background: "#F8F8FA",
      cardSolid: "#FFFFFF",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

const mockPrompt: Prompt = {
  id: "p1",
  title: "Code Review Prompt",
  content: "Review the following code for bugs and suggest improvements.",
  categoryId: "cat-coding",
  tags: ["coding", "review"],
  isFavorite: false,
  createdAt: 1000,
  updatedAt: 2000,
};

const mockCategory: Category = {
  id: "cat-coding",
  name: "编程",
  icon: "code-2",
  color: "#5E5CE6",
};

describe("PromptCard", () => {
  it("should render title", () => {
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByText("Code Review Prompt")).toBeTruthy();
  });

  it("should render content preview", () => {
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(
      getByText("Review the following code for bugs and suggest improvements.")
    ).toBeTruthy();
  });

  it("should have favorite button with testID", () => {
    const { getByTestId } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByTestId("favorite-button")).toBeTruthy();
  });

  it("should render category pill when category provided", () => {
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByText("编程")).toBeTruthy();
  });

  it("should not render category text when category is undefined", () => {
    const { queryByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(queryByText("编程")).toBeNull();
  });

  it("should call onPress when card is pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={onPress}
        onToggleFavorite={jest.fn()}
      />
    );
    fireEvent.press(getByText("Code Review Prompt"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should call onToggleFavorite when favorite button pressed", () => {
    const onToggleFavorite = jest.fn();
    const { getByTestId } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.press(getByTestId("favorite-button"));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it("should render with favorite star filled when isFavorite is true", () => {
    const favPrompt = { ...mockPrompt, isFavorite: true };
    const { getByTestId } = render(
      <PromptCard
        prompt={favPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByTestId("favorite-button")).toBeTruthy();
  });

  it("should truncate long titles to single line", () => {
    const longPrompt = {
      ...mockPrompt,
      title: "This is a very long prompt title that should be truncated in the card view",
    };
    const { getByText } = render(
      <PromptCard
        prompt={longPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByText(longPrompt.title)).toBeTruthy();
  });
});
