import AsyncStorage from "@react-native-async-storage/async-storage";
import { Prompt, Category } from "../types";

const PROMPTS_KEY = "prompts";
const CATEGORIES_KEY = "categories";

export async function saveData(
  prompts: Prompt[],
  categories: Category[]
): Promise<void> {
  await AsyncStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export async function loadData(): Promise<{
  prompts: Prompt[];
  categories: Category[];
}> {
  const promptsJson = await AsyncStorage.getItem(PROMPTS_KEY);
  const categoriesJson = await AsyncStorage.getItem(CATEGORIES_KEY);

  return {
    prompts: promptsJson ? JSON.parse(promptsJson) : [],
    categories: categoriesJson ? JSON.parse(categoriesJson) : [],
  };
}
