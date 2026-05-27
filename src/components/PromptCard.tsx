import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Prompt, Category } from "../types";
import { useTheme } from "../hooks/useTheme";
import { Shadow, Radius } from "../constants/theme";

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
  const { colors, isDark } = useTheme();
  const shadow = isDark ? Shadow.dark.md : Shadow.light.md;

  return (
    <TouchableOpacity
      className="mx-5 mb-3 overflow-hidden"
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        borderWidth: 0.5,
        borderColor: colors.separator,
        ...shadow,
      }}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="px-5 pt-5 pb-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text
              className="mb-1.5"
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: colors.text,
                letterSpacing: -0.2,
              }}
              numberOfLines={1}
            >
              {prompt.title}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 21,
                letterSpacing: -0.15,
              }}
              numberOfLines={2}
            >
              {prompt.content}
            </Text>
          </View>
          <TouchableOpacity
            testID="favorite-button"
            onPress={onToggleFavorite}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              marginTop: -4,
            }}
          >
            <Ionicons
              name={prompt.isFavorite ? "star" : "star-outline"}
              size={20}
              color={prompt.isFavorite ? colors.accent : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
        {category && (
          <View className="flex-row mt-3.5">
            <View
              className="px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: category.color + "18" }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: category.color,
                  fontWeight: "500",
                  letterSpacing: -0.1,
                }}
              >
                {category.name}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
