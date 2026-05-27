import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { Shadow, Radius } from "../constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const shadow = isDark ? Shadow.dark.sm : Shadow.light.sm;

  return (
    <View className="mx-5 mt-1 mb-3">
      <View
        className="flex-row items-center px-3.5"
        style={{
          backgroundColor: colors.card,
          borderRadius: Radius.md,
          borderWidth: 0.5,
          borderColor: colors.separator,
          minHeight: 44,
          ...shadow,
        }}
      >
        <Ionicons
          name="search"
          size={18}
          color={colors.textTertiary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          className="flex-1 py-2.5"
          style={{
            fontSize: 16,
            color: colors.text,
            minHeight: 44,
            letterSpacing: -0.15,
          }}
          placeholder="搜索提示词..."
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>
    </View>
  );
}
