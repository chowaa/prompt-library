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
}

export default function NewPromptSheet({
  visible,
  categories,
  editingPrompt,
  onClose,
  onSave,
}: NewPromptSheetProps) {
  const { colors, isDark } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setContent(editingPrompt.content);
      setCategoryId(editingPrompt.categoryId);
    } else {
      setTitle("");
      setContent("");
      setCategoryId(categories[0]?.id || "");
    }
  }, [editingPrompt, visible]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), categoryId, tags: [] });
    setTitle("");
    setContent("");
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
          className="rounded-t-[20px] p-5"
          style={{ backgroundColor: colors.card, maxHeight: "80%" }}
        >
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 17, color: colors.textSecondary }}>取消</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.text }}>
              {editingPrompt ? "编辑提示词" : "新建提示词"}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: colors.primary }}>保存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              className="rounded-xl px-4 mb-3"
              style={{
                fontSize: 17,
                color: colors.text,
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                minHeight: 44,
              }}
              placeholder="提示词标题"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="rounded-xl px-4 py-3 mb-3"
              style={{
                fontSize: 16,
                color: colors.text,
                backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7",
                minHeight: 120,
                textAlignVertical: "top",
              }}
              placeholder="输入提示词内容..."
              placeholderTextColor={colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
            />

            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 8 }}>
              分类
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className="px-4 py-2 rounded-xl mr-2"
                  style={{
                    backgroundColor: categoryId === cat.id ? cat.color : "transparent",
                    borderWidth: 1.5,
                    borderColor: cat.color,
                  }}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text
                    style={{
                      color: categoryId === cat.id ? "#FFFFFF" : cat.color,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    <Ionicons name={cat.icon as any} size={14} /> {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
