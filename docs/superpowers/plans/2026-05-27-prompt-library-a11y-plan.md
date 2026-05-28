# Prompt Library — 暗色模式 + 无障碍审计实施计划

> **范围:** 暗黑模式对比度校准 + ui-ux-pro-max 无障碍触控审计
> **不涉及:** 卡片透明度体系、分类色板重排、Reanimated 动效、背景纹理
> **上一轮:** 2026-05-26-ios26-design-refactor（iOS 26 设计重构已完成）
> **文档:** 本文为 2026-05-27-prompt-library-ui-upgrade-plan.md 的精简聚焦版，保留原版存档

---

## 背景

上一轮 (2026-05-26) 已完成 iOS 26 设计语言全量重构——毛玻璃卡片、SF 排版体系、Shadow 三档体系、三级文字色阶。本轮仅做**生产环境必需**的质量加固：暗色模式下对比度是否达标、触控目标是否合规、VoiceOver 是否能正常朗读。

---

## 阶段概览

| # | Phase | 内容 | 文件数 | 状态 |
|---|-------|------|--------|------|
| 1 | 暗色对比度校准 | textSecondary / separator / scrim 调整 | 1 | pending |
| 2 | 无障碍审计 | accessibilityLabel / accessibilityRole / 对比度实测 | 8 | pending |
| 3 | 验收 | 对照 ui-ux-pro-max checklist 逐项打勾 | — | pending |

---

## Phase 1: 暗黑模式对比度校准

### 问题诊断

当前 `theme.ts` 暗色模式 Token 与 WCAG AA 标准对照：

| Token | 当前值 | 对应背景 | 实际对比度 | AA 要求 | 是否达标 |
|-------|--------|---------|-----------|---------|---------|
| `text` | `rgba(255,255,255,0.92)` | `#000000` | ≈18.5:1 | 4.5:1 | ✅ |
| `textSecondary` | `rgba(255,255,255,0.55)` | `#000000` | ≈10.1:1 | 3:1 (大文本) / 4.5:1 (正文) | ✅ 对大文本 / ⚠️ 对小正文 |
| `textTertiary` | `rgba(255,255,255,0.35)` | `#000000` | ≈5.8:1 | 3:1 | ✅ |
| `separator` | `rgba(255,255,255,0.10)` | `#000000` | ≈1.5:1 | 无硬性要求 | ⚠️ 可能太淡不可见 |
| `scrim` | `rgba(0,0,0,0.55)` | 内容层 | — | 40-60% | ✅ |
| `primary` | `#8B88FF` | `#000000` | ≈6.8:1 | 3:1 (大文本) | ✅ |
| `accent` | `#FFD60A` | `#000000` | ≈14.2:1 | 3:1 | ✅ |

> 结论：主要问题不在文字对比度，而在 `separator` 可见性和 `textSecondary` 在小字号 (12-13px) 场景下的可读性。

### 1.1 修改内容

**文件:** `src/constants/theme.ts`

```diff
dark: {
-  textSecondary: "rgba(255,255,255,0.55)",
+  textSecondary: "rgba(255,255,255,0.60)",

-  separator: "rgba(255,255,255,0.10)",
+  separator: "rgba(255,255,255,0.13)",
}
```

| Token | 当前 | 修改后 | 理由 |
|-------|------|--------|------|
| `textSecondary` | 0.55 | 0.60 | 12-14px 小字号场景下提升可读性，仍保持与 text 的明显层级差 |
| `separator` | 0.10 | 0.13 | 0.10 在 OLED 黑底上几乎不可见，0.13 刚好能感知 |

**不改动:**
- `text`: 0.92 已远超 AA 标准
- `textTertiary`: 0.35 作为让步文字/图标，5.8:1 足够
- `primary`/`accent`: 均已达标
- `card`/`cardSolid`/`scrim`: 均在合理范围

---

## Phase 2: 无障碍审计

对照 `ui-ux-pro-max` Priority 1 (Accessibility) + Priority 2 (Touch & Interaction) 规则。

### 2.1 触控目标审计

| 组件 | 元素 | 尺寸 | ≥44pt? | 状态 |
|------|------|------|--------|------|
| `PromptCard` | 收藏星标按钮 | 44×44 + hitSlop=12 | ✅ | 已合规 |
| `PromptCard` | 卡片主体 | flex 自适应, ≥44 高 | ✅ | 已合规 |
| `FAB` | "+" 按钮 | 56×56 | ✅ | 已合规 |
| `CategoryChip` | 胶囊按钮 | 高 34 | ❌ | **需修复** |
| `NewPromptSheet` | 取消/保存文字按钮 | 文字区域 ~44×30 | ⚠️ | 需加 hitSlop |
| `SettingsScreen` | Switch 开关 | 系统默认 51×31 | ✅ | 系统保证 |
| `SettingsScreen` | SettingRow 行 | 高 ≥44 (py-3 = 12×2 + 20 icon ≈ 44) | ⚠️ | 临界值 |
| `CategoryGrid` | 分类卡片 | flex 自适应 | ✅ | 已合规 |

### 2.2 VoiceOver / Screen Reader 审计

| 组件 | 元素 | 当前 accessibilityLabel | 问题 |
|------|------|------------------------|------|
| `PromptCard` | 收藏星标 | ❌ 无 | 读不出 "收藏" 还是 "取消收藏" |
| `PromptCard` | 卡片主体 | ❌ 无 | 读不出标题和分类 |
| `FAB` | "+" 按钮 | ❌ 无 | 读不出 "新建提示词" |
| `CategoryChip` | 胶囊 | ❌ 无 | 读不出分类名和数量 |
| `CategoryGrid` | 分类卡片 | ❌ 无 | 读不出分类名和数量 |
| `SearchBar` | 搜索框 | ❌ 无 | 读不出 "搜索提示词" |
| `EmptyState` | CTA 按钮 | ❌ 无 | 读不出按钮用途 |
| `NewPromptSheet` | 关闭按钮 | ❌ 无 | 读不出 "关闭" |
| `NewPromptSheet` | 删除按钮 | ❌ 无 | 读不出删除确认 |
| `SettingsScreen` | Switch | ❌ 无 | 读不出 "深色模式" |

### 2.3 accessibilityRole 审计

| 组件 | 元素 | 当前 | 应设为 |
|------|------|------|--------|
| `PromptCard` | 卡片 | `TouchableOpacity` | `accessibilityRole="button"` |
| `FAB` | "+" | `TouchableOpacity` | `accessibilityRole="button"` |
| `CategoryChip` | 胶囊 | `TouchableOpacity` | `accessibilityRole="button"` + `accessibilityState={{ selected }}` |
| `SettingsScreen` | Switch | `Switch` | 已自带 role |

### 2.4 颜色非唯一信息载体审计

| 场景 | 当前 | 问题 | 修复 |
|------|------|------|------|
| 收藏状态 | 星标图标 `star` vs `star-outline` | ✅ 图标形态差异 + 颜色差异 | 无需修复 |
| 分类选中 | 背景色 + 白色文字 vs 浅色底 + 原色文字 | ✅ 形态差异足够 | 无需修复 |
| 错误状态 | Alert.alert 文字 | ✅ 系统原生对话框 | 无需修复 |
| 深色模式 Switch | on/off 位置 | ✅ 系统控件自带语义 | 无需修复 |

### 2.5 动态字体支持

当前所有 `fontSize` 使用绝对值 (13/14/17/20...)，未使用 `accessibilityScale`。需要验证在系统「更大字体」辅助功能开启后：
- 卡片内文字是否截断
- 按钮文字是否溢出
- Tab Bar 标签是否重叠

此项为**验证性任务**，不涉及代码修改，仅真机测试。

---

## Phase 3: 验收

对照 `ui-ux-pro-max` pre-delivery checklist (App UI 精简版):

### 视觉质量
- [ ] 无 emoji 作为图标 ✅ (已使用 Ionicons)
- [ ] 图标风格统一 ✅ (Ionicons)
- [ ] 语义 Token 全局一致 ✅ (theme.ts Colors)

### 交互
- [ ] 所有可点击元素有按压反馈 ✅ (activeOpacity / haptic)
- [ ] 触控目标 ≥44pt ⚠️ (CategoryChip 需修复)
- [ ] 禁用态清晰 ✅ (disabled + activeOpacity)

### 明暗模式
- [ ] 主文字对比度 ≥4.5:1 ✅ (Phase 1 验证)
- [ ] 辅助文字对比度 ≥3:1 ⚠️ (Phase 1 修复)
- [ ] 分割线双模式可见 ⚠️ (Phase 1 修复)
- [ ] Modal scrim 40-60% ✅

### 布局
- [ ] 安全区域正确 ✅ (已使用系统 SafeArea)
- [ ] 滚动内容不被固定栏遮挡 ✅ (paddingBottom: 120)
- [ ] 4/8dp 间距体系 ✅

### 无障碍
- [ ] 图标/按钮有 accessibilityLabel ❌ (Phase 2 补充)
- [ ] 表单有标签/提示/错误 ✅ (placeholder + Alert)
- [ ] 颜色非唯一信息载体 ✅
- [ ] 动态字体不截断 ⚠️ (Phase 2 验证)

---

## 文件变更清单

| 文件 | 类型 | 内容 |
|------|------|------|
| `src/constants/theme.ts` | 修改 | 暗色 `textSecondary` 0.55→0.60, `separator` 0.10→0.13 |
| `src/components/PromptCard.tsx` | 修改 | 添加 `accessibilityLabel`, `accessibilityRole` |
| `src/components/CategoryChip.tsx` | 修改 | `minHeight: 44`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState` |
| `src/components/CategoryGrid.tsx` | 修改 | 分类卡片 `accessibilityLabel` |
| `src/components/SearchBar.tsx` | 修改 | `accessibilityLabel` |
| `src/components/FAB.tsx` | 修改 | `accessibilityLabel`, `accessibilityRole` |
| `src/components/EmptyState.tsx` | 修改 | CTA 按钮 `accessibilityLabel`, `accessibilityRole` |
| `src/components/NewPromptSheet.tsx` | 修改 | 关闭/保存/删除按钮 `accessibilityLabel`, 取消/保存 hitSlop |
| `src/screens/SettingsScreen.tsx` | 修改 | Switch `accessibilityLabel`, SettingRow `accessibilityLabel` |

---

## 风险

| 风险 | 缓解 |
|------|------|
| 暗色 separator 0.13 仍不可见 | 真机测试后酌情升至 0.15 |
| accessibilityLabel 需中英文选择 | 使用中文 label，匹配 App 界面语言 |
| CategoryChip 加高到 44 可能影响横向滚动视觉 | 使用 `minHeight` + 保持 `py-2` padding |
