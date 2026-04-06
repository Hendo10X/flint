import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/store/settings";
import { THEMES, Theme, ThemeKey } from "@/constants/themes";

export function useTheme(): Theme {
  const { themeMode, lightAccent, darkAccent } = useSettingsStore();
  const deviceScheme = useColorScheme();

  const resolvedMode =
    themeMode === "system" ? (deviceScheme ?? "light") : themeMode;

  const key = (
    resolvedMode === "light"
      ? `light-${lightAccent}`
      : `dark-${darkAccent}`
  ) as ThemeKey;

  return THEMES[key];
}
