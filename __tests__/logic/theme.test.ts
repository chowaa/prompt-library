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
