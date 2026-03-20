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
import { DifficultyDots } from "@/components/DifficultyDots";

const SWIPE_START_THRESHOLD = 90;
const SWIPE_DELETE_THRESHOLD = -90;

interface TaskCardProps {
  task: Task;
  position: number;
}

export function TaskCard({ task, position }: TaskCardProps) {
  const { setDifficulty, startTask, completeTask, removeTask, setFirstAction } =
    useTaskStore();

  const [isEditingFirstAction, setIsEditingFirstAction] = useState(false);
  const [firstActionDraft, setFirstActionDraft] = useState(task.firstAction ?? "");
  const [titleWidth, setTitleWidth] = useState(0);

  const hasBeenStarted = task.startedAt !== null;
  const hasBeenRated = task.difficulty !== null;

  const swipeX = useSharedValue(0);
  const checkScale = useSharedValue(hasBeenStarted ? 1 : 0);
  const strikeProgress = useSharedValue(hasBeenStarted ? 1 : 0);

  useEffect(() => {
    if (hasBeenStarted) {
      checkScale.value = withSpring(1, { damping: 14, stiffness: 260 });
      strikeProgress.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [hasBeenStarted]);

  const onSwipedRightToStart = () => {
    if (hasBeenStarted) return;
    if (!hasBeenRated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
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
    if (!hasBeenRated) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
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
        <Text style={styles.actionLabel}>
          {hasBeenRated ? "→ start" : "rate first →"}
        </Text>
      </Animated.View>

      <Animated.View style={[styles.actionBackground, styles.deleteBackground, deleteRevealStyle]}>
        <Text style={[styles.actionLabel, styles.actionLabelRight]}>delete ←</Text>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, hasBeenStarted && styles.cardDimmed, cardAnimatedStyle]}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={pressStartCircle} hitSlop={8}>
              <Animated.View style={[styles.startCircle, hasBeenStarted && styles.startCircleActive]}>
                <Animated.Text style={[styles.checkmark, checkAnimatedStyle]}>✓</Animated.Text>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text
                style={[styles.taskTitle, hasBeenStarted && styles.taskTitleMuted]}
                numberOfLines={2}
                onLayout={(e) => setTitleWidth(e.nativeEvent.layout.width)}
              >
                {task.title}
              </Text>
              <Animated.View style={[styles.strikeLine, strikeAnimatedStyle]} />
            </View>

            <TouchableOpacity onPress={() => removeTask(task.id)} hitSlop={8}>
              <Text style={styles.removeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.difficultyRow}>
            <Text style={styles.difficultyLabel}>
              {hasBeenRated ? "to start" : "how hard to start?"}
            </Text>
            <DifficultyDots
              selectedLevel={task.difficulty}
              onSelectLevel={(level) => setDifficulty(task.id, level)}
            />
          </View>

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
              <Text style={styles.firstActionText}>⚡ {task.firstAction}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingFirstAction(true)}>
              <Text style={styles.firstActionPrompt}>⚡ set first spark</Text>
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
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  actionLabelRight: {
    textAlign: "right",
  },
  card: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
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
  startCircle: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  startCircleActive: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 13,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "600",
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
  removeIcon: {
    fontSize: 22,
    color: "#D1D5DB",
    fontWeight: "300",
    lineHeight: 24,
  },
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 34,
  },
  difficultyLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  firstActionText: {
    paddingLeft: 34,
    fontSize: 13,
    color: "#F97316",
    fontWeight: "500",
  },
  firstActionPrompt: {
    paddingLeft: 34,
    fontSize: 13,
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
    color: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#F97316",
    paddingVertical: 2,
  },
  firstActionSaveLabel: {
    fontSize: 13,
    color: "#F97316",
    fontWeight: "600",
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
    color: "#9CA3AF",
  },
});
