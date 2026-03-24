import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { GestureDetector, Gesture, TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTaskStore, Task } from "@/store/tasks";
import { useFontScale } from "@/store/settings";
import { F } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/constants/themes";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  work:     { bg: "#EFF6FF", text: "#2563EB" },
  school:   { bg: "#F5F3FF", text: "#7C3AED" },
  personal: { bg: "#F0FDF4", text: "#16A34A" },
  health:   { bg: "#FEF2F2", text: "#DC2626" },
  home:     { bg: "#FFFBEB", text: "#D97706" },
  creative: { bg: "#F0FDFA", text: "#0D9488" },
};

const SWIPE_START_THRESHOLD = 90;
const SWIPE_DELETE_THRESHOLD = -90;

interface TaskCardProps {
  task: Task;
  position: number;
  onActionComplete?: () => void;
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    wrapper: { position: "relative" },
    actionBackground: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, paddingHorizontal: 20, justifyContent: "center" },
    startBackground: { backgroundColor: t.accent, alignItems: "flex-start" },
    deleteBackground: { backgroundColor: "#F87171", alignItems: "flex-end" },
    actionLabel: { fontFamily: F.semibold, color: "#fff", fontSize: 14 },
    actionLabelRight: { textAlign: "right" },
    card: { backgroundColor: t.surface, borderRadius: 16, borderWidth: 2.5, borderColor: t.borderInput, borderStyle: "dotted", padding: 16, gap: 10 },
    cardDimmed: { opacity: 0.75 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    titleContainer: { flex: 1, justifyContent: "center" },
    titleInner: { alignSelf: "flex-start", maxWidth: "100%" },
    taskTitle: { fontSize: 17, fontFamily: F.semibold, color: t.text, lineHeight: 22 },
    taskTitleMuted: { color: t.textMuted },
    strikeLine: { position: "absolute", height: 1.5, backgroundColor: t.textMuted, top: 11, left: 0 },
    squircle: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: t.accent, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    squircleFilled: { backgroundColor: t.accent, borderColor: t.accent },
    checkmark: { fontFamily: F.bold, color: "#fff", fontSize: 12, lineHeight: 13 },
    removeIcon: { fontSize: 22, fontFamily: F.regular, color: t.textFaint, lineHeight: 24 },
    typeBadge: { alignSelf: "flex-start", marginLeft: 34, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    typeBadgeLabel: { fontSize: 11, fontFamily: F.medium },
    markDoneButton: { marginLeft: 34, marginTop: 4, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: t.border },
    markDoneLabel: { fontSize: 12, fontFamily: F.regular, color: t.textMuted },
    firstActionText: { paddingLeft: 34, fontSize: 13, fontFamily: F.regular, color: t.textMuted },
  });

export function TaskCard({ task, position, onActionComplete }: TaskCardProps) {
  const { startTask, completeTask, removeTask } = useTaskStore();
  const scale = useFontScale();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [titleWidth, setTitleWidth] = useState(0);

  const hasBeenStarted = task.startedAt !== null;

  const swipeX = useSharedValue(0);
  const checkScale = useSharedValue(hasBeenStarted ? 1 : 0);
  const strikeProgress = useSharedValue(hasBeenStarted ? 1 : 0);

  useEffect(() => {
    if (hasBeenStarted) {
      checkScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
      strikeProgress.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) });
    }
  }, [hasBeenStarted]);

  const onSwipedRightToStart = () => {
    if (hasBeenStarted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTask(task.id);
    onActionComplete?.();
  };

  const onSwipedLeftToDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeTask(task.id);
    onActionComplete?.();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .onUpdate((e) => { swipeX.value = e.translationX; })
    .onEnd((e) => {
      if (e.translationX >= SWIPE_START_THRESHOLD) {
        swipeX.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.quad) });
        runOnJS(onSwipedRightToStart)();
      } else if (e.translationX <= SWIPE_DELETE_THRESHOLD) {
        swipeX.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.quad) });
        runOnJS(onSwipedLeftToDelete)();
      } else {
        swipeX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeX.value }],
  }));

  const startRevealStyle = useAnimatedStyle(() => ({
    opacity: interpolate(swipeX.value, [0, SWIPE_START_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const deleteRevealStyle = useAnimatedStyle(() => ({
    opacity: interpolate(swipeX.value, [SWIPE_DELETE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const strikeAnimatedStyle = useAnimatedStyle(() => ({
    width: strikeProgress.value * titleWidth,
  }));

  const pressStartCircle = () => {
    if (hasBeenStarted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTask(task.id);
    onActionComplete?.();
  };

  const pressMarkDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeTask(task.id);
    onActionComplete?.();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(position * 60).duration(380)}
      exiting={FadeOutUp.duration(180)}
      layout={LinearTransition.duration(260)}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.actionBackground, styles.startBackground, startRevealStyle]}>
        <Text style={styles.actionLabel}>→ start</Text>
      </Animated.View>

      <Animated.View style={[styles.actionBackground, styles.deleteBackground, deleteRevealStyle]}>
        <Text style={[styles.actionLabel, styles.actionLabelRight]}>delete ←</Text>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, hasBeenStarted && styles.cardDimmed, cardAnimatedStyle]}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={pressStartCircle} hitSlop={8}>
              <View style={[styles.squircle, hasBeenStarted && styles.squircleFilled]}>
                <Animated.Text style={[styles.checkmark, checkAnimatedStyle]}>✓</Animated.Text>
              </View>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <View
                style={styles.titleInner}
                onLayout={(e) => setTitleWidth(e.nativeEvent.layout.width)}
              >
                <Text
                  style={[styles.taskTitle, hasBeenStarted && styles.taskTitleMuted, { fontSize: scale * 17, lineHeight: scale * 22 }]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <Animated.View style={[styles.strikeLine, strikeAnimatedStyle]} />
              </View>
            </View>

            <TouchableOpacity onPress={() => removeTask(task.id)} hitSlop={8}>
              <Text style={styles.removeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {task.taskType && (() => {
            const color = TYPE_COLORS[task.taskType] ?? { bg: "#F3F4F6", text: "#6B7280" };
            const badgeBg = theme.isDark ? color.text + "22" : color.bg;
            return (
              <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.typeBadgeLabel, { color: color.text }]}>{task.taskType}</Text>
              </View>
            );
          })()}

          {task.firstAction ? (
            <Text style={[styles.firstActionText, { fontSize: scale * 13 }]}>
              → {task.firstAction}
            </Text>
          ) : null}

          {hasBeenStarted && (
            <TouchableOpacity style={styles.markDoneButton} onPress={pressMarkDone}>
              <Text style={styles.markDoneLabel}>mark done</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
