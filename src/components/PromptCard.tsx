import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Prompt, Category } from "../types";
import { useTheme } from "../hooks/useTheme";
import { FontSize, Radius, Shadow } from "../constants/theme";

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
      className="mx-5 mb-3 overflow-hidden"
      style={{
        backgroundColor: colors.card,
        borderRadius: Radius.lg,
        borderWidth: 0.5,
        borderColor: colors.separator,
        ...shadow,
        transform: [{ scale }],
      }}
    >
      <TouchableOpacity
        className="p-5"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View className="flex-row justify-between items-start mb-1.5">
          <Text
            className="flex-1 mr-3"
            style={{
              fontSize: FontSize.body,
              fontWeight: "600",
              color: colors.text,
              letterSpacing: -0.2,
            }}
            numberOfLines={1}
          >
            {prompt.title}
          </Text>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            testID="favorite-button"
          >
            <Animated.View style={{ transform: [{ scale: starScale }] }}>
              <Ionicons
                name={prompt.isFavorite ? "star" : "star-outline"}
                size={20}
                color={prompt.isFavorite ? colors.accent : colors.textTertiary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        <Text
          className="mb-2"
          style={{
            fontSize: FontSize.footnote,
            color: colors.textSecondary,
            lineHeight: 21,
            letterSpacing: -0.15,
          }}
          numberOfLines={2}
        >
          {prompt.content}
        </Text>
        {category && (
          <View
            className="self-start px-2 py-0.5 rounded-md"
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
      </TouchableOpacity>
    </Animated.View>
  );
}
