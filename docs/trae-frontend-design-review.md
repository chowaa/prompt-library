# Prompt Library — 前端设计审核

> 审核范围：全部 `.tsx` 组件与页面
> 框架：排版 / 色彩 / 动效 / 空间构成 / 视觉细节
> 基于 `frontend-design-review.md` 与 Trae 补充审核合并

---

## 一、上次审核修复进度

| # | 问题 | 状态 |
|---|------|------|
| 1 | FontSize tokens 未使用 | ❌ 未修复 |
| 2 | EmptyState 图标硬编码 | ❌ 未修复 |
| 3 | CategoryChip 白字对比度不可控 | ❌ 未修复 |
| 4 | EmptyState 图标 textTertiary 太淡 | ❌ 未修复 |
| 5 | Sheet 开关动画时长不对称 | ❌ 未修复（且有竞态 bug，见 §3.7） |
| 6 | 卡片按下仅 opacity 无 scale | ❌ 未修复 |
| 7 | 收藏星标无切换动画 | ❌ 未修复 |
| 8 | Spacing.md=14 破坏 4px 体系 | ❌ 未修复 |
| 9 | CategoryGrid 圆角 22px 不在 token | ❌ 未修复 |
| 10 | Loading 白屏无 spinner | ❌ 未修复 |
| 11 | ShelfCard/PromptCard 阴影不一致 | ❌ 未修复 |
| 12 | FAB 定位未引用 spacing token | ❌ 未修复 |
| 13 | NewPromptSheet 分类按钮可见度低 | ❌ 未修复 |

**13 项全部未修复。** 上次审核以来的唯一变更是 `issues.md` 中持久化静默失败 + Switch 防抖这两个逻辑问题（非视觉设计问题）。

---

## 二、排版

> **评分：6/10**

### ✅ 做得好的

- San Francisco 字重体系（400/500/600）贯彻一致，无非法 fontWeight
- 微负 letterSpacing 遵循 iOS 26 设计语言
- 正文/标签/标题分层清晰

### ❌ 需要改进

#### 2.1 FontSize tokens 形同虚设

`theme.ts` 定义了 `FontSize`（caption 13 → largeTitle 34），但实际代码中 fontSize 全部是手写数字。这意味着改字号需要在 10+ 个组件里逐个查找替换，token 形同虚设。

**影响：** 中等。目前字号一致（17/15/13/20），靠的是约定而非约束。

#### 2.2 EmptyState 图标硬编码

无论什么场景（搜索无结果 / 库为空 / 分类为空），EmptyState 的图标永远是 `documents-outline`。不同空状态应该传达不同语义——搜索无结果用放大镜，库为空用文件夹。

#### 2.3 字号层级跨度不均匀

Section header 20px/600，card title 17px/600，Settings section header 13px/500。这个层级本身没问题，但跨度不均匀：20→17→13 不是等比例缩小。

---

## 三、色彩

> **评分：7/10**

### ✅ 做得好的

- 三层语义色（text / textSecondary / textTertiary）+ primary / accent 体系清晰
- Light / Dark 双模式实现完整，色彩 token 覆盖所有场景

### ❌ 需要改进

#### 3.1 CategoryChip 选中态白字 + 用户定义色底 = 不可控对比度

`CategoryChip.tsx:32` 选中态文字固定白色 `#FFFFFF`，背景用 `category.color + "E6"`。用户可自定义分类颜色，如果选了黄色（`#FFD60A`），白字几乎不可读。5 个默认分类里就有 `accent: "#FF9F0A"`（橙色），白字在上面对比度偏弱。

**建议：** 根据背景色明度自动选黑/白字，或者选中态改用深色文字 `rgba(0,0,0,0.88)`。

#### 3.2 EmptyState 图标色用了 textTertiary

`textTertiary` 在 light 模式下是 `rgba(0,0,0,0.30)`，56px 大图标用这么低的透明度显得发虚无力。大尺寸装饰元素应该比文字更重或至少同重。

#### 3.3 🆕 `CategoryColors` 与 `DEFAULT_CATEGORIES` 颜色完全不一致（死代码）

`theme.ts:L28-L34` 定义了 `CategoryColors`：

| 分类 | theme.ts | defaults.ts |
|------|----------|-------------|
| 编程 | `#5E5CE6` | `#6366F1` |
| 写作 | `#34C759` | `#10B981` |
| 设计 | `#FF375F` | `#EC4899` |
| 数据 | `#007AFF` | `#3B82F6` |
| 通用 | `#8E8E93` | `#78716C` |

**没有任何组件引用 `CategoryColors`**。它完全是死代码，而实际渲染用的是 `defaults.ts` 中的颜色。两套颜色值完全不同，如果有人以后"修复"引用指向 `CategoryColors`，整个 App 的分类色会瞬间变化。

**建议：** 删除 `CategoryColors`，或者将其与 `DEFAULT_CATEGORIES` 统一为单一数据源。

---

## 四、动效

> **评分：3/10**

### ✅ 做得好的

- NewPromptSheet 有滑入/淡入动画
- Haptics 反馈在收藏和删除时触发

### ❌ 需要改进

#### 4.1 唯一的动效不对称，关闭比打开快

`NewPromptSheet.tsx`：
- 打开：scrim 200ms + panel 300ms（parallel）
- 关闭：scrim 150ms + panel 200ms（parallel）

关闭动画缩短了 50% 时长。iOS HIG 的建议是关闭可以略快，但 33%-50% 的缩短幅度偏大，导致 sheet dismiss 显得"弹回"而非"滑走"。

#### 4.2 🆕 NewPromptSheet 关闭动画竞态 bug（功能缺陷）

`NewPromptSheet.tsx:L126`：
```tsx
if (!visible) return null;
```

Modal 在不可见时完全卸载。关闭动画（scrim fade out + panel slide down）实际上不会完整执行——`handleClose` 中的 `Animated.parallel(...).start(() => onClose())` 在 `onClose` 将 `visible` 设为 false 后，组件已经 return null 了。

**当前行为：** 点击取消 → 动画播放 → onClose → visible=false → return null（动画被截断）
**实际效果：** 取决于动画是否能在组件卸载前完成，是一个竞态条件。也就是说 §4.1 的关闭动画参数实际从未生效。

#### 4.3 卡片按下只有透明度变化

所有 `TouchableOpacity` 的反馈是 `activeOpacity`（0.6 或 0.85）。没有 scale 微缩、没有颜色加深。在 iOS 26 设计语言下，这种反馈过于基础——用户按下卡片时几乎感知不到触觉确认（虽然有 haptic 辅助，但那是在抬手后触发）。

#### 4.4 收藏星标切换无动画

`handleToggleFavorite` 触发 haptic + 状态切换，但星标图标瞬间变，没有填充动画或轻微的 scale bounce。这是高频交互点，值得 200ms 的 `transform: scale` 弹跳。

#### 4.5 Loading 是白屏

`HomeScreen.tsx:136` 和 `BrowseScreen.tsx:94`：
```tsx
if (state.isLoading) return null;
```

首次启动时用户看到的是纯背景色空白页面，直到 AsyncStorage 读取完成。这是一个明确的体验缺陷。最轻量的修复是展示一个居中的 `ActivityIndicator` 或至少一个骨架占位。

---

## 五、空间构成

> **评分：6/10**

### ✅ 做得好的

- Spacing token 体系存在且大部分被遵守
- 圆角 token 体系基本完整（sm/md/lg/xl/full）

### ❌ 需要改进

#### 5.1 Spacing.md = 14，不整除 4

`theme.ts` 声称 4px 倍数体系，但 `md: 14` 是唯一例外。所有用到 md 的地方其实用 12 或 16 都不影响布局。这是一个信号：要么把体系改为真正的 4px grid，要么别声称是 4px 倍数。

#### 5.2 CategoryGrid 圆角 22px 不在 token 体系里

`CategoryGrid.tsx:28` 卡片的 `rounded-[22px]` 不在 `Radius` 常量中（sm=10, md=16, lg=24）。应该用 lg=24 或降到 md=16。

#### 5.3 搜索模式下分类 chip 无"全部"按钮（Browse 分支原因）

`HomeScreen.tsx` 在 `isSearching` 时显示 CategoryChip 横滚条，最前面有一个手写的"全部"按钮（`TouchableOpacity` + `Text`），而 BrowseScreen 没有。这意味着同样的搜索模式在不同入口有不同的 chip 行为。如果 BrowseScreen 被保留，两者应该一致。

#### 5.4 🆕 NewPromptSheet 圆角裸值

`NewPromptSheet.tsx:L148` 使用 `rounded-t-[28px]`，而 Radius token 中 `xl=28`。应该用 `Radius.xl` 替代。

#### 5.5 🆕 HomeScreen ListHeaderComponent 缺 key

`HomeScreen.tsx:L154-L174` "全部"按钮作为 `ListHeaderComponent` 渲染，但没有 `key` prop。在 FlatList 重渲染时可能导致 React 将"全部"按钮误识别为数据项。

---

## 六、视觉细节

> **评分：6/10**

### ✅ 做得好的

- 毛玻璃卡片风格贯彻（rgba 半透明 + 0.5px 细边框）
- Shadow 分 light/dark 三档体系
- FAB 阴影随主题切换

### ❌ 需要改进

#### 6.1 ShelfCard 扁平，PromptCard 有阴影

同一页面内两种卡片的外观语言不一致。ShelfCard 是纯扁平 + 0.5px 边框，PromptCard 在此基础上多了 `Shadow.md`。用户在 Shelf 模式和搜索模式之间切换时，卡片"重量"会突然改变。这是上一轮 issues 讨论过的问题，从设计一致性角度确实应该统一。

#### 6.2 FAB 没有 spacing 常量引用

`FAB.tsx:18`：
```tsx
className="absolute bottom-8 right-6 w-14 h-14 rounded-full"
```

`bottom-8=32` 对应 `Spacing.xxl=40` 不对齐，`right-6=24` 也不在任何 Spacing token 里。FAB 是页面上最显眼的操作入口，它的定位应该纳入 spacing 体系。

#### 6.3 NewPromptSheet 选中/未选中分类按钮区分度不足

`NewPromptSheet.tsx:253-257` 未选中态 `color+"10"` 背景 + `color+"30"` 边框（均带透明度），在 light 模式下与白色 sheet 背景的区分极弱，几乎看不出有按钮存在。选中/未选中的对比靠的是背景色从 10% 跳到 90% 不透明度——跳跃过大，缺少中间态。

#### 6.4 Save error banner 使用硬编码颜色

`HomeScreen.tsx:L322-L341` 的 save error banner 使用 `"#B45309"` 硬编码，而非语义 token。在 dark 模式下这个颜色可能与背景冲突。

---

## 七、代码与架构问题

### 7.1 🆕 `BrowseScreen` 和 `CategoriesScreen` 是死页面

`TabNavigator.tsx` 只有 Home + Settings 两个 Tab，但 BrowseScreen 和 CategoriesScreen 仍然存在且被 CategoriesScreen 中的 `navigation.navigate("Browse", ...)` 引用。这些页面不会被渲染，但占用 bundle 体积、测试覆盖率和维护心智。

### 7.2 🆕 `useTheme` 返回值每次渲染都创建新对象

`useTheme.ts:L15-L16`：
```typescript
const colors = isDark ? Colors.dark : Colors.light;
return { isDark, colors };
```

`{ isDark, colors }` 每次渲染都是新引用。所有消费 `useTheme()` 的组件（几乎全部组件）在 Context 值变化时都会重渲染，即使它们只用到了 `colors` 而 `isDark` 没变。应该用 `useMemo` 包裹返回值。

### 7.3 🆕 `generateId` 函数重复定义

`HomeScreen.tsx:L17-L19` 和 `BrowseScreen.tsx:L15-L17` 有完全相同的 `generateId` 函数。应抽取为共享工具函数。

### 7.4 🆕 无 StatusBar 主题管理

App 不支持根据 dark/light 模式切换 StatusBar 样式。在 dark 模式下 StatusBar 文字可能不可见。

### 7.5 🆕 DarkModeRow 无障碍提示缺失

`SettingsScreen.tsx:L36` 整个 row 被 disabled 了（因为 Switch 自己处理交互），但 `TouchableOpacity` 没有 `accessibilityLabel`，VoiceOver 用户无法理解这个区域的用途。

---

## 八、建议修复优先级

| 优先级 | 问题 | 类型 | 工作量 |
|--------|------|------|--------|
| 🔴 P0 | Loading 白屏 → 加 ActivityIndicator | 体验缺陷 | 5 行 |
| 🔴 P0 | CategoryColors 死代码 → 删除或统一 | 数据一致性 | 3 行 |
| 🔴 P0 | NewPromptSheet 关闭动画竞态 → 改为 visible 控制动画而非卸载 | 功能缺陷 | 中等 |
| 🟡 P1 | CategoryChip 对比度 → 自动选黑/白字 | 无障碍 | 10 行 |
| 🟡 P1 | FontSize token 实际使用 | 一致性 | 全局替换 |
| 🟡 P1 | Spacing.md=14 → 改为 12 或 16 | 一致性 | 全局替换 |
| 🟡 P1 | 收藏星标切换动画 | 微交互 | 20 行 |
| 🟡 P1 | 卡片按下 scale 反馈 | 微交互 | 15 行 |
| 🟡 P1 | StatusBar 主题适配 | 体验 | 5 行 |
| 🟡 P1 | useTheme 返回值 memo 化 | 性能 | 1 行 |
| 🟡 P1 | ShelfCard/PromptCard 阴影统一 | 视觉一致性 | 5 行 |
| 🟡 P1 | EmptyState 图标色改用 textSecondary | 视觉 | 1 行 |
| 🟢 P2 | 死页面清理（BrowseScreen/CategoriesScreen） | 代码整洁 | 删文件 |
| 🟢 P2 | 圆角裸值替换为 Radius token（3 处） | 一致性 | 3 处 |
| 🟢 P2 | generateId 抽取为共享工具函数 | 代码整洁 | 新建 1 文件 |
| 🟢 P2 | EmptyState 图标按场景区分 | 细节 | 10 行 |
| 🟢 P2 | 关闭动画时长统一（200ms/300ms → 250ms/250ms） | 动效 | 2 行 |
| 🟢 P2 | DarkModeRow 无障碍 label | 无障碍 | 1 行 |
| 🟢 P2 | FAB 定位引用 spacing token | 一致性 | 2 行 |
| 🟢 P2 | NewPromptSheet 分类按钮中间态 | 视觉 | 5 行 |

---

## 九、总体评价

这是一个**功能完整、代码整洁**的个人工具 App。iOS 26 设计语言的方向选得很好——毛玻璃卡片、微负 letterSpacing、0.5px 细边框、SF 字重体系都执行到位。色彩 token 体系设计合理，Light/Dark 双模式覆盖完整。

但上次审核的 **13 项问题全部未修复**，加上 Trae 补充审核新发现的 **10 个问题**（含 1 个功能级缺陷），说明前端设计质量在两次审核之间没有提升。

五维度得分：**排版 6 / 色彩 7 / 动效 3 / 空间 6 / 视觉 6**，加权平均约 **5.6/10**。最薄弱的是动效（Loading 白屏 + 卡片无微交互 + 收藏无动画 + Sheet 竞态 bug），这是提升体验感知最快、性价比最高的方向。

最关键的三个修复（Loading spinner、CategoryChip 对比度、动画竞态）合计不超过 40 行代码，但能显著提升体验下限。建议优先处理 P0/P1 项。
