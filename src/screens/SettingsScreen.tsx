import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useApp } from "../store/AppContext";
import { useTheme } from "../hooks/useTheme";

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { colors, isDark } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(isDark);

  const totalPrompts = state.prompts.length;
  const totalCategories = state.categories.length;
  const favoritedCount = state.prompts.filter((p) => p.isFavorite).length;

  const handleExport = async () => {
    try {
      const data = JSON.stringify(
        { prompts: state.prompts, categories: state.categories },
        null,
        2
      );
      const path = FileSystem.documentDirectory + "prompt-library-backup.json";
      await FileSystem.writeAsStringAsync(path, data);
      await Sharing.shareAsync(path, {
        mimeType: "application/json",
        dialogTitle: "导出提示词库",
      });
    } catch {
      Alert.alert("导出失败", "无法导出数据，请重试");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });
      if (!result.canceled) {
        const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const data = JSON.parse(content);
        if (data.prompts && data.categories) {
          dispatch({
            type: "SET_INITIAL_DATA",
            prompts: data.prompts,
            categories: data.categories,
          });
          Alert.alert("导入成功", `已导入 ${data.prompts.length} 个提示词`);
        } else {
          Alert.alert("文件格式无效", "请选择正确的导出的 JSON 文件");
        }
      }
    } catch {
      Alert.alert("导入失败", "文件格式无效或读取失败");
    }
  };

  const SettingRow = ({
    icon,
    label,
    right,
    onPress,
  }: {
    icon: string;
    label: string;
    right?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3.5 mx-4 rounded-xl mb-2"
      style={{ backgroundColor: colors.card }}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={0.6}
    >
      <Ionicons name={icon as any} size={22} color={colors.primary} />
      <Text className="flex-1 ml-3" style={{ fontSize: 17, color: colors.text }}>
        {label}
      </Text>
      {right || <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mt-4">
        <Text
          className="px-4 mb-2"
          style={{ fontSize: 13, color: colors.textSecondary, textTransform: "uppercase" }}
        >
          外观
        </Text>
        <SettingRow
          icon="moon"
          label="深色模式"
          right={
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#E5E5EA", true: colors.primary }}
            />
          }
        />
      </View>

      <View className="mt-6">
        <Text
          className="px-4 mb-2"
          style={{ fontSize: 13, color: colors.textSecondary, textTransform: "uppercase" }}
        >
          数据
        </Text>
        <SettingRow icon="download" label="导出 JSON" onPress={handleExport} />
        <SettingRow icon="upload" label="导入 JSON" onPress={handleImport} />
      </View>

      <View className="mt-6">
        <Text
          className="px-4 mb-2"
          style={{ fontSize: 13, color: colors.textSecondary, textTransform: "uppercase" }}
        >
          统计
        </Text>
        <View className="mx-4 rounded-xl p-4" style={{ backgroundColor: colors.card }}>
          <View className="flex-row justify-between mb-2">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>提示词总数</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
              {totalPrompts}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>分类数</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
              {totalCategories}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>已收藏</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
              {favoritedCount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
