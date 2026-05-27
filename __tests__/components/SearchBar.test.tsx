import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchBar from "../../src/components/SearchBar";

jest.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      card: "rgba(255,255,255,0.72)",
      text: "rgba(0,0,0,0.88)",
      textTertiary: "rgba(0,0,0,0.30)",
      separator: "rgba(0,0,0,0.08)",
      background: "#F8F8FA",
      primary: "#5E5CE6",
      accent: "#FF9F0A",
      textSecondary: "rgba(0,0,0,0.50)",
      cardSolid: "#FFFFFF",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

describe("SearchBar", () => {
  it("should render with placeholder text", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText("搜索提示词...")).toBeTruthy();
  });

  it("should display current value", () => {
    const { getByDisplayValue } = render(
      <SearchBar value="testing" onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue("testing")).toBeTruthy();
  });

  it("should call onChangeText when text is entered", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(
      getByPlaceholderText("搜索提示词..."),
      "new search"
    );
    expect(onChangeText).toHaveBeenCalledWith("new search");
  });

  it("should call onChangeText with empty string when cleared", () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <SearchBar value="old" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByDisplayValue("old"), "");
    expect(onChangeText).toHaveBeenCalledWith("");
  });
});
