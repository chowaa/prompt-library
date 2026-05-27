# 测试体系建设任务计划

**目标：** 为 Prompt Library 建立完整自动化测试体系，分两阶段推进。

**工作目录：** `./trae/`

**状态：** complete ✅

---

## Phase 1: 纯逻辑模块测试 → 覆盖率 ≥90% ✅

### Task 1.1: appReducer 全部 action + 边界测试 ✅
- [x] 文件：`trae/__tests__/logic/appReducer.test.ts`
- [x] 覆盖 10 种 action：SET_INITIAL_DATA、ADD_PROMPT、UPDATE_PROMPT、DELETE_PROMPT、TOGGLE_FAVORITE、ADD_CATEGORY、UPDATE_CATEGORY、DELETE_CATEGORY、SET_CATEGORIES、SET_THEME_MODE
- [x] 不可变性检查（5 种 action）
- [x] 未知 action default 分支
- [x] 跨 action 场景（add→update→toggle→delete）

### Task 1.2: storage.ts AsyncStorage mock 测试 ✅
- [x] 文件：`trae/__tests__/logic/storage.test.ts`
- [x] saveData 序列化 + 存储验证 + 失败 throw
- [x] loadData 反序列化、null fallback、损坏 JSON fallback
- [x] saveThemeMode 持久化 + 静默异常
- [x] isValidThemeMode 类型守卫测试（通过 loadData 间接测试）
- [x] safeParse 泛型工具测试（通过 loadData 间接测试）
- [x] 局部损坏恢复（prompts 损坏不影响 categories）

### Task 1.3: theme.ts 常量完整性测试 ✅
- [x] 文件：`trae/__tests__/logic/theme.test.ts`
- [x] Colors light/dark token 完整性、格式、对称性
- [x] CategoryColors 数量、名称、hex 格式
- [x] Spacing 单调递增、正整数、4pt grid
- [x] Radius 单调递增、full=9999
- [x] FontSize 层级关系、全序关系
- [x] Shadow light/dark 结构、属性完整性、暗色 > 亮色

### Task 1.4: defaults.ts 默认分类测试 ✅
- [x] 文件：`trae/__tests__/logic/defaults.test.ts`
- [x] 5 个分类、唯一 ID/名称/颜色
- [x] id 前缀 `cat-`
- [x] 所有属性完整、hex 颜色、图标名合法性
- [x] 预期 ID 列表、名称列表精确匹配
- [x] 不可变性

### Task 1.5: 运行覆盖率验证 ✅
- [x] `npx jest trae/__tests__/logic --coverage` → 4 passed, 127 tests, storage/theme/defaults 100%

---

## Phase 2: UI 组件测试 ✅

### Task 2.1: PromptCard 渲染与交互 ✅
- [x] 文件：`trae/__tests__/components/PromptCard.test.tsx`
- [x] 渲染标题、内容、收藏按钮
- [x] category pill 渲染/不渲染
- [x] onPress / onToggleFavorite 回调
- [x] isFavorite=true 渲染、长标题截断

### Task 2.2: SearchBar 渲染与交互 ✅
- [x] 文件：`trae/__tests__/components/SearchBar.test.tsx`
- [x] placeholder、value 显示、onChangeText
- [x] 清空文本

### Task 2.3: CategoryChip 渲染与交互 ✅
- [x] 文件：`trae/__tests__/components/CategoryChip.test.tsx`
- [x] 名称+计数、选中/未选中样式、onPress
- [x] count=0、count=999 边界

### Task 2.4: EmptyState 渲染与交互 ✅
- [x] 文件：`trae/__tests__/components/EmptyState.test.tsx`
- [x] 标题+消息、按钮条件渲染、onAction 回调
- [x] 部分 props 不渲染按钮

### Task 2.5: FAB 渲染与交互 ✅
- [x] 文件：`trae/__tests__/components/FAB.test.tsx`
- [x] testID、onPress 单次/多次

### Task 2.6: AppProvider 集成测试 ✅
- [x] 文件：`trae/__tests__/components/AppProvider.test.tsx`
- [x] Context 外报错
- [x] isLoading → false 加载流程
- [x] ADD_PROMPT / DELETE_PROMPT / TOGGLE_FAVORITE / SET_THEME_MODE dispatch
- [x] 300ms debounce 防抖
- [x] 多次快速 dispatch 合并为一次保存
- [x] 空存储时初始化 DEFAULT_CATEGORIES

### Task 2.7: 运行覆盖率验证 ✅
- [x] `npx jest trae/ --coverage` → 10 passed, 168 tests, 0 failures

---

## 最终覆盖率结果

```
trae/__tests__/logic/
  storage.ts        100% / 100% / 100% / 100%
  theme.ts          100% / 100% / 100% / 100%
  defaults.ts       100% / 100% / 100% / 100%
  AppContext.tsx   97.77% / 93.10% / 93.33% / 97.67%

trae/__tests__/components/
  CategoryChip.tsx  100% / 100% / 100% / 100%
  PromptCard.tsx    100% / 87.50% / 100% / 100%
  EmptyState.tsx    100% / 100% / 100% / 100%
  FAB.tsx           100% / 50% / 100% / 100%
  SearchBar.tsx     100% / 50% / 100% / 100%
  AppProvider       (integration via renderHook)
```

**结论：全部目标模块 ≥90%，两阶段均完成。**
