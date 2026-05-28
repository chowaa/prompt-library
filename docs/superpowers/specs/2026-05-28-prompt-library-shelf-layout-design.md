# Prompt Library — Shelf 布局设计规格

> **设计目标:** 将 BrowseScreen (列表) + CategoriesScreen (双列网格) 合并为 HomeScreen，采用"Shelf"分组陈列布局
> **设计参考:** shelf-layout-plan.md 中的 ASCII 草图
> **技术约束:** 不动 theme.ts，不加动画，不引入新依赖

---

## 导航结构变更

```
旧结构 (3 Tab):              新结构 (2 Tab):
┌──────────────────┐         ┌──────────────────┐
│ 🔍 浏览 │ 📁 分类 │ ⚙️ 设置 │         │ 🏠 首页 │ ⚙️ 设置 │
└──────────────────┘         └──────────────────┘
                                    ↑
                              右上角 ⚙️ 进入设置
```

---

## HomeScreen 布局规范

### Shelf 模式 (isSearching === false)

```
┌──────────────────────────────────────────────┐
│ 提示词库                              ⚙️     │  ← Header + headerRight
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ 🔍  搜索提示词...                        │ │  ← SearchBar (复用)
│ └──────────────────────────────────────────┘ │
│                                              │
│ ⭐ 收藏 (2)                                  │  ← 仅当有收藏时显示
│ ┌──────────┐ ┌──────────┐                   │
│ │ [编程]   │ │ [写作]   │                   │  ← ShelfCard 150×100
│ │ 代码审查  │ │ 风格优化  │                   │     FlatList horizontal
│ │ 请帮我... │ │ 请将以下..│                   │     gap: 12px
│ │       ★  │ │       ★  │                   │
│ └──────────┘ └──────────┘                   │
│                                              │
│ 编程 (3)                         查看全部 →  │  ← Section header
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │     左侧: 20px/600
│ │ [编程]   │ │ [编程]   │ │ [编程]   │     │     右侧: 15px primary
│ │ API设计  │ │ 代码审查  │ │ 算法优化  │     │
│ │ ...      │ │ ...      │ │ ...      │     │
│ │       ☆  │ │       ★  │ │       ☆  │     │
│ └──────────┘ └──────────┘ └──────────┘     │
│                                              │
│ 写作 (2)                         查看全部 →  │
│ ...                                          │
│                                              │
│                          ┌──────┐            │
│                          │  +   │  ← FAB     │
│                          └──────┘            │
└──────────────────────────────────────────────┘
```

### 搜索模式 (isSearching === true)

```
┌──────────────────────────────────────────────┐
│ 提示词库                              ⚙️     │
├──────────────────────────────────────────────┤
│ 🔍 代码...                                   │  ← 搜索词
├──────────────────────────────────────────────┤
│ [编程 3] [写作 2] [设计 1] [数据 4]          │  ← CategoryChip 横滚
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │ 代码审查助手                        ★   │ │  ← PromptCard (复用)
│ │ 请帮我审查以下代码，找出潜在的...         │ │
│ │ ┌──────┐                                 │ │
│ │ │ 编程  │                                 │ │
│ │ └──────┘                                 │ │
│ └──────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────┐ │
│ │ API 设计规范                        ☆   │ │
│ │ ...                                       │ │
│ └──────────────────────────────────────────┘ │
│                          ┌──────┐            │
│                          │  +   │  ← FAB     │
│                          └──────┘            │
└──────────────────────────────────────────────┘
```

---

## ShelfCard 组件规格

### 尺寸与布局

```
┌──────────────────────┐
│ 宽度: 150px           │
│ 高度: ~100px (auto)   │
│ 内边距: 12px (p-3)    │
│ 圆角: 16px (Radius.md)│
│ 背景: card token      │
│ 边框: 0.5px separator │
└──────────────────────┘
```

### 内部结构

```
┌──────────────────────┐
│ ┌────────┐           │  ← 分类 pill: 左上角
│ │ 编程    │           │     color+"18" 底, 12px/500
│ └────────┘           │
│                      │
│ 代码审查助手         │  ← 标题: 15px/600, numberOfLines=1
│                      │     color: text
│ 请帮我审查以下代码，  │  ← 内容: 13px/400, numberOfLines=2
│ 找出潜在的问题...     │     color: textSecondary
│                      │     lineHeight: 18
│                  ★   │  ← 收藏星标: 右下角, 18px
└──────────────────────┘     选中: accent, 未选中: textTertiary
                             触控: hitSlop 12
```

### Props

```typescript
interface ShelfCardProps {
  prompt: Prompt;
  category?: Category;
  onPress: () => void;
  onToggleFavorite: () => void;
}
```

---

## TabNavigator 规格

### Tab 配置

```
┌──────────┬────────────────┬───────────────┐
│ Tab      │ 图标           │ 标题          │
├──────────┼────────────────┼───────────────┤
│ Home     │ home-outline   │ 提示词库      │
│ Settings │ settings-outline│ 设置          │
└──────────┴────────────────┴───────────────┘
```

### Home Tab headerRight

```
┌──────────────────────────────────────────────┐
│ 提示词库                              ⚙️     │
│                                       ↑      │
│                          settings-outline    │
│                          20px, text color    │
│                          触控: 44×44         │
└──────────────────────────────────────────────┘
```

点击 → `navigation.navigate("Settings")`

### Header 样式

```
headerStyle:
  backgroundColor: colors.background
  shadowColor: "transparent"
  borderBottomWidth: 0.5
  borderBottomColor: colors.separator

headerTitleStyle:
  fontSize: 17
  fontWeight: "600"
  letterSpacing: -0.2
```

---

## Section Header 规格

### 收藏 Shelf Header

```
⭐ 收藏 (2)
↑          ↑
icon       计数
20px/600   20px/600
text       text
```

仅当 `favoritedPrompts.length > 0` 时显示。

### 分类 Shelf Header

```
编程 (3)                                    查看全部 →
↑                                            ↑
分类名 + 计数                                primary 色
20px/600                                    15px/500
text                                        primary
```

"查看全部" → 设置 `selectedCategoryId`，切换到搜索模式。

仅当该分类有提示词时显示整个 shelf。

---

## 间距规范 (4px 倍数)

```
┌────────────────────┬──────┬──────────────────────────────┐
│ 元素               │ 值   │ 说明                         │
├────────────────────┼──────┼──────────────────────────────┤
│ ShelfCard 内边距   │ 12   │ px-3 py-3                    │
│ ShelfCard 间距     │ 12   │ ItemSeparator width          │
│ Section header 下  │ 8    │ mb-2                         │
│ Shelf 区块间距     │ 24   │ mt-6 (首个收藏 shelf mt-2)   │
│ SearchBar 下边距   │ 12   │ mb-3                         │
│ ScrollView 底部    │ 120  │ paddingBottom (FAB 空间)      │
│ Shelf 水平边距     │ 20   │ contentContainerStyle         │
└────────────────────┴──────┴──────────────────────────────┘
```

---

## 状态流转

```
┌─────────────────────────────────────────────────────────┐
│                    HomeScreen 启动                        │
│                          │                               │
│              state.isLoading? ──yes──→ return null       │
│                          │                               │
│                         no                               │
│                          │                               │
│         isSearching? ────yes──→ 搜索模式                  │
│                          │       CategoryChip +          │
│                         no       PromptCard FlatList     │
│                          │                               │
│                    Shelf 模式                             │
│                    ScrollView                            │
│                    ├── SearchBar                         │
│                    ├── 收藏 Shelf (if any)               │
│                    ├── 每分类 Shelf (if has prompts)     │
│                    └── FAB + NewPromptSheet              │
│                          │                               │
│              用户搜索/选分类                              │
│                          │                               │
│              isSearching ← true                          │
│                          │                               │
│              用户清空搜索/取消分类                         │
│                          │                               │
│              isSearching ← false                         │
└─────────────────────────────────────────────────────────┘
```

---

## 数据流

```
AppContext (state.prompts, state.categories)
        │
        ▼
    HomeScreen
        │
        ├── favoritedPrompts = state.prompts.filter(p => p.isFavorite)
        │
        ├── categoryPromptCounts = useMemo(...)
        │      每个分类的提示词数量
        │
        ├── filteredPrompts = useMemo(...)
        │      搜索 + 分类过滤 + 收藏优先排序
        │      仅在搜索模式使用
        │
        └── categoriesWithPrompts = state.categories
                .filter(cat => categoryPromptCounts[cat.id] > 0)
                仅 Shelf 模式使用
```
