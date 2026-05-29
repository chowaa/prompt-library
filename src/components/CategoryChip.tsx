import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { Category } from "../types";
import { FontSize } from "../constants/theme";

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  count: number;
  onPress: () => void;
}

export default function CategoryChip({
  category,
  isSelected,
  count,
  onPress,
}: CategoryChipProps) {
  return (
    <TouchableOpacity
      className="px-4 py-2 rounded-full mr-2"
      style={{
        backgroundColor: isSelected ? category.color + "E6" : category.color + "10",
        borderWidth: 1,
        borderColor: isSelected ? "transparent" : category.color + "30",
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={{
          color: isSelected ? "rgba(0,0,0,0.88)" : category.color,
          fontWeight: "500",
          fontSize: FontSize.footnote,
          letterSpacing: -0.1,
        }}
      >
        {category.name} {count}
      </Text>
    </TouchableOpacity>
  );
}
