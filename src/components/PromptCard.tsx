import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Prompt, Category } from "../types";
import { useTheme } from "../hooks/useTheme";

interface PromptCardProps {
  prompt: Prompt;
  category?: Category;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export default function PromptCard({
  prompt,
  category,
  onPress,
  onToggleFavorite,
}: PromptCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      className="mx-4 mb-3 rounded-2xl overflow-hidden flex-row"
      style={{ backgroundColor: colors.card }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 4,
          backgroundColor: category?.color || colors.separator,
        }}
      />
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="flex-1"
            style={{ fontSize: 17, fontWeight: "600", color: colors.text }}
            numberOfLines={1}
          >
            {prompt.title}
          </Text>
          <TouchableOpacity
            testID="favorite-button"
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons
              name={prompt.isFavorite ? "star" : "star-outline"}
              size={20}
              color={prompt.isFavorite ? colors.accent : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}
          numberOfLines={2}
        >
          {prompt.content}
        </Text>
        {category && (
          <View className="flex-row mt-3">
            <View
              className="px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: category.color + "20" }}
            >
              <Text style={{ fontSize: 12, color: category.color, fontWeight: "500" }}>
                {category.name}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
