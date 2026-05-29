# Prompt Library — issues.md 修复实施计划

> **来源:** `docs/issues.md` (3 项待改进)
> **范围:** #1 已完成 (Settings 入口冗余已修复)，本轮修复 #2 持久化静默失败 + #3 Switch 防抖简化
> **约束:** 不动核心架构，只做精准修复

---

## 阶段概览

| # | Phase | 内容 | 文件 | 状态 |
|---|-------|------|------|------|
| 1 | 持久化失败提示 | AppContext 添加 saveStatus + 轻提示 | 2 | pending |
| 2 | Switch 防抖简化 | DarkModeRow 移除 setTimeout | 1 | pending |
| 3 | 类型检查 | tsc --noEmit 零错误 | — | pending |

---

## Phase 1: 持久化静默失败

**文件:** `src/store/AppContext.tsx`

### 问题
`AppContext.tsx:121` 的 `saveData(...).catch(() => {})` 在 AsyncStorage 写入失败时完全静默。用户编辑后关掉 App 再打开可能发现数据丢失，没有任何提示。

### 修复方案
1. `AppState` 新增 `saveError: string | null` 字段
2. `.catch` 中 dispatch `SAVE_ERROR` action，写入错误信息
3. 后续保存成功时 dispatch `SAVE_SUCCESS` action，清除错误
4. 在 `HomeScreen` 底部用轻量级 banner 展示错误（不阻塞操作）

### 新增类型
```typescript
type AppAction =
  | ...
  | { type: "SAVE_ERROR"; error: string }
  | { type: "SAVE_SUCCESS" }
```

---

## Phase 2: Switch 防抖简化

**文件:** `src/screens/SettingsScreen.tsx` (DarkModeRow)

### 问题
`DarkModeRow` 中 `handleValueChange` 对 Switch 的 `onValueChange` 加了 100ms setTimeout 防抖。ThemeMode 切换只需 dispatch 一个 action，没有 I/O 开销，防抖只会让开关响应变迟钝。

### 修复方案
1. 移除 `localValue` state、`timerRef`、`useEffect` 同步逻辑
2. `handleValueChange` 中直接 dispatch
3. Switch 的 `value` 直接用 `isDark` prop
4. 保留 `React.memo` 包裹

### 变更对比
```diff
- const [localValue, setLocalValue] = useState(isDark);
- const timerRef = useRef<...>(null);
- useEffect(() => { setLocalValue(isDark); }, [isDark]);
- const handleValueChange = (value) => {
-   setLocalValue(value);
-   clearTimeout(timerRef.current);
-   timerRef.current = setTimeout(() => onThemeChange(value ? "dark" : "light"), 100);
- };
+ const handleValueChange = (value: boolean) => {
+   onThemeChange(value ? "dark" : "light");
+ };
- <Switch value={localValue} ... />
+ <Switch value={isDark} ... />
```

---

## Phase 3: 类型检查

```bash
npx tsc --noEmit
```

---

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/store/AppContext.tsx` | 修改 | 新增 SAVE_ERROR/SAVE_SUCCESS action + saveError state |
| `src/screens/SettingsScreen.tsx` | 修改 | DarkModeRow 移除防抖逻辑 |
| `src/types/index.ts` | 修改 | 新增 SAVE_ERROR/SAVE_SUCCESS action 类型 |

## 不涉及的修复

| 项 | 原因 |
|---|---|
| Settings 入口冗余 (#1) | 上轮已删除 headerRight 设置齿轮 |
