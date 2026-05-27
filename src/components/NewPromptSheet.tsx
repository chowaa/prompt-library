import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category, Prompt } from "../types";
import { useTheme } from "../hooks/useTheme";

interface NewPromptSheetProps {
  visible: boolean;
  categories: Category[];
  editingPrompt?: Prompt | null;
  onClose: () => void;
  onSave: (data: { title: string; content: string; categoryId: string; tags: string[] }) => void;
  onDelete?: (id: string) => void;
}

export default function NewPromptSheet({
  visible,
  categories,
  editingPrompt,
  onClose,
  onSave,
  onDelete,
}: NewPromptSheetProps) {
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [tagsText, setTagsText] = useState("");

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setContent(editingPrompt.content);
      setCategoryId(editingPrompt.categoryId);
      setTagsText(editingPrompt.tags.join(", "));
    } else {
      setTitle("");
      setContent("");
      setCategoryId(categories[0]?.id || "");
      setTagsText("");
    }
  }, [editingPrompt, visible]);

  const parseTags = (text: string): string[] => {
    return text
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      tags: parseTags(tagsText),
    });
    setTitle("");
    setContent("");
    setTagsText("");
  };

  const handleDelete = () => {
    if (!editingPrompt || !onDelete) return;
    Alert.alert("删除提示词", `确定要删除「${editingPrompt.title}」吗？`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => onDelete(editingPrompt.id),
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <TouchableOpacity
          className="flex-1"
          style={{ backgroundColor: colors.scrim }}
          onPress={onClose}
        />
        <View
          className="rounded-t-[28px] p-5"
          style={{
            backgroundColor: isDark ? "rgba(28,28,30,0.98)" : "rgba(255,255,255,0.96)",
            maxHeight: "80%",
            borderWidth: 0.5,
            borderColor: colors.separator,
            borderBottomWidth: 0,
          }}
        >
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 17, color: colors.primary }}>取消</Text>
            </TouchableOpacity>
            <Text style={{
              fontSize: 17,
              fontWeight: "600",
              color: colors.text,
              letterSpacing: -0.2,
            }}>
              {editingPrompt ? "编辑提示词" : "新建提示词"}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: colors.primary }}>保存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              className="rounded-2xl px-4 mb-4"
              style={{
                fontSize: 17,
                fontWeight: "400",
                color: colors.text,
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                minHeight: 48,
                letterSpacing: -0.2,
              }}
              placeholder="提示词标题"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="rounded-2xl px-4 py-3.5 mb-4"
              style={{
                fontSize: 16,
                color: colors.text,
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                minHeight: 130,
                textAlignVertical: "top",
                letterSpacing: -0.15,
                lineHeight: 22,
              }}
              placeholder="输入提示词内容..."
              placeholderTextColor={colors.textTertiary}
              value={content}
              onChangeText={setContent}
              multiline
            />

            <Text style={{
              fontSize: 13,
              fontWeight: "500",
              color: colors.textSecondary,
              marginBottom: 6,
              marginLeft: 4,
              letterSpacing: -0.08,
              textTransform: "uppercase",
            }}>
              标签
            </Text>
            <TextInput
              className="rounded-2xl px-4 mb-5"
              style={{
                fontSize: 15,
                color: colors.text,
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                minHeight: 48,
                letterSpacing: -0.12,
              }}
              placeholder="用逗号分隔，如：编程, 代码审查"
              placeholderTextColor={colors.textTertiary}
              value={tagsText}
              onChangeText={setTagsText}
            />

            <Text style={{
              fontSize: 13,
              fontWeight: "500",
              color: colors.textSecondary,
              marginBottom: 6,
              marginLeft: 4,
              letterSpacing: -0.08,
              textTransform: "uppercase",
            }}>
              分类
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className="px-4 py-2 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      categoryId === cat.id ? cat.color + "E6" : cat.color + "10",
                    borderWidth: 1,
                    borderColor:
                      categoryId === cat.id ? "transparent" : cat.color + "30",
                  }}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={{
                      color: categoryId === cat.id ? "#FFFFFF" : cat.color,
                      fontWeight: "500",
                      fontSize: 13,
                      letterSpacing: -0.1,
                    }}
                  >
                    <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={13} /> {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {editingPrompt && onDelete && (
              <TouchableOpacity
                className="py-3.5 rounded-2xl mt-4 items-center"
                style={{ backgroundColor: isDark ? "rgba(255,69,58,0.12)" : "rgba(255,69,58,0.08)" }}
                onPress={handleDelete}
              >
                <Text style={{ fontSize: 16, fontWeight: "500", color: "#FF453A", letterSpacing: -0.15 }}>
                  <Ionicons name="trash-outline" size={16} color="#FF453A" /> 删除提示词
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
