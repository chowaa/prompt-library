import React, { useState, useMemo } from "react";
import { View, FlatList } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useApp } from "../store/AppContext";
import { useTheme } from "../hooks/useTheme";
import SearchBar from "../components/SearchBar";
import CategoryChip from "../components/CategoryChip";
import PromptCard from "../components/PromptCard";
import EmptyState from "../components/EmptyState";
import FAB from "../components/FAB";
import NewPromptSheet from "../components/NewPromptSheet";
import * as Haptics from "expo-haptics";

export default function BrowseScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const route = useRoute<any>();
  const routeCategoryId = route.params?.categoryId;

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(routeCategoryId || null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);

  const categoryPromptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.categories.forEach((cat) => {
      counts[cat.id] = state.prompts.filter((p) => p.categoryId === cat.id).length;
    });
    return counts;
  }, [state.prompts, state.categories]);

  const filteredPrompts = useMemo(() => {
    let result = state.prompts;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategoryId) {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }

    return [...result].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [state.prompts, search, selectedCategoryId]);

  const handleToggleFavorite = (id: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", id });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSavePrompt = (data: { title: string; content: string; categoryId: string; tags: string[] }) => {
    const now = Date.now();
    if (editingPrompt) {
      dispatch({
        type: "UPDATE_PROMPT",
        prompt: { ...editingPrompt, ...data, updatedAt: now },
      });
    } else {
      const newPrompt = {
        id: now.toString(),
        ...data,
        tags: [],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: "ADD_PROMPT", prompt: newPrompt });
    }
    setSheetVisible(false);
    setEditingPrompt(null);
  };

  if (state.isLoading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SearchBar value={search} onChangeText={setSearch} />

      <View className="mb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          data={state.categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryChip
              category={item}
              isSelected={selectedCategoryId === item.id}
              count={categoryPromptCounts[item.id] || 0}
              onPress={() =>
                setSelectedCategoryId(
                  selectedCategoryId === item.id ? null : item.id
                )
              }
            />
          )}
        />
      </View>

      <FlatList
        data={filteredPrompts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <PromptCard
            prompt={item}
            category={state.categories.find((c) => c.id === item.categoryId)}
            onPress={() => {
              setEditingPrompt(item);
              setSheetVisible(true);
            }}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={state.prompts.length === 0 ? "还没有提示词" : "没有匹配的提示词"}
            message={
              state.prompts.length === 0
                ? "点击右下角 + 创建第一个提示词"
                : "试试换个搜索词或分类筛选"
            }
          />
        }
      />

      <FAB onPress={() => setSheetVisible(true)} />

      <NewPromptSheet
        visible={sheetVisible}
        categories={state.categories}
        editingPrompt={editingPrompt}
        onClose={() => {
          setSheetVisible(false);
          setEditingPrompt(null);
        }}
        onSave={handleSavePrompt}
      />
    </View>
  );
}
