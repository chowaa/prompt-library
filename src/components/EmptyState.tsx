import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-10">
      <Ionicons
        name="documents-outline"
        size={56}
        color={colors.textTertiary}
      />
      <Text
        className="text-center mt-5"
        style={{
          fontSize: 20,
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
          fontSize: 15,
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
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16, letterSpacing: -0.15 }}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
