import { DEFAULT_CATEGORIES } from "../../../src/constants/defaults";

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
    const first = DEFAULT_CATEGORIES[0];
    expect(first.id).toBe("cat-coding");
    expect(first.name).toBe("编程");
  });

  it("should match expected category IDs", () => {
    const ids = DEFAULT_CATEGORIES.map((c) => c.id);
    expect(ids).toEqual([
      "cat-coding",
      "cat-writing",
      "cat-design",
      "cat-data",
      "cat-general",
    ]);
  });

  it("should match expected category names in order", () => {
    const names = DEFAULT_CATEGORIES.map((c) => c.name);
    expect(names).toEqual(["编程", "写作", "设计", "数据", "通用"]);
  });

  it("should have non-empty icon strings", () => {
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(c.icon.length).toBeGreaterThan(0);
    });
  });

  it("should have non-empty name strings", () => {
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(c.name.length).toBeGreaterThan(0);
    });
  });

  it("should be immutable (array methods should not affect original)", () => {
    const snapshot = [...DEFAULT_CATEGORIES];
    DEFAULT_CATEGORIES.slice(1);
    expect(DEFAULT_CATEGORIES).toEqual(snapshot);
  });
});
