# Prompt Library

AI 提示词管理工具，基于 Expo SDK 54 + React Native，采用 iOS 26 设计语言。

## 功能

- **提示词管理** — 创建、编辑、删除提示词，支持标题、内容、分类、标签
- **书架布局** — 首页聚合展示，收藏 + 分类横向滚动书架
- **搜索筛选** — 标题/内容/标签实时搜索 + 分类 Chip 筛选
- **收藏** — 星标常用提示词，Haptics 震动反馈
- **数据导入/导出** — JSON 格式导入导出，支持跨设备迁移
- **深色模式** — 跟随系统 / 手动切换，React.memo 优化
- **触觉反馈** — 收藏、删除等操作有 Haptics 震动反馈

## 技术栈

| 类别 | 方案 |
|------|------|
| 框架 | Expo SDK 54 + React Native 0.81 |
| 语言 | TypeScript 5.9 (strict) |
| 样式 | NativeWind v4 (Tailwind CSS v3) |
| 导航 | React Navigation 7 (Bottom Tabs: Home + Settings) |
| 持久化 | AsyncStorage (300ms 防抖) |
| 图标 | @expo/vector-icons (Ionicons) |
| 动效 | React Native Animated API（仅弹层使用） |
| 测试 | Jest + @testing-library/react-native ⚠️ 暂无测试文件 |
| Web | react-native-web (实验性支持) |

## 项目结构

```
prompt-library/
├── App.tsx                        # 入口 (StatusBar + NavigationContainer)
├── src/
│   ├── global.css                 # NativeWind 全局样式
│   ├── types/index.ts             # 类型 (Prompt, Category, ThemeMode, AppAction)
│   ├── constants/
│   │   ├── defaults.ts            # 默认分类数据
│   │   └── theme.ts               # 设计 Token (Colors, FontSize, Radius, Shadow, Spacing)
│   ├── hooks/
│   │   └── useTheme.ts            # 主题 hook (system/light/dark)
│   ├── store/
│   │   ├── AppContext.tsx          # 全局状态 (useReducer + Context)
│   │   └── storage.ts             # AsyncStorage 读写 + 防抖持久化
│   ├── utils/
│   │   └── id.ts                  # 共享 ID 生成
│   ├── navigation/
│   │   └── TabNavigator.tsx       # 底部双 Tab (Home + Settings)
│   ├── screens/
│   │   ├── HomeScreen.tsx         # 首页 (三态: Shelf / Search / Empty)
│   │   ├── SettingsScreen.tsx     # 设置 (外观 / 数据 / 统计)
│   │   ├── BrowseScreen.tsx       # 旧浏览页 (保留但未注册到 Tab)
│   │   └── CategoriesScreen.tsx   # 旧分类页 (保留但未注册到 Tab)
│   └── components/
│       ├── PromptCard.tsx         # 搜索列表卡片
│       ├── ShelfCard.tsx          # 书架卡片
│       ├── SearchBar.tsx          # 搜索框
│       ├── CategoryChip.tsx       # 分类筛选胶囊
│       ├── CategoryGrid.tsx       # 旧分类网格 (保留但未使用)
│       ├── EmptyState.tsx         # 空状态
│       ├── NewPromptSheet.tsx     # 新建/编辑弹层
│       └── FAB.tsx                # 悬浮按钮
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# iOS 模拟器
npx expo start --ios

# Android 模拟器
npx expo start --android

# Web (实验性)
npx expo start --web
```

## 测试

```bash
# 运行测试
npm test

# 覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 类型检查

```bash
npx tsc --noEmit
```
