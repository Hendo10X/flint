import { useEffect, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { CheckCircle, WarningCircle } from "phosphor-react-native";
import { useToastStore } from "@/store/toast";

const SHOW_DURATION = 3200;

export function Toast() {
  const { message, type, hide } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = () => {
    translateY.value = withTiming(-100, { duration: 260 });
    opacity.value = withTiming(0, { duration: 260 }, (done) => {
      if (done) runOnJS(hide)();
    });
  };

  useEffect(() => {
    if (message) {
      if (timerRef.current) clearTimeout(timerRef.current);
      translateY.value = withTiming(0, { duration: 320 });
      opacity.value = withTiming(1, { duration: 240 });
      timerRef.current = setTimeout(dismiss, SHOW_DURATION);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!message) return null;

  const isError = type === "error";
  const bg = isError ? "#1C1C1E" : "#1C1C1E";
  const iconColor = isError ? "#F87171" : "#4ADE80";
  const Icon = isError ? WarningCircle : CheckCircle;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 12 },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View style={[styles.pill, { backgroundColor: bg }]}>
        <Icon size={18} color={iconColor} weight="fill" />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#F5F5F5",
    lineHeight: 19,
  },
});
