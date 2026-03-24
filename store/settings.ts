import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

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

const STORAGE_KEY = "flint_settings_v1";

interface SettingsStore {
  fontSizeKey: FontSizeKey;
  setFontSize: (key: FontSizeKey) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  fontSizeKey: "medium",

  setFontSize: (fontSizeKey) => {
    set({ fontSizeKey });
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ fontSizeKey })).catch(() => {});
  },

  loadSettings: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.fontSizeKey && parsed.fontSizeKey in FONT_SCALE) {
          set({ fontSizeKey: parsed.fontSizeKey });
        }
      }
    } catch {}
  },
}));

/** Returns the current scale multiplier (0.85 / 1.0 / 1.2). */
export function useFontScale() {
  const key = useSettingsStore((s) => s.fontSizeKey);
  return FONT_SCALE[key];
}
