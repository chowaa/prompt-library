# Prompt Library

AI 提示词管理工具，基于 Expo SDK 54 + React Native，采用 iOS 26 设计语言。

## 功能

- **提示词管理** — 创建、编辑、删除提示词，支持标题、内容、分类、标签
- **分类浏览** — 按分类筛选，网格视图快速定位
- **搜索** — 标题/内容实时搜索
- **收藏** — 星标常用提示词，一键切换
- **数据导入/导出** — JSON 格式导入导出，支持跨设备迁移
- **深色模式** — 跟随系统 / 手动切换 / 持久化记住偏好
- **触觉反馈** — 收藏、删除等操作有 Haptics 震动反馈

## 技术栈

| 类别 | 方案 |
|------|------|
| 框架 | Expo SDK 54 + React Native 0.81 |
| 语言 | TypeScript 5.9 |
| 样式 | NativeWind v4 (Tailwind CSS) |
| 导航 | React Navigation 7 (Bottom Tabs) |
| 持久化 | AsyncStorage |
| 图标 | @expo/vector-icons (Ionicons) |
| 动效 | react-native-reanimated 4 |

## 项目结构

```
prompt-library/
├── App.tsx                        # 入口
├── src/
│   ├── global.css                 # NativeWind 全局样式
│   ├── types/index.ts             # 类型定义 (Prompt, Category, ThemeMode, AppAction)
│   ├── constants/
│   │   ├── defaults.ts            # 默认分类数据
│   │   └── theme.ts               # 设计 Token (Colors, Radius, Shadow, Spacing)
│   ├── hooks/
│   │   └── useTheme.ts            # 主题 hook (支持 system/light/dark)
│   ├── store/
│   │   ├── AppContext.tsx          # 全局状态 (useReducer + Context)
│   │   └── storage.ts             # AsyncStorage 读写 + 防抖持久化
│   ├── navigation/
│   │   └── TabNavigator.tsx       # 底部三 Tab 导航
│   ├── screens/
│   │   ├── BrowseScreen.tsx       # 浏览页 (提示词列表 + 搜索 + 筛选)
│   │   ├── CategoriesScreen.tsx   # 分类页 (网格视图)
│   │   └── SettingsScreen.tsx     # 设置页 (主题 / 导入导出 / 统计)
│   └── components/
│       ├── PromptCard.tsx         # 提示词卡片
│       ├── SearchBar.tsx          # 搜索框
│       ├── CategoryChip.tsx       # 分类筛选胶囊
│       ├── CategoryGrid.tsx       # 分类网格卡片
│       ├── NewPromptSheet.tsx     # 新建/编辑弹层
│       ├── FAB.tsx                # 悬浮新建按钮
│       └── EmptyState.tsx         # 空状态视图
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 在 iOS 模拟器运行
npx expo start --ios

# 在 Android 模拟器运行
npx expo start --android
```

## 类型检查

```bash
npx tsc --noEmit
```
