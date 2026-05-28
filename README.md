# Prompt Library

AI 提示词管理工具，基于 Expo SDK 54 + React Native，采用 iOS 26 设计语言。

## 功能

- **提示词管理** — 创建、编辑、删除提示词，支持标题、内容、分类、标签
- **书架布局** — 首页聚合展示，分类横向滚动 + 提示词卡片网格
- **分类浏览** — 按分类筛选，支持全部/收藏/自定义分类切换
- **搜索** — 标题/内容实时搜索
- **收藏** — 星标常用提示词，一键切换
- **数据导入/导出** — JSON 格式导入导出，支持跨设备迁移
- **深色模式** — 跟随系统 / 手动切换，100ms 防抖避免闪烁
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
| 测试 | Jest + @testing-library/react-native |
| Web | react-native-web (实验性支持) |

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
│   │   └── TabNavigator.tsx       # 底部双 Tab 导航 (首页 + 设置)
│   ├── screens/
│   │   ├── HomeScreen.tsx         # 首页 (书架布局: 分类横滚 + 卡片网格)
│   │   └── SettingsScreen.tsx     # 设置页 (主题 / 导入导出 / 统计)
│   └── components/
│       ├── PromptCard.tsx         # 提示词卡片
│       ├── ShelfCard.tsx          # 书架分类卡片
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
