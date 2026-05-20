# Prompt Library - 设计规格文档

## 项目概览

一款 iOS 端的 AI 提示词管理工具（React Native + Expo）。用户可以创建、归类、搜索和复用 AI 提示词。通过 Expo Go 在 iPhone 上实时预览，支持热更新。

**产品类型：** 生产力工具  
**目标用户：** AI 重度用户（开发者、内容创作者）  
**整体调性：** 整洁、有序、高效、iOS 原生风格

---

## 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 框架 | React Native + Expo SDK 53+ | Expo Go 扫码预览，无需 Xcode |
| 样式 | NativeWind（RN 版 Tailwind CSS） | className 写样式，迭代极快 |
| 导航 | React Navigation（底部 Tab + Stack） | iOS 原生导航体验 |
| 存储 | AsyncStorage | 键值对本地持久化，零后端 |
| 图标 | @expo/vector-icons（Lucide 图标集） | 统一的描边风格 SVG |
| 触觉 | expo-haptics | 复制/删除时轻震反馈 |
| 文件 | expo-file-system + expo-sharing | JSON 导入导出 |

---

## 数据模型

```
Prompt {
  id: string              // uuid
  title: string           // 标题，如 "代码审查助手"
  content: string         // 提示词正文
  categoryId: string      // 关联分类
  tags: string[]          // 标签，如 ["编程", "审查"]
  isFavorite: boolean     // 是否收藏
  createdAt: number       // 创建时间戳
  updatedAt: number       // 更新时间戳
}

Category {
  id: string
  name: string            // 分类名，如 "编程"、"写作"、"设计"
  icon: string            // Lucide 图标名
  color: string           // 标识色
}
```

**状态管理：** React Context + useReducer。应用启动时从 AsyncStorage 加载数据注入 Context，每次增删改操作同时更新 Context 和 AsyncStorage。

---

## 设计系统

### 风格：柔和极简 + iOS 原生

| Token | 浅色模式 | 深色模式 |
|-------|----------|----------|
| 页面背景 | `#F2F2F7`（iOS 系统色） | `#000000` |
| 卡片背景 | `#FFFFFF` | `#1C1C1E` |
| 主色调 | `#6366F1`（靛蓝） | `#818CF8`（浅靛蓝） |
| 强调色 | `#F59E0B`（琥珀，仅收藏星标） | 同左 |
| 主文字 | 90% 黑 | 90% 白 |
| 辅文字 | 60% 黑 | 60% 白 |
| 分割线 | `#E5E5EA` | `#38383A` |
| 遮罩 | 40% 黑 | 60% 黑 |

### 分类色板（卡片左侧色条 + 筛选 Chip 用）

| 分类 | 颜色 |
|------|------|
| 编程 | `#6366F1` |
| 写作 | `#10B981` |
| 设计 | `#EC4899` |
| 数据 | `#3B82F6` |
| 通用 | `#78716C` |

### 间距（8px 基础网格）
- 页面左右边距：16px
- 卡片间距：12px
- 区块间距：24px
- 卡片内边距：16px
- 最小触摸区域：44×44pt

### 圆角
- 卡片：16px
- 按钮/Chip：12px
- 输入框：12px
- 底部弹出层：20px（顶部两角）

### 字体（SF Pro，iOS 系统字体）
- 大标题：28px，粗体 700
- 标题：22px，半粗 600
- 正文：17px，常规 400
- 辅助文字：13px，常规 400

### 动效
- 卡片入场：弹簧动画，200ms
- 底部弹出：滑入 + 淡入，250ms，可中断
- 复制反馈：150ms 透明度脉冲 + 轻触觉
- 滑动操作：实时跟随手指，松开后弹簧归位

---

## 导航结构

```
底部 Tab Bar（3 个标签 + 浮动新增按钮）
├── 🔍 浏览
│   └── 提示词列表 → 搜索栏、分类筛选条、卡片列表
│       ├── 右滑 → 编辑
│       ├── 左滑 → 复制
│       ├── 点击卡片 → 展开详情
│       └── 下拉 → 刷新
├── 📁 分类
│   └── 分类网格 → 带数量的分类卡片
│       ├── 点击 → 进入该分类下的提示词列表
│       └── 长按 → 编辑模式（排序、重命名、删除）
├── ⚙️ 设置
│   └── 深色模式开关、导出 JSON、导入 JSON、统计
│
└── FAB（+）→ 底部弹出层
    └── 新建提示词表单 → 标题、内容、分类选择、标签、保存
```

---

## 关键组件

| 组件 | 说明 |
|------|------|
| `PromptCard` | 圆角卡片，左侧分类色条，标题 + 内容预览 + 收藏星标，支持滑动操作 |
| `CategoryChip` | 横向滚动分类筛选条，选中时填充对应颜色 |
| `SearchBar` | 带图标的圆角搜索框，滚动时收起 |
| `CategoryGrid` | 双列分类卡片网格，图标 + 数量统计 |
| `NewPromptSheet` | 底部弹出表单，标题/内容输入、分类选择器、保存按钮 |
| `FAB` | 浮动 "+" 按钮，56×56pt 圆形，主色调，位于 Tab Bar 上方 |
| `EmptyState` | 空状态插画 + 引导操作按钮 |

---

## 异常处理

- AsyncStorage 读取失败 → 显示空状态 + "重试"按钮
- AsyncStorage 写入失败 → Toast "保存失败"，保留内存中的数据
- JSON 导入解析错误 → Toast "文件格式无效"
- JSON 导出写入失败 → Toast "导出失败"

---

## 测试策略

- 组件单测：PromptCard、CategoryChip 的各种渲染状态
- 集成测试：完整 CRUD 流程 — 创建 → 列表 → 编辑 → 删除
- 边界情况：空状态、超长文本（5000+ 字）、搜索特殊字符
- 平台验证：Expo Go iOS 真机预览，浅色/深色双模式
- 无障碍：所有触摸区域 ≥44pt，交互元素设置 VoiceOver 标签
