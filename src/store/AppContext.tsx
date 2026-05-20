import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { Prompt, Category, AppAction } from "../types";
import { loadData, saveData } from "./storage";
import { DEFAULT_CATEGORIES } from "../constants/defaults";

interface AppState {
  prompts: Prompt[];
  categories: Category[];
  isLoading: boolean;
}

const initialState: AppState = {
  prompts: [],
  categories: [],
  isLoading: true,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return {
        ...state,
        prompts: action.prompts,
        categories: action.categories,
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

  useEffect(() => {
    (async () => {
      const data = await loadData();
      if (data.categories.length === 0) {
        dispatch({
          type: "SET_INITIAL_DATA",
          prompts: data.prompts,
          categories: DEFAULT_CATEGORIES,
        });
      } else {
        dispatch({
          type: "SET_INITIAL_DATA",
          prompts: data.prompts,
          categories: data.categories,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      saveData(state.prompts, state.categories);
    }
  }, [state.prompts, state.categories]);

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
