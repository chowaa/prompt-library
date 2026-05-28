# Prompt Library — Shelf 布局重构实施计划

> **目标:** 将 BrowseScreen + CategoriesScreen 合并为 HomeScreen，用 Shelf 布局替代双列网格
> **技术栈:** React Native 0.81 + Expo SDK 54 + TypeScript 5.9 + NativeWind v4 + React Navigation 7
> **约束:** 不动 theme.ts / AppContext / storage，不引入新依赖，不加动画

---

## 阶段概览

| # | Phase | 内容 | 文件 | 状态 |
|---|-------|------|------|------|
| 1 | 导航重构 | TabParamList + TabNavigator | 2 修改 | pending |
| 2 | 新建组件 | ShelfCard 紧凑横向卡片 | 1 新建 | pending |
| 3 | 新建 HomeScreen | Shelf 布局 + 搜索双模式 | 1 新建 | pending |
| 4 | 清理旧文件 | 删除 BrowseScreen / CategoriesScreen / CategoryGrid | 3 删除 | pending |
| 5 | 类型检查 | tsc --noEmit 零错误 | — | pending |

---

## Phase 1: 导航重构

### Task 1: 更新 TabParamList

**文件:** `src/types/index.ts`

```diff
export type TabParamList = {
- Browse: { categoryId?: string } | undefined;
- Categories: undefined;
+ Home: { categoryId?: string } | undefined;
  Settings: undefined;
};
```

### Task 2: 重构 TabNavigator

**文件:** `src/navigation/TabNavigator.tsx`

- 导入 `HomeScreen` 替代 `BrowseScreen` 和 `CategoriesScreen`
- 3 个 Tab 减为 2 个：`Home`、`Settings`
- Home Tab: 标题"提示词库"，图标 `home-outline`
- Home Tab `headerRight`: 设置齿轮图标按钮 → `navigation.navigate("Settings")`
- 删除 `Browse` 和 `Categories` Tab 定义
- `headerRight` 需要 `useNavigation` hook

---

## Phase 2: 新建 ShelfCard 组件

### Task 3: ShelfCard

**新建文件:** `src/components/ShelfCard.tsx`

Props:
```typescript
interface ShelfCardProps {
  prompt: Prompt;
  category?: Category;
  onPress: () => void;
  onToggleFavorite: () => void;
}
```

布局 (约 150×100 紧凑横向卡片):
```
┌────────────────────┐
│ [分类pill]         │  ← 12px/500, color+"18" 底
│                    │
│ 代码审查助手       │  ← 15px/600, 1 行截断
│ 请帮我审查以下...   │  ← 13px/400, 2 行截断, textSecondary
│                    │
│                ★   │  ← 18px 星标, 右下角
└────────────────────┘
```

规格:
- 背景: `colors.card` + `0.5px separator` 边框
- 圆角: `Radius.md` (16px)
- 内边距: `px-3 py-3` (12px)
- 收藏星标: `hitSlop` 确保 ≥44pt
- 星标未选中色 `textTertiary`, 选中色 `accent`

---

## Phase 3: 新建 HomeScreen

### Task 4: HomeScreen.tsx

**新建文件:** `src/screens/HomeScreen.tsx`

核心逻辑:
```
isSearching = search.trim().length > 0 || selectedCategoryId !== null

if isSearching → 搜索模式 (CategoryChip 横滚 + PromptCard 垂直列表)
if !isSearching → Shelf 模式 (ScrollView + 收藏 shelf + 每分类一个 shelf)
```

Shelf 模式结构:
```
ScrollView
├── SearchBar
├── 收藏 Shelf (if favoritedPrompts.length > 0)
│   ├── Section header: "⭐ 收藏 (N)" 20px/600
│   └── FlatList horizontal → ShelfCard[]
├── 每分类一个 Shelf (if 该分类有提示词)
│   ├── Section header: 分类名 + "查看全部 →" 按钮
│   └── FlatList horizontal → ShelfCard[]
├── FAB (绝对定位)
└── NewPromptSheet (Modal)
```

"查看全部" → 设置 `selectedCategoryId`，切换到搜索模式。

从 BrowseScreen 迁移:
- 所有状态 (search, selectedCategoryId, sheetVisible, editingPrompt)
- 所有 handler (handleToggleFavorite, handleDelete, handleSavePrompt)
- generateId 函数
- useMemo (categoryPromptCounts, filteredPrompts)
- 分类胶囊取消选中 → 回到 shelf 模式

---

## Phase 4: 清理旧文件

### Task 5: 删除

- 删除 `src/screens/BrowseScreen.tsx`
- 删除 `src/screens/CategoriesScreen.tsx`
- 删除 `src/components/CategoryGrid.tsx`

---

## Phase 5: 类型检查

```bash
npx tsc --noEmit
```

确保零类型错误。

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/index.ts` | 修改 | TabParamList: Browse→Home, 删 Categories |
| `src/navigation/TabNavigator.tsx` | 重构 | 2 Tab, headerRight 设置按钮 |
| `src/screens/HomeScreen.tsx` | 新建 | Shelf 布局 + 搜索双模式 |
| `src/components/ShelfCard.tsx` | 新建 | 紧凑横向卡片 |
| `src/screens/BrowseScreen.tsx` | 删除 | 合并到 HomeScreen |
| `src/screens/CategoriesScreen.tsx` | 删除 | 合并到 HomeScreen |
| `src/components/CategoryGrid.tsx` | 删除 | Shelf 替代网格 |

## 保留不变的文件

| 文件 | 原因 |
|------|------|
| `src/components/PromptCard.tsx` | 搜索模式仍然需要垂直卡片 |
| `src/components/SearchBar.tsx` | 不变 |
| `src/components/CategoryChip.tsx` | 搜索模式仍然需要 |
| `src/components/FAB.tsx` | 不变 |
| `src/components/EmptyState.tsx` | 不变 |
| `src/components/NewPromptSheet.tsx` | 不变 |
| `src/screens/SettingsScreen.tsx` | 不变 |
| `src/constants/theme.ts` | 不动 |
| `src/store/AppContext.tsx` | 不动 |
| `src/store/storage.ts` | 不动 |
