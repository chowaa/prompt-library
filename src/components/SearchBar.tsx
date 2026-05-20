import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className="flex-row items-center mx-4 my-3 px-3 rounded-xl"
      style={{ backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" }}
    >
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        className="flex-1 py-2.5 ml-2"
        style={{ fontSize: 16, color: colors.text, minHeight: 44 }}
        placeholder="搜索提示词..."
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}
