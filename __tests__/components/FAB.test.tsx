import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FAB from "../../src/components/FAB";

jest.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      primary: "#5E5CE6",
      background: "#F8F8FA",
      card: "rgba(255,255,255,0.72)",
      cardSolid: "#FFFFFF",
      accent: "#FF9F0A",
      text: "rgba(0,0,0,0.88)",
      textSecondary: "rgba(0,0,0,0.50)",
      textTertiary: "rgba(0,0,0,0.30)",
      separator: "rgba(0,0,0,0.08)",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

describe("FAB", () => {
  it("should render with testID 'fab'", () => {
    const { getByTestId } = render(<FAB onPress={jest.fn()} />);
    expect(getByTestId("fab")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<FAB onPress={onPress} />);
    fireEvent.press(getByTestId("fab"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should trigger onPress exactly once per tap", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<FAB onPress={onPress} />);
    fireEvent.press(getByTestId("fab"));
    fireEvent.press(getByTestId("fab"));
    fireEvent.press(getByTestId("fab"));
    expect(onPress).toHaveBeenCalledTimes(3);
  });
});
