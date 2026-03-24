import { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Tabs, router } from "expo-router";
import { CheckSquare, Timer, ChartBar, UserCircle, Plus } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { authClient } from "@/lib/auth-client";
import { useTaskStore } from "@/store/tasks";
import { AddTaskSheet } from "@/components/AddTaskSheet";
import { F } from "@/constants/fonts";

type PhosphorIcon = React.ComponentType<{ size?: number; color?: string; weight?: string }>;

function tabIcon(Icon: PhosphorIcon) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Icon size={22} color={color} weight={focused ? "fill" : "regular"} />
  );
}

function CenterAddButton() {
  const openAddSheet = useTaskStore((s) => s.openAddSheet);
  return (
    <View style={styles.fabWrapper}>
      <TouchableOpacity style={styles.fab} onPress={openAddSheet} activeOpacity={0.85}>
        <Plus size={26} color="#fff" weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { data: session, isPending } = authClient.useSession();
  const { addSheetOpen, closeAddSheet } = useTaskStore();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/(auth)/sign-in" as any);
    }
  }, [session, isPending]);

  if (isPending) return <View style={{ flex: 1, backgroundColor: "#fff" }} />;
  if (!session) return null;

  const TAB_BAR_HEIGHT = 54 + insets.bottom;

  return (
    <>
      <Tabs
        screenListeners={{
          tabPress: () => Haptics.selectionAsync(),
        }}
        screenOptions={{
          headerShown: false,
          animation: "none",
          tabBarActiveTintColor: "#F97316",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 0,
            elevation: 0,
            height: TAB_BAR_HEIGHT,
            paddingTop: 6,
            paddingBottom: insets.bottom + 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: F.medium,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "tasks", tabBarIcon: tabIcon(CheckSquare) }}
        />
        <Tabs.Screen
          name="timer"
          options={{ title: "timer", tabBarIcon: tabIcon(Timer) }}
        />
        <Tabs.Screen
          name="add-task"
          options={{
            title: "",
            tabBarButton: () => <CenterAddButton />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{ title: "stats", tabBarIcon: tabIcon(ChartBar) }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: "settings", tabBarIcon: tabIcon(UserCircle) }}
        />
      </Tabs>

      <AddTaskSheet visible={addSheetOpen} onClose={closeAddSheet} />
    </>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
});
