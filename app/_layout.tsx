import { useEffect } from "react";
import { View, Text, useColorScheme } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { Toast } from "@/components/Toast";
import { HeroUINativeProvider } from "heroui-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSettingsStore } from "@/store/settings";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

export default function RootLayout() {
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    "OpenRunde-Regular": require("../assets/images/fonts/OpenRunde-Regular-BF64ee9c627e5b6.otf"),
    "OpenRunde-Medium": require("../assets/images/fonts/OpenRunde-Medium-BF64ee9c62ad3ad.otf"),
    "OpenRunde-Semibold": require("../assets/images/fonts/OpenRunde-Semibold-BF64ee9c629e0a5.otf"),
    "OpenRunde-Bold": require("../assets/images/fonts/OpenRunde-Bold-BF64ee9c62a2035.otf"),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    const isDark = colorScheme === "dark";
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#F9FAFB", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 48, fontWeight: "700", color: "#F97316", letterSpacing: -1 }}>
          flint
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </HeroUINativeProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}
