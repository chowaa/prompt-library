import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useApp } from "../store/AppContext";
import { useTheme } from "../hooks/useTheme";
import { ThemeMode } from "../types";
import { FontSize } from "../constants/theme";

const DarkModeRow = React.memo(function DarkModeRow({
  isDark,
  colors,
  onThemeChange,
}: {
  isDark: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
  onThemeChange: (themeMode: ThemeMode) => void;
}) {
  const handleValueChange = useCallback(
    (value: boolean) => {
      onThemeChange(value ? "dark" : "light");
    },
    [onThemeChange]
  );

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 mx-5 rounded-2xl mb-2.5"
      style={{
        backgroundColor: colors.card,
        borderWidth: 0.5,
        borderColor: colors.separator,
      }}
      activeOpacity={0.6}
      disabled
    >
      <Ionicons name="moon" size={20} color={colors.primary} />
      <Text
        className="flex-1 ml-3"
        style={{
          fontSize: FontSize.body,
          color: colors.text,
          letterSpacing: -0.2,
        }}
      >
        深色模式
      </Text>
      <Switch
        value={isDark}
        onValueChange={handleValueChange}
        trackColor={{ false: "rgba(0,0,0,0.16)", true: colors.primary }}
        ios_backgroundColor="rgba(0,0,0,0.16)"
        accessibilityLabel="深色模式"
      />
    </TouchableOpacity>
  );
});

export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { colors, isDark } = useTheme();

  const totalPrompts = state.prompts.length;
  const totalCategories = state.categories.length;
  const favoritedCount = state.prompts.filter((p) => p.isFavorite).length;

  const handleThemeChange = useCallback(
    (themeMode: ThemeMode) => {
      dispatch({ type: "SET_THEME_MODE", themeMode });
    },
    [dispatch]
  );

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
            themeMode: state.themeMode,
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

  const SettingRow = React.memo(function SettingRow({
    icon,
    label,
    right,
    onPress,
  }: {
    icon: string;
    label: string;
    right?: React.ReactNode;
    onPress?: () => void;
  }) {
    return (
      <TouchableOpacity
        className="flex-row items-center px-4 py-3 mx-5 rounded-2xl mb-2.5"
        style={{
          backgroundColor: colors.card,
          borderWidth: 0.5,
          borderColor: colors.separator,
        }}
        onPress={onPress}
        disabled={!onPress && !right}
        activeOpacity={0.6}
      >
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.primary} />
        <Text className="flex-1 ml-3" style={{
          fontSize: FontSize.body,
          color: colors.text,
          letterSpacing: -0.2,
        }}>
          {label}
        </Text>
        {right || <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
      </TouchableOpacity>
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mt-6">
        <Text
          className="px-5 mb-2"
          style={{
            fontSize: FontSize.footnote,
            color: colors.textSecondary,
            textTransform: "uppercase",
            fontWeight: "500",
            letterSpacing: 0.5,
          }}
        >
          外观
        </Text>
        <DarkModeRow isDark={isDark} colors={colors} onThemeChange={handleThemeChange} />
      </View>

      <View className="mt-6">
        <Text
          className="px-5 mb-2"
          style={{
            fontSize: FontSize.footnote,
            color: colors.textSecondary,
            textTransform: "uppercase",
            fontWeight: "500",
            letterSpacing: 0.5,
          }}
        >
          数据
        </Text>
        <SettingRow icon="download" label="导出 JSON" onPress={handleExport} />
        <SettingRow icon="upload" label="导入 JSON" onPress={handleImport} />
      </View>

      <View className="mt-6">
        <Text
          className="px-5 mb-2"
          style={{
            fontSize: FontSize.footnote,
            color: colors.textSecondary,
            textTransform: "uppercase",
            fontWeight: "500",
            letterSpacing: 0.5,
          }}
        >
          统计
        </Text>
        <View className="mx-5 rounded-2xl p-4" style={{
          backgroundColor: colors.card,
          borderWidth: 0.5,
          borderColor: colors.separator,
        }}>
          <View className="flex-row justify-between mb-2.5">
            <Text style={{ fontSize: FontSize.subhead, color: colors.textSecondary, letterSpacing: -0.1 }}>提示词总数</Text>
            <Text style={{ fontSize: FontSize.subhead, fontWeight: "600", color: colors.text, letterSpacing: -0.1 }}>{totalPrompts}</Text>
          </View>
          <View className="flex-row justify-between mb-2.5">
            <Text style={{ fontSize: FontSize.subhead, color: colors.textSecondary, letterSpacing: -0.1 }}>分类数</Text>
            <Text style={{ fontSize: FontSize.subhead, fontWeight: "600", color: colors.text, letterSpacing: -0.1 }}>{totalCategories}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: FontSize.subhead, color: colors.textSecondary, letterSpacing: -0.1 }}>已收藏</Text>
            <Text style={{ fontSize: FontSize.subhead, fontWeight: "600", color: colors.text, letterSpacing: -0.1 }}>{favoritedCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
