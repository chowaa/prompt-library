# Prompt Library — 待改进项

> 筛选原则：只列有实际影响的，不过度工程化。个人工具、单人维护、小代码量的前提下判断。

---

## 1. Settings 入口冗余

Tab 栏和 HomeScreen headerRight 各有一个 Settings 入口，指向同一页面。两个入口并存会让用户困惑——到底点哪个。

**建议:** 保留一个。如果走 headerRight 齿轮的方案，从 TabNavigator 里删掉 Settings Tab，同时在 SettingsScreen 左上角加返回按钮（或用 `navigation.goBack()`）。

---

## 2. 持久化静默失败

`AppContext.tsx:121` 的 `saveData(...).catch(() => {})` 在 AsyncStorage 写入失败时完全静默。用户编辑了提示词、收藏了内容，关掉 App 再打开发现数据丢了，没有任何提示。这是数据可靠性问题，不是代码风格问题。

**建议:** 至少 `console.warn` 打出错误；可以加一个 `saveStatus` state，失败时在 UI 上给一个轻提示。

---

## 3. DarkModeRow 中 Switch 防抖多余

`SettingsScreen.tsx:31` 对 Switch 的 `onValueChange` 加了 100ms setTimeout 防抖。ThemeMode 切换只需 dispatch 一个 action，没有 I/O 开销，防抖只会让开关响应变迟钝。

**修复:** 去掉 `setTimeout`，回调里直接 `dispatch({ type: "SET_THEME_MODE", themeMode })`。

---

## 说明：以下不列为问题

| 项 | 不列的原因 |
|---|---|
| generateId 重复 | BrowseScreen 是用户明确选择保留的，两份 1 行函数不值得抽 |
| ShelfCard/PromptCard 阴影不统一 | 列表卡片和横向滚动卡片场景不同，差异可能是刻意的 |
| HomeScreen 330 行 | 小 App 的主屏幕，这个长度合理，拆文件反而增加跳转 |
| 空状态加引导文案 | 用户自己写的 App，不需要向自己解释用途 |
| "查看全部"切换 | 本质是过滤操作，不是页面跳转，当前行为合理 |
| reanimated 未使用 | 可能是 Expo 模板自带依赖，删了反而可能出问题 |
| 无测试 | 单人项目手动测试够用，RN 测试基建 ROI 不高 |
| i18n | 中文用户、中文 App，不需要预留多语言 |
| 版本号/迁移 | 一个人控制 schema，改结构时手动清数据即可 |
| 长按菜单/滑动删除 | 个人工具不需要这些快捷手势，点一下打开 sheet 就够了 |
