# Prompt Library — 暗色模式 + 无障碍设计规格

> **范围:** 暗黑模式对比度校准 + 无障碍 (accessibility) 审计与修复
> **文档:** 本文为 2026-05-27-prompt-library-ui-upgrade-design.md 的精简聚焦版，保留原版存档

---

## 暗色模式 Token 校准

### 修改对照

```
┌──────────────────┬────────────────────┬────────────────────┬──────────┐
│ Token (dark)     │ 当前值              │ 修改后              │ 理由     │
├──────────────────┼────────────────────┼────────────────────┼──────────┤
│ textSecondary    │ rgba(255,255,255,0.55) │ rgba(255,255,255,0.60) │ 小字号可读性 │
│ separator        │ rgba(255,255,255,0.10) │ rgba(255,255,255,0.13) │ OLED 可见性  │
└──────────────────┴────────────────────┴────────────────────┴──────────┘
```

### 不改动的 Token（已达标）

```
┌──────────────────┬────────────────────┬───────────┐
│ Token (dark)     │ 值                  │ 对比度    │
├──────────────────┼────────────────────┼───────────┤
│ text             │ rgba(255,255,255,0.92) │ 18.5:1 ✅ │
│ textTertiary     │ rgba(255,255,255,0.35) │ 5.8:1 ✅  │
│ primary          │ #8B88FF             │ 6.8:1 ✅  │
│ accent           │ #FFD60A             │ 14.2:1 ✅ │
│ card             │ rgba(28,28,30,0.88) │ — ✅      │
│ scrim            │ rgba(0,0,0,0.55)    │ — ✅      │
└──────────────────┴────────────────────┴───────────┘
```

### 分类色在暗色下的表现

分类 pill 使用 `category.color + "18"` (6% 不透明度底 + 纯色文字)，暗色下 18% 透明度可能偏暗。但分类颜色本身在暗色下有足够的文字对比度 (如 `#34C759` vs `#000000` ≈ 8.5:1)，暂不调整。

---

## 无障碍属性规范

### accessibilityLabel 命名规则

统一使用中文 label，匹配 App 界面语言。格式: `{元素功能}，{附加状态或上下文}`。

### 组件级规范

#### PromptCard

```
收藏星标按钮:
  accessibilityLabel = prompt.isFavorite ? "取消收藏" : "收藏"
  accessibilityRole = "button"

卡片主体:
  accessibilityLabel = "{prompt.title}，{category?.name || '未分类'}"
  accessibilityRole = "button"
```

#### FAB

```
accessibilityLabel = "新建提示词"
accessibilityRole = "button"
```

#### CategoryChip

```
accessibilityLabel = "{category.name}，{count} 个提示词{isSelected ? '，已选中' : ''}"
accessibilityRole = "button"
accessibilityState = { selected: isSelected }
minHeight = 44  (从 34 提升)
```

#### CategoryGrid 分类卡片

```
accessibilityLabel = "{item.name}，{promptCount} 个提示词"
accessibilityRole = "button"
```

#### SearchBar

```
accessibilityLabel = "搜索提示词"
// TextInput 自带 accessibility，仅需在容器层补充语义
```

#### EmptyState CTA 按钮

```
accessibilityLabel = actionLabel  (如 "创建第一个提示词")
accessibilityRole = "button"
```

#### NewPromptSheet

```
取消按钮:
  accessibilityLabel = "取消"
  hitSlop = { top: 8, bottom: 8, left: 12, right: 12 }

保存按钮:
  accessibilityLabel = editingPrompt ? "保存修改" : "保存"
  hitSlop = { top: 8, bottom: 8, left: 12, right: 12 }

删除按钮 (仅编辑态):
  accessibilityLabel = "删除提示词"
  accessibilityRole = "button"
```

#### SettingsScreen

```
Switch:
  accessibilityLabel = "深色模式"

SettingRow (导出/导入):
  accessibilityLabel = label  (如 "导出 JSON")
  accessibilityRole = "button"
```

---

## 触控目标修复

### CategoryChip

```
当前: minHeight: 34  ← 不满足 44pt 标准
修复: minHeight: 44  (保持视觉高度 34 通过 padding 调节，或直接设为 44)
```

方案：将 `py-2` (8px) 改为 `py-2.5` (10px)，使 `fontSize: 13` + `lineHeight ~18` + `paddingVertical: 10×2` ≈ 38，再加上 `minHeight: 44` 作为安全兜底。

### NewPromptSheet 顶栏按钮

取消/保存文字按钮的触控区域仅约 44×30，需加 `hitSlop`:

```
hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
```

---

## 验证清单

### Phase 1: 暗色对比度
- [ ] `textSecondary` 0.55 → 0.60 后，所有使用处视觉确认（卡片预览文字、设置统计 label 等）
- [ ] `separator` 0.10 → 0.13 后，卡片边框、Tab Bar 分割线、设置分组线可见性确认
- [ ] 确认修改未导致 `textSecondary` 与 `text` 层级模糊

### Phase 2: 无障碍
- [ ] iOS VoiceOver 开启后，每个可交互元素能读出正确 label
- [ ] 焦点遍历顺序符合视觉顺序（从上到下、从左到右）
- [ ] CategoryChip 选中/未选中状态通过 `accessibilityState` 正确播报
- [ ] 收藏星标在切换后 label 更新为 "取消收藏" / "收藏"
- [ ] 触控目标 ≥44pt 真机验证（CategoryChip 和 Sheet 顶栏按钮）
- [ ] 系统「更大字体」开启后，无文字截断、无布局错乱
- [ ] 系统「减少动态效果」开启后，无不适感

### Phase 3: 回归
- [ ] `npx tsc --noEmit` 零错误
- [ ] 浅色模式无回归问题（仅改了 dark 下两个 Token）
- [ ] 新建/编辑/删除提示词流程正常
- [ ] 导入/导出功能正常
- [ ] 主题切换持久化正常
