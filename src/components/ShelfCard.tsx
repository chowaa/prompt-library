import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Prompt, Category } from "../types";
import { useTheme } from "../hooks/useTheme";
import { Radius } from "../constants/theme";

interface ShelfCardProps {
  prompt: Prompt;
  category?: Category;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export default function ShelfCard({
  prompt,
  category,
  onPress,
  onToggleFavorite,
}: ShelfCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      className="overflow-hidden"
      style={{
        width: 150,
        backgroundColor: colors.card,
        borderRadius: Radius.md,
        borderWidth: 0.5,
        borderColor: colors.separator,
      }}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="p-3 flex-1 justify-between">
        <View>
          {category && (
            <View
              className="self-start px-2 py-0.5 rounded-md mb-2"
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
          )}
          <Text
            className="mb-1"
            style={{
              fontSize: 15,
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
              fontSize: 13,
              color: colors.textSecondary,
              lineHeight: 18,
              letterSpacing: -0.12,
            }}
            numberOfLines={2}
          >
            {prompt.content}
          </Text>
        </View>
        <View className="flex-row justify-end mt-2">
          <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              width: 44,
              height: 44,
              justifyContent: "center",
              alignItems: "center",
              marginRight: -12,
              marginBottom: -12,
            }}
          >
            <Ionicons
              name={prompt.isFavorite ? "star" : "star-outline"}
              size={18}
              color={prompt.isFavorite ? colors.accent : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
