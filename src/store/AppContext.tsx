import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Prompt, Category, AppAction, ThemeMode } from "../types";
import { loadData, saveData, saveThemeMode } from "./storage";
import { DEFAULT_CATEGORIES } from "../constants/defaults";

interface AppState {
  prompts: Prompt[];
  categories: Category[];
  themeMode: ThemeMode;
  isLoading: boolean;
}

const initialState: AppState = {
  prompts: [],
  categories: [],
  themeMode: "system",
  isLoading: true,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return {
        ...state,
        prompts: action.prompts,
        categories: action.categories,
        themeMode: action.themeMode,
        isLoading: false,
      };
    case "ADD_PROMPT":
      return { ...state, prompts: [...state.prompts, action.prompt] };
    case "UPDATE_PROMPT":
      return {
        ...state,
        prompts: state.prompts.map((p) =>
          p.id === action.prompt.id ? action.prompt : p
        ),
      };
    case "DELETE_PROMPT":
      return {
        ...state,
        prompts: state.prompts.filter((p) => p.id !== action.id),
      };
    case "TOGGLE_FAVORITE":
      return {
        ...state,
        prompts: state.prompts.map((p) =>
          p.id === action.id ? { ...p, isFavorite: !p.isFavorite } : p
        ),
      };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.category] };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.category.id ? action.category : c
        ),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
      };
    case "SET_CATEGORIES":
      return { ...state, categories: action.categories };
    case "SET_THEME_MODE":
      return { ...state, themeMode: action.themeMode };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const data = await loadData();
      if (data.categories.length === 0) {
        dispatch({
          type: "SET_INITIAL_DATA",
          prompts: data.prompts,
          categories: DEFAULT_CATEGORIES,
          themeMode: data.themeMode,
        });
      } else {
        dispatch({
          type: "SET_INITIAL_DATA",
          prompts: data.prompts,
          categories: data.categories,
          themeMode: data.themeMode,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (state.isLoading) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveData(state.prompts, state.categories).catch(() => {});
    }, 300);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [state.prompts, state.categories, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveThemeMode(state.themeMode);
    }
  }, [state.themeMode, state.isLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
