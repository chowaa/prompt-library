import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      testID="fab"
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      style={{ backgroundColor: colors.primary }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
