# 测试体系建设 — 调研发现

**日期：** 2026-05-27

---

## 现有基础设施

| 发现 | 详情 |
|------|------|
| Jest 配置 | `jest.config.js` 已就绪，preset=jest-expo，coverageThreshold: global {branches:80, functions:80, lines:85, statements:85} |
| jest.setup.js | mock 了 react-native-reanimated、useColorScheme、suppress ReactDOM.render warning |
| 测试目录 | 用户已有 `__tests__/logic/` (4 文件) 和 `__tests__/components/` (6 文件) |
| AsyncStorage mock | `jest-expo` 内置 `@react-native-async-storage/async-storage/jest/async-storage-mock`，提供 `__reset()` 方法 |
| test scripts | `package.json` 已有 `test`、`test:coverage`、`test:watch` 三个脚本 |

## 关键源码状态

### appReducer
- 10 种 action，default 分支返回原 state
- `SET_INITIAL_DATA` payload 包含 `themeMode`

### storage.ts
- `saveData`：try/catch 包裹，失败 throw `"SAVE_FAILED"`
- `loadData`：safeParse 独立保护每个 key，isValidThemeMode 类型守卫
- `saveThemeMode`：静默吞异常

### theme.ts
- Colors: light/dark 各 10 个 token，新增 `textTertiary` 和 `cardSolid`
- Shadow: light/dark 各 3 档 (sm/md/lg)，每档 6 个属性
- FontSize: 7 级 (caption → largeTitle)

### useTheme mock 模式
- 组件测试中直接 `jest.mock("../../src/hooks/useTheme")` 注入固定 colors 对象

### 防抖测试
- AppProvider 使用 `jest.useFakeTimers()` + `jest.advanceTimersByTime()` 验证 300ms 防抖

## 注意事项

- `trae/__tests__/` 中的测试引用 `src/` 路径与 `__tests__/` 相同
- jest 默认 testMatch 会同时发现 `__tests__/` 和 `trae/__tests__/`
- 组件测试需 mock `useTheme` hook（否则依赖 AppContext）
- `jest-expo` 的 preset 自动配置了 transformIgnorePatterns 和 AsyncStorage mock
