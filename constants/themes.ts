export interface Theme {
  // Backgrounds
  bg: string;
  surface: string;
  surfaceAlt: string;
  // Borders
  border: string;
  borderInput: string;
  borderFaint: string;
  // Text
  text: string;
  textSub: string;
  textMuted: string;
  textFaint: string;
  // Accent
  accent: string;
  accentFg: string;
  accentBg: string;
  accentBorder: string;
  // Tab bar
  tabBg: string;
  // Meta
  isDark: boolean;
  statusBar: "light-content" | "dark-content";
}

export type ThemeMode = "light" | "dark" | "system";
export type LightAccent = "orange" | "lavender" | "teal";
export type DarkAccent = "orange" | "lemon" | "coral";
export type ThemeKey =
  | "light-orange"
  | "light-lavender"
  | "light-teal"
  | "dark-orange"
  | "dark-lemon"
  | "dark-coral";

const LIGHT_ORANGE: Theme = {
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  surfaceAlt: "#FAFAFA",
  border: "#F0F0F0",
  borderInput: "#E5E7EB",
  borderFaint: "#F5F5F5",
  text: "#111111",
  textSub: "#4B5563",
  textMuted: "#9CA3AF",
  textFaint: "#D1D5DB",
  accent: "#F97316",
  accentFg: "#fff",
  accentBg: "#FFF7ED",
  accentBorder: "#FED7AA",
  tabBg: "#FFFFFF",
  isDark: false,
  statusBar: "dark-content",
};

const LIGHT_LAVENDER: Theme = {
  bg: "#F8F7FF",
  surface: "#FFFFFF",
  surfaceAlt: "#FAF9FF",
  border: "#EDE9FE",
  borderInput: "#DDD6FE",
  borderFaint: "#F0EEFF",
  text: "#111111",
  textSub: "#4B5563",
  textMuted: "#7C6E9B",
  textFaint: "#C4BAF7",
  accent: "#7C3AED",
  accentFg: "#fff",
  accentBg: "#F5F3FF",
  accentBorder: "#DDD6FE",
  tabBg: "#FFFFFF",
  isDark: false,
  statusBar: "dark-content",
};

const LIGHT_TEAL: Theme = {
  bg: "#F0FDFF",
  surface: "#FFFFFF",
  surfaceAlt: "#F5FEFF",
  border: "#CFFAFE",
  borderInput: "#A5F3FC",
  borderFaint: "#E0FAFE",
  text: "#111111",
  textSub: "#164E63",
  textMuted: "#0E7490",
  textFaint: "#67E8F9",
  accent: "#0891B2",
  accentFg: "#fff",
  accentBg: "#ECFEFF",
  accentBorder: "#A5F3FC",
  tabBg: "#FFFFFF",
  isDark: false,
  statusBar: "dark-content",
};

const DARK_ORANGE: Theme = {
  bg: "#121212",
  surface: "#1E1E1E",
  surfaceAlt: "#252525",
  border: "#2A2A2A",
  borderInput: "#333333",
  borderFaint: "#222222",
  text: "#FAFAFA",
  textSub: "#D1D5DB",
  textMuted: "#9CA3AF",
  textFaint: "#6B7280",
  accent: "#F97316",
  accentFg: "#fff",
  accentBg: "#2A1800",
  accentBorder: "#4D2C00",
  tabBg: "#1A1A1A",
  isDark: true,
  statusBar: "light-content",
};

const DARK_LEMON: Theme = {
  bg: "#121212",
  surface: "#1E1E1E",
  surfaceAlt: "#252525",
  border: "#2A2A2A",
  borderInput: "#333333",
  borderFaint: "#222222",
  text: "#FAFAFA",
  textSub: "#D1D5DB",
  textMuted: "#9CA3AF",
  textFaint: "#6B7280",
  accent: "#A3E635",
  accentFg: "#1A3300",
  accentBg: "#162100",
  accentBorder: "#2D4100",
  tabBg: "#1A1A1A",
  isDark: true,
  statusBar: "light-content",
};

const DARK_CORAL: Theme = {
  bg: "#121212",
  surface: "#1E1E1E",
  surfaceAlt: "#252525",
  border: "#2A2A2A",
  borderInput: "#333333",
  borderFaint: "#222222",
  text: "#FAFAFA",
  textSub: "#D1D5DB",
  textMuted: "#9CA3AF",
  textFaint: "#6B7280",
  accent: "#FF6B6B",
  accentFg: "#fff",
  accentBg: "#2A0E0E",
  accentBorder: "#4D1A1A",
  tabBg: "#1A1A1A",
  isDark: true,
  statusBar: "light-content",
};

export const THEMES: Record<ThemeKey, Theme> = {
  "light-orange": LIGHT_ORANGE,
  "light-lavender": LIGHT_LAVENDER,
  "light-teal": LIGHT_TEAL,
  "dark-orange": DARK_ORANGE,
  "dark-lemon": DARK_LEMON,
  "dark-coral": DARK_CORAL,
};

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export const LIGHT_ACCENT_LABELS: Record<LightAccent, string> = {
  orange: "Orange",
  lavender: "Lavender",
  teal: "Teal",
};

export const DARK_ACCENT_LABELS: Record<DarkAccent, string> = {
  orange: "Orange",
  lemon: "Lemon",
  coral: "Coral",
};

export const LIGHT_ACCENT_COLORS: Record<LightAccent, string> = {
  orange: "#F97316",
  lavender: "#7C3AED",
  teal: "#0891B2",
};

export const DARK_ACCENT_COLORS: Record<DarkAccent, string> = {
  orange: "#F97316",
  lemon: "#A3E635",
  coral: "#FF6B6B",
};
