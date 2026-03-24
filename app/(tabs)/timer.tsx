import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { F } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/constants/themes";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Ring geometry
const RING_SIZE = 264;
const RING_RADIUS = 110;
const RING_STROKE = 9;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const RING_CENTER = RING_SIZE / 2;

const PRESETS = [
  { label: "5m",  seconds: 5  * 60 },
  { label: "10m", seconds: 10 * 60 },
  { label: "25m", seconds: 25 * 60 },
  { label: "60m", seconds: 60 * 60 },
];

const DEFAULT_DURATION = 25 * 60;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function statusLabel(
  isFinished: boolean,
  isRunning: boolean,
  remaining: number,
  duration: number
) {
  if (isFinished) return "done 🔥";
  if (isRunning) return "focus";
  if (remaining === duration) return "ready";
  return "paused";
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.bg,
      paddingHorizontal: 24,
    },
    screenTitle: {
      fontSize: 26,
      fontFamily: F.bold,
      color: t.accent,
      letterSpacing: -0.5,
      marginTop: 12,
      marginBottom: 28,
    },
    presetRow: {
      flexDirection: "row",
      gap: 10,
    },
    presetChip: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: t.border,
      backgroundColor: t.surfaceAlt,
      alignItems: "center",
    },
    presetChipActive: {
      backgroundColor: t.accentBg,
      borderColor: t.accent,
    },
    presetLabel: {
      fontSize: 13,
      fontFamily: F.semibold,
      color: t.textMuted,
    },
    presetLabelActive: {
      color: t.accent,
    },

    // ── Ring area ──
    timerCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    ringWrapper: {
      width: RING_SIZE,
      height: RING_SIZE,
      alignItems: "center",
      justifyContent: "center",
    },
    ringSvg: {
      position: "absolute",
    },
    ringTextCenter: {
      alignItems: "center",
      gap: 8,
    },
    timeText: {
      fontSize: 68,
      fontFamily: F.bold,
      color: t.text,
      letterSpacing: -3,
    },
    timeTextFinished: {
      color: t.accent,
    },
    modeLabel: {
      fontSize: 13,
      fontFamily: F.medium,
      color: t.textMuted,
      letterSpacing: 2,
      textTransform: "uppercase",
    },

    // ── Controls ──
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
      borderColor: t.border,
    },
    resetLabel: {
      fontSize: 16,
      fontFamily: F.medium,
      color: t.textMuted,
    },
    startButton: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 14,
      backgroundColor: t.accent,
      alignItems: "center",
    },
    pauseButton: {
      backgroundColor: t.text,
    },
    startLabel: {
      fontSize: 16,
      fontFamily: F.bold,
      color: t.surface,
    },
  });

export default function TimerScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Shared value: 0 = empty → 1 = full
  const progressValue = useSharedValue(0);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - progressValue.value),
  }));

  // Drive the ring progress
  useEffect(() => {
    const elapsed = duration - remaining;
    progressValue.value = withTiming(elapsed / duration, {
      duration: 950,
      easing: Easing.linear,
    });
  }, [remaining, duration]);

  // Timer interval
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
    progressValue.value = withTiming(0, { duration: 300 });
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
    progressValue.value = withTiming(0, { duration: 300 });
  };

  const isFinished = remaining === 0;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style={theme.statusBar === "light-content" ? "light" : "dark"} />
      <Text style={styles.screenTitle}>timer</Text>

      {/* Preset chips */}
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

      {/* Ring + time */}
      <View style={styles.timerCenter}>
        <View style={styles.ringWrapper}>
          {/* SVG ring */}
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            style={styles.ringSvg}
          >
            {/* Track */}
            <Circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={theme.border}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
            />
            {/* Progress arc — starts at 12 o'clock via rotation */}
            <AnimatedCircle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={isFinished ? theme.accent : theme.accent}
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              animatedProps={ringAnimatedProps}
              transform={`rotate(-90, ${RING_CENTER}, ${RING_CENTER})`}
            />
          </Svg>

          {/* Time & label centred inside the ring */}
          <View style={styles.ringTextCenter} pointerEvents="none">
            <Text style={[styles.timeText, isFinished && styles.timeTextFinished]}>
              {formatTime(remaining)}
            </Text>
            <Text style={styles.modeLabel}>
              {statusLabel(isFinished, isRunning, remaining, duration)}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
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
