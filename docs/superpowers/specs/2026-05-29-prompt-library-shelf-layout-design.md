# Prompt Library — 设计规格

> **范围:** 多轮迭代汇总 — Shelf 布局重构 + issues.md 修复 + 前端设计审核修复
> **最后更新:** 2026-05-29 v2

---

## 一、Shelf 布局重构

### 导航结构

底部双 Tab：Home（提示词库）+ Settings（设置）

删除 Browse、Categories 独立 Tab，将浏览和分类筛选功能整合到 HomeScreen。

### HomeScreen 三态

1. **Shelf 态**（默认）: 收藏横滚 Shelf → 分类 Section（横滚 Shelf + "查看全部"）→ FAB
2. **搜索态**（搜索有结果）: 分类 Chip 横滚（含"全部"按钮）→ PromptCard 列表
3. **空状态**（搜索无结果/库为空）: EmptyState 居中

### 组件职责

| 组件 | 用途 | 交互 |
|------|------|------|
| PromptCard | 搜索列表中的提示词卡片 | 按下 scale 0.97、收藏星标 bounce |
| ShelfCard | 横滚书架中的提示词卡片 | 同 PromptCard 动效 |
| SearchBar | 实时搜索输入 | 输入即搜索 |
| CategoryChip | 分类筛选胶囊 | 选中/取消，选中态暗色文字 |
| EmptyState | 空状态视图 | 搜索无结果→search 图标，库为空→sparkles 图标 |
| FAB | 新建提示词悬浮按钮 | 定位引用 Spacing token |
| NewPromptSheet | 新建/编辑弹层 | 打开 200/300ms，关闭 200/300ms（对称） |

---

## 二、issues.md 修复

### 持久化失败提示

- AppState 新增 `saveError: string | null`
- AppAction 新增 `SAVE_ERROR` / `SAVE_SUCCESS`
- 持久化 catch 分支 dispatch error + console.warn
- HomeScreen 底部 banner 使用语义色 `colors.primary + "1F"` / `colors.primary + "4D"`

### Switch 防抖简化

- 移除 DarkModeRow 中的 localValue state、timerRef、useEffect、setTimeout
- Switch value 直接绑定 isDark
- onValueChange 直接 dispatch themeMode
- 保留 React.memo + useCallback

---

## 三、前端设计审核修复 (v2)

### 排版

- FontSize token 扩展为 10 级（caption2 11 → largeTitle 34）
- 全局 10+ 个组件所有 fontSize 替换为 FontSize.* token，消除硬编码

### 色彩

- CategoryChip 选中态文字从 `#FFFFFF` 改为 `rgba(0,0,0,0.88)`（暗色文字）
- EmptyState 图标色从 `textTertiary` 改为 `textSecondary`
- CategoryColors 死代码已删除
- Save error banner 使用语义色替代硬编码 `#B45309`

### 动效

- PromptCard + ShelfCard: 按下 `Animated.spring` scale 0.97→1.0
- 收藏星标: `Animated.sequence` scale 0.8→1.0 spring bounce
- NewPromptSheet: 打开 200/300ms，关闭 200/300ms（对称）

### 空间构成

- Spacing.md 从 14 改为 12（纯 4px 体系）
- FAB 定位引用 Spacing.xl / Spacing.lg token
- NewPromptSheet 圆角使用 Radius.xl 替代裸值 `rounded-t-[28px]`
- CategoryGrid 已删除（随 Browse/Categories 清理）

### 视觉细节

- ShelfCard 增加 Shadow.sm（与 PromptCard 统一有阴影）
- DarkModeRow 增加 `accessibilityLabel="深色模式"`

### 代码架构

- 删除 BrowseScreen、CategoriesScreen、CategoryGrid
- TabParamList 清理为 Home + Settings
- generateId 抽取到 `src/utils/id.ts`
- StatusBar 主题适配（dark/light）
- useTheme 返回值 useMemo 包裹
- HomeScreen ListHeaderComponent 增加 `key="all"`

---

## 四、未修复项

| 问题 | 原因 |
|------|------|
| NewPromptSheet 关闭动画竞态 (P0) | 用户明确跳过，需后续重构 Modal visible 控制逻辑 |

---

## 五、设计 Token 体系

```typescript
// 字号 (src/constants/theme.ts)
FontSize = { caption2: 11, caption: 12, footnote: 13, subhead: 15,
             callout: 16, body: 17, title3: 20, title2: 22,
             title1: 28, largeTitle: 34 }

// 间距 (4px 体系)
Spacing = { xs: 4, sm: 8, md: 12, lg: 20, xl: 28, xxl: 40 }

// 圆角
Radius = { sm: 10, md: 16, lg: 24, xl: 28, full: 9999 }

// 阴影 (light/dark 各三档)
Shadow = { light: { sm, md, lg }, dark: { sm, md, lg } }

// 色彩 (light/dark 双模式)
Colors = { light: { background, card, primary, accent, text, textSecondary, textTertiary, separator, scrim },
           dark:  { ... } }
```
