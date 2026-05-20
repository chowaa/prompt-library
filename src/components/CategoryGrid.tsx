import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../types";
import { useTheme } from "../hooks/useTheme";

interface CategoryGridProps {
  categories: Category[];
  promptCounts: Record<string, number>;
  onPress: (category: Category) => void;
}

export default function CategoryGrid({ categories, promptCounts, onPress }: CategoryGridProps) {
  const { colors } = useTheme();

  return (
    <FlatList
      data={categories}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      columnWrapperStyle={{ gap: 12 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="flex-1 rounded-2xl p-5 items-center"
          style={{ backgroundColor: colors.card }}
          onPress={() => onPress(item)}
          activeOpacity={0.7}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mb-3"
            style={{ backgroundColor: item.color + "20" }}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            {promptCounts[item.id] || 0} 个提示词
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
