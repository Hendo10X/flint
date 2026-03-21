import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { GestureDetector, Gesture, TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTaskStore, Task } from "@/store/tasks";
import { F } from "@/constants/fonts";

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
}

export function TaskCard({ task, position }: TaskCardProps) {
  const { startTask, completeTask, removeTask, setFirstAction } = useTaskStore();

  const [isEditingFirstAction, setIsEditingFirstAction] = useState(false);
  const [firstActionDraft, setFirstActionDraft] = useState(task.firstAction ?? "");
  const [titleWidth, setTitleWidth] = useState(0);

  const hasBeenStarted = task.startedAt !== null;

  const swipeX = useSharedValue(0);
  const checkScale = useSharedValue(hasBeenStarted ? 1 : 0);
  const strikeProgress = useSharedValue(hasBeenStarted ? 1 : 0);

  useEffect(() => {
    if (hasBeenStarted) {
      checkScale.value = withSpring(1, { damping: 14, stiffness: 260 });
      strikeProgress.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [hasBeenStarted]);

  const onSwipedRightToStart = () => {
    if (hasBeenStarted) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTask(task.id);
  };

  const onSwipedLeftToDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removeTask(task.id);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .onUpdate((e) => {
      swipeX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX >= SWIPE_START_THRESHOLD) {
        swipeX.value = withSpring(0, { damping: 15 });
        runOnJS(onSwipedRightToStart)();
      } else if (e.translationX <= SWIPE_DELETE_THRESHOLD) {
        swipeX.value = withSpring(0, { damping: 15 });
        runOnJS(onSwipedLeftToDelete)();
      } else {
        swipeX.value = withSpring(0, { damping: 15 });
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
  };

  const pressMarkDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    completeTask(task.id);
  };

  const saveFirstAction = () => {
    if (firstActionDraft.trim()) setFirstAction(task.id, firstActionDraft.trim());
    setIsEditingFirstAction(false);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(position * 60).springify()}
      exiting={FadeOutUp.duration(200)}
      layout={LinearTransition.springify()}
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
                  style={[styles.taskTitle, hasBeenStarted && styles.taskTitleMuted]}
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
            return (
              <View style={[styles.typeBadge, { backgroundColor: color.bg }]}>
                <Text style={[styles.typeBadgeLabel, { color: color.text }]}>{task.taskType}</Text>
              </View>
            );
          })()}

          {isEditingFirstAction ? (
            <View style={styles.firstActionInputRow}>
              <TextInput
                style={styles.firstActionInput}
                value={firstActionDraft}
                onChangeText={setFirstActionDraft}
                placeholder="smallest first action..."
                placeholderTextColor="#D1D5DB"
                autoFocus
                onSubmitEditing={saveFirstAction}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={saveFirstAction}>
                <Text style={styles.firstActionSaveLabel}>save</Text>
              </TouchableOpacity>
            </View>
          ) : task.firstAction ? (
            <TouchableOpacity onPress={() => setIsEditingFirstAction(true)}>
              <Text style={styles.firstActionText}>{task.firstAction}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingFirstAction(true)}>
              <Text style={styles.firstActionPrompt}>set first spark</Text>
            </TouchableOpacity>
          )}

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

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  actionBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  startBackground: {
    backgroundColor: "#F97316",
    alignItems: "flex-start",
  },
  deleteBackground: {
    backgroundColor: "#F87171",
    alignItems: "flex-end",
  },
  actionLabel: {
    fontFamily: F.semibold,
    color: "#fff",
    fontSize: 14,
  },
  actionLabelRight: {
    textAlign: "right",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderStyle: "dotted",
    padding: 16,
    gap: 10,
  },
  cardDimmed: {
    opacity: 0.75,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleInner: {
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  taskTitle: {
    fontSize: 17,
    fontFamily: F.semibold,
    color: "#111",
    lineHeight: 22,
  },
  taskTitleMuted: {
    color: "#9CA3AF",
  },
  strikeLine: {
    position: "absolute",
    height: 1.5,
    backgroundColor: "#9CA3AF",
    top: 11,
    left: 0,
  },
  squircle: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  squircleFilled: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  checkmark: {
    fontFamily: F.bold,
    color: "#fff",
    fontSize: 12,
    lineHeight: 13,
  },
  removeIcon: {
    fontSize: 22,
    fontFamily: F.regular,
    color: "#D1D5DB",
    lineHeight: 24,
  },
  typeBadge: {
    alignSelf: "flex-start",
    marginLeft: 34,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeBadgeLabel: {
    fontSize: 11,
    fontFamily: F.medium,
  },
  markDoneButton: {
    marginLeft: 34,
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  markDoneLabel: {
    fontSize: 12,
    fontFamily: F.regular,
    color: "#9CA3AF",
  },
  firstActionText: {
    paddingLeft: 34,
    fontSize: 13,
    fontFamily: F.medium,
    color: "#F97316",
  },
  firstActionPrompt: {
    paddingLeft: 34,
    fontSize: 13,
    fontFamily: F.regular,
    color: "#D1D5DB",
  },
  firstActionInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 34,
    gap: 8,
  },
  firstActionInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.regular,
    color: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#F97316",
    paddingVertical: 2,
  },
  firstActionSaveLabel: {
    fontSize: 13,
    fontFamily: F.semibold,
    color: "#F97316",
  },
});
