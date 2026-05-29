import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { FontSize, Radius, Shadow } from "../constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const shadow = isDark ? Shadow.dark.sm : Shadow.light.sm;

  return (
    <View
      className="mx-5 my-3 px-4 flex-row items-center"
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.md,
        borderWidth: 0.5,
        borderColor: colors.separator,
        ...shadow,
      }}
    >
      <Ionicons name="search" size={18} color={colors.textTertiary} />
      <TextInput
        className="flex-1 ml-2.5"
        style={{
          fontSize: FontSize.callout,
          color: colors.text,
          height: 44,
          letterSpacing: -0.15,
        }}
        placeholder="搜索提示词..."
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
