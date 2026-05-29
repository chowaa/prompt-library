# Prompt Library — 前端设计审核修复进度 (v2)

## 2026-05-29 Round 2 — 全部完成 ✅

### Phase A: FontSize token 落地 ✅
- [x] A.1 扩展 FontSize token (`theme.ts`)
- [x] A.2 全局替换 (10 个文件)

### Phase B: 死页面清理 ✅
- [x] B.1 删除 BrowseScreen/CategoriesScreen/CategoryGrid
- [x] B.2 清理 TabParamList
- [x] B.3 清理 HomeScreen 路由引用

### Phase C: generateId 去重 ✅
- [x] C.1 新建 `src/utils/id.ts`
- [x] C.2 更新 HomeScreen import

### Phase D: EmptyState 场景化图标 ✅
- [x] D.1 HomeScreen 不同场景传不同 icon (search/sparkles)

### Phase E: 动效注入 ✅
- [x] E.1 PromptCard 按下 scale
- [x] E.2 ShelfCard 按下 scale
- [x] E.3 收藏星标 bounce

### Phase F: 类型检查 ✅
- [x] `npx tsc --noEmit` 零错误

### Phase G: 关闭动画时长对称 ✅
- [x] NewPromptSheet 关闭 scrim 150→200, panel 200→300

---

## 审核 23 项最终状态

| # | 问题 | 优先级 | 状态 |
|---|------|--------|------|
| 1 | Loading 白屏 → ActivityIndicator | P0 | ✅ 已修复 |
| 2 | CategoryColors 死代码 → 删除 | P0 | ✅ 已修复 |
| 3 | NewPromptSheet 关闭动画竞态 | P0 | ⏭️ 跳过（用户指定） |
| 4 | CategoryChip 对比度 → 暗色文字 | P1 | ✅ 已修复 |
| 5 | FontSize token 实际使用 | P1 | ✅ 已修复 |
| 6 | Spacing.md=14 → 改为 12 | P1 | ✅ 已修复 |
| 7 | 收藏星标切换动画 | P1 | ✅ 已修复 |
| 8 | 卡片按下 scale 反馈 | P1 | ✅ 已修复 |
| 9 | StatusBar 主题适配 | P1 | ✅ 已修复 |
| 10 | useTheme 返回值 memo 化 | P1 | ✅ 已修复 |
| 11 | ShelfCard/PromptCard 阴影统一 | P1 | ✅ 已修复 |
| 12 | EmptyState 图标色 → textSecondary | P1 | ✅ 已修复 |
| 13 | 死页面清理 | P2 | ✅ 已修复 |
| 14 | 圆角裸值替换为 Radius token | P2 | ✅ 已修复 |
| 15 | generateId 抽取为共享工具 | P2 | ✅ 已修复 |
| 16 | EmptyState 图标按场景区分 | P2 | ✅ 已修复 |
| 17 | 关闭动画时长统一 | P2 | ✅ 已修复 |
| 18 | DarkModeRow 无障碍 label | P2 | ✅ 已修复 |
| 19 | FAB 定位引用 spacing token | P2 | ✅ 已修复 |
| 20 | NewPromptSheet 分类按钮中间态 | P2 | ✅ 已修复 |
| 21 | 全部按钮 key | P2 | ✅ 已修复 |
| 22 | Save banner 硬编码颜色 | P2 | ✅ 已修复 |
| 23 | BrowseScreen 死页面 | P2 | ✅ 已修复 |

**修复率: 22/23 (96%)，P0 竞态 bug 用户明确跳过。**
