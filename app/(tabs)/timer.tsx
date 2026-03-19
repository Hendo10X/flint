import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const PRESETS = [
  { label: "25m", seconds: 25 * 60 },
  { label: "10m", seconds: 10 * 60 },
  { label: "5m", seconds: 5 * 60 },
];

const DEFAULT_DURATION = 25 * 60;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function statusLabel(isFinished: boolean, isRunning: boolean, remaining: number, duration: number) {
  if (isFinished) return "done 🔥";
  if (isRunning) return "focus";
  if (remaining === duration) return "ready";
  return "paused";
}

export default function TimerScreen() {
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackWidthRef = useRef(300);

  const progressFillWidth = useSharedValue(0);
  const timeDisplayScale = useSharedValue(1);

  useEffect(() => {
    const elapsed = duration - remaining;
    progressFillWidth.value = withTiming((elapsed / duration) * trackWidthRef.current, {
      duration: 950,
      easing: Easing.linear,
    });
  }, [remaining, duration]);

  useEffect(() => {
    if (isRunning) {
      timeDisplayScale.value = withRepeat(
        withSequence(
          withTiming(1.015, { duration: 3000, easing: Easing.inOut(Easing.sine) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sine) })
        ),
        -1,
        false
      );
    } else {
      timeDisplayScale.value = withSpring(1, { damping: 12 });
    }
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const selectPreset = (seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setDuration(seconds);
    setRemaining(seconds);
    progressFillWidth.value = withTiming(0, { duration: 300 });
  };

  const toggleRunning = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning((prev) => !prev);
  };

  const reset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setRemaining(duration);
    progressFillWidth.value = withTiming(0, { duration: 300 });
  };

  const isFinished = remaining === 0;

  const progressFillStyle = useAnimatedStyle(() => ({
    width: progressFillWidth.value,
  }));

  const timeDisplayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timeDisplayScale.value }],
  }));

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.screenTitle}>timer</Text>

      <View style={styles.presetRow}>
        {PRESETS.map((preset) => {
          const isActive = duration === preset.seconds;
          return (
            <TouchableOpacity
              key={preset.label}
              style={[styles.presetChip, isActive && styles.presetChipActive]}
              onPress={() => selectPreset(preset.seconds)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.timerCenter}>
        <Animated.Text
          style={[styles.timeText, isFinished && styles.timeTextFinished, timeDisplayStyle]}
        >
          {formatTime(remaining)}
        </Animated.Text>
        <Text style={styles.modeLabel}>
          {statusLabel(isFinished, isRunning, remaining, duration)}
        </Text>
      </View>

      <View
        style={styles.progressTrack}
        onLayout={(e) => { trackWidthRef.current = e.nativeEvent.layout.width; }}
      >
        <Animated.View style={[styles.progressFill, progressFillStyle]} />
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.resetButton} onPress={reset} activeOpacity={0.7}>
          <Text style={styles.resetLabel}>reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.startButton, isRunning && styles.pauseButton]}
          onPress={toggleRunning}
          activeOpacity={0.8}
        >
          <Text style={styles.startLabel}>{isRunning ? "pause" : "start"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F97316",
    letterSpacing: -0.5,
    marginTop: 12,
    marginBottom: 28,
  },
  presetRow: {
    flexDirection: "row",
    gap: 10,
  },
  presetChip: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
  },
  presetChipActive: {
    backgroundColor: "#FFF7ED",
    borderColor: "#F97316",
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  presetLabelActive: {
    color: "#F97316",
  },
  timerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  timeText: {
    fontSize: 82,
    fontWeight: "200",
    color: "#111",
    letterSpacing: -4,
    fontVariant: ["tabular-nums"],
  },
  timeTextFinished: {
    color: "#F97316",
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    marginBottom: 28,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 2,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
  },
  resetLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  startButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
  },
  pauseButton: {
    backgroundColor: "#111",
  },
  startLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
