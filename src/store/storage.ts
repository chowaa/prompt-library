import AsyncStorage from "@react-native-async-storage/async-storage";
import { Prompt, Category, ThemeMode } from "../types";

const PROMPTS_KEY = "prompts";
const CATEGORIES_KEY = "categories";
const THEME_MODE_KEY = "themeMode";

export async function saveData(
  prompts: Prompt[],
  categories: Category[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    throw new Error("SAVE_FAILED");
  }
}

function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export async function loadData(): Promise<{
  prompts: Prompt[];
  categories: Category[];
  themeMode: ThemeMode;
}> {
  try {
    const [promptsJson, categoriesJson, themeModeRaw] = await Promise.all([
      AsyncStorage.getItem(PROMPTS_KEY),
      AsyncStorage.getItem(CATEGORIES_KEY),
      AsyncStorage.getItem(THEME_MODE_KEY),
    ]);

    return {
      prompts: safeParse<Prompt[]>(promptsJson, []),
      categories: safeParse<Category[]>(categoriesJson, []),
      themeMode: isValidThemeMode(themeModeRaw) ? themeModeRaw : "system",
    };
  } catch {
    return { prompts: [], categories: [], themeMode: "system" };
  }
}

export async function saveThemeMode(themeMode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_MODE_KEY, themeMode);
  } catch {}
}
