# Prompt Library — 前端设计审核

> 审核范围：全部 `.tsx` 组件与页面
> 框架：排版 / 色彩 / 动效 / 空间构成 / 视觉细节

---

## 一、发现的 Bug（优先于设计）

### P0-1 关闭动画竞态：`visible=false` 直接卸载 Modal，动画从未生效

`NewPromptSheet.tsx:126`：

```tsx
if (!visible) return null;
```

`handleClose` 中 `Animated.parallel(...).start(() => onClose())` 在动画结束后才调用 `onClose`，此时 `visible` 变为 false，组件 return null，这本身是正确的。但问题出在另一条路径——用户点击 scrim 背景时，`onPress={handleClose}` 会触发同样的流程，而如果用户在动画播放期间再次操作（比如快速双击取消），第二次调用可能在第一次动画未完成时就触发状态变更。更根本的问题是：`handleClose` 没有防重入保护。

**当前行为：** 点击取消 → 动画播放 → onClose → visible=false → return null（正常情况下动画可以播完）
**风险场景：** 快速双击取消 / 在动画期间通过其他方式触发 onClose → 第二次调用可能在动画中途重置 animated values → 动画被截断

**修复方向：** 加一个 `isClosing` ref 防止重入，在动画期间忽略额外的关闭请求。

### P0-2 `CategoryColors` 与 `DEFAULT_CATEGORIES` 颜色完全不一致（死代码 / 数据分裂）

`theme.ts:L28-L34` 定义了 `CategoryColors`，但**没有任何组件引用它**。实际渲染用的是 `defaults.ts` 中的分类颜色。两套数据值完全不同：

| 分类 | theme.ts (`CategoryColors`) | defaults.ts (实际使用) |
|------|---------------------------|----------------------|
| 编程 | `#5E5CE6` | `#6366F1` |
| 写作 | `#34C759` | `#10B981` |
| 设计 | `#FF375F` | `#EC4899` |
| 数据 | `#007AFF` | `#3B82F6` |
| 通用 | `#8E8E93` | `#78716C` |

如果有人以后"修复"引用指向 `CategoryColors`，整个 App 的分类色会瞬间变化。

**修复方向：** 删除 `CategoryColors`，或将 `DEFAULT_CATEGORIES` 的颜色与它统一为单一数据源。

### P0-3 Loading 白屏

`HomeScreen.tsx:136` / `BrowseScreen.tsx:94`：

```tsx
if (state.isLoading) return null;
```

首次启动时用户看到的是纯背景色空白页面，直到 AsyncStorage 读取完成。应该至少展示居中的 `ActivityIndicator`。

### P0-4 无 StatusBar 适配

App 不根据 dark/light 模式切换 StatusBar 样式。在 dark 模式下，默认深色 StatusBar 文字在深色背景上不可见。

---

## 二、五维度逐项审核

### 排版 — 6/10

- ✅ San Francisco 字重体系（400/500/600）贯彻一致，无 `"700"` Bold
- ✅ 微负 letterSpacing 遵循 iOS 26 设计语言，各组件间取值有规律（标题 -0.2、正文 -0.15、小字 -0.1）
- ❌ `FontSize` token 定义了但从不使用——caption 13 → largeTitle 34 体系完整，但所有 fontSize 都是手写数字。改字号需要逐个文件查找替换，token 形同虚设
- ❌ EmptyState 图标硬编码 `documents-outline`，搜索无结果和库为空场景语义不匹配
- ⚠️ 字号层级跨度不均：Section header 20px → card title 17px → Settings label 13px，每级差 3-4px 而非等比

### 色彩 — 5/10（因 P0-2 数据分裂扣分）

- ✅ 三层语义色（text/textSecondary/textTertiary）+ primary/accent 体系清晰
- ✅ Light/Dark 双模式实现完整
- ❌ `CategoryColors` 死代码与 `DEFAULT_CATEGORIES` 颜色分裂（见 P0-2）
- ❌ CategoryChip 选中态白字 `#FFFFFF` + 自定义色底 `color+"E6"` = 不可控对比度。默认分类中的橙色（`#FF9F0A`）、黄色系（`#FFD60A`）上白字对比度偏弱，用户自定义分类时更不可预测
- ⚠️ EmptyState 56px 大图标用 `textTertiary`（light 模式 `rgba(0,0,0,0.30)`），大尺寸装饰元素用最低透明度显得发虚无力
- ⚠️ `useTheme` 每次渲染创建新对象 `{ isDark, colors }`，所有消费组件在 Context 变化时全量重渲染

### 动效 — 3/10

- ✅ NewPromptSheet 有滑入 + 淡入动画（scrim 200ms + panel 300ms parallel）
- ✅ Haptics 在收藏和删除时触发
- ❌ 关闭动画有重入风险（见 P0-1），且关闭时长（150ms/200ms）与打开（200ms/300ms）不对称，dismiss 显得偏急促
- ❌ 卡片按下只有 `activeOpacity`（0.6-0.85），无 scale 微缩。iOS 26 设计语言下这种反馈过于基础——用户按下卡片时几乎感知不到触觉确认（haptic 是抬手后触发，不是按下时）
- ❌ 收藏星标切换无动画——高频交互点，值得 200ms 的 `transform: scale` 弹跳
- ❌ 列表项出现/消失无过渡
- ❌ Loading 状态白屏无 skeleton/spinner

### 空间构成 — 6/10

- ✅ Spacing token 体系存在且大部分被遵守
- ✅ Radius token 基本完整（sm=10, md=16, lg=24, xl=28, full=9999）
- ❌ `Spacing.md=14` 不整除 4，破坏自称的 4px 体系
- ❌ CategoryGrid 圆角 `rounded-[22px]` 不在 Radius token 中（最近的 token 是 md=16 和 lg=24）
- ❌ NewPromptSheet 圆角 `rounded-t-[28px]` 裸值，虽然和 Radius.xl=28 数值相同但未引用 token
- ❌ FAB 定位 `bottom-8 right-6` 未引用 Spacing token
- ⚠️ 布局是标准垂直滚动 + 水平 Shelf 子滚动，功能正确但缺乏空间创意

### 视觉细节 — 5/10

- ✅ 毛玻璃卡片风格贯彻（rgba 半透明 + 0.5px 细边框 + 柔和阴影）
- ✅ Shadow 分 light/dark 各 sm/md/lg 三档
- ❌ ShelfCard（扁平无阴影）与 PromptCard（Shadow.md）视觉重量不一致。用户在 Shelf 和搜索模式间切换时卡片"重量"突变
- ❌ NewPromptSheet 分类按钮未选中态 `color+"10"` 背景 + `color+"30"` 边框在 light 模式下与白色 sheet 几乎融为一体，区分度极低。选中/未选中从 10% 不透明度跳到 90%，无中间态
- ❌ EmptyState 图标 `documents-outline` 硬编码，不随场景变化
- ⚠️ DarkModeRow 的 TouchableOpacity 设置了 `disabled` 但无 `accessibilityLabel`，VoiceOver 下该区域语义缺失

---

## 三、代码层面问题

### C1. generateId 在两处重复定义

`HomeScreen.tsx:17` 和 `BrowseScreen.tsx:15` 有完全相同的 `generateId` 函数。应抽取为共享工具函数。

### C2. BrowseScreen / CategoriesScreen / CategoryGrid 为死页面

`TabNavigator.tsx` 只有 Home + Settings 两个 Tab，这三个文件无任何组件引用，占用 bundle 体积和维护心智。上次 Shelf 重构的 Phase 4 清理被用户明确跳过，但长期保留无益。

### C3. HomeScreen 搜索模式分支的 ListHeaderComponent 缺 key

`HomeScreen.tsx:154-174` "全部"按钮作为 `FlatList` 的 `ListHeaderComponent` 渲染但无 `key` prop，重渲染时可能被误识别为数据项。

---

## 四、修复优先级

| 优先级 | 问题 | 类型 | 工作量 |
|--------|------|------|--------|
| 🔴 P0 | 关闭动画重入风险（#P0-1） | Bug | 中 |
| 🔴 P0 | CategoryColors 死代码（#P0-2） | 数据分裂 | 删 10 行 |
| 🔴 P0 | Loading 白屏 → 加 ActivityIndicator | 体验缺陷 | 5 行 |
| 🔴 P0 | StatusBar 主题适配 | 功能缺陷 | 5 行 |
| 🟡 P1 | CategoryChip 对比度 → 根据背景色明度选黑/白字 | 无障碍 | 15 行 |
| 🟡 P1 | FontSize token 实际使用（全局替换手写 fontSize） | 一致性 | 全局替换 |
| 🟡 P1 | Spacing.md=14 → 改为 12 或 16 | 一致性 | 全局替换 |
| 🟡 P1 | 收藏星标切换加 scale bounce 动画 | 微交互 | 20 行 |
| 🟡 P1 | 卡片按下加 scale 反馈（替代纯 opacity） | 微交互 | 补充到各卡片 |
| 🟡 P1 | EmptyState 图标按场景区分（搜索/空库/空分类） | 细节 | 10 行 |
| 🟢 P2 | useTheme 返回值 memo 化 | 性能 | 1 行 |
| 🟢 P2 | 圆角裸值替换为 Radius token（3 处） | 一致性 | 3 处 |
| 🟢 P2 | FAB 定位引用 Spacing token | 一致性 | 1 行 |
| 🟢 P2 | NewPromptSheet 分类按钮未选中态加深（`color+"10"` → `color+"20"`） | 可见性 | 2 字符 |
| 🟢 P2 | DarkModeRow 加 accessibilityLabel | 无障碍 | 1 行 |
| 🟢 P2 | generateId 抽取为共享工具函数 | 代码整洁 | 新建 util 文件 |
| 🟢 P3 | 清理死页面（BrowseScreen/CategoriesScreen/CategoryGrid） | 代码整洁 | 删文件 |
| 🟢 P3 | ListHeaderComponent 补 key | 防御性 | 1 行 |

---

## 五、总体评价

这是一个**功能完整、代码整洁**的个人工具 App。iOS 26 设计语言的方向选得很好——毛玻璃卡片、微负 letterSpacing、0.5px 细边框、SF 字重体系都执行到位。色彩 token 体系（text/textSecondary/textTertiary + primary/accent）设计合理，light/dark 双模式覆盖完整。

但设计执行上偏"骨架正确，血肉不足"。动效是最薄弱的环节（3/10）——除了 sheet 的滑入，所有交互反馈都限于 opacity 变化和 haptic 震动。这个差距在 iOS 平台上尤其明显，因为用户被系统级动画养成了高预期。

工程层面，P0 的三个 Bug 值得优先处理：**动画重入风险**是真实的功能缺陷，**CategoryColors 死代码**是埋下的雷，**Loading 白屏**是第一印象的地板。三个加起来不超过 40 行改动，性价比极高。

P1 的 token 统一和微交互补充属于打磨层——不影响功能但决定 App"品质感"的上限。
