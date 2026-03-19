import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(outline: IoniconsName, filled: IoniconsName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? filled : outline} size={22} color={color} />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#F0F0F0",
          borderTopWidth: 1,
          height: 54 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "tasks", tabBarIcon: tabIcon("checkbox-outline", "checkbox") }}
      />
      <Tabs.Screen
        name="timer"
        options={{ title: "timer", tabBarIcon: tabIcon("timer-outline", "timer") }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: "stats", tabBarIcon: tabIcon("bar-chart-outline", "bar-chart") }}
      />
    </Tabs>
  );
}
