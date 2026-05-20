export const Colors = {
  light: {
    background: "#F2F2F7",
    card: "#FFFFFF",
    primary: "#6366F1",
    accent: "#F59E0B",
    text: "rgba(0,0,0,0.9)",
    textSecondary: "rgba(0,0,0,0.6)",
    separator: "#E5E5EA",
    scrim: "rgba(0,0,0,0.4)",
  },
  dark: {
    background: "#000000",
    card: "#1C1C1E",
    primary: "#818CF8",
    accent: "#F59E0B",
    text: "rgba(255,255,255,0.9)",
    textSecondary: "rgba(255,255,255,0.6)",
    separator: "#38383A",
    scrim: "rgba(0,0,0,0.6)",
  },
} as const;

export const CategoryColors: Record<string, string> = {
  编程: "#6366F1",
  写作: "#10B981",
  设计: "#EC4899",
  数据: "#3B82F6",
  通用: "#78716C",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const FontSize = {
  caption: 13,
  body: 17,
  title: 22,
  largeTitle: 28,
} as const;
