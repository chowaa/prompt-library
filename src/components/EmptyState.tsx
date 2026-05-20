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
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="documents-outline" size={64} color={colors.textSecondary} />
      <Text
        className="text-center mt-4"
        style={{ fontSize: 20, fontWeight: "600", color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="text-center mt-2"
        style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
          onPress={onAction}
        >
          <Text className="text-white font-semibold text-base">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
