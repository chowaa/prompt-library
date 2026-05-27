# Prompt Library — iOS 26 设计重构规格文档

## 项目概览

在原有 Prompt Library（AI 提示词管理工具）基础上，将 UI 从基础 iOS 风格升级为 **iOS 26 设计语言**——毛玻璃材质、柔和圆角、通透阴影、San Francisco 的克制排版、大留白、轻量层级。整体简约优雅。

**产品类型：** 生产力工具  
**目标用户：** AI 重度用户（开发者、内容创作者）  
**整体调性：** 简约优雅、通透轻盈、克制从容

---

## 设计理念

### 从 iOS 基础 → iOS 26

| 维度 | 旧设计 | 新设计 |
|------|--------|--------|
| 材质 | 实色卡片 `#FFFFFF` / `#1C1C1E` | 毛玻璃半透明 `rgba(255,255,255,0.72)` / `rgba(28,28,30,0.88)` |
| 层级 | 左侧色条分隔卡片 | 0.5px 极细边框 + 通透阴影分层 |
| 圆角 | 8~20px | 10~28px，更流动的曲率 |
| 阴影 | 无标准化体系 | light/dark 分模式下 sm/md/lg 三档精细控制 |
| 排版 | 标准 fontWeight/无 letterSpacing | SF Pro 完整字重体系 + 微负 letterSpacing |
| 间距 | 12~32px | 14~40px，更慷慨的呼吸感 |
| 色彩 | 高对比、浓色 | 柔光、冗余度更低的色阶 |
| 图标 | `textSecondary` 强存在感 | `textTertiary` 后退让步 |

---

## 设计系统

### 色彩体系

#### 语义 Token

```
background    → 页面底色（暖白 / 纯黑）
card          → 毛玻璃卡片底色（半透明）
cardSolid     → 完全实色底色（面板等需要明确遮挡的场景）
primary       → 主操作色（靛蓝系）
accent        → 强调色（琥珀/黄）
text          → 主文字
textSecondary → 辅助文字
textTertiary  → 让步文字 / 图标灰（新增）
separator     → 分割线 / 边框
scrim         → 模态遮罩
```

#### Light Mode

| Token | 旧值 | 新值 | 说明 |
|-------|------|------|------|
| `background` | `#F2F2F7` | `#F8F8FA` | 降低灰暖差，更通透 |
| `card` | `#FFFFFF` | `rgba(255,255,255,0.72)` | 毛玻璃质感核心 |
| `primary` | `#6366F1` | `#5E5CE6` | 微调饱和度，退一步更克制 |
| `text` | `rgba(0,0,0,0.9)` | `rgba(0,0,0,0.88)` | 柔和一度 |
| `textSecondary` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.50)` | 明显让步 |
| `textTertiary` | ❌ | `rgba(0,0,0,0.30)` | 新增：图标/占位符灰度 |
| `separator` | `#E5E5EA` | `rgba(0,0,0,0.08)` | 近乎透明，隐身感 |
| `scrim` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.35)` | 轻微减轻 |

#### Dark Mode

| Token | 旧值 | 新值 | 说明 |
|-------|------|------|------|
| `card` | `#1C1C1E` | `rgba(28,28,30,0.88)` | 暗色毛玻璃 |
| `primary` | `#818CF8` | `#8B88FF` | 提升亮度适配暗底 |
| `accent` | `#F59E0B` | `#FFD60A` | 提升亮度适配暗底 |
| `text` | `rgba(255,255,255,0.9)` | `rgba(255,255,255,0.92)` | 微提亮度 |
| `textTertiary` | ❌ | `rgba(255,255,255,0.35)` | 新增 |
| `separator` | `#38383A` | `rgba(255,255,255,0.10)` | 半透明细线 |
| `scrim` | `rgba(0,0,0,0.6)` | `rgba(0,0,0,0.55)` | 轻微减轻 |

### 圆角体系

| Token | 旧值 | 新值 | 用途 |
|-------|------|------|------|
| `sm` | 8 | 10 | 输入框内部元素 |
| `md` | 12 | 16 | 搜索框、设置行 |
| `lg` | 16 | 24 | 卡片主容器 |
| `xl` | 20 | 28 | 弹层顶部 |
| `full` | 9999 | 9999 | 胶囊、FAB |

### 阴影体系

```
Shadow.light.sm → shadowOpacity: 0.06, shadowRadius: 4   (细微浮起)
Shadow.light.md → shadowOpacity: 0.08, shadowRadius: 12  (卡片标准)
Shadow.light.lg → shadowOpacity: 0.10, shadowRadius: 24  (FAB 长阴影)

Shadow.dark  → 对应 opacity ×2~3  (暗色下需更强阴影才能被感知)
```

### 间距体系

| Token | 旧 | 新 | 变化 |
|-------|---|---|------|
| `xs` | 4 | 4 | — |
| `sm` | 8 | 8 | — |
| `md` | 12 | 14 | +2 |
| `lg` | 16 | 20 | +4 |
| `xl` | 24 | 28 | +4 |
| `xxl` | 32 | 40 | +8 |

**原则：** 组件间用 md/lg，区块间用 xl/xxl。统一外间距 `px-5`（列表）/ `px-20`（FlatList contentInset）。

### San Francisco 排版体系

#### 字重责任矩阵

| 字重 | 语义角色 | 用途举例 |
|------|---------|---------|
| `"400"` (Regular) | Body | 正文、提示文字 |
| `"500"` (Medium) | Caption / Label | 标签、元数据、section header |
| `"600"` (Semibold) | Title / Headline | 卡片标题、导航标题、CTA 按钮 |

不使用 `"700"` (Bold)，iOS 26 的显著趋势是减少粗体使用，用更大的字号和留白建立层级。

#### 字号—字间距对照

| fontSize | letterSpacing | 用途 |
|----------|---------------|------|
| 34px | — | Large Title（预留） |
| 28px | — | Title1（预留） |
| 22px | — | Title2（预留） |
| 20px | `-0.2` | Headline（空状态标题） |
| 17px | `-0.2` | Title（卡片标题、导航标题、输入正文） |
| 15px | `-0.1` | Body 小（辅助文字） |
| 14px | `-0.15` | Footnote（卡片预览文字） |
| 13px | `-0.08` ~ `0.5` | Caption（计数、Section Header uppercase） |

微负 letterSpacing 模仿 SF Pro 在 iOS 原生的字距调节（tracking），让人眼感知更加流畅。

---

## 组件设计规格

### PromptCard

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │ 标题 (17px / 600 / -0.2)   ★ │    │
│  │ 内容预览 (14px / 400)         │    │
│  │                             │    │
│  │ ┌──────┐                    │    │
│  │ │ 分类  │ (pill / 12px/500)  │    │
│  │ └──────┘                    │    │
│  └─────────────────────────────┘    │
│  背景: card (0.72半透明)             │
│  边框: 0.5px separator             │
│  圆角: 24px                        │
│  阴影: Shadow.md                   │
└─────────────────────────────────────┘
```

**变更要点：**
- 去掉左侧 `width: 4` 重色条 → 卡片自身即为完整视觉单位
- 半透明背景透过页面底色形成天然毛玻璃感
- 收藏星标未选中用 `textTertiary`（让步），选中用 `accent`（突出）
- 分类标签从底条改为同色系半透明 pill 气泡

### SearchBar

```
┌───────────────────────────────────┐
│ 🔍  搜索提示词...                  │
│ 背景: card + 0.5px border + s.sm  │
│ 圆角: 16px                        │
│ 图标色: textTertiary              │
└───────────────────────────────────┘
```

### CategoryChip

```
选中态:   [ 编程 3 ]  ← 实色底 + 无边框 + 白色字
未选中:   [ 写作 2 ]  ← 10%色底 + 30%色边框 + 原色字
          rounded-full capsule
```

### CategoryGrid

```
┌──────────────┐  ┌──────────────┐
│   ┌────┐     │  │   ┌────┐     │
│   │ 📐 │     │  │   │ 📝 │     │
│   └────┘     │  │   └────┘     │
│   编程        │  │   写作        │
│   3 个提示词  │  │   5 个提示词  │
└──────────────┘  └──────────────┘
背景: card + 0.5px border + Shadow.sm
圆角: 22px
图标容器: 52×52 / rounded-2xl / 18%色底
```

### FAB

```
               ┌────┐
               │  + │  ← primary 实色底
               └────┘    Shadow.lg 柔和长阴影
               56×56 / rounded-full
               bottom: 32px / right: 24px
```

### NewPromptSheet

```
┌──────────────────────────────────┐
│  取消         新建提示词      保存  │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ 提示词标题                     │ │  输入框: rgba半透明底 / rounded-2xl
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │                              │ │
│ │ 输入提示词内容...              │ │  多行输入: min-height 130px
│ │                              │ │
│ └──────────────────────────────┘ │
│ 标签                              │  uppercase section header
│ ┌──────────────────────────────┐ │
│ │ 用逗号分隔，如：编程, 代码审查  │ │
│ └──────────────────────────────┘ │
│ 分类                              │  uppercase section header
│ [ 编程 ] [ 写作 ] [ 设计 ]        │  圆角胶囊 + 半透明
├──────────────────────────────────┤
│        🗑  删除提示词              │  仅编辑态显示
│        红色 8%底 + #FF453A 字     │
└──────────────────────────────────┘
面板: rounded-t-[28px] / 0.96~0.98 opacity
      + 0.5px top border
遮罩: scrim (0.35 / 0.55)
```

### TabNavigator

```
┌──────────────────────────────────┐
│  浏览                    ← Header │
│  背景: background                │
│  下边框: 0.5px separator         │
│  无阴影（iOS 26 风格）            │
├──────────────────────────────────┤
│                                  │
│          (page content)          │
│                                  │
├──────────────────────────────────┤
│  🔍 浏览   📁 分类   ⚙️ 设置     │
│  card 半透明底                    │
│  上边框: 0.5px separator         │
└──────────────────────────────────┘
Tab 图标活跃: primary / 非活跃: textTertiary
Tab 文字: 11px / "500" / -0.05
```

### SettingsScreen

```
┌──────────────────────────────────┐
│  外观                             │  uppercase / 13px / 500 / 0.5ls
│ ┌──────────────────────────────┐ │
│ │ 🌙  深色模式          [====]  │ │  row: 0.5px border + 半透明card
│ └──────────────────────────────┘ │
│  数据                             │
│ ┌──────────────────────────────┐ │
│ │ 📥  导出 JSON               > │ │
│ │ 📤  导入 JSON               > │ │
│ └──────────────────────────────┘ │
│  统计                             │
│ ┌──────────────────────────────┐ │
│ │ 提示词总数              12    │ │  22px rounded / 0.5px 边框
│ │ 分类数                   5    │ │
│ │ 已收藏                   3    │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## 毛玻璃实现策略（React Native）

React Native 无法使用 CSS `backdrop-filter: blur()`，因此采用**视觉等效方案**：

1. **半透明背景色** — `rgba(255,255,255,0.72)` 让底层颜色微微透出
2. **极细边框** — `0.5px` separator 建立微弱边缘感
3. **柔和阴影** — `Shadow.md`（2px offset + 0.08 opacity + 12px blur）替代平面排列
4. **contentInset 间距** — 确保卡片与背景之间有足够面积透出底色

> 在真实 iOS 26 设备上，`backgroundColor: "rgba(...)"` 配合系统渲染会自动产生轻微的色彩透叠效果，接近原生毛玻璃观感。

---

## 文件变更清单

| 文件 | 类型 | 内容 |
|------|------|------|
| `src/constants/theme.ts` | 重构 | 色彩、圆角、阴影、间距、字号全面升级 |
| `src/components/PromptCard.tsx` | 重构 | 去色条、半透明卡、soft shadow、pill 标签 |
| `src/components/SearchBar.tsx` | 重构 | 毛玻璃搜索框 |
| `src/components/CategoryChip.tsx` | 重构 | 胶囊圆角、半透明状态色 |
| `src/components/CategoryGrid.tsx` | 重构 | 22px 圆角、半透明、图标容器升级 |
| `src/components/FAB.tsx` | 微调 | Shadow.lg、bottom 增至 8 |
| `src/components/EmptyState.tsx` | 微调 | 图标淡化、按钮 capsule |
| `src/components/NewPromptSheet.tsx` | 重构 | 玻璃面板、rgba 输入、系统红删除 |
| `src/navigation/TabNavigator.tsx` | 重构 | 透明 Header、半透明 TabBar、排版体系 |
| `src/screens/SettingsScreen.tsx` | 重构 | uppercase header、细边框 row、switch 颜色 |
| `src/screens/BrowseScreen.tsx` | 微调 | 间距放大、paddingBottom 加深 |