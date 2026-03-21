import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Slot } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "OpenRunde-Regular": require("../assets/images/fonts/OpenRunde-Regular-BF64ee9c627e5b6.otf"),
    "OpenRunde-Medium": require("../assets/images/fonts/OpenRunde-Medium-BF64ee9c62ad3ad.otf"),
    "OpenRunde-Semibold": require("../assets/images/fonts/OpenRunde-Semibold-BF64ee9c629e0a5.otf"),
    "OpenRunde-Bold": require("../assets/images/fonts/OpenRunde-Bold-BF64ee9c62a2035.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Slot />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
