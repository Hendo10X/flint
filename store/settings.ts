import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { ThemeMode, LightAccent, DarkAccent } from "@/constants/themes";

export type FontSizeKey = "small" | "medium" | "large";

export const FONT_SCALE: Record<FontSizeKey, number> = {
  small: 0.85,
  medium: 1,
  large: 1.2,
};

export const FONT_SIZE_LABELS: Record<FontSizeKey, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const STORAGE_KEY = "flint_settings_v2";

interface SettingsStore {
  fontSizeKey: FontSizeKey;
  themeMode: ThemeMode;
  lightAccent: LightAccent;
  darkAccent: DarkAccent;
  setFontSize: (key: FontSizeKey) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLightAccent: (accent: LightAccent) => void;
  setDarkAccent: (accent: DarkAccent) => void;
  loadSettings: () => Promise<void>;
}

function persist(state: Partial<SettingsStore>) {
  const { fontSizeKey, themeMode, lightAccent, darkAccent } = state as any;
  SecureStore.setItemAsync(
    STORAGE_KEY,
    JSON.stringify({ fontSizeKey, themeMode, lightAccent, darkAccent })
  ).catch(() => {});
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  fontSizeKey: "medium",
  themeMode: "system",
  lightAccent: "orange",
  darkAccent: "orange",

  setFontSize: (fontSizeKey) => {
    set({ fontSizeKey });
    persist({ ...get(), fontSizeKey });
  },

  setThemeMode: (themeMode) => {
    set({ themeMode });
    persist({ ...get(), themeMode });
  },

  setLightAccent: (lightAccent) => {
    set({ lightAccent });
    persist({ ...get(), lightAccent });
  },

  setDarkAccent: (darkAccent) => {
    set({ darkAccent });
    persist({ ...get(), darkAccent });
  },

  loadSettings: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        set({
          ...(p.fontSizeKey && p.fontSizeKey in FONT_SCALE ? { fontSizeKey: p.fontSizeKey } : {}),
          ...(p.themeMode && ["light", "dark", "system"].includes(p.themeMode)
            ? { themeMode: p.themeMode }
            : {}),
          ...(p.lightAccent && ["orange", "lavender", "teal"].includes(p.lightAccent)
            ? { lightAccent: p.lightAccent }
            : {}),
          ...(p.darkAccent && ["orange", "lemon", "coral"].includes(p.darkAccent)
            ? { darkAccent: p.darkAccent }
            : {}),
        });
      }
    } catch {}
  },
}));

export function useFontScale() {
  const key = useSettingsStore((s) => s.fontSizeKey);
  return FONT_SCALE[key];
}
