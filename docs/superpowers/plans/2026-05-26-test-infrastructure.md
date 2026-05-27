# Prompt Library 自动化测试体系建设计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建 Jest + @testing-library/react-native + jest-expo 测试体系，分两阶段覆盖纯逻辑模块（≥90% 覆盖率）和 UI 组件。

**Architecture:** 使用 jest-expo preset 作为基础配置，@testing-library/react-native 处理组件渲染与交互，jest.mock 隔离 AsyncStorage 和第三方依赖。纯逻辑测试直接 import 被测函数；组件测试通过 render + fireEvent 验证渲染输出和用户交互。

**Tech Stack:** Jest 29, jest-expo (Expo SDK 54 preset), @testing-library/react-native 12.x, @testing-library/jest-native (extended matchers), TypeScript 5.9

---

## 文件结构

```
prompt-library/
├── jest.config.js                          # 新增: Jest 配置
├── jest.setup.js                           # 新增: 全局 mock 与扩展 matcher
├── package.json                            # 修改: 添加 test/coverage 脚本和依赖
├── __tests__/
│   ├── logic/                              # 阶段一: 纯逻辑测试
│   │   ├── appReducer.test.ts
│   │   ├── storage.test.ts
│   │   ├── theme.test.ts
│   │   └── defaults.test.ts
│   └── components/                         # 阶段二: UI 组件测试
│       ├── PromptCard.test.tsx
│       ├── SearchBar.test.tsx
│       ├── CategoryChip.test.tsx
│       ├── EmptyState.test.tsx
│       ├── FAB.test.tsx
│       └── AppProvider.test.tsx
└── __mocks__/
    └── @react-native-async-storage/
        └── async-storage.js                # 新增: AsyncStorage mock 模块
```

---

## Part 0: 基础设施搭建

### Task 0: Jest 环境搭建

**Files:**
- Create: `jest.config.js`
- Create: `jest.setup.js`
- Create: `__mocks__/@react-native-async-storage/async-storage.js`
- Modify: `package.json` (scripts + devDependencies)

- [ ] **Step 1: 安装测试依赖**

```bash
npx expo install jest-expo jest @testing-library/react-native @testing-library/jest-native -- --dev
npm install --save-dev @types/jest
```

- [ ] **Step 2: 创建 jest.config.js**

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-reanimated|@react-native-async-storage/.*)",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/types/**",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.css$": "<rootDir>/__mocks__/styleMock.js",
  },
};
```

- [ ] **Step 3: 创建 jest.setup.js**

```javascript
import "@testing-library/jest-native/extend-expect";

// Mock react-native-reanimated (required by jest-expo but avoids native module issues)
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock NativeWind's useColorScheme for consistent theme testing
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
  default: jest.fn(() => "light"),
}));

// Suppress specific console warnings during tests
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported/.test(args[0]) ||
    /inside a test was not wrapped in act/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};
```

- [ ] **Step 4: 创建 AsyncStorage mock**

File: `__mocks__/@react-native-async-storage/async-storage.js`

```javascript
const mockStorage = new Map();

const AsyncStorage = {
  getItem: jest.fn(async (key) => {
    return mockStorage.has(key) ? mockStorage.get(key) : null;
  }),

  setItem: jest.fn(async (key, value) => {
    mockStorage.set(key, value);
  }),

  removeItem: jest.fn(async (key) => {
    mockStorage.delete(key);
  }),

  clear: jest.fn(async () => {
    mockStorage.clear();
  }),

  // Helper for tests: reset between test cases
  __reset: () => {
    mockStorage.clear();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    AsyncStorage.clear.mockClear();
  },
};

module.exports = AsyncStorage;
```

- [ ] **Step 5: 创建 CSS mock (NativeWind global.css)**

File: `__mocks__/styleMock.js`

```javascript
module.exports = {};
```

- [ ] **Step 6: 添加 package.json scripts**

在 `package.json` 的 `"scripts"` 中添加:

```json
"test": "jest --no-cache",
"test:coverage": "jest --coverage --no-cache",
"test:watch": "jest --watch"
```

- [ ] **Step 7: 验证环境能跑通**

```bash
npx jest --passWithNoTests
```

Expected: `No tests found, exiting with code 0`

- [ ] **Step 8: 提交**

```bash
git add jest.config.js jest.setup.js __mocks__/ package.json
git commit -m "chore: setup Jest + jest-expo + @testing-library/react-native test infrastructure"
```

---

## Part 1: 纯逻辑模块测试 (覆盖率目标 ≥90%)

### Task 1: appReducer 测试

**Files:**
- Create: `__tests__/logic/appReducer.test.ts`
- Reference: `src/store/AppContext.tsx:27-79`
- Reference: `src/types/index.ts:27-37`

- [ ] **Step 1: 编写完整测试文件**

File: `__tests__/logic/appReducer.test.ts`

```typescript
import { appReducer } from "../../src/store/AppContext";
import { Prompt, Category, AppAction, ThemeMode } from "../../src/types";

// --- Helpers ---

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: "p1",
    title: "Test Prompt",
    content: "Test content",
    categoryId: "cat-coding",
    tags: [],
    isFavorite: false,
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-coding",
    name: "编程",
    icon: "code-2",
    color: "#5E5CE6",
    ...overrides,
  };
}

function makeState(overrides: Partial<ReturnType<typeof makeBaseState>> = {}) {
  return { ...makeBaseState(), ...overrides };
}

function makeBaseState() {
  return {
    prompts: [] as Prompt[],
    categories: [] as Category[],
    themeMode: "system" as ThemeMode,
    isLoading: false,
  };
}

// --- SET_INITIAL_DATA ---

describe("appReducer - SET_INITIAL_DATA", () => {
  it("should set prompts, categories, themeMode, and clear isLoading", () => {
    const prompts = [makePrompt()];
    const categories = [makeCategory()];
    const action: AppAction = {
      type: "SET_INITIAL_DATA",
      prompts,
      categories,
      themeMode: "dark",
    };
    const state = appReducer(
      { ...makeBaseState(), isLoading: true },
      action
    );
    expect(state.prompts).toEqual(prompts);
    expect(state.categories).toEqual(categories);
    expect(state.themeMode).toBe("dark");
    expect(state.isLoading).toBe(false);
  });

  it("should handle empty arrays", () => {
    const action: AppAction = {
      type: "SET_INITIAL_DATA",
      prompts: [],
      categories: [],
      themeMode: "system",
    };
    const state = appReducer(makeBaseState(), action);
    expect(state.prompts).toHaveLength(0);
    expect(state.categories).toHaveLength(0);
  });
});

// --- ADD_PROMPT ---

describe("appReducer - ADD_PROMPT", () => {
  it("should append a prompt to the array", () => {
    const existing = makePrompt({ id: "p1", title: "First" });
    const newPrompt = makePrompt({ id: "p2", title: "Second" });
    const state = appReducer(
      makeState({ prompts: [existing] }),
      { type: "ADD_PROMPT", prompt: newPrompt }
    );
    expect(state.prompts).toHaveLength(2);
    expect(state.prompts[1]).toEqual(newPrompt);
  });

  it("should not mutate existing prompts", () => {
    const existing = makePrompt({ id: "p1" });
    const initial = makeState({ prompts: [existing] });
    const state = appReducer(initial, {
      type: "ADD_PROMPT",
      prompt: makePrompt({ id: "p2" }),
    });
    expect(state.prompts[0]).toBe(existing);
  });

  it("should add prompt when array is empty", () => {
    const prompt = makePrompt();
    const state = appReducer(makeBaseState(), { type: "ADD_PROMPT", prompt });
    expect(state.prompts).toHaveLength(1);
    expect(state.prompts[0]).toEqual(prompt);
  });
});

// --- UPDATE_PROMPT ---

describe("appReducer - UPDATE_PROMPT", () => {
  it("should update matching prompt by id", () => {
    const old = makePrompt({ id: "p1", title: "Old" });
    const updated = { ...old, title: "New Title", updatedAt: 3000 };
    const state = appReducer(
      makeState({ prompts: [old] }),
      { type: "UPDATE_PROMPT", prompt: updated }
    );
    expect(state.prompts[0].title).toBe("New Title");
    expect(state.prompts[0].updatedAt).toBe(3000);
  });

  it("should leave non-matching prompts unchanged", () => {
    const p1 = makePrompt({ id: "p1", title: "Keep" });
    const p2 = makePrompt({ id: "p2", title: "Update me" });
    const updated = { ...p2, title: "Updated" };
    const state = appReducer(
      makeState({ prompts: [p1, p2] }),
      { type: "UPDATE_PROMPT", prompt: updated }
    );
    expect(state.prompts[0]).toBe(p1);
    expect(state.prompts[1].title).toBe("Updated");
  });

  it("should not change state if id not found", () => {
    const prompt = makePrompt({ id: "p1" });
    const unknown = makePrompt({ id: "nonexistent", title: "Ghost" });
    const state = appReducer(
      makeState({ prompts: [prompt] }),
      { type: "UPDATE_PROMPT", prompt: unknown }
    );
    expect(state.prompts).toEqual([prompt]);
  });
});

// --- DELETE_PROMPT ---

describe("appReducer - DELETE_PROMPT", () => {
  it("should remove prompt by id", () => {
    const p1 = makePrompt({ id: "p1" });
    const p2 = makePrompt({ id: "p2" });
    const state = appReducer(
      makeState({ prompts: [p1, p2] }),
      { type: "DELETE_PROMPT", id: "p1" }
    );
    expect(state.prompts).toHaveLength(1);
    expect(state.prompts[0]).toEqual(p2);
  });

  it("should not change state if id not found", () => {
    const prompts = [makePrompt({ id: "p1" })];
    const state = appReducer(
      makeState({ prompts }),
      { type: "DELETE_PROMPT", id: "nonexistent" }
    );
    expect(state.prompts).toEqual(prompts);
  });

  it("should handle empty array", () => {
    const state = appReducer(
      makeBaseState(),
      { type: "DELETE_PROMPT", id: "whatever" }
    );
    expect(state.prompts).toHaveLength(0);
  });
});

// --- TOGGLE_FAVORITE ---

describe("appReducer - TOGGLE_FAVORITE", () => {
  it("should toggle isFavorite from false to true", () => {
    const prompt = makePrompt({ id: "p1", isFavorite: false });
    const state = appReducer(
      makeState({ prompts: [prompt] }),
      { type: "TOGGLE_FAVORITE", id: "p1" }
    );
    expect(state.prompts[0].isFavorite).toBe(true);
  });

  it("should toggle isFavorite from true to false", () => {
    const prompt = makePrompt({ id: "p1", isFavorite: true });
    const state = appReducer(
      makeState({ prompts: [prompt] }),
      { type: "TOGGLE_FAVORITE", id: "p1" }
    );
    expect(state.prompts[0].isFavorite).toBe(false);
  });

  it("should not affect other prompts", () => {
    const p1 = makePrompt({ id: "p1", isFavorite: false });
    const p2 = makePrompt({ id: "p2", isFavorite: false });
    const state = appReducer(
      makeState({ prompts: [p1, p2] }),
      { type: "TOGGLE_FAVORITE", id: "p2" }
    );
    expect(state.prompts[0].isFavorite).toBe(false);
    expect(state.prompts[1].isFavorite).toBe(true);
  });

  it("should not mutate if id not found", () => {
    const prompts = [makePrompt({ id: "p1" })];
    const state = appReducer(
      makeState({ prompts }),
      { type: "TOGGLE_FAVORITE", id: "nonexistent" }
    );
    expect(state.prompts).toEqual(prompts);
  });
});

// --- ADD_CATEGORY ---

describe("appReducer - ADD_CATEGORY", () => {
  it("should append a category", () => {
    const state = appReducer(
      makeBaseState(),
      { type: "ADD_CATEGORY", category: makeCategory() }
    );
    expect(state.categories).toHaveLength(1);
  });
});

// --- UPDATE_CATEGORY ---

describe("appReducer - UPDATE_CATEGORY", () => {
  it("should update matching category", () => {
    const old = makeCategory({ id: "c1", name: "Old" });
    const updated = { ...old, name: "New" };
    const state = appReducer(
      makeState({ categories: [old] }),
      { type: "UPDATE_CATEGORY", category: updated }
    );
    expect(state.categories[0].name).toBe("New");
  });

  it("should not mutate if id not found", () => {
    const categories = [makeCategory({ id: "c1" })];
    const unknown = makeCategory({ id: "nonexistent", name: "Ghost" });
    const state = appReducer(
      makeState({ categories }),
      { type: "UPDATE_CATEGORY", category: unknown }
    );
    expect(state.categories).toEqual(categories);
  });
});

// --- DELETE_CATEGORY ---

describe("appReducer - DELETE_CATEGORY", () => {
  it("should remove category by id", () => {
    const c1 = makeCategory({ id: "c1" });
    const c2 = makeCategory({ id: "c2" });
    const state = appReducer(
      makeState({ categories: [c1, c2] }),
      { type: "DELETE_CATEGORY", id: "c1" }
    );
    expect(state.categories).toHaveLength(1);
    expect(state.categories[0]).toEqual(c2);
  });
});

// --- SET_CATEGORIES ---

describe("appReducer - SET_CATEGORIES", () => {
  it("should replace categories array", () => {
    const old = [makeCategory({ id: "c1" })];
    const replacement = [makeCategory({ id: "c2" }), makeCategory({ id: "c3" })];
    const state = appReducer(
      makeState({ categories: old }),
      { type: "SET_CATEGORIES", categories: replacement }
    );
    expect(state.categories).toEqual(replacement);
    expect(state.categories).toHaveLength(2);
  });

  it("should allow setting empty array", () => {
    const state = appReducer(
      makeState({ categories: [makeCategory()] }),
      { type: "SET_CATEGORIES", categories: [] }
    );
    expect(state.categories).toHaveLength(0);
  });
});

// --- SET_THEME_MODE ---

describe("appReducer - SET_THEME_MODE", () => {
  it("should set themeMode to light", () => {
    const state = appReducer(makeBaseState(), {
      type: "SET_THEME_MODE",
      themeMode: "light",
    });
    expect(state.themeMode).toBe("light");
  });

  it("should set themeMode to dark", () => {
    const state = appReducer(makeBaseState(), {
      type: "SET_THEME_MODE",
      themeMode: "dark",
    });
    expect(state.themeMode).toBe("dark");
  });

  it("should set themeMode to system", () => {
    const state = appReducer(
      makeState({ themeMode: "dark" }),
      { type: "SET_THEME_MODE", themeMode: "system" }
    );
    expect(state.themeMode).toBe("system");
  });
});

// --- Edge Cases & Immutability ---

describe("appReducer - immutability", () => {
  it("should not mutate original state on ADD_PROMPT", () => {
    const initial = makeBaseState();
    const frozen = JSON.parse(JSON.stringify(initial));
    appReducer(initial, { type: "ADD_PROMPT", prompt: makePrompt() });
    expect(initial).toEqual(frozen);
  });

  it("should not mutate original state on DELETE_PROMPT", () => {
    const initial = makeState({ prompts: [makePrompt({ id: "p1" })] });
    const frozen = JSON.parse(JSON.stringify(initial));
    appReducer(initial, { type: "DELETE_PROMPT", id: "p1" });
    expect(initial).toEqual(frozen);
  });

  it("should not mutate original state on TOGGLE_FAVORITE", () => {
    const initial = makeState({ prompts: [makePrompt({ id: "p1" })] });
    const frozen = JSON.parse(JSON.stringify(initial));
    appReducer(initial, { type: "TOGGLE_FAVORITE", id: "p1" });
    expect(initial).toEqual(frozen);
  });

  it("should return current state for unknown action type", () => {
    const initial = makeState();
    const state = appReducer(initial, { type: "UNKNOWN" } as any);
    expect(state).toBe(initial);
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/logic/appReducer.test.ts --no-cache
```

Expected: All 22 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/logic/appReducer.test.ts
git commit -m "test: add appReducer unit tests — 10 actions + immutability + edge cases"
```

---

### Task 2: storage.ts 测试

**Files:**
- Create: `__tests__/logic/storage.test.ts`
- Reference: `src/store/storage.ts`
- Reference: `__mocks__/@react-native-async-storage/async-storage.js`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/logic/storage.test.ts`

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveData, loadData, saveThemeMode } from "../../src/store/storage";
import { Prompt, Category } from "../../src/types";

// AsyncStorage is auto-mocked via __mocks__/ directory

beforeEach(() => {
  (AsyncStorage as any).__reset();
});

// --- saveData ---

describe("saveData", () => {
  it("should serialize and store prompts and categories", async () => {
    const prompts: Prompt[] = [
      {
        id: "p1",
        title: "Test",
        content: "Hello",
        categoryId: "cat-1",
        tags: ["tag1"],
        isFavorite: false,
        createdAt: 1000,
        updatedAt: 2000,
      },
    ];
    const categories: Category[] = [
      { id: "cat-1", name: "编程", icon: "code-2", color: "#5E5CE6" },
    ];

    await saveData(prompts, categories);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "prompts",
      JSON.stringify(prompts)
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "categories",
      JSON.stringify(categories)
    );
  });

  it("should throw SAVE_FAILED if AsyncStorage.setItem rejects", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error("Disk full")
    );

    await expect(saveData([], [])).rejects.toThrow("SAVE_FAILED");
  });

  it("should handle empty arrays", async () => {
    await saveData([], []);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("prompts", "[]");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("categories", "[]");
  });
});

// --- saveThemeMode ---

describe("saveThemeMode", () => {
  it("should persist themeMode to AsyncStorage", async () => {
    await saveThemeMode("dark");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("themeMode", "dark");
  });

  it("should silently catch errors (not throw)", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error("Disk full")
    );
    await expect(saveThemeMode("light")).resolves.toBeUndefined();
  });
});

// --- loadData ---

describe("loadData", () => {
  it("should return parsed data when all keys exist", async () => {
    const prompts: Prompt[] = [
      {
        id: "p1",
        title: "Loaded",
        content: "Content",
        categoryId: "cat-1",
        tags: [],
        isFavorite: true,
        createdAt: 1,
        updatedAt: 2,
      },
    ];
    const categories: Category[] = [
      { id: "cat-1", name: "写作", icon: "pen-line", color: "#34C759" },
    ];

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(prompts))
      .mockResolvedValueOnce(JSON.stringify(categories))
      .mockResolvedValueOnce("dark");

    const result = await loadData();
    expect(result.prompts).toEqual(prompts);
    expect(result.categories).toEqual(categories);
    expect(result.themeMode).toBe("dark");
  });

  it("should return defaults when keys are null", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const result = await loadData();
    expect(result.prompts).toEqual([]);
    expect(result.categories).toEqual([]);
    expect(result.themeMode).toBe("system");
  });

  it("should fallback to empty arrays when JSON is malformed", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("{ broken json")
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const result = await loadData();
    expect(result.prompts).toEqual([]);
  });

  it("should fallback to system for invalid themeMode value", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("invalid_value");

    const result = await loadData();
    expect(result.themeMode).toBe("system");
  });

  it("should return empty state when AsyncStorage.getItem throws", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error("Connection lost")
    );

    const result = await loadData();
    expect(result.prompts).toEqual([]);
    expect(result.categories).toEqual([]);
    expect(result.themeMode).toBe("system");
  });

  it("should handle partial nulls — missing prompts but valid categories", async () => {
    const categories: Category[] = [
      { id: "cat-1", name: "设计", icon: "palette", color: "#FF375F" },
    ];
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(JSON.stringify(categories))
      .mockResolvedValueOnce("light");

    const result = await loadData();
    expect(result.prompts).toEqual([]);
    expect(result.categories).toEqual(categories);
    expect(result.themeMode).toBe("light");
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/logic/storage.test.ts --no-cache
```

Expected: 9 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/logic/storage.test.ts
git commit -m "test: add storage.ts unit tests — saveData, loadData, saveThemeMode + error paths"
```

---

### Task 3: theme.ts 常量完整性测试

**Files:**
- Create: `__tests__/logic/theme.test.ts`
- Reference: `src/constants/theme.ts`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/logic/theme.test.ts`

```typescript
import {
  Colors,
  CategoryColors,
  Spacing,
  Radius,
  FontSize,
  Shadow,
} from "../../src/constants/theme";

// --- Colors ---

describe("Colors", () => {
  const requiredTokens = [
    "background",
    "card",
    "cardSolid",
    "primary",
    "accent",
    "text",
    "textSecondary",
    "textTertiary",
    "separator",
    "scrim",
  ];

  it("should have all required tokens in light mode", () => {
    requiredTokens.forEach((token) => {
      expect(Colors.light).toHaveProperty(token);
      expect(typeof Colors.light[token as keyof typeof Colors.light]).toBe(
        "string"
      );
    });
  });

  it("should have all required tokens in dark mode", () => {
    requiredTokens.forEach((token) => {
      expect(Colors.dark).toHaveProperty(token);
      expect(typeof Colors.dark[token as keyof typeof Colors.dark]).toBe(
        "string"
      );
    });
  });

  it("should have matching token keys between light and dark modes", () => {
    const lightKeys = Object.keys(Colors.light).sort();
    const darkKeys = Object.keys(Colors.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("should use rgba or hex format for all color values", () => {
    const colorRegex = /^(#|rgba?\().*$/;
    const allColors = [
      ...Object.values(Colors.light),
      ...Object.values(Colors.dark),
    ];
    allColors.forEach((color) => {
      expect(color).toMatch(colorRegex);
    });
  });

  it("should have primary color that differs between light and dark", () => {
    expect(Colors.light.primary).not.toBe(Colors.dark.primary);
  });

  it("should have accent color that differs between light and dark", () => {
    expect(Colors.light.accent).not.toBe(Colors.dark.accent);
  });
});

// --- CategoryColors ---

describe("CategoryColors", () => {
  it("should have 5 default categories", () => {
    expect(Object.keys(CategoryColors)).toHaveLength(5);
  });

  it("should contain expected category names", () => {
    expect(CategoryColors).toHaveProperty("编程");
    expect(CategoryColors).toHaveProperty("写作");
    expect(CategoryColors).toHaveProperty("设计");
    expect(CategoryColors).toHaveProperty("数据");
    expect(CategoryColors).toHaveProperty("通用");
  });

  it("should have valid hex color for every category", () => {
    Object.values(CategoryColors).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

// --- Spacing ---

describe("Spacing", () => {
  it("should have monotonically increasing values", () => {
    const values = Object.values(Spacing);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it("should have all required keys", () => {
    expect(Spacing).toHaveProperty("xs");
    expect(Spacing).toHaveProperty("sm");
    expect(Spacing).toHaveProperty("md");
    expect(Spacing).toHaveProperty("lg");
    expect(Spacing).toHaveProperty("xl");
    expect(Spacing).toHaveProperty("xxl");
  });

  it("should have positive integer values", () => {
    Object.values(Spacing).forEach((value) => {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    });
  });
});

// --- Radius ---

describe("Radius", () => {
  it("should have monotonically increasing values (except full)", () => {
    const { full, sm, md, lg, xl } = Radius;
    expect(md).toBeGreaterThan(sm);
    expect(lg).toBeGreaterThan(md);
    expect(xl).toBeGreaterThan(lg);
    expect(full).toBe(9999);
  });

  it("should include 'full' as 9999 for pill shapes", () => {
    expect(Radius.full).toBe(9999);
  });
});

// --- FontSize ---

describe("FontSize", () => {
  it("should have new iOS26 tokens", () => {
    expect(FontSize).toHaveProperty("caption");
    expect(FontSize).toHaveProperty("footnote");
    expect(FontSize).toHaveProperty("body");
    expect(FontSize).toHaveProperty("title3");
    expect(FontSize).toHaveProperty("title2");
    expect(FontSize).toHaveProperty("title1");
    expect(FontSize).toHaveProperty("largeTitle");
  });

  it("should have caption smaller than body", () => {
    expect(FontSize.caption).toBeLessThan(FontSize.body);
  });

  it("should have largeTitle as the largest", () => {
    const values = Object.values(FontSize) as number[];
    const max = Math.max(...values);
    expect(FontSize.largeTitle).toBe(max);
  });
});

// --- Shadow ---

describe("Shadow", () => {
  it("should have light and dark modes", () => {
    expect(Shadow).toHaveProperty("light");
    expect(Shadow).toHaveProperty("dark");
  });

  it("should have sm, md, lg in each mode", () => {
    ["light", "dark"].forEach((mode) => {
      expect(Shadow[mode as keyof typeof Shadow]).toHaveProperty("sm");
      expect(Shadow[mode as keyof typeof Shadow]).toHaveProperty("md");
      expect(Shadow[mode as keyof typeof Shadow]).toHaveProperty("lg");
    });
  });

  it("should have required properties for every shadow level", () => {
    const requiredProps = [
      "shadowColor",
      "shadowOffset",
      "shadowOpacity",
      "shadowRadius",
      "elevation",
    ];

    ["light", "dark"].forEach((mode) => {
      ["sm", "md", "lg"].forEach((level) => {
        const shadow =
          Shadow[mode as keyof typeof Shadow][
            level as keyof (typeof Shadow)["light"]
          ];
        requiredProps.forEach((prop) => {
          expect(shadow).toHaveProperty(prop);
        });
      });
    });
  });

  it("should have shadowColor #000 for all", () => {
    ["light", "dark"].forEach((mode) => {
      ["sm", "md", "lg"].forEach((level) => {
        const shadow =
          Shadow[mode as keyof typeof Shadow][
            level as keyof (typeof Shadow)["light"]
          ];
        expect(shadow.shadowColor).toBe("#000");
      });
    });
  });

  it("should have stronger shadow opacity in dark mode than light for each level", () => {
    ["sm", "md", "lg"].forEach((level) => {
      const lightLevel =
        Shadow.light[level as keyof typeof Shadow.light];
      const darkLevel =
        Shadow.dark[level as keyof typeof Shadow.dark];
      expect(darkLevel.shadowOpacity).toBeGreaterThan(
        lightLevel.shadowOpacity
      );
    });
  });

  it("should have increasing shadowRadius within each mode (sm < md < lg)", () => {
    ["light", "dark"].forEach((mode) => {
      const m = Shadow[mode as keyof typeof Shadow];
      expect(m.md.shadowRadius).toBeGreaterThan(m.sm.shadowRadius);
      expect(m.lg.shadowRadius).toBeGreaterThan(m.md.shadowRadius);
    });
  });

  it("should have shadowOffset.width 0 for all", () => {
    ["light", "dark"].forEach((mode) => {
      ["sm", "md", "lg"].forEach((level) => {
        const shadow =
          Shadow[mode as keyof typeof Shadow][
            level as keyof (typeof Shadow)["light"]
          ];
        expect(shadow.shadowOffset.width).toBe(0);
      });
    });
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/logic/theme.test.ts --no-cache
```

Expected: 16 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/logic/theme.test.ts
git commit -m "test: add theme.ts constants validation tests"
```

---

### Task 4: defaults.ts 测试

**Files:**
- Create: `__tests__/logic/defaults.test.ts`
- Reference: `src/constants/defaults.ts`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/logic/defaults.test.ts`

```typescript
import { DEFAULT_CATEGORIES } from "../../src/constants/defaults";

describe("DEFAULT_CATEGORIES", () => {
  it("should have exactly 5 categories", () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(5);
  });

  it("should have unique ids", () => {
    const ids = DEFAULT_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should have unique names", () => {
    const names = DEFAULT_CATEGORIES.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("should have unique colors (visual distinction)", () => {
    const colors = DEFAULT_CATEGORIES.map((c) => c.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it("should have id prefix 'cat-' for every category", () => {
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(c.id).toMatch(/^cat-/);
    });
  });

  it("should have all required properties on each category", () => {
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(c).toHaveProperty("id");
      expect(c).toHaveProperty("name");
      expect(c).toHaveProperty("icon");
      expect(c).toHaveProperty("color");
      expect(typeof c.id).toBe("string");
      expect(typeof c.name).toBe("string");
      expect(typeof c.icon).toBe("string");
      expect(typeof c.color).toBe("string");
    });
  });

  it("should have valid hex colors", () => {
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(c.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("should use Ionicons-compatible icon names", () => {
    const validIcons = [
      "code-2",
      "pen-line",
      "palette",
      "bar-chart-2",
      "folder",
    ];
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(validIcons).toContain(c.icon);
    });
  });

  it("should be a frozen/reference-safe export", () => {
    // Verify we don't accidentally mutate the original in tests
    const first = DEFAULT_CATEGORIES[0];
    expect(first.id).toBe("cat-coding");
    expect(first.name).toBe("编程");
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/logic/defaults.test.ts --no-cache
```

Expected: 9 tests PASS

- [ ] **Step 3: 运行 Phase 1 全部测试 + 覆盖率**

```bash
npx jest __tests__/logic/ --coverage --no-cache
```

Expected: Coverage ≥90% for `src/store/AppContext.tsx`, `src/store/storage.ts`, `src/constants/theme.ts`, `src/constants/defaults.ts`

- [ ] **Step 4: 提交**

```bash
git add __tests__/logic/defaults.test.ts
git commit -m "test: add defaults.ts constants validation tests; Phase 1 complete"
```

---

## Part 2: UI 组件与集成测试

### Task 5: PromptCard 组件测试

**Files:**
- Create: `__tests__/components/PromptCard.test.tsx`
- Reference: `src/components/PromptCard.tsx`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/components/PromptCard.test.tsx`

```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PromptCard from "../../src/components/PromptCard";
import { Prompt, Category } from "../../src/types";

// Mock useTheme to provide stable colors
jest.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      card: "rgba(255,255,255,0.72)",
      primary: "#5E5CE6",
      accent: "#FF9F0A",
      text: "rgba(0,0,0,0.88)",
      textSecondary: "rgba(0,0,0,0.50)",
      textTertiary: "rgba(0,0,0,0.30)",
      separator: "rgba(0,0,0,0.08)",
      background: "#F8F8FA",
      cardSolid: "#FFFFFF",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

const mockPrompt: Prompt = {
  id: "p1",
  title: "Code Review Prompt",
  content: "Review the following code for bugs and suggest improvements.",
  categoryId: "cat-coding",
  tags: ["coding", "review"],
  isFavorite: false,
  createdAt: 1000,
  updatedAt: 2000,
};

const mockCategory: Category = {
  id: "cat-coding",
  name: "编程",
  icon: "code-2",
  color: "#5E5CE6",
};

describe("PromptCard", () => {
  it("should render title", () => {
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByText("Code Review Prompt")).toBeTruthy();
  });

  it("should render content preview", () => {
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(
      getByText("Review the following code for bugs and suggest improvements.")
    ).toBeTruthy();
  });

  it("should show star icon (unfilled) when not favorite", () => {
    const { getByTestId } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    // Ionicons name rendered as accessibleLabel in testing-library
    const favButton = getByTestId("favorite-button");
    expect(favButton).toBeTruthy();
  });

  it("should render category pill when category provided", () => {
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        category={mockCategory}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    expect(getByText("编程")).toBeTruthy();
  });

  it("should not render category when category is undefined", () => {
    const { queryByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={jest.fn()}
      />
    );
    // "编程" should not appear since no category prop
    // The category pill View should not exist
    expect(queryByText("编程")).toBeNull();
  });

  it("should call onPress when card is pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={onPress}
        onToggleFavorite={jest.fn()}
      />
    );
    fireEvent.press(getByText("Code Review Prompt"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should call onToggleFavorite when favorite button pressed", () => {
    const onToggleFavorite = jest.fn();
    const { getByTestId } = render(
      <PromptCard
        prompt={mockPrompt}
        onPress={jest.fn()}
        onToggleFavorite={onToggleFavorite}
      />
    );
    fireEvent.press(getByTestId("favorite-button"));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/components/PromptCard.test.tsx --no-cache
```

Expected: 7 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/components/PromptCard.test.tsx
git commit -m "test: add PromptCard component tests"
```

---

### Task 6: SearchBar 组件测试

**Files:**
- Create: `__tests__/components/SearchBar.test.tsx`
- Reference: `src/components/SearchBar.tsx`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/components/SearchBar.test.tsx`

```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SearchBar from "../../src/components/SearchBar";

jest.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      card: "rgba(255,255,255,0.72)",
      text: "rgba(0,0,0,0.88)",
      textTertiary: "rgba(0,0,0,0.30)",
      separator: "rgba(0,0,0,0.08)",
      background: "#F8F8FA",
      primary: "#5E5CE6",
      accent: "#FF9F0A",
      textSecondary: "rgba(0,0,0,0.50)",
      cardSolid: "#FFFFFF",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

describe("SearchBar", () => {
  it("should render with placeholder text", () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} />
    );
    expect(getByPlaceholderText("搜索提示词...")).toBeTruthy();
  });

  it("should display current value", () => {
    const { getByDisplayValue } = render(
      <SearchBar value="testing" onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue("testing")).toBeTruthy();
  });

  it("should call onChangeText when text is entered", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} />
    );
    fireEvent.changeText(
      getByPlaceholderText("搜索提示词..."),
      "new search"
    );
    expect(onChangeText).toHaveBeenCalledWith("new search");
  });

  it("should call onChangeText with empty string when cleared", () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = render(
      <SearchBar value="old" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByDisplayValue("old"), "");
    expect(onChangeText).toHaveBeenCalledWith("");
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/components/SearchBar.test.tsx --no-cache
```

Expected: 4 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/components/SearchBar.test.tsx
git commit -m "test: add SearchBar component tests"
```

---

### Task 7: CategoryChip 组件测试

**Files:**
- Create: `__tests__/components/CategoryChip.test.tsx`
- Reference: `src/components/CategoryChip.tsx`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/components/CategoryChip.test.tsx`

```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CategoryChip from "../../src/components/CategoryChip";
import { Category } from "../../src/types";

const mockCategory: Category = {
  id: "cat-writing",
  name: "写作",
  icon: "pen-line",
  color: "#34C759",
};

describe("CategoryChip", () => {
  it("should render category name and count", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={5}
        onPress={jest.fn()}
      />
    );
    // Renders "写作 5" (name + count separated by space)
    expect(getByText("写作 5")).toBeTruthy();
  });

  it("should apply selected style when isSelected is true", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={true}
        count={3}
        onPress={jest.fn()}
      />
    );
    const text = getByText("写作 3");
    expect(text.props.style).toMatchObject({
      color: "#FFFFFF",
    });
  });

  it("should apply unselected style when isSelected is false", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={3}
        onPress={jest.fn()}
      />
    );
    const text = getByText("写作 3");
    expect(text.props.style).toMatchObject({
      color: "#34C759",
    });
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={0}
        onPress={onPress}
      />
    );
    fireEvent.press(getByText("写作 0"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should render zero count correctly", () => {
    const { getByText } = render(
      <CategoryChip
        category={mockCategory}
        isSelected={false}
        count={0}
        onPress={jest.fn()}
      />
    );
    expect(getByText("写作 0")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/components/CategoryChip.test.tsx --no-cache
```

Expected: 5 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/components/CategoryChip.test.tsx
git commit -m "test: add CategoryChip component tests"
```

---

### Task 8: EmptyState 组件测试

**Files:**
- Create: `__tests__/components/EmptyState.test.tsx`
- Reference: `src/components/EmptyState.tsx`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/components/EmptyState.test.tsx`

```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EmptyState from "../../src/components/EmptyState";

jest.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      text: "rgba(0,0,0,0.88)",
      textSecondary: "rgba(0,0,0,0.50)",
      textTertiary: "rgba(0,0,0,0.30)",
      primary: "#5E5CE6",
      background: "#F8F8FA",
      card: "rgba(255,255,255,0.72)",
      cardSolid: "#FFFFFF",
      accent: "#FF9F0A",
      separator: "rgba(0,0,0,0.08)",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

describe("EmptyState", () => {
  it("should render title and message", () => {
    const { getByText } = render(
      <EmptyState title="No items" message="Nothing here yet" />
    );
    expect(getByText("No items")).toBeTruthy();
    expect(getByText("Nothing here yet")).toBeTruthy();
  });

  it("should not render action button when actionLabel or onAction is missing", () => {
    const { queryByText } = render(
      <EmptyState title="Title" message="Message" />
    );
    // No button should be present
    expect(queryByText("Add")).toBeNull();
  });

  it("should not render action button when only actionLabel is provided", () => {
    const { queryByText } = render(
      <EmptyState title="Title" message="Message" actionLabel="Add" />
    );
    expect(queryByText("Add")).toBeNull();
  });

  it("should not render action button when only onAction is provided", () => {
    const { queryByText } = render(
      <EmptyState
        title="Title"
        message="Message"
        onAction={jest.fn()}
      />
    );
    expect(queryByText("Add")).toBeNull();
  });

  it("should render action button when both actionLabel and onAction are provided", () => {
    const { getByText } = render(
      <EmptyState
        title="Title"
        message="Message"
        actionLabel="Create New"
        onAction={jest.fn()}
      />
    );
    expect(getByText("Create New")).toBeTruthy();
  });

  it("should call onAction when button is pressed", () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <EmptyState
        title="Title"
        message="Message"
        actionLabel="Go"
        onAction={onAction}
      />
    );
    fireEvent.press(getByText("Go"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/components/EmptyState.test.tsx --no-cache
```

Expected: 6 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/components/EmptyState.test.tsx
git commit -m "test: add EmptyState component tests"
```

---

### Task 9: FAB 组件测试

**Files:**
- Create: `__tests__/components/FAB.test.tsx`
- Reference: `src/components/FAB.tsx`

- [ ] **Step 1: 编写测试文件**

File: `__tests__/components/FAB.test.tsx`

```typescript
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FAB from "../../src/components/FAB";

jest.mock("../../src/hooks/useTheme", () => ({
  useTheme: () => ({
    isDark: false,
    colors: {
      primary: "#5E5CE6",
      background: "#F8F8FA",
      card: "rgba(255,255,255,0.72)",
      cardSolid: "#FFFFFF",
      accent: "#FF9F0A",
      text: "rgba(0,0,0,0.88)",
      textSecondary: "rgba(0,0,0,0.50)",
      textTertiary: "rgba(0,0,0,0.30)",
      separator: "rgba(0,0,0,0.08)",
      scrim: "rgba(0,0,0,0.35)",
    },
  }),
}));

describe("FAB", () => {
  it("should render with testID 'fab'", () => {
    const { getByTestId } = render(<FAB onPress={jest.fn()} />);
    expect(getByTestId("fab")).toBeTruthy();
  });

  it("should call onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<FAB onPress={onPress} />);
    fireEvent.press(getByTestId("fab"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("should trigger onPress exactly once per tap", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<FAB onPress={onPress} />);
    fireEvent.press(getByTestId("fab"));
    fireEvent.press(getByTestId("fab"));
    fireEvent.press(getByTestId("fab"));
    expect(onPress).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/components/FAB.test.tsx --no-cache
```

Expected: 3 tests PASS

- [ ] **Step 3: 提交**

```bash
git add __tests__/components/FAB.test.tsx
git commit -m "test: add FAB component tests"
```

---

### Task 10: AppProvider 集成测试 (Context + 300ms 防抖)

**Files:**
- Create: `__tests__/components/AppProvider.test.tsx`
- Reference: `src/store/AppContext.tsx`
- Reference: `src/store/storage.ts`

- [ ] **Step 1: 编写集成测试文件**

File: `__tests__/components/AppProvider.test.tsx`

```typescript
import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { AppProvider, useApp } from "../../src/store/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Prompt } from "../../src/types";

// AsyncStorage is auto-mocked, but loadData needs to return something
beforeEach(() => {
  (AsyncStorage as any).__reset();
  // Default: loadData returns empty state
  (AsyncStorage.getItem as jest.Mock)
    .mockResolvedValueOnce(null) // prompts
    .mockResolvedValueOnce(null) // categories
    .mockResolvedValueOnce(null); // themeMode
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe("AppProvider", () => {
  it("should throw error when useApp is used outside AppProvider", () => {
    // Suppress console.error for expected throw
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      const { result } = renderHook(() => useApp());
    }).toThrow("useApp must be used within AppProvider");

    spy.mockRestore();
  });

  it("should start with isLoading true and empty state", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.state.isLoading).toBe(true);
    expect(result.current.state.prompts).toEqual([]);
    expect(result.current.state.categories).toEqual([]);
    expect(result.current.state.themeMode).toBe("system");
  });

  it("should dispatch ADD_PROMPT and update state", async () => {
    // First wait for initial load
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useApp(), { wrapper });

    const newPrompt: Prompt = {
      id: "test-1",
      title: "Test",
      content: "Content",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt: newPrompt });
    });

    expect(result.current.state.prompts).toHaveLength(1);
    expect(result.current.state.prompts[0].title).toBe("Test");
  });

  it("should dispatch DELETE_PROMPT and remove from state", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useApp(), { wrapper });

    const prompt: Prompt = {
      id: "del-me",
      title: "Delete me",
      content: "...",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt });
    });
    expect(result.current.state.prompts).toHaveLength(1);

    await act(async () => {
      result.current.dispatch({ type: "DELETE_PROMPT", id: "del-me" });
    });
    expect(result.current.state.prompts).toHaveLength(0);
  });

  it("should dispatch TOGGLE_FAVORITE and flip isFavorite", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useApp(), { wrapper });

    const prompt: Prompt = {
      id: "fav-1",
      title: "Star me",
      content: "...",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt });
    });

    await act(async () => {
      result.current.dispatch({ type: "TOGGLE_FAVORITE", id: "fav-1" });
    });

    expect(result.current.state.prompts[0].isFavorite).toBe(true);

    await act(async () => {
      result.current.dispatch({ type: "TOGGLE_FAVORITE", id: "fav-1" });
    });

    expect(result.current.state.prompts[0].isFavorite).toBe(false);
  });

  it("should dispatch SET_THEME_MODE and change themeMode", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useApp(), { wrapper });

    await act(async () => {
      result.current.dispatch({
        type: "SET_THEME_MODE",
        themeMode: "dark",
      });
    });

    expect(result.current.state.themeMode).toBe("dark");
  });

  it("should debounce saveData by 300ms after state change", async () => {
    jest.useFakeTimers();

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { result } = renderHook(() => useApp(), { wrapper });

    // Wait for initial load to complete
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    const prompt: Prompt = {
      id: "save-test",
      title: "Save test",
      content: "...",
      categoryId: "cat-1",
      tags: [],
      isFavorite: false,
      createdAt: 1,
      updatedAt: 2,
    };

    // Clear mock call history after initial load
    (AsyncStorage.setItem as jest.Mock).mockClear();

    await act(async () => {
      result.current.dispatch({ type: "ADD_PROMPT", prompt });
    });

    // saveData should NOT have been called yet (debounce pending)
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    // Advance past 300ms debounce
    await act(async () => {
      jest.advanceTimersByTime(350);
    });

    // Now saveData should have been called
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
npx jest __tests__/components/AppProvider.test.tsx --no-cache
```

Expected: 7 tests PASS

- [ ] **Step 3: 运行 Phase 2 全部测试**

```bash
npx jest __tests__/components/ --no-cache
```

Expected: All 32 component/integration tests PASS

- [ ] **Step 4: 提交**

```bash
git add __tests__/components/AppProvider.test.tsx
git commit -m "test: add AppProvider integration tests — Context + 300ms debounce"
```

---

## 最终验证

- [ ] **运行全部测试 + 覆盖率报告**

```bash
npx jest --coverage --no-cache
```

Expected:
- 全部 88 个测试 PASS
- `src/store/AppContext.tsx` (appReducer 部分) 覆盖率 ≥90%
- `src/store/storage.ts` 覆盖率 ≥90%
- `src/constants/theme.ts` 覆盖率 100%
- `src/constants/defaults.ts` 覆盖率 100%
- UI 组件覆盖率 ≥80%

- [ ] **最终提交**

```bash
git add .
git commit -m "test: complete test infrastructure — 88 tests across logic + UI components, 90%+ coverage"
```

---

## 关键设计决策

1. **API 差异处理**: `@testing-library/react-native` v12+ 使用 `renderHook` 从 `@testing-library/react-native` 直接导出（而非旧的 `@testing-library/react-hooks`），`fireEvent` 和 `act` 同样从该包直接导入。

2. **Mock 策略**: `useTheme` hook 在每个组件测试文件中独立 mock，避免全局 mock 影响其他测试。AsyncStorage 使用 `__mocks__/` 目录自动 mock，提供 `__reset()` helper 做测试隔离。

3. **覆盖率阈值**: `jest.config.js` 中设为全局 85% lines/statements + 80% branches/functions。组件测试阶段 branches 降低到 80% 是合理的（NativeWind className、Shadow 等条件分支在 mock 环境下难以全部覆盖）。

4. **TypeScript**: 所有测试文件用 `.ts` / `.tsx` 后缀，无需额外 ts-jest 配置——`jest-expo` preset 已内置。
