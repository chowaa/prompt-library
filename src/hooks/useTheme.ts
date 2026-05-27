import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/theme";
import { useApp } from "../store/AppContext";

export function useTheme() {
  const colorScheme = useColorScheme();
  const { state: { themeMode } } = useApp();

  const isDark = useMemo(() => {
    if (themeMode === "system") return colorScheme === "dark";
    return themeMode === "dark";
  }, [colorScheme, themeMode]);

  const colors = isDark ? Colors.dark : Colors.light;
  return { isDark, colors };
}
