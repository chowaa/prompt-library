# Prompt Library — UI 升级实施计划

> **方法论:** `ui-ux-pro-max` (50+ 设计规则系统) + `frontend-design` (编辑/杂志风 + 精致极简)
> **技术栈:** React Native 0.81 + Expo SDK 54 + NativeWind v4 + Reanimated 4
> **上一轮:** 已完成 iOS 26 设计语言重构 (2026-05-26-ios26-design-refactor)，本轮在此基础上深化

---

## 设计方向

| 维度 | 上一轮 (iOS 26) | 本轮升级 |
|------|----------------|---------|
| **Tone** | 简约优雅、通透轻盈 | Editorial + Refined Minimalism — 排版主导、留白慷慨、单一强调色 + 大面积中性色 |
| **色彩** | 紫/黄双色，5 分类色 | 降低色彩数量，强化 primary 独特性（靛蓝→更深邃的 slate-indigo），accent 仅用于收藏星标 |
| **卡片** | 毛玻璃统一卡片 (0.72) | 引入**卡片层次差异**：主卡片高透 (0.85) / 次级卡片低透 (0.60) / 面板实色 |
| **动效** | 无 | Reanimated 交错入场 (30-50ms stagger)、弹性曲线、页面切换共享元素 |
| **背景** | 纯色 `#F8F8FA` | 极 subtle 纹理/渐变背景（通过 global.css / NativeWind 实现） |
| **版面** | 标准 iOS 网格 | 不对称间距、卡片比例变化、引入「呼吸节奏」 |

---

## 阶段概览

| # | Phase | 内容 | 文件数 | 状态 |
|---|-------|------|--------|------|
| 1 | 设计系统深化 | 色彩 Token 精调、新增背景纹理、动效规范 | 3 | pending |
| 2 | 卡片层次体系 | PromptCard 比例变化、CategoryGrid 不等高、SearchBar 分离态 | 3 | pending |
| 3 | 列表动效注入 | BrowseScreen FlatList 交错入场 + 收藏动画 + FAB 弹性 | 2 | pending |
| 4 | 空状态情感化 | EmptyState 品牌插图 + 引导文案优化 | 1 | pending |
| 5 | Sheet & Modal 升级 | 手势交互优化、过渡动画、键盘适配增强 | 1 | pending |
| 6 | Tab Bar 品牌化 | 选中态指示器动画、背景纹理 | 1 | pending |
| 7 | 暗黑模式独立优化 | 暗色下色彩对比度独立校准、毛玻璃透明度独立设置 | 2 | pending |
| 8 | 无障碍 & 触控审计 | 44pt 触控目标、VoiceOver label、色彩对比度 4.5:1 | 全部 | pending |
| 9 | 验收检查 | ui-ux-pro-max pre-delivery checklist | — | pending |

---

## Phase 1: 设计系统深化

### 1.1 色彩 Token 精调

**文件:** `src/constants/theme.ts`

| Token | 当前值 | 新值 | 理由 |
|-------|--------|------|------|
| `light.primary` | `#5E5CE6` | `#4F46E5` | 更深邃的 indigo，减少紫味增加蓝味，更「工具感」 |
| `light.accent` | `#FF9F0A` | `#F59E0B` | 微降饱和度，仅收藏星标使用 |
| `light.background` | `#F8F8FA` | `#FAFAFA` | 更接近纯白，增加卡片毛玻璃对比度 |
| `light.card` | `rgba(255,255,255,0.72)` | — | 保留，毛玻璃核心 |
| `light.cardSecondary` | ❌ | `rgba(255,255,255,0.55)` | 新增：次级卡片（CategoryGrid） |
| `light.cardElevated` | ❌ | `rgba(255,255,255,0.85)` | 新增：弹出层 / Modal |
| `dark.primary` | `#8B88FF` | `#818CF8` | 暗色下略微降低亮度避免刺眼 |
| `dark.card` | `rgba(28,28,30,0.88)` | — | 保留 |
| `dark.cardSecondary` | ❌ | `rgba(28,28,30,0.65)` | 新增 |
| `dark.cardElevated` | ❌ | `rgba(28,28,30,0.95)` | 新增 |

### 1.2 分类色板升级

**文件:** `src/constants/theme.ts` + `src/constants/defaults.ts`

当前 5 个分类色过于分散且部分饱和度过高。升级为更协调的色板：

| 分类 | 旧色 | 新色 | 理由 |
|------|------|------|------|
| 编程 | `#5E5CE6` | `#6366F1` | 与 primary 形成同一色系家族 |
| 写作 | `#34C759` | `#059669` | 降低亮度，更沉稳的 emerald |
| 设计 | `#FF375F` | `#DB2777` | 降低饱和度，pink→rose |
| 数据 | `#007AFF` | `#2563EB` | 更深的蓝，与 primary 协调 |
| 通用 | `#8E8E93` | `#78716C` | warm stone，与 slate-indigo 形成暖冷对比 |

### 1.3 背景纹理

**文件:** `src/global.css`

在 Tailwind 层中添加 subtle 噪点纹理背景（仅 light 模式，dark 模式纯黑）：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  .bg-noise {
    background-image: url("data:image/svg+xml,...");
    background-repeat: repeat;
    background-size: 200px 200px;
  }
}
```

### 1.4 动效规范

| 动效 | 时长 | 曲线 | 说明 |
|------|------|------|------|
| 列表项入场 | 300ms | spring(阻尼15, 刚度120) | 30ms stagger |
| 收藏切换 | 200ms | ease-out | scale 0.8→1.0 + 旋转 |
| FAB 按压 | 150ms | spring | scale 1.0→0.92→1.0 |
| Sheet 弹入 | 300ms | ease-out | translateY 200→0 + fade |
| Tab 切换 | 200ms | ease-in-out | icon scale + color transition |

---

## Phase 2: 卡片层次体系

### 2.1 PromptCard — 主编排卡片

**文件:** `src/components/PromptCard.tsx`

- 主列表卡片使用 `card` (0.72 透) + `Shadow.md`
- 添加 `cardElevated` (0.85 透) 作为「已展开/编辑中」态
- 卡片内标题与内容间距从 `mb-1.5` 增加到 `mb-2`（更呼吸）
- 分类 pill 字号从 12px 提升到 13px，更可读
- 收藏星标增加 scale 弹性动画（Reanimated）

### 2.2 CategoryGrid — 次级卡片

**文件:** `src/components/CategoryGrid.tsx`

- 背景改为 `cardSecondary` (0.55 透)，与主卡片形成层次对比
- 引入**不等高双列**：奇数项略高（通过 padding 差异），打破单调网格
- 图标容器从 52×52 缩小到 48×48，让步于文字
- 圆角从 22px 统一到 24px（与 PromptCard 一致）

### 2.3 SearchBar — 分离态搜索

**文件:** `src/components/SearchBar.tsx`

- 未聚焦态：更透明的背景 `cardSecondary`
- 聚焦态：提升到 `card` + `Shadow.md`，输入框边框高亮 primary
- 添加聚焦/失焦过渡动画 (200ms)

---

## Phase 3: 列表动效注入

### 3.1 BrowseScreen 交错入场

**文件:** `src/screens/BrowseScreen.tsx`

使用 `react-native-reanimated` 的 `FadeInDown` + `withDelay`:

```typescript
// 每个 PromptCard 包裹 Animated.View
// entering={FadeInDown.duration(300).delay(index * 30).springify()}
```

首次加载 / 筛选切换时触发。已渲染的列表不重复动画。

### 3.2 收藏星标动画

**文件:** `src/components/PromptCard.tsx`

收藏切换时星标 scale 0.8→1.2→1.0 (spring)，配合 haptic light。

### 3.3 FAB 弹性动画

**文件:** `src/components/FAB.tsx`

按压时 scale 0.92，松手回弹 1.0 (spring stiffness 200)。

---

## Phase 4: 空状态情感化

**文件:** `src/components/EmptyState.tsx`

- 图标从 `documents-outline` 替换为更有品牌感的 `sparkles` (闪烁感)
- 添加 subtitle 级别的副标题（区分「完全空」和「筛选空」）
- CTA 按钮添加 subtle 渐变背景（primary → primary 加深 10%）
- 整体 padding 增加，图标与文字间距加大

---

## Phase 5: Sheet & Modal 升级

**文件:** `src/components/NewPromptSheet.tsx`

- 弹入动画从系统 slide → Reanimated `SlideInUp` (300ms spring)
- 遮罩点击关闭时添加 `FadeOut` 动画
- 输入框聚焦时面板自动上移（已有 KeyboardAvoidingView，需验证）
- 删除确认按钮改为系统红 `#FF453A`（已做，验证）
- 添加手势下拉关闭（`PanGestureHandler`，threshold 100px）

---

## Phase 6: Tab Bar 品牌化

**文件:** `src/navigation/TabNavigator.tsx`

- 选中态 Tab 图标添加微 scale 动画 (1.0→1.15)
- Tab Bar 顶部添加 0.5px 渐变分割线（非纯色）
- Tab 文字选中态 fontWeight 从 500 升级到 600

---

## Phase 7: 暗黑模式独立优化

### 7.1 对比度校准

- 暗色下 `textSecondary` 从 `0.55` 提升到 `0.60`（当前可能对比度不足 4.5:1）
- 暗色下 `separator` 从 `0.10` 提升到 `0.12`（太细看不见）
- 暗色下分类 pill 透明度从 `18` 提升到 `22`（太暗无法辨识）

### 7.2 毛玻璃透明度独立设置

- 暗色下卡片透明度整体提升 5-8%（暗底上毛玻璃效果更依赖透明度）
- `cardSecondary` 暗色从 0.65 → 0.72
- `cardElevated` 暗色从 0.95 → 0.97

---

## Phase 8: 无障碍 & 触控审计

对照 `ui-ux-pro-max` Priority 1-2 规则:

| 检查项 | 标准 | 当前状态 |
|--------|------|---------|
| 文字对比度 | ≥4.5:1 (AA) | 待测 |
| 触控目标 | ≥44×44pt | PromptCard 收藏按钮已 44×44 + hitSlop=12 ✓ |
| 键盘导航 | Tab 顺序正确 | N/A (移动端) |
| VoiceOver | accessibilityLabel | 待补充 |
| 焦点环 | 可见 focus ring | N/A (移动端) |
| 动态字体 | 支持系统文字缩放 | 待验证 |
| 减少动效 | 尊重 prefers-reduced-motion | 待实现 |

---

## Phase 9: 验收检查

对照 `ui-ux-pro-max` pre-delivery checklist:

### 视觉质量
- [ ] 无 emoji 作为图标
- [ ] 所有图标统一 Ionicons 风格
- [ ] 按压态不导致布局位移
- [ ] 语义 Token 全局一致

### 交互
- [ ] 所有可点击元素有按压反馈
- [ ] 触控目标 ≥44pt
- [ ] 微交互 150-300ms
- [ ] 禁用态清晰

### 明暗模式
- [ ] 主文字对比度 ≥4.5:1
- [ ] 辅助文字对比度 ≥3:1
- [ ] 分割线/边框双模式可见
- [ ] Modal scrim 足够深 (40-60%)

### 布局
- [ ] 安全区域正确
- [ ] 滚动内容不被固定栏遮挡
- [ ] 小屏/大屏/横屏验证
- [ ] 4/8dp 间距体系

### 无障碍
- [ ] 图标有 accessibilityLabel
- [ ] 表单有标签/提示/错误
- [ ] 颜色非唯一信息载体
- [ ] 减少动效 + 动态字体支持

---

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| Reanimated 动效在低端设备掉帧 | 使用 `useSharedValue` + `withSpring` 替代 JS 线程动画 |
| 毛玻璃模拟效果有限 | 通过多级透明度 + 阴影建立层次差异 |
| 暗色模式对比度不达标 | Phase 7 独立校准，Phase 9 逐项检查 |
| 不等高网格在 FlatList 中实现复杂 | 使用 `getItemLayout` 或退化为等高网格 |
