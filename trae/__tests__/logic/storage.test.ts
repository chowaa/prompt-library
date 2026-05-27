import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveData, loadData, saveThemeMode } from "../../../src/store/storage";
import { Prompt, Category } from "../../../src/types";

beforeEach(() => {
  (AsyncStorage as any).__reset();
});

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

  it("should throw if only prompts fail to save", async () => {
    (AsyncStorage.setItem as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("categories full"));
    await expect(saveData([makePrompt()], [makeCategory()])).rejects.toThrow(
      "SAVE_FAILED"
    );
  });

  it("should throw if only categories fail to save", async () => {
    (AsyncStorage.setItem as jest.Mock)
      .mockRejectedValueOnce(new Error("prompts full"));
    await expect(saveData([makePrompt()], [makeCategory()])).rejects.toThrow(
      "SAVE_FAILED"
    );
  });

  it("should store tags correctly in serialized JSON", async () => {
    const prompts: Prompt[] = [
      makePrompt({ tags: ["ai", "code", "review"] }),
    ];
    await saveData(prompts, []);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "prompts",
      expect.stringContaining('"ai"')
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "prompts",
      expect.stringContaining('"code"')
    );
  });
});

describe("saveThemeMode", () => {
  it("should persist themeMode to AsyncStorage", async () => {
    await saveThemeMode("dark");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("themeMode", "dark");
  });

  it("should persist 'light'", async () => {
    await saveThemeMode("light");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("themeMode", "light");
  });

  it("should persist 'system'", async () => {
    await saveThemeMode("system");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("themeMode", "system");
  });

  it("should silently catch errors (not throw)", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error("Disk full")
    );
    await expect(saveThemeMode("light")).resolves.toBeUndefined();
  });

  it("should not throw on any error", async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
      new Error("Persistent failure")
    );
    await expect(saveThemeMode("dark")).resolves.toBeUndefined();
    await expect(saveThemeMode("light")).resolves.toBeUndefined();
  });
});

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

  it("should handle partial nulls — missing categories but valid prompts", async () => {
    const prompts: Prompt[] = [makePrompt()];
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(prompts))
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("dark");

    const result = await loadData();
    expect(result.prompts).toEqual(prompts);
    expect(result.categories).toEqual([]);
    expect(result.themeMode).toBe("dark");
  });

  it("should handle partial corruption — valid prompts but broken categories", async () => {
    const prompts: Prompt[] = [makePrompt()];
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(prompts))
      .mockResolvedValueOnce("{ corrupted")
      .mockResolvedValueOnce("system");

    const result = await loadData();
    expect(result.prompts).toEqual(prompts);
    expect(result.categories).toEqual([]);
  });

  it("should handle partial corruption — broken prompts but valid categories", async () => {
    const categories: Category[] = [makeCategory()];
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("{ corrupted")
      .mockResolvedValueOnce(JSON.stringify(categories))
      .mockResolvedValueOnce("system");

    const result = await loadData();
    expect(result.prompts).toEqual([]);
    expect(result.categories).toEqual(categories);
  });

  it("should accept 'system' as valid themeMode", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("system");

    const result = await loadData();
    expect(result.themeMode).toBe("system");
  });

  it("should accept 'light' as valid themeMode", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("light");

    const result = await loadData();
    expect(result.themeMode).toBe("light");
  });

  it("should accept 'dark' as valid themeMode", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("dark");

    const result = await loadData();
    expect(result.themeMode).toBe("dark");
  });

  it("should reject empty string as themeMode", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("");

    const result = await loadData();
    expect(result.themeMode).toBe("system");
  });

  it("should reject null as themeMode (third key null)", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce(null);

    const result = await loadData();
    expect(result.themeMode).toBe("system");
  });

  it("should handle large prompt dataset", async () => {
    const largePrompts: Prompt[] = Array.from({ length: 500 }, (_, i) =>
      makePrompt({ id: `p${i}`, title: `Prompt ${i}` })
    );
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(largePrompts))
      .mockResolvedValueOnce("[]")
      .mockResolvedValueOnce("dark");

    const result = await loadData();
    expect(result.prompts).toHaveLength(500);
  });
});

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: "p1",
    title: "Test Prompt",
    content: "Test content",
    categoryId: "cat-1",
    tags: [],
    isFavorite: false,
    createdAt: 1000,
    updatedAt: 2000,
    ...overrides,
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-1",
    name: "编程",
    icon: "code-2",
    color: "#5E5CE6",
    ...overrides,
  };
}
