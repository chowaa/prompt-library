# Prompt Library 改进计划 — 代码质量 + iOS 26 设计重构

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**目标：** 修复代码质量缺陷，重构 UI 为 iOS 26 设计语言——毛玻璃材质、柔和圆角、通透阴影、San Francisco 克制排版、大留白、轻量层级。

**范围：** 10 个文件修改，零新依赖引入。

**技术栈：** React Native, Expo SDK 54, TypeScript, NativeWind, React Navigation, AsyncStorage, @expo/vector-icons (Ionicons), expo-haptics

---

## Part 1: 代码质量修复

### Task 1: 类型系统加固

**文件：**
- 修改：`src/types/index.ts`

- [x] **Step 1：新增 ThemeMode 类型**

```typescript
export type ThemeMode = "system" | "light" | "dark";
```

- [x] **Step 2：新增 TabParamList 导航参数类型**

```typescript
export type TabParamList = {
  Browse: { categoryId?: string } | undefined;
  Categories: undefined;
  Settings: undefined;
};
```

- [x] **Step 3：AppAction 新增 SET_THEME_MODE action，SET_INITIAL_DATA 补 themeMode payload**

```typescript
| { type: "SET_INITIAL_DATA"; prompts: Prompt[]; categories: Category[]; themeMode: ThemeMode }
| { type: "SET_THEME_MODE"; themeMode: ThemeMode }
```

### Task 2: 存储层健壮性加固

**文件：**
- 修改：`src/store/storage.ts`

- [x] **Step 1：loadData 返回 themeMode**

返回值新增 `themeMode: ThemeMode` 字段，独立读写 `THEME_MODE_KEY`。

- [x] **Step 2：isValidThemeMode 类型守卫**

```typescript
function isValidThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}
```

取代 `as ThemeMode` 裸断言，运行时真实验证三个值。

- [x] **Step 3：safeParse 泛型工具**

```typescript
function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try { return JSON.parse(json) as T; } catch { return fallback; }
}
```

每个 key 独立 try/catch，prompts 损坏不影响 categories 恢复。

- [x] **Step 4：saveData/saveThemeMode 异常保护**

`saveData` 包裹 try/catch 并抛出明确错误 `"SAVE_FAILED"`。`loadData` 失败时返回空数据 + 默认主题。

### Task 3: AppContext 功能完善

**文件：**
- 修改：`src/store/AppContext.tsx`

- [x] **Step 1：AppState 新增 themeMode 字段**

```typescript
interface AppState {
  prompts: Prompt[];
  categories: Category[];
  themeMode: ThemeMode;
  isLoading: boolean;
}
```

- [x] **Step 2：reducer 处理 SET_THEME_MODE**

```typescript
case "SET_THEME_MODE":
  return { ...state, themeMode: action.themeMode };
```

- [x] **Step 3：初始化时加载 themeMode**

```typescript
dispatch({
  type: "SET_INITIAL_DATA",
  prompts: data.prompts,
  categories: data.categories,
  themeMode: data.themeMode,
});
```

- [x] **Step 4：saveData 300ms 防抖**

```typescript
const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
// ...
saveTimerRef.current = setTimeout(() => {
  saveData(state.prompts, state.categories).catch(() => {});
}, 300);
```

避免快速连续操作导致竞态写入，cleanup 中 `clearTimeout` 兜底。

- [x] **Step 5：themeMode 独立持久化 useEffect**

```typescript
useEffect(() => {
  if (!state.isLoading) {
    saveThemeMode(state.themeMode);
  }
}, [state.themeMode, state.isLoading]);
```

### Task 4: useTheme 支持手动主题模式

**文件：**
- 修改：`src/hooks/useTheme.ts`

- [x] **Step 1：从 AppContext 读取 themeMode**

```typescript
const { state: { themeMode } } = useApp();
```

- [x] **Step 2：isDark 计算逻辑**

```typescript
const isDark = useMemo(() => {
  if (themeMode === "system") return colorScheme === "dark";
  return themeMode === "dark";
}, [colorScheme, themeMode]);
```

优先级：用户手动选择 > 系统设置。

### Task 5: TypeScript any 类型清除

**文件：**
- 修改：`src/screens/BrowseScreen.tsx`
- 修改：`src/screens/CategoriesScreen.tsx`
- 修改：`src/screens/SettingsScreen.tsx`
- 修改：`src/components/NewPromptSheet.tsx`
- 修改：`src/components/CategoryGrid.tsx`

- [x] **Step 1：useRoute 泛型指定**

```typescript
// Before: useRoute<any>()
// After:  useRoute<RouteProp<TabParamList, "Browse">>()
```

- [x] **Step 2：useNavigation 泛型指定**

```typescript
// Before: useNavigation<any>()
// After:  useNavigation<NavigationProp<TabParamList>>()
```

- [x] **Step 3：useState 泛型指定**

```typescript
// Before: useState<any>(null)
// After:  useState<Prompt | null>(null)
```

- [x] **Step 4：Ionicons name 类型断言收窄**

```typescript
// Before: cat.icon as any
// After:  cat.icon as keyof typeof Ionicons.glyphMap
```

### Task 6: ID 生成更健壮

**文件：**
- 修改：`src/screens/BrowseScreen.tsx`

- [x] **Step 1：新增 generateId 工具函数**

```typescript
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
```

timestamp(36进制) + 8位随机串，避免快速连点产生重复 ID。

### Task 7: 删除功能实现

**文件：**
- 修改：`src/components/NewPromptSheet.tsx`
- 修改：`src/screens/BrowseScreen.tsx`

- [x] **Step 1：NewPromptSheet 新增 onDelete prop**

```typescript
interface NewPromptSheetProps {
  onDelete?: (id: string) => void;
}
```

- [x] **Step 2：编辑态底部渲染删除按钮**

红色半透明底色 + `Alert.alert` 原生确认对话框 + Haptics 警告震动反馈。

- [x] **Step 3：BrowseScreen 传递并处理 onDelete**

```typescript
const handleDelete = (id: string) => {
  dispatch({ type: "DELETE_PROMPT", id });
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  setSheetVisible(false);
  setEditingPrompt(null);
};
```

### Task 8: SettingsScreen 深色模式开关修复

**文件：**
- 修改：`src/screens/SettingsScreen.tsx`

- [x] **Step 1：移除本地 isDarkMode state**

原 `const [isDarkMode, setIsDarkMode] = useState(isDark)` 只有本地展示效果。

- [x] **Step 2：Switch 直接派发 SET_THEME_MODE**

```typescript
const handleThemeChange = (value: boolean) => {
  dispatch({ type: "SET_THEME_MODE", themeMode: value ? "dark" : "light" });
};
```

- [x] **Step 3：导入持久化保留 themeMode 不覆盖**

```typescript
dispatch({
  type: "SET_INITIAL_DATA",
  prompts: data.prompts,
  categories: data.categories,
  themeMode: state.themeMode,
});
```

---

## Part 2: iOS 26 设计语言重构

### Task 9: 设计 Token 升级

**文件：**
- 修改：`src/constants/theme.ts`

- [x] **Step 1：Colors 向 iOS 26 毛玻璃色系靠拢**

| Token | Light 旧 | Light 新 | 变化 |
|-------|---------|---------|------|
| background | `#F2F2F7` | `#F8F8FA` | 更通透的暖白 |
| card | `#FFFFFF` | `rgba(255,255,255,0.72)` | 毛玻璃半透明 |
| primary | `#6366F1` | `#5E5CE6` | 微调饱和度 |
| text | `rgba(0,0,0,0.9)` | `rgba(0,0,0,0.88)` | 柔和 |
| textSecondary | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.50)` | 让步 |
| separator | `#E5E5EA` | `rgba(0,0,0,0.08)` | 近乎透明 |

| Token | Dark 旧 | Dark 新 | 变化 |
|-------|--------|--------|------|
| card | `#1C1C1E` | `rgba(28,28,30,0.88)` | 半透明暗 |
| primary | `#818CF8` | `#8B88FF` | 亮一度 |
| accent | `#F59E0B` | `#FFD60A` | 亮一度 |

- [x] **Step 2：新增 textTertiary 色阶**

```typescript
textTertiary: "rgba(0,0,0,0.30)"  // light
textTertiary: "rgba(255,255,255,0.35)"  // dark
```

- [x] **Step 3：Radius 放大**

| Token | 旧 | 新 |
|-------|---|---|
| sm | 8 | 10 |
| md | 12 | 16 |
| lg | 16 | 24 |
| xl | 20 | 28 |

- [x] **Step 4：新增 Shadow 体系**

```typescript
export const Shadow = {
  light: { sm, md, lg },
  dark:  { sm, md, lg },
} as const;
```

sm: 1px offset / 0.06 opacity / 4px blur  
md: 2px offset / 0.08 opacity / 12px blur  
lg: 4px offset / 0.10 opacity / 24px blur  

- [x] **Step 5：Spacing 放大**

| Token | 旧 | 新 |
|-------|---|---|
| md | 12 | 14 |
| lg | 16 | 20 |
| xl | 24 | 28 |
| xxl | 32 | 40 |

- [x] **Step 6：FontSize 扩展**

新增 `footnote: 14`, `title3: 20`, `title2: 22`, `largeTitle: 34`

### Task 10: 组件视觉重构

**文件：**
- 修改：`src/components/PromptCard.tsx`
- 修改：`src/components/SearchBar.tsx`
- 修改：`src/components/CategoryChip.tsx`
- 修改：`src/components/CategoryGrid.tsx`
- 修改：`src/components/FAB.tsx`
- 修改：`src/components/EmptyState.tsx`
- 修改：`src/components/NewPromptSheet.tsx`
- 修改：`src/navigation/TabNavigator.tsx`
- 修改：`src/screens/SettingsScreen.tsx`
- 修改：`src/screens/BrowseScreen.tsx`

- [x] **PromptCard**
  - 去掉左侧 `width: 4` 重色条
  - 背景改为半透明 card + 0.5px separator 细边框 + Shadow.md
  - 圆角升至 `Radius.lg`（24px）
  - 分类标签从粗底条改为 pill 气泡（category.color + "18"）
  - 收藏图标未选中态颜色改为 `textTertiary`

- [x] **SearchBar**
  - 半透明 card 背景 + 细边框 + Shadow.sm
  - 放大镜图标颜色改为 `textTertiary`
  - placeholderTextColor 改为 `textTertiary`

- [x] **CategoryChip**
  - 直角 → `rounded-full` 胶囊
  - 未选中态：`category.color + "10"` 淡底色 + `category.color + "30"` 淡边框
  - 选中态：`category.color + "E6"` 实色 + 无边框
  - 字体从 `"600"/14px` 改为 `"500"/13px`

- [x] **CategoryGrid**
  - 圆角从 `rounded-2xl`(12px) 升级到 `rounded-[22px]`
  - 卡片半透明 + 0.5px 细边框 + Shadow.sm
  - 图标容器更大（`w-13 h-13 rounded-2xl`）+ category.color + "18"
  - 文字使用新的 FontSize/letterSpacing

- [x] **FAB**
  - 使用 Shadow.lg 柔和长阴影
  - bottom 从 `6` 增加到 `8`

- [x] **EmptyState**
  - 图标从 `size={64}` 缩小到 `size={56}`，颜色从 `textSecondary` 改为 `textTertiary`
  - CTA 按钮 `rounded-xl` → `rounded-full`
  - 全部 fontWeight 统一 San Francisco 字重体系

- [x] **NewPromptSheet**
  - 弹层面板圆角 `20px` → `28px`
  - 面板背景不透明 0.96（light）/ 0.98（dark）+ 边框
  - 输入框用 `rgba` 半透明底色替代 `#F2F2F7`/`#2C2C2E`
  - 取消/保存字体 `textSecondary` → `primary`（更符合 iOS 规范）
  - 分类选择器与 CategoryChip 统一：圆角胶囊 + 半透明
  - 标签字数 `"600"` → `"500"` / 字号 `15` → `13`，加 `uppercase`
  - 删除按钮背景从 `#FEE2E2`/`#2C2C2E` 改为 `rgba(255,69,58,0.08)`/`rgba(255,69,58,0.12)`
  - 删除按钮颜色统一使用系统红 `#FF453A`（非 `#EF4444`）

- [x] **TabNavigator**
  - header 背景 `colors.card` → `colors.background`，`shadowColor: "transparent"`
  - tabBar 半透明 card 背景 + 0.5px separator 上边框
  - 全局 header/styles/tabs 应用 letterSpacing / fontWeight 600 / fontSize 体系

- [x] **SettingsScreen**
  - Section header: `uppercase` + `letterSpacing: 0.5` + `fontWeight: "500"`
  - SettingRow: `rounded-2xl` + `0.5px` 细边框 + 半透明 card
  - 统计面板圆角 `rounded-xl` → `rounded-2xl` + 细边框
  - Switch trackColor 关闭态改为 `rgba(0,0,0,0.16)`
  - 间距从 `mx-4`/`mb-2` 升级到 `mx-5`/`mb-2.5`

- [x] **BrowseScreen**
  - 分类 FlatList `paddingHorizontal: 16` → `20`
  - 提示词列表 `paddingBottom: 100` → `120`
  - 空状态文案微调

---

## San Francisco 排版体系

| 角色 | fontWeight | fontSize | letterSpacing | 用途 |
|------|-----------|----------|---------------|------|
| Section Header | `"500"` | 13px | `0.5` | uppercase 分类标题 |
| Body | `"400"` | 17px | `-0.2` | 主内容文字 |
| Body (小) | `"400"` | 15px / 14px | `-0.1` / `-0.15` | 辅助文字、标签 |
| Caption | `"500"` | 13px | `-0.08` | 计数、元信息 |
| Title | `"600"` | 17px | `-0.2` | 卡片标题、导航标题 |
| Headline | `"600"` | 20px | `-0.2` | 空状态标题 |

---

## 验证清单

- [x] `npx tsc --noEmit` 零错误
- [ ] iOS 模拟器 / Expo Go 真机运行验证
- [x] 浅色模式与深色模式 Token 对照检查
- [x] 所有 `fontWeight: "590"` 替换为 `"600"`（RN 不支持非标准值）
- [x] 所有 `as any` 替换为精确类型
- [ ] Touch target ≥44pt 检查（已维持现有 hitSlop 配置）
- [ ] 主题切换持久化验证
- [ ] 删除功能完整流程验证