import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Prompt, Category } from "../types";
import { useTheme } from "../hooks/useTheme";
import { FontSize, Radius, Shadow } from "../constants/theme";

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
  const { colors, isDark } = useTheme();
  const shadow = isDark ? Shadow.dark.sm : Shadow.light.sm;
  const scale = useRef(new Animated.Value(1)).current;
  const starScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleToggleFavorite = () => {
    Animated.sequence([
      Animated.timing(starScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(starScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 16 }),
    ]).start();
    onToggleFavorite();
  };

  return (
    <Animated.View
      style={{
        width: 150,
        backgroundColor: colors.card,
        borderRadius: Radius.md,
        borderWidth: 0.5,
        borderColor: colors.separator,
        ...shadow,
        transform: [{ scale }],
      }}
    >
      <TouchableOpacity
        className="p-3 flex-1 justify-between"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View>
          {category && (
            <View
              className="self-start px-2 py-0.5 rounded-md mb-2"
              style={{ backgroundColor: category.color + "18" }}
            >
              <Text
                style={{
                  fontSize: FontSize.caption,
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
              fontSize: FontSize.subhead,
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
              fontSize: FontSize.footnote,
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
            onPress={handleToggleFavorite}
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
            <Animated.View style={{ transform: [{ scale: starScale }] }}>
              <Ionicons
                name={prompt.isFavorite ? "star" : "star-outline"}
                size={18}
                color={prompt.isFavorite ? colors.accent : colors.textTertiary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
