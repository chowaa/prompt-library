# Prompt Library — Shelf 布局重构计划

> **For agentic workers:** 使用 `planning-with-files` skill 完成先规划再执行的工作流。流程：
> 1. 先基于本文档生成以下文件：
>    - `docs/superpowers/plans/2026-05-27-prompt-library-shelf-layout-plan.md`（计划文档）
>    - `docs/superpowers/specs/2026-05-27-prompt-library-shelf-layout-design.md`（设计文档）
>    - `docs/superpowers/progress/2026-05-27-prompt-library-shelf-layout-progress.md`（进度文档）
> 2. 然后按计划逐步实施，每完成一步更新 progress.md。
> **构建命令:** `npx expo start` (开发), `npx tsc --noEmit` (类型检查)

## 目标

把当前 BrowseScreen（列表）+ CategoriesScreen（双列网格）两个 Tab 合并为一个 HomeScreen，用"分组陈列（Shelf）"布局——每个分类是一个水平滚动的 shelf，收藏 shelf 置顶。设置页保留为第二个 Tab。

## 技术栈

- React Native 0.81 + Expo SDK 54 + TypeScript 5.9 (strict)
- NativeWind v4 (Tailwind CSS)
- React Navigation 7 (bottom tabs)
- 全局状态: `useReducer` + Context (`src/store/AppContext.tsx`)
- 图标: `@expo/vector-icons` (Ionicons)
- 主题: `src/hooks/useTheme.ts`
- 设计 Token: `src/constants/theme.ts`

## 最终效果（ASCII 草图）

```
┌──────────────────────────────────────┐
│ 提示词库                     ⚙️      │  ← 右上角设置按钮
├──────────────────────────────────────┤
│ 🔍 搜索提示词...                     │
├──────────────────────────────────────┤
│ ⭐ 收藏 (2)                          │  ← section header
│ ┌──────────┐ ┌──────────┐           │  ← 水平滚动 shelf
│ │ 代码审查  │ │ SQL优化  │           │
│ └──────────┘ └──────────┘           │
├──────────────────────────────────────┤
│ 编程 (3)                   查看全部 →│
│ ┌──────────┐ ┌──────────┐ ┌───────┐ │
│ │ 代码审查  │ │ API设计  │ │ ...   │ │
│ └──────────┘ └──────────┘ └───────┘ │
├──────────────────────────────────────┤
│ 写作 (2)                   查看全部 →│
│ ┌──────────┐ ┌──────────┐           │
│ │ 风格优化  │ │ 邮件润色  │           │
│ └──────────┘ └──────────┘           │
├──────────────────────────────────────┤
│ 设计 (1)                             │
│ ...                                  │
├──────────────────────────────────────┤
│              ┌────┐                  │
│              │ +  │  FAB             │
│              └────┘                  │
├──────────────────────────────────────┤
│  🏠 首页          ⚙️ 设置            │  ← 2 个 Tab
└──────────────────────────────────────┘
```

---

## Phase 1: 导航重构

### Task 1: 更新 TabParamList 类型

- [ ] **文件:** `src/types/index.ts`

```diff
export type TabParamList = {
- Browse: { categoryId?: string } | undefined;
- Categories: undefined;
+ Home: { categoryId?: string } | undefined;
  Settings: undefined;
};
```

### Task 2: 重构 TabNavigator

- [ ] **文件:** `src/navigation/TabNavigator.tsx`

- Tab 从 3 个减为 2 个：`Home`、`Settings`
- Home Tab 标题为"提示词库"
- Home Tab 的 `headerRight` 放一个设置图标按钮（`settings-outline`），点击导航到 Settings Tab
- Tab 图标：Home 用 `home`（或 `home-outline`），Settings 用 `settings-outline`
- 删除 `Categories` Tab 相关代码

---

## Phase 2: 新建组件

### Task 3: 新建 ShelfCard 组件

- [ ] **新建文件:** `src/components/ShelfCard.tsx`

紧凑型横向卡片，尺寸约 150×100：

```
┌────────────────────┐
│ [编程]             │  ← 分类 pill，左上角，12px/500
│                    │
│ 代码审查助手       │  ← 标题，15px/600，最多1行
│ 请帮我审查以下...   │  ← 内容预览，13px/400，最多2行
│                    │
│                ★   │  ← 收藏星标，右下角，18px
└────────────────────┘

背景: card token + 0.5px separator 边框
圆角: 16px (Radius.md)
内边距: px-3 py-3 (12px)
```

Props：

```typescript
interface ShelfCardProps {
  prompt: Prompt;
  category?: Category;
  onPress: () => void;
  onToggleFavorite: () => void;
}
```

实现要点：
- 使用 `colors` token（从 `useTheme()` 获取），不硬编码颜色
- 分类 pill：`category.color + "18"` 背景 + `category.color` 文字，12px/500
- 标题：15px/600，`numberOfLines={1}`
- 内容预览：13px/400，`numberOfLines={2}`，颜色 `textSecondary`
- 收藏星标：右下角绝对定位或 flex-end，18px 图标
- 收藏星标 hitSlop 确保 ≥44pt 触控区域
- 点击卡片 → `onPress`；点击星标 → `onToggleFavorite`
- `activeOpacity={0.6}`

---

## Phase 3: 新建 HomeScreen

### Task 4: 新建 HomeScreen.tsx

- [ ] **新建文件:** `src/screens/HomeScreen.tsx`

这是最核心的文件，合并当前 BrowseScreen + CategoriesScreen 的所有逻辑。

#### 4.1 状态管理

```typescript
const [search, setSearch] = useState("");
const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(routeCategoryId || null);
const [sheetVisible, setSheetVisible] = useState(false);
const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
```

#### 4.2 数据计算

```typescript
// 从 AppContext 获取 state, dispatch
// 从 useTheme() 获取 colors
// 从 route.params 获取 categoryId（来自其他页面的导航）

// 收藏的提示词
const favoritedPrompts = state.prompts.filter(p => p.isFavorite);

// 每个分类的提示词数量
const categoryPromptCounts = useMemo(() => { ... }, [state.prompts, state.categories]);

// 搜索结果（同当前 BrowseScreen 逻辑）
const filteredPrompts = useMemo(() => { ... }, [state.prompts, search, selectedCategoryId]);
```

#### 4.3 搜索模式 vs Shelf 模式

```tsx
const isSearching = search.trim().length > 0 || selectedCategoryId !== null;
```

- **搜索模式**（`isSearching === true`）：显示当前 BrowseScreen 的筛选视图——分类胶囊横向滚动条 + PromptCard 垂直列表
- **Shelf 模式**（`isSearching === false`）：显示 Shelf 布局

#### 4.4 Shelf 布局（isSearching === false）

整个页面是一个 `ScrollView`：

1. **SearchBar** — 复用现有组件
2. **收藏 Shelf**（仅当 `favoritedPrompts.length > 0`）：
   - Section header：`"⭐ 收藏 (N)"`，20px/600
   - 水平 FlatList，ItemSeparator 宽度 12px
   - 每个 item 是 ShelfCard
3. **每个分类一个 Shelf**：
   - Section header 左侧：分类名 + 数量，20px/600
   - Section header 右侧：`"查看全部"` 按钮，15px，primary 色
   - 仅当该分类有提示词时才显示这个 shelf
   - 水平 FlatList，ItemSeparator 宽度 12px
   - 每个 item 是 ShelfCard
   - `contentContainerStyle={{ paddingHorizontal: 20 }}`
4. **FAB** — 保持不变
5. **NewPromptSheet** — 保持不变
6. **EmptyState** — 当没有任何提示词时显示

每个 shelf 区块的 `mt-6`（24px 上边距），第一个收藏 shelf 的 `mt-2`（8px）。

#### 4.5 搜索模式（isSearching === true）

复用当前 BrowseScreen 的筛选视图：
- 分类胶囊横向滚动条（CategoryChip）
- PromptCard 垂直 FlatList
- 搜索结果按"收藏优先 + 最近更新"排序

#### 4.6 "查看全部"功能

点击 shelf 的"查看全部"：
1. 清空搜索框
2. 设置 `selectedCategoryId` 为该分类的 id
3. 切换到搜索模式（显示该分类所有提示词）
4. 用户可以点击分类胶囊取消筛选，回到 shelf 视图

#### 4.7 交互处理

```typescript
const handleToggleFavorite = (id: string) => {
  dispatch({ type: "TOGGLE_FAVORITE", id });
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const handleDelete = (id: string) => {
  dispatch({ type: "DELETE_PROMPT", id });
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  setSheetVisible(false);
  setEditingPrompt(null);
};

const handleSavePrompt = (data) => { /* 同当前 BrowseScreen */ };
```

#### 4.8 空状态

当 `state.prompts.length === 0` 且不在搜索模式时，显示 EmptyState：
- title: "还没有提示词"
- message: "点击右下角 + 创建第一个提示词"

当搜索无结果时，显示 EmptyState：
- title: "没有匹配的提示词"
- message: "试试换个搜索词或分类筛选"

---

## Phase 4: 清理旧文件

### Task 5: 删除不再需要的文件

- [ ] 删除 `src/screens/BrowseScreen.tsx`
- [ ] 删除 `src/screens/CategoriesScreen.tsx`
- [ ] 删除 `src/components/CategoryGrid.tsx`

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/index.ts` | 修改 | TabParamList 改为 Home + Settings |
| `src/navigation/TabNavigator.tsx` | 重构 | 2 Tab，Home header 加设置按钮 |
| `src/screens/HomeScreen.tsx` | **新建** | 合并 Browse + Categories 的 Shelf 布局 |
| `src/components/ShelfCard.tsx` | **新建** | 紧凑横向卡片 |
| `src/screens/BrowseScreen.tsx` | **删除** | 已合并到 HomeScreen |
| `src/screens/CategoriesScreen.tsx` | **删除** | 已合并到 HomeScreen |
| `src/components/CategoryGrid.tsx` | **删除** | 不再需要，shelf 替代了网格 |
| `src/components/PromptCard.tsx` | 保留 | 搜索模式下仍然需要垂直卡片 |
| `src/components/SearchBar.tsx` | 保留 | 不变 |
| `src/components/CategoryChip.tsx` | 保留 | 搜索模式下仍然需要 |
| `src/components/FAB.tsx` | 保留 | 不变 |
| `src/components/EmptyState.tsx` | 保留 | 不变 |
| `src/components/NewPromptSheet.tsx` | 保留 | 不变 |
| `src/screens/SettingsScreen.tsx` | 保留 | 不变 |

---

## 重要约束

- **不动 `src/constants/theme.ts`**，不新增/修改任何颜色 Token
- **不动 `src/store/AppContext.tsx` 和 `src/store/storage.ts`**，状态管理零改动
- **不添加任何动画**（Reanimated 等）
- **不引入新依赖**
- **不改 NewPromptSheet**，编辑/创建流程保持不变
- **不改 SettingsScreen**
- 所有 `fontWeight` 只能是 `"400"` `"500"` `"600"`，不能用 `"700"`
- 所有间距对齐 4px 倍数（4/8/12/16/20/24/32），不用 6px、14px、10px 等非标准值
- Ionicons name 用 `keyof typeof Ionicons.glyphMap` 类型断言，不用 `as any`
- 使用 `colors` token（从 `useTheme()` 获取），不硬编码颜色
- 卡片使用 `0.5px separator` 边框

---

## 验证

```bash
npx tsc --noEmit
```

确保零类型错误。
