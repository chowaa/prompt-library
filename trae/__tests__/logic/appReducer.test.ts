/**
 * @jest-environment jsdom
 */

import { appReducer } from "../../../src/store/AppContext";
import { Prompt, Category, AppAction, ThemeMode } from "../../../src/types";

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

function makeState(overrides: any = {}) {
  return {
    prompts: [] as Prompt[],
    categories: [] as Category[],
    themeMode: "system" as ThemeMode,
    isLoading: false,
    ...overrides,
  };
}

// ============================================================
// SET_INITIAL_DATA
// ============================================================

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
      { ...makeState(), isLoading: true },
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
    const state = appReducer(makeState(), action);
    expect(state.prompts).toHaveLength(0);
    expect(state.categories).toHaveLength(0);
  });

  it("should handle all three ThemeMode values", () => {
    const modes: ThemeMode[] = ["system", "light", "dark"];
    modes.forEach((mode) => {
      const action: AppAction = {
        type: "SET_INITIAL_DATA",
        prompts: [],
        categories: [],
        themeMode: mode,
      };
      const state = appReducer(makeState(), action);
      expect(state.themeMode).toBe(mode);
    });
  });

  it("should handle large dataset", () => {
    const largePrompts = Array.from({ length: 1000 }, (_, i) =>
      makePrompt({ id: `p${i}`, title: `Prompt ${i}` })
    );
    const action: AppAction = {
      type: "SET_INITIAL_DATA",
      prompts: largePrompts,
      categories: [],
      themeMode: "system",
    };
    const state = appReducer(makeState(), action);
    expect(state.prompts).toHaveLength(1000);
  });
});

// ============================================================
// ADD_PROMPT
// ============================================================

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
    const state = appReducer(makeState(), { type: "ADD_PROMPT", prompt });
    expect(state.prompts).toHaveLength(1);
    expect(state.prompts[0]).toEqual(prompt);
  });

  it("should not affect categories or themeMode", () => {
    const state = appReducer(makeState(), {
      type: "ADD_PROMPT",
      prompt: makePrompt(),
    });
    expect(state.categories).toEqual([]);
    expect(state.themeMode).toBe("system");
  });

  it("should handle prompts with tags", () => {
    const prompt = makePrompt({ tags: ["a", "b", "c"] });
    const state = appReducer(makeState(), { type: "ADD_PROMPT", prompt });
    expect(state.prompts[0].tags).toEqual(["a", "b", "c"]);
  });

  it("should handle prompts with isFavorite true", () => {
    const prompt = makePrompt({ isFavorite: true });
    const state = appReducer(makeState(), { type: "ADD_PROMPT", prompt });
    expect(state.prompts[0].isFavorite).toBe(true);
  });
});

// ============================================================
// UPDATE_PROMPT
// ============================================================

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

  it("should update all fields simultaneously", () => {
    const old = makePrompt({
      id: "p1",
      title: "Old",
      content: "Old content",
      categoryId: "cat-old",
      tags: ["old"],
      isFavorite: false,
    });
    const updated: Prompt = {
      ...old,
      title: "New",
      content: "New content",
      categoryId: "cat-new",
      tags: ["new1", "new2"],
      isFavorite: true,
      updatedAt: 9999,
    };
    const state = appReducer(
      makeState({ prompts: [old] }),
      { type: "UPDATE_PROMPT", prompt: updated }
    );
    const result = state.prompts[0];
    expect(result.title).toBe("New");
    expect(result.content).toBe("New content");
    expect(result.categoryId).toBe("cat-new");
    expect(result.tags).toEqual(["new1", "new2"]);
    expect(result.isFavorite).toBe(true);
    expect(result.updatedAt).toBe(9999);
  });
});

// ============================================================
// DELETE_PROMPT
// ============================================================

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
    const state = appReducer(makeState(), {
      type: "DELETE_PROMPT",
      id: "whatever",
    });
    expect(state.prompts).toHaveLength(0);
  });

  it("should delete the only remaining prompt", () => {
    const state = appReducer(
      makeState({ prompts: [makePrompt({ id: "only" })] }),
      { type: "DELETE_PROMPT", id: "only" }
    );
    expect(state.prompts).toHaveLength(0);
  });

  it("should delete the last prompt in array", () => {
    const p1 = makePrompt({ id: "p1" });
    const p2 = makePrompt({ id: "p2" });
    const state = appReducer(
      makeState({ prompts: [p1, p2] }),
      { type: "DELETE_PROMPT", id: "p2" }
    );
    expect(state.prompts).toEqual([p1]);
  });
});

// ============================================================
// TOGGLE_FAVORITE
// ============================================================

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

  it("should toggle multiple times (idempotent-ish)", () => {
    const prompt = makePrompt({ id: "p1", isFavorite: false });
    let state = makeState({ prompts: [prompt] });
    state = appReducer(state, { type: "TOGGLE_FAVORITE", id: "p1" });
    state = appReducer(state, { type: "TOGGLE_FAVORITE", id: "p1" });
    state = appReducer(state, { type: "TOGGLE_FAVORITE", id: "p1" });
    expect(state.prompts[0].isFavorite).toBe(true);
  });
});

// ============================================================
// ADD_CATEGORY
// ============================================================

describe("appReducer - ADD_CATEGORY", () => {
  it("should append a category", () => {
    const state = appReducer(makeState(), {
      type: "ADD_CATEGORY",
      category: makeCategory(),
    });
    expect(state.categories).toHaveLength(1);
  });

  it("should not mutate existing categories", () => {
    const existing = makeCategory({ id: "c1", name: "Existing" });
    const initial = makeState({ categories: [existing] });
    const state = appReducer(initial, {
      type: "ADD_CATEGORY",
      category: makeCategory({ id: "c2", name: "New" }),
    });
    expect(state.categories[0]).toBe(existing);
  });

  it("should not affect prompts", () => {
    const prompts = [makePrompt()];
    const state = appReducer(
      makeState({ prompts }),
      { type: "ADD_CATEGORY", category: makeCategory() }
    );
    expect(state.prompts).toEqual(prompts);
  });
});

// ============================================================
// UPDATE_CATEGORY
// ============================================================

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

  it("should update color and icon", () => {
    const old = makeCategory({ id: "c1", color: "#000000", icon: "old-icon" });
    const updated = { ...old, color: "#FFFFFF", icon: "new-icon" };
    const state = appReducer(
      makeState({ categories: [old] }),
      { type: "UPDATE_CATEGORY", category: updated }
    );
    expect(state.categories[0].color).toBe("#FFFFFF");
    expect(state.categories[0].icon).toBe("new-icon");
  });
});

// ============================================================
// DELETE_CATEGORY
// ============================================================

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

  it("should not change state if id not found", () => {
    const categories = [makeCategory({ id: "c1" })];
    const state = appReducer(
      makeState({ categories }),
      { type: "DELETE_CATEGORY", id: "nonexistent" }
    );
    expect(state.categories).toEqual(categories);
  });

  it("should handle empty array", () => {
    const state = appReducer(makeState(), {
      type: "DELETE_CATEGORY",
      id: "whatever",
    });
    expect(state.categories).toHaveLength(0);
  });
});

// ============================================================
// SET_CATEGORIES
// ============================================================

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

  it("should not affect prompts", () => {
    const prompts = [makePrompt()];
    const state = appReducer(
      makeState({ prompts }),
      { type: "SET_CATEGORIES", categories: [] }
    );
    expect(state.prompts).toEqual(prompts);
  });
});

// ============================================================
// SET_THEME_MODE
// ============================================================

describe("appReducer - SET_THEME_MODE", () => {
  it("should set themeMode to light", () => {
    const state = appReducer(makeState(), {
      type: "SET_THEME_MODE",
      themeMode: "light",
    });
    expect(state.themeMode).toBe("light");
  });

  it("should set themeMode to dark", () => {
    const state = appReducer(makeState(), {
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

  it("should not affect prompts or categories", () => {
    const prompts = [makePrompt()];
    const categories = [makeCategory()];
    const state = appReducer(
      makeState({ prompts, categories }),
      { type: "SET_THEME_MODE", themeMode: "dark" }
    );
    expect(state.prompts).toEqual(prompts);
    expect(state.categories).toEqual(categories);
  });
});

// ============================================================
// Immutability
// ============================================================

describe("appReducer - immutability", () => {
  it("should not mutate original state on ADD_PROMPT", () => {
    const initial = makeState();
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

  it("should not mutate original state on UPDATE_PROMPT", () => {
    const initial = makeState({ prompts: [makePrompt({ id: "p1" })] });
    const frozen = JSON.parse(JSON.stringify(initial));
    const updated = { ...initial.prompts[0], title: "Changed" };
    appReducer(initial, { type: "UPDATE_PROMPT", prompt: updated });
    expect(initial).toEqual(frozen);
  });

  it("should not mutate original state on SET_THEME_MODE", () => {
    const initial = makeState();
    const frozen = JSON.parse(JSON.stringify(initial));
    appReducer(initial, { type: "SET_THEME_MODE", themeMode: "dark" });
    expect(initial).toEqual(frozen);
  });

  it("should return current state for unknown action type", () => {
    const initial = makeState();
    const state = appReducer(initial, { type: "UNKNOWN" } as any);
    expect(state).toBe(initial);
  });

  it("should return same state reference for unknown action", () => {
    const initial = makeState();
    const result = appReducer(initial, { type: "UNKNOWN_ACTION" } as any);
    expect(result).toBe(initial);
  });
});

// ============================================================
// Cross-action scenarios
// ============================================================

describe("appReducer - cross-action scenarios", () => {
  it("should add then delete a prompt", () => {
    let state = makeState();
    state = appReducer(state, { type: "ADD_PROMPT", prompt: makePrompt({ id: "tmp" }) });
    expect(state.prompts).toHaveLength(1);
    state = appReducer(state, { type: "DELETE_PROMPT", id: "tmp" });
    expect(state.prompts).toHaveLength(0);
  });

  it("should add, update, toggle favorite, then delete", () => {
    let state = makeState();
    const prompt = makePrompt({ id: "flow", isFavorite: false });

    state = appReducer(state, { type: "ADD_PROMPT", prompt });
    state = appReducer(state, {
      type: "UPDATE_PROMPT",
      prompt: { ...prompt, title: "Flow Updated" },
    });
    state = appReducer(state, { type: "TOGGLE_FAVORITE", id: "flow" });
    expect(state.prompts[0].title).toBe("Flow Updated");
    expect(state.prompts[0].isFavorite).toBe(true);

    state = appReducer(state, { type: "DELETE_PROMPT", id: "flow" });
    expect(state.prompts).toHaveLength(0);
  });

  it("should handle full initialization then mutation flow", () => {
    const prompts = [makePrompt({ id: "p1" }), makePrompt({ id: "p2" })];
    const categories = [makeCategory({ id: "c1" })];

    let state = appReducer(
      { ...makeState(), isLoading: true },
      {
        type: "SET_INITIAL_DATA",
        prompts,
        categories,
        themeMode: "light",
      }
    );

    expect(state.isLoading).toBe(false);
    expect(state.prompts).toHaveLength(2);

    state = appReducer(state, {
      type: "ADD_PROMPT",
      prompt: makePrompt({ id: "p3" }),
    });
    expect(state.prompts).toHaveLength(3);

    state = appReducer(state, { type: "SET_THEME_MODE", themeMode: "dark" });
    expect(state.themeMode).toBe("dark");
  });
});
