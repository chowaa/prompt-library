import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useTheme } from "../hooks/useTheme";
import { TabParamList } from "../types";
import { FontSize } from "../constants/theme";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0.5,
          borderTopColor: colors.separator,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.caption2,
          fontWeight: "500",
          letterSpacing: -0.05,
        },
        headerStyle: {
          backgroundColor: colors.background,
          shadowColor: "transparent",
          borderBottomWidth: 0.5,
          borderBottomColor: colors.separator,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontSize: FontSize.body,
          fontWeight: "600",
          letterSpacing: -0.2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "提示词库",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "设置",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
