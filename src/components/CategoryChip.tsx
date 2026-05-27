import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Category } from "../types";

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
        minHeight: 34,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={{
          color: isSelected ? "#FFFFFF" : category.color,
          fontWeight: "500",
          fontSize: 13,
          letterSpacing: -0.1,
        }}
      >
        {category.name} {count}
      </Text>
    </TouchableOpacity>
  );
}
