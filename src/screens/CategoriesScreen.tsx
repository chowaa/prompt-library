import React, { useMemo } from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../store/AppContext";
import { useTheme } from "../hooks/useTheme";
import CategoryGrid from "../components/CategoryGrid";
import EmptyState from "../components/EmptyState";

export default function CategoriesScreen() {
  const { state } = useApp();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const promptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.categories.forEach((cat) => {
      counts[cat.id] = state.prompts.filter((p) => p.categoryId === cat.id).length;
    });
    return counts;
  }, [state.prompts, state.categories]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {state.categories.length === 0 ? (
        <EmptyState title="暂无分类" message="创建提示词时会自动使用分类" />
      ) : (
        <CategoryGrid
          categories={state.categories}
          promptCounts={promptCounts}
          onPress={(cat) => {
            navigation.navigate("Browse", { categoryId: cat.id });
          }}
        />
      )}
    </View>
  );
}
