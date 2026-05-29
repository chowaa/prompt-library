export interface Prompt {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type ThemeMode = "system" | "light" | "dark";

export type TabParamList = {
  Home: undefined;
  Settings: undefined;
};

export type AppAction =
  | { type: "SET_INITIAL_DATA"; prompts: Prompt[]; categories: Category[]; themeMode: ThemeMode }
  | { type: "ADD_PROMPT"; prompt: Prompt }
  | { type: "UPDATE_PROMPT"; prompt: Prompt }
  | { type: "DELETE_PROMPT"; id: string }
  | { type: "TOGGLE_FAVORITE"; id: string }
  | { type: "ADD_CATEGORY"; category: Category }
  | { type: "UPDATE_CATEGORY"; category: Category }
  | { type: "DELETE_CATEGORY"; id: string }
  | { type: "SET_CATEGORIES"; categories: Category[] }
  | { type: "SET_THEME_MODE"; themeMode: ThemeMode }
  | { type: "SAVE_ERROR"; error: string }
  | { type: "SAVE_SUCCESS" };
