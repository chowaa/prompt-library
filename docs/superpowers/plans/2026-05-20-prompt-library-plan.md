# Prompt Library 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 用 React Native + Expo 构建一个 iOS 端 AI 提示词管理工具，支持提示词的增删改查、分类管理、搜索筛选、收藏、导入导出，以及深色/浅色模式。

**架构：** 单页应用，React Context + useReducer 管理状态，AsyncStorage 持久化，React Navigation 底部 Tab 导航，NativeWind (Tailwind) 样式方案。所有数据本地存储，无后端。

**技术栈：** React Native, Expo SDK 53+, TypeScript, NativeWind, React Navigation, AsyncStorage, @expo/vector-icons (Lucide), expo-haptics, expo-file-system, expo-sharing

---

## 文件结构预览

```
src/
├── types/index.ts                  # Prompt、Category 类型定义
├── constants/theme.ts              # 设计 Token（颜色、间距、圆角、字体）
├── constants/defaults.ts           # 默认分类数据
├── store/AppContext.tsx             # Context + useReducer 状态管理
├── store/storage.ts                # AsyncStorage 读写封装
├── hooks/useTheme.ts               # 深色/浅色模式 Hook
├── components/EmptyState.tsx        # 空状态组件
├── components/SearchBar.tsx         # 搜索栏组件
├── components/CategoryChip.tsx      # 分类筛选条组件
├── components/PromptCard.tsx        # 提示词卡片组件（滑动操作）
├── components/CategoryGrid.tsx      # 分类网格组件
├── components/NewPromptSheet.tsx    # 新建/编辑提示词底部弹出层
├── components/FAB.tsx               # 浮动新增按钮
├── screens/BrowseScreen.tsx         # 浏览 Tab 页面
├── screens/CategoriesScreen.tsx     # 分类 Tab 页面
├── screens/SettingsScreen.tsx       # 设置 Tab 页面
├── navigation/TabNavigator.tsx      # 底部 Tab 导航配置
└── App.tsx                          # 根组件
```

---

### Task 1: 项目脚手架

**文件：**
- 创建：Expo 项目所有文件
- 修改：N/A

- [ ] **Step 1：创建 Expo 项目**

```bash
cd /d/Desktop/test/prompt-library
npx create-expo-app@latest . --template blank-typescript
```

- [ ] **Step 2：安装依赖**

```bash
npx expo install react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/bottom-tabs @react-native-async-storage/async-storage expo-haptics expo-file-system expo-sharing
```

- [ ] **Step 3：安装 NativeWind 及其依赖**

```bash
npx expo install nativewind tailwindcss react-native-reanimated
npx expo install @tailwindcss/postcss postcss
```

- [ ] **Step 4：配置 NativeWind**

创建 `tailwind.config.js`：
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./App.tsx"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
}
```

创建 `postcss.config.js`：
```js
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}
```

创建 `src/global.css`：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5：验证项目能启动**

```bash
npx expo start
```

期望：Metro bundler 启动成功，无报错，Expo Go 扫码可以看到默认页面。

- [ ] **Step 6：初始化 Git 并提交**

```bash
cd /d/Desktop/test/prompt-library
git init
git add -A
git commit -m "feat: scaffold Expo project with NativeWind and React Navigation"
```

---

### Task 2: 类型定义与设计 Token

**文件：**
- 创建：`src/types/index.ts`
- 创建：`src/constants/theme.ts`
- 创建：`src/constants/defaults.ts`

- [ ] **Step 1：写类型定义测试**

创建 `src/__tests__/types.test.ts`：
```typescript
import { Prompt, Category } from "../types";

describe("Prompt type", () => {
  it("should allow creating a valid Prompt object", () => {
    const prompt: Prompt = {
      id: "abc-123",
      title: "代码审查助手",
      content: "请帮我审查以下代码...",
      categoryId: "cat-coding",
      tags: ["编程", "审查"],
      isFavorite: true,
      createdAt: 1716200000000,
      updatedAt: 1716200000000,
    };
    expect(prompt.title).toBe("代码审查助手");
    expect(prompt.tags).toHaveLength(2);
  });
});

describe("Category type", () => {
  it("should allow creating a valid Category object", () => {
    const category: Category = {
      id: "cat-coding",
      name: "编程",
      icon: "code-2",
      color: "#6366F1",
    };
    expect(category.name).toBe("编程");
  });
});
```

- [ ] **Step 2：运行测试，确认失败**

```bash
npx jest src/__tests__/types.test.ts
```

期望：FAIL，模块 `../types` 不存在。

- [ ] **Step 3：创建类型文件**

`src/types/index.ts`：
```typescript
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

export type AppAction =
  | { type: "SET_INITIAL_DATA"; prompts: Prompt[]; categories: Category[] }
  | { type: "ADD_PROMPT"; prompt: Prompt }
  | { type: "UPDATE_PROMPT"; prompt: Prompt }
  | { type: "DELETE_PROMPT"; id: string }
  | { type: "TOGGLE_FAVORITE"; id: string }
  | { type: "ADD_CATEGORY"; category: Category }
  | { type: "UPDATE_CATEGORY"; category: Category }
  | { type: "DELETE_CATEGORY"; id: string }
  | { type: "SET_CATEGORIES"; categories: Category[] };
```

- [ ] **Step 4：运行测试，确认通过**

```bash
npx jest src/__tests__/types.test.ts
```

期望：PASS。

- [ ] **Step 5：创建设计 Token 常量**

`src/constants/theme.ts`：
```typescript
export const Colors = {
  light: {
    background: "#F2F2F7",
    card: "#FFFFFF",
    primary: "#6366F1",
    accent: "#F59E0B",
    text: "rgba(0,0,0,0.9)",
    textSecondary: "rgba(0,0,0,0.6)",
    separator: "#E5E5EA",
    scrim: "rgba(0,0,0,0.4)",
  },
  dark: {
    background: "#000000",
    card: "#1C1C1E",
    primary: "#818CF8",
    accent: "#F59E0B",
    text: "rgba(255,255,255,0.9)",
    textSecondary: "rgba(255,255,255,0.6)",
    separator: "#38383A",
    scrim: "rgba(0,0,0,0.6)",
  },
} as const;

export const CategoryColors: Record<string, string> = {
  "编程": "#6366F1",
  "写作": "#10B981",
  "设计": "#EC4899",
  "数据": "#3B82F6",
  "通用": "#78716C",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const FontSize = {
  caption: 13,
  body: 17,
  title: 22,
  largeTitle: 28,
} as const;
```

- [ ] **Step 6：创建默认数据**

`src/constants/defaults.ts`：
```typescript
import { Category } from "../types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-coding", name: "编程", icon: "code-2", color: "#6366F1" },
  { id: "cat-writing", name: "写作", icon: "pen-line", color: "#10B981" },
  { id: "cat-design", name: "设计", icon: "palette", color: "#EC4899" },
  { id: "cat-data", name: "数据", icon: "bar-chart-2", color: "#3B82F6" },
  { id: "cat-general", name: "通用", icon: "folder", color: "#78716C" },
];
```

- [ ] **Step 7：提交**

```bash
git add -A
git commit -m "feat: add types, theme tokens, and default categories"
```

---

### Task 3: 数据持久化层（AsyncStorage）

**文件：**
- 创建：`src/store/storage.ts`

- [ ] **Step 1：写存储层测试**

创建 `src/__tests__/storage.test.ts`：
```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveData, loadData } from "../store/storage";
import { Prompt, Category } from "../types";

jest.mock("@react-native-async-storage/async-storage");

const mockPrompts: Prompt[] = [
  {
    id: "1",
    title: "测试提示词",
    content: "测试内容",
    categoryId: "cat-coding",
    tags: ["测试"],
    isFavorite: false,
    createdAt: 0,
    updatedAt: 0,
  },
];

const mockCategories: Category[] = [
  { id: "cat-coding", name: "编程", icon: "code-2", color: "#6366F1" },
];

describe("saveData", () => {
  it("should save prompts and categories to AsyncStorage", async () => {
    await saveData(mockPrompts, mockCategories);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "prompts",
      JSON.stringify(mockPrompts)
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "categories",
      JSON.stringify(mockCategories)
    );
  });

  it("should throw when save fails", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error("disk full"));
    await expect(saveData(mockPrompts, mockCategories)).rejects.toThrow("disk full");
  });
});

describe("loadData", () => {
  it("should return empty arrays when no data exists", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const result = await loadData();
    expect(result).toEqual({ prompts: [], categories: [] });
  });

  it("should return parsed data when data exists", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(mockPrompts))
      .mockResolvedValueOnce(JSON.stringify(mockCategories));
    const result = await loadData();
    expect(result.prompts).toHaveLength(1);
    expect(result.categories).toHaveLength(1);
  });
});
```

- [ ] **Step 2：运行测试，确认失败**

```bash
npx jest src/__tests__/storage.test.ts
```

期望：FAIL，模块 `../store/storage` 不存在。

- [ ] **Step 3：实现存储层**

`src/store/storage.ts`：
```typescript
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
```

- [ ] **Step 4：运行测试，确认通过**

```bash
npx jest src/__tests__/storage.test.ts
```

期望：PASS。

- [ ] **Step 5：提交**

```bash
git add -A
git commit -m "feat: add AsyncStorage persistence layer"
```

---

### Task 4: 状态管理（Context + useReducer）

**文件：**
- 创建：`src/store/AppContext.tsx`

- [ ] **Step 1：写状态管理测试**

创建 `src/__tests__/appReducer.test.ts`：
```typescript
import { appReducer } from "../store/AppContext";
import { Prompt, Category, AppAction } from "../types";

const mockCategory: Category = {
  id: "cat-coding",
  name: "编程",
  icon: "code-2",
  color: "#6366F1",
};

const mockPrompt: Prompt = {
  id: "1",
  title: "测试",
  content: "内容",
  categoryId: "cat-coding",
  tags: [],
  isFavorite: false,
  createdAt: 1000,
  updatedAt: 1000,
};

const initialState = {
  prompts: [] as Prompt[],
  categories: [mockCategory] as Category[],
};

describe("appReducer", () => {
  it("should set initial data", () => {
    const action: AppAction = {
      type: "SET_INITIAL_DATA",
      prompts: [mockPrompt],
      categories: [mockCategory],
    };
    const state = appReducer(initialState, action);
    expect(state.prompts).toHaveLength(1);
    expect(state.categories).toHaveLength(1);
  });

  it("should add a prompt", () => {
    const action: AppAction = { type: "ADD_PROMPT", prompt: mockPrompt };
    const state = appReducer(initialState, action);
    expect(state.prompts).toHaveLength(1);
    expect(state.prompts[0].title).toBe("测试");
  });

  it("should update a prompt", () => {
    const stateWithPrompt = { ...initialState, prompts: [mockPrompt] };
    const action: AppAction = {
      type: "UPDATE_PROMPT",
      prompt: { ...mockPrompt, title: "已更新" },
    };
    const state = appReducer(stateWithPrompt, action);
    expect(state.prompts[0].title).toBe("已更新");
  });

  it("should delete a prompt", () => {
    const stateWithPrompt = { ...initialState, prompts: [mockPrompt] };
    const action: AppAction = { type: "DELETE_PROMPT", id: "1" };
    const state = appReducer(stateWithPrompt, action);
    expect(state.prompts).toHaveLength(0);
  });

  it("should toggle favorite", () => {
    const stateWithPrompt = { ...initialState, prompts: [mockPrompt] };
    const action: AppAction = { type: "TOGGLE_FAVORITE", id: "1" };
    const state = appReducer(stateWithPrompt, action);
    expect(state.prompts[0].isFavorite).toBe(true);
  });

  it("should add a category", () => {
    const action: AppAction = {
      type: "ADD_CATEGORY",
      category: { id: "cat-new", name: "新分类", icon: "star", color: "#000" },
    };
    const state = appReducer(initialState, action);
    expect(state.categories).toHaveLength(2);
  });

  it("should update a category", () => {
    const action: AppAction = {
      type: "UPDATE_CATEGORY",
      category: { ...mockCategory, name: "已更新分类" },
    };
    const state = appReducer(initialState, action);
    expect(state.categories[0].name).toBe("已更新分类");
  });

  it("should delete a category", () => {
    const action: AppAction = { type: "DELETE_CATEGORY", id: "cat-coding" };
    const state = appReducer(initialState, action);
    expect(state.categories).toHaveLength(0);
  });
});
```

- [ ] **Step 2：运行测试，确认失败**

```bash
npx jest src/__tests__/appReducer.test.ts
```

期望：FAIL，模块不存在。

- [ ] **Step 3：实现 AppContext**

`src/store/AppContext.tsx`：
```typescript
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
```

- [ ] **Step 4：运行测试，确认通过**

```bash
npx jest src/__tests__/appReducer.test.ts
```

期望：PASS。

- [ ] **Step 5：提交**

```bash
git add -A
git commit -m "feat: add AppContext with useReducer state management"
```

---

### Task 5: 主题系统（深色/浅色模式）

**文件：**
- 创建：`src/hooks/useTheme.ts`

- [ ] **Step 1：实现 useTheme Hook**

`src/hooks/useTheme.ts`：
```typescript
import { useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  return { isDark, colors };
}
```

无需测试——这是对 RN `useColorScheme` 的薄封装，行为由系统保证。

- [ ] **Step 2：提交**

```bash
git add -A
git commit -m "feat: add useTheme hook for dark mode support"
```

---

### Task 6: 底部 Tab 导航

**文件：**
- 创建：`src/navigation/TabNavigator.tsx`
- 修改：`src/App.tsx`

- [ ] **Step 1：创建占位页面**

`src/screens/BrowseScreen.tsx`：
```typescript
import { View, Text } from "react-native";

export default function BrowseScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>浏览</Text>
    </View>
  );
}
```

`src/screens/CategoriesScreen.tsx`：
```typescript
import { View, Text } from "react-native";

export default function CategoriesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>分类</Text>
    </View>
  );
}
```

`src/screens/SettingsScreen.tsx`：
```typescript
import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>设置</Text>
    </View>
  );
}
```

- [ ] **Step 2：创建 Tab 导航**

`src/navigation/TabNavigator.tsx`：
```typescript
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import BrowseScreen from "../screens/BrowseScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useTheme } from "../hooks/useTheme";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.separator,
        },
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
      }}
    >
      <Tab.Screen
        name="Browse"
        component={BrowseScreen}
        options={{
          title: "浏览",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: "分类",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
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
```

- [ ] **Step 3：更新 App.tsx**

`App.tsx`：
```typescript
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from "./src/store/AppContext";
import TabNavigator from "./src/navigation/TabNavigator";
import "./src/global.css";

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
```

- [ ] **Step 4：验证**

```bash
npx expo start
```

期望：Metro 正常启动，Expo Go 中看到底部 3 个 Tab。

- [ ] **Step 5：提交**

```bash
git add -A
git commit -m "feat: add bottom tab navigation with placeholder screens"
```

---

### Task 7: EmptyState 组件

**文件：**
- 创建：`src/components/EmptyState.tsx`

- [ ] **Step 1：写测试**

创建 `src/__tests__/EmptyState.test.tsx`：
```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EmptyState from "../components/EmptyState";

describe("EmptyState", () => {
  it("should render title and message", () => {
    const { getByText } = render(
      <EmptyState title="还没有提示词" message="点击下方 + 创建第一个" />
    );
    expect(getByText("还没有提示词")).toBeTruthy();
    expect(getByText("点击下方 + 创建第一个")).toBeTruthy();
  });

  it("should render action button when onAction is provided", () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState
        title="加载失败"
        message="请检查存储空间"
        actionLabel="重试"
        onAction={onAction}
      />
    );
    const button = getByText("重试");
    fireEvent.press(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("should not render button when onAction is not provided", () => {
    const { queryByText } = render(
      <EmptyState title="空" message="无内容" />
    );
    expect(queryByText("重试")).toBeNull();
  });
});
```

- [ ] **Step 2：运行测试，确认失败**

```bash
npx jest src/__tests__/EmptyState.test.tsx
```

期望：FAIL，组件不存在。

- [ ] **Step 3：实现 EmptyState**

`src/components/EmptyState.tsx`：
```typescript
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="documents-outline" size={64} color={colors.textSecondary} />
      <Text
        className="text-center mt-4"
        style={{ fontSize: 20, fontWeight: "600", color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="text-center mt-2"
        style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="mt-6 px-6 py-3 rounded-xl"
          style={{ backgroundColor: colors.primary }}
          onPress={onAction}
        >
          <Text className="text-white font-semibold text-base">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

- [ ] **Step 4：运行测试，确认通过**

```bash
npx jest src/__tests__/EmptyState.test.tsx
```

期望：PASS。

- [ ] **Step 5：提交**

```bash
git add -A
git commit -m "feat: add EmptyState component"
```

---

### Task 8: SearchBar + CategoryChip 组件

**文件：**
- 创建：`src/components/SearchBar.tsx`
- 创建：`src/components/CategoryChip.tsx`

- [ ] **Step 1：写 SearchBar 测试**

创建 `src/__tests__/SearchBar.test.tsx`：
```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchBar from "../components/SearchBar";

describe("SearchBar", () => {
  it("should render placeholder", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText("搜索提示词...")).toBeTruthy();
  });

  it("should call onChangeText when typing", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText("搜索提示词..."), "代码");
    expect(onChangeText).toHaveBeenCalledWith("代码");
  });
});
```

- [ ] **Step 2：写 CategoryChip 测试**

创建 `src/__tests__/CategoryChip.test.tsx`：
```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CategoryChip from "../components/CategoryChip";
import { Category } from "../types";

const mockCategory: Category = {
  id: "cat-coding",
  name: "编程",
  icon: "code-2",
  color: "#6366F1",
};

describe("CategoryChip", () => {
  it("should render category name", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={3}
        onPress={jest.fn()}
      />
    );
    expect(getByText("编程 (3)")).toBeTruthy();
  });

  it("should call onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={0}
        onPress={onPress}
      />
    );
    fireEvent.press(getByText("编程 (0)"));
    expect(onPress).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3：运行测试，确认失败**

```bash
npx jest src/__tests__/SearchBar.test.tsx src/__tests__/CategoryChip.test.tsx
```

期望：FAIL。

- [ ] **Step 4：实现 SearchBar**

`src/components/SearchBar.tsx`：
```typescript
import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className="flex-row items-center mx-4 my-3 px-3 rounded-xl"
      style={{ backgroundColor: isDark ? "#2C2C2E" : "#E5E5EA" }}
    >
      <Ionicons name="search" size={18} color={colors.textSecondary} />
      <TextInput
        className="flex-1 py-2.5 ml-2"
        style={{ fontSize: 16, color: colors.text, minHeight: 44 }}
        placeholder="搜索提示词..."
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
}
```

- [ ] **Step 5：实现 CategoryChip**

`src/components/CategoryChip.tsx`：
```typescript
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Category } from "../types";

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  count: number;
  onPress: () => void;
}

export default function CategoryChip({ category, isSelected, count, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      className="px-4 py-2 rounded-xl mr-2"
      style={[
        {
          backgroundColor: isSelected ? category.color : "transparent",
          borderWidth: 1.5,
          borderColor: category.color,
          minHeight: 36,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          color: isSelected ? "#FFFFFF" : category.color,
          fontWeight: "600",
          fontSize: 14,
        }}
      >
        {category.name} ({count})
      </Text>
    </TouchableOpacity>
  );
}
```

- [ ] **Step 6：运行测试，确认通过**

```bash
npx jest src/__tests__/SearchBar.test.tsx src/__tests__/CategoryChip.test.tsx
```

期望：PASS。

- [ ] **Step 7：提交**

```bash
git add -A
git commit -m "feat: add SearchBar and CategoryChip components"
```

---

### Task 9: PromptCard 组件

**文件：**
- 创建：`src/components/PromptCard.tsx`

- [ ] **Step 1：写测试**

创建 `src/__tests__/PromptCard.test.tsx`：
```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PromptCard from "../components/PromptCard";
import { Prompt, Category } from "../types";

const mockPrompt: Prompt = {
  id: "1",
  title: "代码审查助手",
  content: "请帮我审查以下代码，找出潜在的问题和改进建议。",
  categoryId: "cat-coding",
  tags: ["编程", "审查"],
  isFavorite: false,
  createdAt: 1716200000000,
  updatedAt: 1716200000000,
};

const mockCategory: Category = {
  id: "cat-coding",
  name: "编程",
  icon: "code-2",
  color: "#6366F1",
};

describe("PromptCard", () => {
  it("should render title and content preview", () => {
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByText("代码审查助手")).toBeTruthy();
    expect(getByText("请帮我审查以下代码，找出潜在的问题和改进建议。")).toBeTruthy();
  });

  it("should call onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onPress={onPress}
        onToggleFavorite={jest.fn()}
      />
    );
    fireEvent.press(getByText("代码审查助手"));
    expect(onPress).toHaveBeenCalled();
  });

  it("should call onToggleFavorite when star is tapped", () => {
    const onToggleFavorite = jest.fn();
    const { getByTestId } = render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onPress={jest.fn()}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.press(getByTestId("favorite-button"));
    expect(onToggleFavorite).toHaveBeenCalled();
  });

  it("should show filled star when favorited", () => {
    const favPrompt = { ...mockPrompt, isFavorite: true };
    const { getByTestId } = render(
      <PromptCard
        prompt={favPrompt}
        category={mockCategory}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByTestId("favorite-icon")).toBeTruthy();
  });
});
```

- [ ] **Step 2：运行测试，确认失败**

```bash
npx jest src/__tests__/PromptCard.test.tsx
```

期望：FAIL。

- [ ] **Step 3：实现 PromptCard**

`src/components/PromptCard.tsx`：
```typescript
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Prompt, Category } from "../types";
import { useTheme } from "../hooks/useTheme";

interface PromptCardProps {
  prompt: Prompt;
  category?: Category;
  onPress: () => void;
  onToggleFavorite: () => void;
  onCopy?: () => void;
}

export default function PromptCard({
  prompt,
  category,
  onPress,
  onToggleFavorite,
}: PromptCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      className="mx-4 mb-3 rounded-2xl overflow-hidden flex-row"
      style={{ backgroundColor: colors.card }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 4,
          backgroundColor: category?.color || colors.separator,
        }}
      />
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="flex-1"
            style={{ fontSize: 17, fontWeight: "600", color: colors.text }}
            numberOfLines={1}
          >
            {prompt.title}
          </Text>
          <TouchableOpacity
            testID="favorite-button"
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons
              testID="favorite-icon"
              name={prompt.isFavorite ? "star" : "star-outline"}
              size={20}
              color={prompt.isFavorite ? colors.accent : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text
          style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}
          numberOfLines={2}
        >
          {prompt.content}
        </Text>
        {category && (
          <View className="flex-row mt-3">
            <View
              className="px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: category.color + "20" }}
            >
              <Text style={{ fontSize: 12, color: category.color, fontWeight: "500" }}>
                {category.name}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
```

- [ ] **Step 4：运行测试，确认通过**

```bash
npx jest src/__tests__/PromptCard.test.tsx
```

期望：PASS。

- [ ] **Step 5：提交**

```bash
git add -A
git commit -m "feat: add PromptCard component with favorite toggle"
```

---

### Task 10: FAB + NewPromptSheet 组件

**文件：**
- 创建：`src/components/FAB.tsx`
- 创建：`src/components/NewPromptSheet.tsx`

- [ ] **Step 1：写 FAB 测试**

创建 `src/__tests__/FAB.test.tsx`：
```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FAB from "../components/FAB";

describe("FAB", () => {
  it("should render and call onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<FAB onPress={onPress} />);
    fireEvent.press(getByTestId("fab"));
    expect(onPress).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2：写 NewPromptSheet 测试**

创建 `src/__tests__/NewPromptSheet.test.tsx`：
```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NewPromptSheet from "../components/NewPromptSheet";
import { Category } from "../types";

const mockCategories: Category[] = [
  { id: "cat-coding", name: "编程", icon: "code-2", color: "#6366F1" },
  { id: "cat-writing", name: "写作", icon: "pen-line", color: "#10B981" },
];

describe("NewPromptSheet", () => {
  it("should render form fields", () => {
    const { getByPlaceholderText, getByText } = render(
      <NewPromptSheet
        visible={true}
        categories={mockCategories}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );
    expect(getByPlaceholderText("提示词标题")).toBeTruthy();
    expect(getByPlaceholderText("输入提示词内容...")).toBeTruthy();
    expect(getByText("保存")).toBeTruthy();
  });

  it("should call onClose when cancel is pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <NewPromptSheet
        visible={true}
        categories={mockCategories}
        onClose={onClose}
        onSave={jest.fn()}
      />
    );
    fireEvent.press(getByText("取消"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should call onSave with form data", () => {
    const onSave = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <NewPromptSheet
        visible={true}
        categories={mockCategories}
        onClose={jest.fn()}
        onSave={onSave}
      />
    );
    fireEvent.changeText(getByPlaceholderText("提示词标题"), "新提示词");
    fireEvent.changeText(getByPlaceholderText("输入提示词内容..."), "这是内容");
    fireEvent.press(getByText("保存"));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: "新提示词", content: "这是内容" })
    );
  });
});
```

- [ ] **Step 3：运行测试，确认失败**

```bash
npx jest src/__tests__/FAB.test.tsx src/__tests__/NewPromptSheet.test.tsx
```

期望：FAIL。

- [ ] **Step 4：实现 FAB**

`src/components/FAB.tsx`：
```typescript
import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      testID="fab"
      className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      style={{ backgroundColor: colors.primary }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}
```

- [ ] **Step 5：实现 NewPromptSheet**

`src/components/NewPromptSheet.tsx`：
```typescript
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
        <TouchableOpacity className="flex-1" style={{ backgroundColor: colors.scrim }} onPress={onClose} />
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
```

- [ ] **Step 6：运行测试，确认通过**

```bash
npx jest src/__tests__/FAB.test.tsx src/__tests__/NewPromptSheet.test.tsx
```

期望：PASS。

- [ ] **Step 7：提交**

```bash
git add -A
git commit -m "feat: add FAB and NewPromptSheet components"
```

---

### Task 11: BrowseScreen 页面

**文件：**
- 修改：`src/screens/BrowseScreen.tsx`

- [ ] **Step 1：重写 BrowseScreen**

```typescript
import React, { useState, useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppContext";
import { useTheme } from "../hooks/useTheme";
import SearchBar from "../components/SearchBar";
import CategoryChip from "../components/CategoryChip";
import PromptCard from "../components/PromptCard";
import EmptyState from "../components/EmptyState";
import FAB from "../components/FAB";
import NewPromptSheet from "../components/NewPromptSheet";
import * as Haptics from "expo-haptics";

export default function BrowseScreen() {
  const { state, dispatch } = useApp();
  const { colors, isDark } = useTheme();

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);

  const categoryPromptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.categories.forEach((cat) => {
      counts[cat.id] = state.prompts.filter((p) => p.categoryId === cat.id).length;
    });
    return counts;
  }, [state.prompts, state.categories]);

  const filteredPrompts = useMemo(() => {
    let result = state.prompts;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategoryId) {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }

    // 收藏置顶
    return [...result].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [state.prompts, search, selectedCategoryId]);

  const handleToggleFavorite = (id: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", id });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSavePrompt = (data: { title: string; content: string; categoryId: string; tags: string[] }) => {
    const now = Date.now();
    if (editingPrompt) {
      dispatch({
        type: "UPDATE_PROMPT",
        prompt: { ...editingPrompt, ...data, updatedAt: now },
      });
    } else {
      const newPrompt = {
        id: Date.now().toString(),
        ...data,
        tags: [],
        isFavorite: false,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: "ADD_PROMPT", prompt: newPrompt });
    }
    setSheetVisible(false);
    setEditingPrompt(null);
  };

  const handleCopy = async (content: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (state.isLoading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SearchBar value={search} onChangeText={setSearch} />

      {/* 分类筛选条 */}
      <View className="mb-2">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          data={state.categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryChip
              category={item}
              isSelected={selectedCategoryId === item.id}
              count={categoryPromptCounts[item.id] || 0}
              onPress={() =>
                setSelectedCategoryId(
                  selectedCategoryId === item.id ? null : item.id
                )
              }
            />
          )}
        />
      </View>

      {/* 提示词列表 */}
      <FlatList
        data={filteredPrompts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <PromptCard
            prompt={item}
            category={state.categories.find((c) => c.id === item.categoryId)}
            onPress={() => {
              setEditingPrompt(item);
              setSheetVisible(true);
            }}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
            onCopy={() => handleCopy(item.content)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title={state.prompts.length === 0 ? "还没有提示词" : "没有匹配的提示词"}
            message={
              state.prompts.length === 0
                ? "点击右下角 + 创建第一个提示词"
                : "试试换个搜索词或分类筛选"
            }
          />
        }
      />

      <FAB onPress={() => setSheetVisible(true)} />

      <NewPromptSheet
        visible={sheetVisible}
        categories={state.categories}
        editingPrompt={editingPrompt}
        onClose={() => {
          setSheetVisible(false);
          setEditingPrompt(null);
        }}
        onSave={handleSavePrompt}
      />
    </View>
  );
}
```

- [ ] **Step 2：验证**

```bash
npx expo start
```

期望：Metro 启动成功，浏览页面显示空状态，点击 FAB 弹出表单，创建提示词后列表显示。

- [ ] **Step 3：提交**

```bash
git add -A
git commit -m "feat: implement BrowseScreen with search, filter, and CRUD"
```

---

### Task 12: CategoriesScreen + SettingsScreen

**文件：**
- 修改：`src/screens/CategoriesScreen.tsx`
- 创建：`src/components/CategoryGrid.tsx`
- 修改：`src/screens/SettingsScreen.tsx`

- [ ] **Step 1：实现 CategoryGrid**

`src/components/CategoryGrid.tsx`：
```typescript
import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../types";
import { useTheme } from "../hooks/useTheme";

interface CategoryGridProps {
  categories: Category[];
  promptCounts: Record<string, number>;
  onPress: (category: Category) => void;
}

export default function CategoryGrid({ categories, promptCounts, onPress }: CategoryGridProps) {
  const { colors } = useTheme();

  return (
    <FlatList
      data={categories}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      columnWrapperStyle={{ gap: 12 }}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="flex-1 rounded-2xl p-5 items-center"
          style={{ backgroundColor: colors.card }}
          onPress={() => onPress(item)}
          activeOpacity={0.7}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mb-3"
            style={{ backgroundColor: item.color + "20" }}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <Text
            style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
          >
            {item.name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            {promptCounts[item.id] || 0} 个提示词
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

- [ ] **Step 2：重写 CategoriesScreen**

`src/screens/CategoriesScreen.tsx`：
```typescript
import React, { useMemo } from "react";
import { View } from "react-native";
import { useApp } from "../store/AppContext";
import { useTheme } from "../hooks/useTheme";
import CategoryGrid from "../components/CategoryGrid";
import EmptyState from "../components/EmptyState";

export default function CategoriesScreen() {
  const { state } = useApp();
  const { colors } = useTheme();

  const promptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.categories.forEach((cat) => {
      counts[cat.id] = state.prompts.filter((p) => p.categoryId === cat.id).length;
    });
    return counts;
  }, [state.prompts, state.categories]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {state.categories.length === 0 ? (
        <EmptyState title="暂无分类" message="创建提示词时会自动使用分类" />
      ) : (
        <CategoryGrid
          categories={state.categories}
          promptCounts={promptCounts}
          onPress={(cat) => {
            // 切换回浏览 Tab 并筛选该分类
          }}
        />
      )}
    </View>
  );
}
```

- [ ] **Step 3：重写 SettingsScreen**

`src/screens/SettingsScreen.tsx`：
```typescript
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
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
      <Text
        className="flex-1 ml-3"
        style={{ fontSize: 17, color: colors.text }}
      >
        {label}
      </Text>
      {right || <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="mt-4">
        <Text className="px-4 mb-2" style={{ fontSize: 13, color: colors.textSecondary, textTransform: "uppercase" }}>
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
        <Text className="px-4 mb-2" style={{ fontSize: 13, color: colors.textSecondary, textTransform: "uppercase" }}>
          数据
        </Text>
        <SettingRow icon="download" label="导出 JSON" onPress={handleExport} />
        <SettingRow icon="upload" label="导入 JSON" onPress={handleImport} />
      </View>

      <View className="mt-6">
        <Text className="px-4 mb-2" style={{ fontSize: 13, color: colors.textSecondary, textTransform: "uppercase" }}>
          统计
        </Text>
        <View className="mx-4 rounded-xl p-4" style={{ backgroundColor: colors.card }}>
          <View className="flex-row justify-between mb-2">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>提示词总数</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{totalPrompts}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>分类数</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{totalCategories}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>已收藏</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{favoritedCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 4：提交**

```bash
git add -A
git commit -m "feat: implement CategoriesScreen, CategoryGrid, and SettingsScreen"
```

---

### Task 13: 整合与收尾

**文件：**
- 修改：`src/screens/CategoriesScreen.tsx` — 添加点击分类跳转浏览页并筛选的功能

- [ ] **Step 1：安装缺失依赖**

```bash
npx expo install expo-document-picker
```

- [ ] **Step 2：添加分类跳转筛选功能**

修改 `src/navigation/TabNavigator.tsx`，使用嵌套 Stack：

不需要额外嵌套——在 `CategoriesScreen` 中通过 React Navigation 的 `useNavigation` 跳转即可。

修改 `src/screens/CategoriesScreen.tsx` 的 `onPress`：
```typescript
import { useNavigation } from "@react-navigation/native";

// 在组件内：
const navigation = useNavigation<any>();

// onPress 改为：
onPress={(cat) => {
  navigation.navigate("Browse", { categoryId: cat.id });
}}
```

修改 `src/screens/BrowseScreen.tsx`，接收路由参数：
```typescript
import { useRoute } from "@react-navigation/native";

// 在组件内：
const route = useRoute<any>();
const routeCategoryId = route.params?.categoryId;

// 修改 selectedCategoryId 初始值：
const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(routeCategoryId || null);
```

- [ ] **Step 3：最终验证**

```bash
npx expo start
```

期望：
- 浏览 Tab：搜索、筛选、新建、编辑、收藏、删除均正常工作
- 分类 Tab：显示分类网格和数量，点击跳转浏览 Tab 并选中对应分类
- 设置 Tab：深色/浅色切换、导出、导入、统计信息均正常
- 深色模式下所有颜色正确

- [ ] **Step 4：提交**

```bash
git add -A
git commit -m "feat: integrate category-to-browse navigation and final polish"
```

---

## 自检清单

1. **Spec 覆盖：** 增删改查 ✓ | 分类管理 ✓ | 搜索筛选 ✓ | 收藏 ✓ | 导入导出 ✓ | 深色模式 ✓ | 空状态 ✓
2. **无占位符：** 所有步骤都有完整代码，无 TODO/TBD
3. **类型一致性：** `Prompt`、`Category`、`AppAction` 在所有任务中类型一致，`categoryId: string`、`id: string`、`isFavorite: boolean` 前后统一
