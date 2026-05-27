import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CategoryChip from "../../src/components/CategoryChip";
import { Category } from "../../src/types";

const mockCategory: Category = {
  id: "cat-writing",
  name: "写作",
  icon: "pen-line",
  color: "#34C759",
};

describe("CategoryChip", () => {
  it("should render category name and count", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={5}
        onPress={jest.fn()}
      />
    );
    expect(getByText("写作 5")).toBeTruthy();
  });

  it("should apply selected style when isSelected is true", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={true}
        count={3}
        onPress={jest.fn()}
      />
    );
    const text = getByText("写作 3");
    expect(text.props.style).toMatchObject({ color: "#FFFFFF" });
  });

  it("should apply unselected style when isSelected is false", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={3}
        onPress={jest.fn()}
      />
    );
    const text = getByText("写作 3");
    expect(text.props.style).toMatchObject({ color: "#34C759" });
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={0}
        onPress={onPress}
      />
    );
    fireEvent.press(getByText("写作 0"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should render zero count correctly", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={0}
        onPress={jest.fn()}
      />
    );
    expect(getByText("写作 0")).toBeTruthy();
  });
});
