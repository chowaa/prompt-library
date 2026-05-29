# CLAUDE.md / README.md 审核

> 审核方法：逐条交叉验证两份文档的声称 vs 实际代码/配置文件。

---

## 核心发现：两份文档有相同的根因

CLAUDE.md 和 README.md **描述的都是设计规格中的理想状态，而不是实际代码**。两份文档在许多细节上互相一致（说明它们可能同源或互相抄录），但都与代码现实有偏差。

这个问题的本质是：Shelf 重构的设计文档（plan、spec、progress）描述了一个完整的理想状态，但实现时部分功能落地了，部分没有。文档更新到了"设计完成"的状态，而非"代码实际处于"的状态。

---

## README.md 审核

README 整体结构得体——功能列表、技术栈表、目录树、快速开始、测试命令。问题在于**多个功能描述指向了不存在的代码**。

### 功能列表 — 4 处不实

| README 声称 | 实际代码 | 结论 |
|------------|----------|------|
| "卡片动效 — 按下 scale 微缩" | 所有卡片只有 `activeOpacity`，无 `Animated.spring` scale | ❌ |
| "收藏星标弹跳动画" | `handleToggleFavorite` 只 dispatch + haptics，图标瞬间切换 | ❌ |
| "收藏 — 带 bounce 动画 + Haptics" | Haptics 有，bounce 动效无 | ⚠️ 半真 |
| "数据导入/导出 — JSON 格式" | 确实有，SettingsScreen 中实现 | ✅ |
| "深色模式 — 跟随系统 / 手动切换，React.memo 优化" | DarkModeRow 用了 React.memo | ✅ |

CLAUDE.md 的动效规范里确实写了 scale spring 和 star bounce 的详细参数（speed:50, bounciness:4 等），但这是设计规格，从未在组件中实现。README 把规格当功能写了。

### 技术栈表 — 1 处误导

| 声明 | 实际 | 结论 |
|------|------|------|
| "动效: React Native Animated API" | 只有 NewPromptSheet 用了 Animated，其余组件无动效 | ⚠️ 技术上没错但暗示范围过大 |

### 目录树 — 5 处不实

| 文件 | README 描述 | 实际 |
|------|------------|------|
| `AppContext.tsx` | "全局状态 (useReducer + Context + **saveError**)" | saveError 不存在，`catch(() => {})` 静默吞 | ❌ |
| `useTheme.ts` | "主题 hook (system/light/dark, **useMemo 优化**)" | `isDark` 用了 useMemo，但**返回值对象未 memo** | ⚠️ |
| `EmptyState.tsx` | "空状态 (**支持场景化 icon**)" | 图标硬编码 `documents-outline`，无 icon prop | ❌ |
| `NewPromptSheet.tsx` | "新建/编辑弹层 (**对称开关动画**)" | 开 200+300ms，关 150+200ms，不对称 | ❌ |
| `PromptCard.tsx` | "提示词卡片 (**scale + bounce 动效**)" | 无任何动画，仅 activeOpacity | ❌ |
| `ShelfCard.tsx` | "书架卡片 (**同 PromptCard 动效**)" | 同上，无动画 | ❌ |
| `FAB.tsx` | "悬浮按钮 (**Spacing token 定位**)" | 使用裸值 `bottom-8 right-6`，未引用 Spacing | ❌ |

### 测试 — 1 处问题

README 的"测试"章节列了 `npm test` / `test:coverage` / `test:watch` 命令。Jest 配置确实存在，但**整个 src/ 下无任何测试文件**。README 暗示项目有测试，实际是空壳。

---

## CLAUDE.md 审核

### 技术栈 — 准确 ✅

17 项技术栈声明逐一验证，全部与 `package.json` / `tsconfig.json` / 实际代码一致。

### 构建命令 — 准确 ✅

### 测试命令 — 配置存在但无测试文件 ⚠️

Jest 配置完整（`jest.config.js` + `jest.setup.js`），`package.json` scripts 正确。但 `src/` 下无测试文件，覆盖率阈值 80/80/85/85 形同虚设。`jest.config.js:22` 引用的 `__mocks__/styleMock.js` 不存在。

### 代码规范 — 1 处不实

| 声明 | 实测 | 结论 |
|------|------|------|
| saveError banner | `catch(() => {})` 静默吞，无 saveError 状态 | ❌ |

其余 8 项（strict、Ionicons 断言、useReducer+Context、300ms 防抖、SF 字重、iOS 26 风格、色彩三层、Shadow 分档）均准确。

### 设计 Token — FontSize 不一致 ❌

| | CLAUDE.md | theme.ts |
|--|-----------|----------|
| 级别数 | 10 | 7 |
| footnote | 13 | 14 |
| 缺失 | caption2:11, caption:12, subhead:15, callout:16 | — |

### 组件架构 — 3 处不实

| CLAUDE.md 声称 | 实际 | 结论 |
|----------------|------|------|
| "已删除: BrowseScreen, CategoriesScreen, CategoryGrid" | 三个文件全部存在 | ❌ |
| EmptyState "支持 icon prop" | 图标硬编码 | ❌ |
| `src/utils/id.ts` 共享生成 | 文件存在，但 screen 仍各自定义 | ⚠️ |

### 注意事项 — 准确 ✅

babel/metro/tailwind/tsconfig 配置、StatusBar、Windows CRLF、毛玻璃限制等均与实际一致。

---

## 两份文档对比

| 维度 | CLAUDE.md | README.md |
|------|-----------|-----------|
| 技术栈 | ✅ 准确 | ✅ 准确 |
| 功能描述 | 仅在代码规范/组件架构中零星涉及 | ❌ 多处理想化描述 |
| 组件细节 | ❌ 3 处不实 | ❌ 7 处不实 |
| Token | ❌ FontSize 不一致 | 未涉及 |
| 测试 | ⚠️ 未标注无测试 | ⚠️ 暗示有测试 |
| 目录结构 | 列表形式 | ✅ 树形，但描述不实 |

README 的问题比 CLAUDE.md 更严重——它作为项目的门面，把设计规格中的动效和功能当成了已实现的特性来宣传。

---

## 修正建议

### CLAUDE.md

| # | 位置 | 问题 | 修正 |
|---|------|------|------|
| 1 | 组件架构 | "已删除: BrowseScreen, CategoriesScreen, CategoryGrid" | 改为 "保留但未注册到 Tab（用户选择保留）" |
| 2 | 组件架构 | EmptyState "支持 icon prop" | 改为 "图标硬编码为 documents-outline，无 icon prop" |
| 3 | 代码规范 | saveError 功能描述 | 删除或标注 "未实现" |
| 4 | 设计 Token | FontSize 10 级 + footnote:13 | 与实际 theme.ts 同步为 7 级 + footnote:14 |
| 5 | 测试命令 | 未标注无测试文件 | 补充 "⚠️ 暂无测试文件" |
| 6 | 组件架构 | id.ts 描述不完整 | 补充 "但 screen 中仍有内联副本" |

### README.md

| # | 位置 | 问题 | 修正 |
|---|------|------|------|
| 7 | 功能列表 | "卡片动效 — 按下 scale 微缩 + 收藏星标弹跳动画" | 删除或标注 "计划中" |
| 8 | 功能列表 | "收藏 — 带 bounce 动画" | 改为 "Haptics 反馈" |
| 9 | 目录树 | 6 个组件括号内的描述与代码不符 | 删除概括性括号描述，只保留文件名 |
| 10 | 技术栈 | "动效: React Native Animated API" | 改为 "动效: React Native Animated API（仅弹层使用）" |

---

## 总体评价

两份文档的**技术栈、构建命令、配置说明**可信度很高，属于合格的技术参考。

但**功能描述和组件细节严重美化**——把设计规格（spec/plan 文档）中的动效参数、功能规划写进了 README 和 CLAUDE.md，当成已实现的特性。这导致两份文档描述的是一个"完成度高于实际"的项目。

根因很可能是：Shelf 重构时先写了详细的 spec 和 plan，文档也跟着更新到了目标状态。但实现时动画和部分细节被搁置（可能因为 RN 动画的调试成本），文档没有回退到现实状态。
