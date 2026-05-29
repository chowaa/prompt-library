import React, { useState, useMemo } from "react";
import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppContext";
import { useTheme } from "../hooks/useTheme";
import { FontSize } from "../constants/theme";
import { generateId } from "../utils/id";
import SearchBar from "../components/SearchBar";
import CategoryChip from "../components/CategoryChip";
import PromptCard from "../components/PromptCard";
import ShelfCard from "../components/ShelfCard";
import EmptyState from "../components/EmptyState";
import FAB from "../components/FAB";
import NewPromptSheet from "../components/NewPromptSheet";
import { Prompt } from "../types";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const isSearching = search.trim().length > 0 || selectedCategoryId !== null;

  const favoritedPrompts = useMemo(
    () => state.prompts.filter((p) => p.isFavorite),
    [state.prompts]
  );

  const categoryPromptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.categories.forEach((cat) => {
      counts[cat.id] = state.prompts.filter(
        (p) => p.categoryId === cat.id
      ).length;
    });
    return counts;
  }, [state.prompts, state.categories]);

  const categoriesWithPrompts = useMemo(
    () =>
      state.categories.filter((cat) => categoryPromptCounts[cat.id] > 0),
    [state.categories, categoryPromptCounts]
  );

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

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_PROMPT", id });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setSheetVisible(false);
    setEditingPrompt(null);
  };

  const handleSavePrompt = (data: {
    title: string;
    content: string;
    categoryId: string;
    tags: string[];
  }) => {
    const now = Date.now();
    if (editingPrompt) {
      dispatch({
        type: "UPDATE_PROMPT",
        prompt: { ...editingPrompt, ...data, updatedAt: now },
      });
    } else {
      const newPrompt: Prompt = {
        id: generateId(),
        ...data,
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: "ADD_PROMPT", prompt: newPrompt });
    }
    setSheetVisible(false);
    setEditingPrompt(null);
  };

  const handleViewAll = (categoryId: string) => {
    setSearch("");
    setSelectedCategoryId(categoryId);
  };

  const handleCancelFilter = () => {
    setSearch("");
    setSelectedCategoryId(null);
  };

  const handleChipPress = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      handleCancelFilter();
    } else {
      setSelectedCategoryId(categoryId);
    }
  };

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalPromptsEmpty = state.prompts.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SearchBar value={search} onChangeText={setSearch} />

      {isSearching ? (
        <>
          <View className="mb-2">
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              data={state.categories}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <TouchableOpacity
                  key="all"
                  className="px-4 py-2 rounded-full mr-2"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 0.5,
                    borderColor: colors.separator,
                  }}
                  onPress={handleCancelFilter}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "500",
                      fontSize: FontSize.footnote,
                      letterSpacing: -0.1,
                    }}
                  >
                    全部
                  </Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <CategoryChip
                  category={item}
                  isSelected={selectedCategoryId === item.id}
                  count={categoryPromptCounts[item.id] || 0}
                  onPress={() => handleChipPress(item.id)}
                />
              )}
            />
          </View>

          <FlatList
            data={filteredPrompts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 4, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <PromptCard
                prompt={item}
                category={state.categories.find(
                  (c) => c.id === item.categoryId
                )}
                onPress={() => {
                  setEditingPrompt(item);
                  setSheetVisible(true);
                }}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="没有匹配的提示词"
                message="试试换个搜索词或分类筛选"
                icon="search"
              />
            }
          />
        </>
      ) : totalPromptsEmpty ? (
        <EmptyState
          title="还没有提示词"
          message="点击右下角 + 创建第一个提示词"
          icon="sparkles"
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {favoritedPrompts.length > 0 && (
            <View className="mt-2">
              <View className="flex-row items-center px-5 mb-2">
                <Text
                  style={{
                    fontSize: FontSize.title3,
                    fontWeight: "600",
                    color: colors.text,
                    letterSpacing: -0.2,
                  }}
                >
                  ⭐ 收藏 ({favoritedPrompts.length})
                </Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                data={favoritedPrompts}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                renderItem={({ item }) => (
                  <ShelfCard
                    prompt={item}
                    category={state.categories.find(
                      (c) => c.id === item.categoryId
                    )}
                    onPress={() => {
                      setEditingPrompt(item);
                      setSheetVisible(true);
                    }}
                    onToggleFavorite={() => handleToggleFavorite(item.id)}
                  />
                )}
              />
            </View>
          )}

          {categoriesWithPrompts.map((cat, index) => (
            <View
              key={cat.id}
              className={index === 0 && favoritedPrompts.length === 0 ? "mt-2" : "mt-6"}
            >
              <View className="flex-row items-center justify-between px-5 mb-2">
                <Text
                  style={{
                    fontSize: FontSize.title3,
                    fontWeight: "600",
                    color: colors.text,
                    letterSpacing: -0.2,
                  }}
                >
                  {cat.name} ({categoryPromptCounts[cat.id]})
                </Text>
                <TouchableOpacity
                  onPress={() => handleViewAll(cat.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={{
                      fontSize: FontSize.subhead,
                      fontWeight: "500",
                      color: colors.primary,
                      letterSpacing: -0.1,
                    }}
                  >
                    查看全部{" "}
                    <Ionicons
                      name="chevron-forward"
                      size={FontSize.subhead}
                      color={colors.primary}
                    />
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                data={state.prompts.filter((p) => p.categoryId === cat.id)}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                renderItem={({ item }) => (
                  <ShelfCard
                    prompt={item}
                    category={cat}
                    onPress={() => {
                      setEditingPrompt(item);
                      setSheetVisible(true);
                    }}
                    onToggleFavorite={() => handleToggleFavorite(item.id)}
                  />
                )}
              />
            </View>
          ))}
        </ScrollView>
      )}

      {state.saveError && (
        <TouchableOpacity
          className="absolute left-5 right-5 rounded-2xl px-4 py-3 flex-row items-center"
          style={{
            bottom: 100,
            backgroundColor: colors.primary + "1F",
            borderWidth: 0.5,
            borderColor: colors.primary + "4D",
            zIndex: 10,
          }}
          onPress={() => dispatch({ type: "SAVE_SUCCESS" })}
          activeOpacity={0.7}
        >
          <Ionicons name="warning-outline" size={16} color={colors.text} />
          <Text
            className="flex-1 ml-2"
            style={{ fontSize: FontSize.footnote, color: colors.text, letterSpacing: -0.12 }}
          >
            {state.saveError}
          </Text>
          <Ionicons name="close" size={16} color={colors.text} />
        </TouchableOpacity>
      )}

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
        onDelete={handleDelete}
      />
    </View>
  );
}
