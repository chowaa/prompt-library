import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../types";
import { useTheme } from "../hooks/useTheme";
import { Shadow, Radius } from "../constants/theme";

interface CategoryGridProps {
  categories: Category[];
  promptCounts: Record<string, number>;
  onPress: (category: Category) => void;
}

export default function CategoryGrid({ categories, promptCounts, onPress }: CategoryGridProps) {
  const { colors, isDark } = useTheme();
  const shadow = isDark ? Shadow.dark.sm : Shadow.light.sm;

  return (
    <FlatList
      data={categories}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      columnWrapperStyle={{ gap: 14 }}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="flex-1 rounded-[22px] p-5 items-center"
          style={{
            backgroundColor: colors.card,
            borderWidth: 0.5,
            borderColor: colors.separator,
            ...shadow,
          }}
          onPress={() => onPress(item)}
          activeOpacity={0.6}
        >
          <View
            className="w-13 h-13 rounded-2xl items-center justify-center mb-3.5"
            style={{ backgroundColor: item.color + "18" }}
          >
            <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={item.color} />
          </View>
          <Text style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.text,
            letterSpacing: -0.15,
          }}>
            {item.name}
          </Text>
          <Text style={{
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 4,
            letterSpacing: -0.08,
          }}>
            {promptCounts[item.id] || 0} 个提示词
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
