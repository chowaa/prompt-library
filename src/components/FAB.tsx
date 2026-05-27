import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { Shadow } from "../constants/theme";

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  const { colors, isDark } = useTheme();
  const shadow = isDark ? Shadow.dark.lg : Shadow.light.lg;

  return (
    <TouchableOpacity
      testID="fab"
      className="absolute bottom-8 right-6 w-14 h-14 rounded-full items-center justify-center"
      style={{
        backgroundColor: colors.primary,
        ...shadow,
      }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={26} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
