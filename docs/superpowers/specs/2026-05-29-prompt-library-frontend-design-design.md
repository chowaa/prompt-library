# Prompt Library — 前端设计审核修复设计规格

> **来源:** `docs/trae-frontend-design-review.md`
> **执行顺序:** P0 → P1 → P2

---

## P0: 缺陷修复

### Loading 白屏

```
isLoading ? (
  View: flex 1, background, center
    ActivityIndicator: large, primary color
) : ( ... )
```

### CategoryColors 死代码

直接删除 `theme.ts:L28-L34` 的 `CategoryColors` 常量块。

### NewPromptSheet 竞态

```
旧逻辑:
  if (!visible) return null  ← Modal 卸载时动画截断

新逻辑:
  始终渲染 Modal，visible prop 控制展示
  handleClose → 播完动画 → onClose() → parent setVisible(false)
  动画完整执行，无竞态
```

---

## P1: 体验升级

### CategoryChip 对比度

```
选中态文字: "#FFFFFF" → "rgba(0,0,0,0.88)"
浅色分类（黄/橙）: 白字不可读 → 黑字可读
深色分类（紫/蓝/绿）: 黑字在 90% 不透底色上也足够可读
```

### Spacing 修正

```
md: 14 → md: 12  (4px grid)
所有 className 中用 margin/padding 14 的地方不受影响（用的是 NativeWind 类名，非 Spacing token）
```

### useTheme memo

```typescript
const colors = useMemo(() => isDark ? Colors.dark : Colors.light, [isDark]);
```

### StatusBar

```typescript
<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
```

### EmptyState 图标

```
color: textTertiary → textSecondary (56px 大图标用 textSecondary 更实)
新增 icon prop: string, 默认 "documents-outline"
```

### ShelfCard 阴影

```
加 Shadow.sm，与 PromptCard 的 Shadow.md 形成两级
```

### 动效（简化版）

收藏星标: 200ms scale bounce (0.8 → 1.2 → 1.0)
卡片按下: activeOpacity 0.97（从 0.6 减轻，更像 iOS 原生）

---

## P2: 代码整洁

### 死页面清理

删除:
- `src/screens/BrowseScreen.tsx`
- `src/screens/CategoriesScreen.tsx`
- `src/components/CategoryGrid.tsx`

TabParamList 移除 Browse/Categories。

HomeScreen 中 `routeCategoryId` 逻辑移除（不再需要路由传参）。

### 圆角 token

`NewPromptSheet.tsx`: `rounded-t-[28px]` → `borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl`

### generateId

新建 `src/utils/id.ts`，HomeScreen 引用。

### 动画时长对称

关闭: scrim 200ms + panel 250ms（打开: scrim 200ms + panel 300ms）

### 分类按钮对比度

未选中: `color+"10"` → `color+"1A"`, 边框 `color+"30"` → `color+"40"`

### save error banner

`#B45309` → `colors.text` (light: rgba(0,0,0,0.88), dark: rgba(255,255,255,0.92))
背景: `colors.accent + "1F"` → `colors.primary + "1F"`

### FAB spacing

```
bottom: Spacing.xl (28)
right: Spacing.lg (20)
```
