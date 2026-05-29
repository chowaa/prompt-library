# Prompt Library — 前端设计审核修复实施计划 (v2)

> **来源:** `docs/trae-frontend-design-review.md` 23 项
> **本轮范围:** 排除 P0 竞态 bug，完成其余全部 P1+P2
> **上一轮完成:** 16 项（P0 Loading/CategoryColors, P1 对比度/Spacing/memo/StatusBar/EmptyState色/ShelfCard阴影, P2 圆角/FAB/banner/等）

---

## 本轮新增阶段

| # | Phase | 内容 | 文件数 | 状态 |
|---|-------|------|--------|------|
| A | FontSize token 落地 | 扩展 token + 全局替换硬编码字号 | 10 | ✅ done |
| B | 死页面清理 | 删 BrowseScreen/CategoriesScreen/CategoryGrid + 类型清理 | 4 | ✅ done |
| C | generateId 去重 | 抽取共享工具函数 | 2 | ✅ done |
| D | EmptyState 场景化图标 | 不同场景不同 icon | 1 | ✅ done |
| E | 动效注入 | 卡片按下 scale + 收藏星标 bounce | 2 | ✅ done |
| F | 类型检查 | tsc --noEmit | — | ✅ done |
| G | 关闭动画时长对称 | scrim 150→200, panel 200→300 | 1 | ✅ done |

---

## Phase A: FontSize token 落地 ✅

### A.1 扩展 FontSize token

**文件:** `src/constants/theme.ts`

```diff
export const FontSize = {
+ caption2: 11,
+ caption: 12,
- caption: 13,
- footnote: 14,
+ footnote: 13,
+ subhead: 15,
+ callout: 16,
  body: 17,
  title3: 20,
  title2: 22,
  title1: 28,
  largeTitle: 34,
} as const;
```

### A.2 全局替换 ✅

| 文件 | 位置 | 旧值 | 新值 |
|------|------|------|------|
| TabNavigator | tabBarLabelStyle | 11 | FontSize.caption2 |
| PromptCard | 标题 | 17 | FontSize.body |
| PromptCard | 内容 | 14→13 | FontSize.footnote |
| ShelfCard | 标题 | 15 | FontSize.subhead |
| ShelfCard | 内容 | 13 | FontSize.footnote |
| CategoryChip | 文字 | 13 | FontSize.footnote |
| HomeScreen | section header | 20 | FontSize.title3 |
| HomeScreen | "全部"按钮 | 13 | FontSize.footnote |
| HomeScreen | "查看全部" | 15 | FontSize.subhead |
| HomeScreen | banner 文字 | 14→13 | FontSize.footnote |
| EmptyState | 标题 | 20 | FontSize.title3 |
| EmptyState | 说明 | 15 | FontSize.subhead |
| EmptyState | 按钮 | 16 | FontSize.callout |
| SettingsScreen | section header | 13 | FontSize.footnote |
| SettingsScreen | 行文字 | 17 | FontSize.body |
| SettingsScreen | 统计文字 | 15 | FontSize.subhead |
| SearchBar | 输入 | 16 | FontSize.callout |
| NewPromptSheet | 标题/取消/保存 | 17 | FontSize.body |
| NewPromptSheet | section header | 13 | FontSize.footnote |
| NewPromptSheet | 内容输入 | 16 | FontSize.callout |
| NewPromptSheet | 标签输入 | 15 | FontSize.subhead |
| NewPromptSheet | 分类文字 | 13 | FontSize.footnote |
| NewPromptSheet | 删除按钮 | 16 | FontSize.callout |

---

## Phase B: 死页面清理 ✅

### B.1 删除文件 ✅
- `src/screens/BrowseScreen.tsx` → 已删除
- `src/screens/CategoriesScreen.tsx` → 已删除
- `src/components/CategoryGrid.tsx` → 已删除

### B.2 清理类型 ✅
- `TabParamList` 删除 `Browse` 和 `Categories`，仅保留 `Home` 和 `Settings`

### B.3 清理 HomeScreen ✅
- 删除 `useRoute` 相关: `route`, `routeCategoryId`, `RouteProp`
- 删除 `TabParamList` 导入

---

## Phase C: generateId 去重 ✅

### C.1 新建 `src/utils/id.ts` ✅
```typescript
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
```

### C.2 更新 HomeScreen ✅
删除本地 `generateId` 函数，改为 `import { generateId } from "../utils/id"`。

---

## Phase D: EmptyState 场景化图标 ✅

| 场景 | icon prop |
|------|-----------|
| 搜索无结果 | `"search"` |
| 库为空 | `"sparkles"` |

---

## Phase E: 动效注入 ✅

### E.1 卡片按下 scale (PromptCard + ShelfCard) ✅
用 `Animated.View` 包裹，`onPressIn` scale 0.97, `onPressOut` scale 1.0 (spring 200ms)。

### E.2 收藏星标 bounce ✅
星标切换时 scale 0.8→1.0 (spring bounce)。

---

## Phase F: 类型检查 ✅

```bash
npx tsc --noEmit  # 零错误
```

---

## Phase G: 关闭动画时长对称 ✅

NewPromptSheet 关闭动画从 150/200ms 改为 200/300ms，与打开动画对称。

---

## 文件变更清单

| 文件 | 操作 | 内容 |
|------|------|------|
| `src/constants/theme.ts` | 修改 | FontSize 扩展 |
| `src/navigation/TabNavigator.tsx` | 修改 | FontSize + tabBarLabelStyle |
| `src/components/PromptCard.tsx` | 修改 | FontSize + 动效 |
| `src/components/ShelfCard.tsx` | 修改 | FontSize + 动效 |
| `src/components/CategoryChip.tsx` | 修改 | FontSize |
| `src/screens/HomeScreen.tsx` | 修改 | FontSize + 清理路由 + generateId import + EmptyState icon |
| `src/components/EmptyState.tsx` | 修改 | FontSize + icon prop |
| `src/screens/SettingsScreen.tsx` | 修改 | FontSize |
| `src/components/SearchBar.tsx` | 修改 | FontSize |
| `src/components/NewPromptSheet.tsx` | 修改 | FontSize + 关闭动画时长对称 |
| `src/utils/id.ts` | 新建 | generateId |
| `src/screens/BrowseScreen.tsx` | 删除 | 死页面 |
| `src/screens/CategoriesScreen.tsx` | 删除 | 死页面 |
| `src/components/CategoryGrid.tsx` | 删除 | 死组件 |
| `src/types/index.ts` | 修改 | 删 Browse/Categories 路由 |
