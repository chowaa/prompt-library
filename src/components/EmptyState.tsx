import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { FontSize } from "../constants/theme";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  message,
  icon = "documents-outline",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 justify-center items-center px-8">
      <View className="mb-5">
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={56} color={colors.textSecondary} />
      </View>
      <Text
        className="text-center mt-5"
        style={{
          fontSize: FontSize.title3,
          fontWeight: "600",
          color: colors.text,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
      <Text
        className="text-center mt-2"
        style={{
          fontSize: FontSize.subhead,
          color: colors.textSecondary,
          lineHeight: 22,
          letterSpacing: -0.1,
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-full"
          style={{ backgroundColor: colors.primary }}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: FontSize.callout, letterSpacing: -0.15 }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
