import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Category } from "../types";

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  count: number;
  onPress: () => void;
}

export default function CategoryChip({ category, isSelected, count, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      className="px-4 py-2 rounded-xl mr-2"
      style={{
        backgroundColor: isSelected ? category.color : "transparent",
        borderWidth: 1.5,
        borderColor: category.color,
        minHeight: 36,
      }}
      onPress={onPress}
    >
      <Text
        style={{
          color: isSelected ? "#FFFFFF" : category.color,
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        {category.name} ({count})
      </Text>
    </TouchableOpacity>
  );
}
