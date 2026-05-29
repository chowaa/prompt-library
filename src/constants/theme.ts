export const Colors = {
  light: {
    background: "#F8F8FA",
    card: "rgba(255,255,255,0.72)",
    cardSolid: "#FFFFFF",
    primary: "#5E5CE6",
    accent: "#FF9F0A",
    text: "rgba(0,0,0,0.88)",
    textSecondary: "rgba(0,0,0,0.50)",
    textTertiary: "rgba(0,0,0,0.30)",
    separator: "rgba(0,0,0,0.08)",
    scrim: "rgba(0,0,0,0.35)",
  },
  dark: {
    background: "#000000",
    card: "rgba(28,28,30,0.88)",
    cardSolid: "#1C1C1E",
    primary: "#8B88FF",
    accent: "#FFD60A",
    text: "rgba(255,255,255,0.92)",
    textSecondary: "rgba(255,255,255,0.55)",
    textTertiary: "rgba(255,255,255,0.35)",
    separator: "rgba(255,255,255,0.10)",
    scrim: "rgba(0,0,0,0.55)",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 28,
  full: 9999,
} as const;

export const FontSize = {
  caption2: 11,
  caption: 12,
  footnote: 13,
  subhead: 15,
  callout: 16,
  body: 17,
  title3: 20,
  title2: 22,
  title1: 28,
  largeTitle: 34,
} as const;

export const Shadow = {
  light: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 24,
      elevation: 6,
    },
  },
  dark: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.20,
      shadowRadius: 4,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 24,
      elevation: 6,
    },
  },
} as const;
