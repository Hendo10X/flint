import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Flame } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useTaskStore, sortedActive, Task } from "@/store/tasks";
import { TaskCard } from "@/components/TaskCard";
import { authClient } from "@/lib/auth-client";
import { useFontScale } from "@/store/settings";
import { F } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/constants/themes";

const MAX_VISIBLE_TASKS = 3;
const POPOVER_WIDTH = 230;
const SCREEN_WIDTH = Dimensions.get("window").width;

const DIFFICULTY_LABEL: Record<number, string> = {
  1: "easy",
  2: "medium",
  3: "hard",
};

// ─── Streak messages ────────────────────────────────────────────────────────

interface StreakMsg {
  min: number;
  title: string;
  body: string;
  emoji: string;
}

const STREAK_MESSAGES: StreakMsg[] = [
  { min: 100, title: "100-Day Legend", body: "Triple digits. At this point you don't use Flint — Flint uses you.", emoji: "🏆" },
  { min: 75, title: "Unstoppable", body: "75 days. Scientists are studying you. They don't understand you either.", emoji: "🔬" },
  { min: 50, title: "50 Days?!", body: "Fifty days straight. Flint is basically your personality now. We're honored.", emoji: "🤯" },
  { min: 30, title: "One Month Strong", body: "A full month. Most people quit on day 3. You are not most people.", emoji: "💪" },
  { min: 21, title: "Habit Unlocked", body: "21 days — science says it's a habit now. Science also said Pluto was a planet, but still.", emoji: "🧠" },
  { min: 15, title: "Halfway to a Month", body: "15 days. You've built more momentum than a boulder rolling downhill. Do NOT stop.", emoji: "🪨" },
  { min: 10, title: "Double Digits", body: "10 days. You've outlasted most New Year's resolutions by about 355 days.", emoji: "🎯" },
  { min: 7, title: "One Full Week", body: "A whole week without breaking the chain. Your future self says thanks. Probably.", emoji: "📅" },
  { min: 5, title: "Five Days In", body: "Top 40% of people who said they'd be consistent. The bar is low. You're clearing it.", emoji: "✨" },
  { min: 3, title: "Hat Trick", body: "Three days. That's longer than most gym resolutions last. You're basically an athlete.", emoji: "🎩" },
  { min: 2, title: "Two Days Running", body: "Yesterday wasn't a fluke. Something is happening here. Don't overthink it.", emoji: "👀" },
  { min: 1, title: "Just Getting Started", body: "Day one. The hardest part was opening the app. You're practically done already.", emoji: "🌱" },
];

function getStreakMessage(streak: number): StreakMsg {
  return STREAK_MESSAGES.find((m) => streak >= m.min) ?? STREAK_MESSAGES[STREAK_MESSAGES.length - 1];
}

function getDateLabel() {
  const now = new Date();
  const day = now.getDate();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  return `${day}, ${weekday}`;
}

// ─── Queue stack ─────────────────────────────────────────────────────────────

const createQueueStyles = (t: Theme) =>
  StyleSheet.create({
    stackWrapper: { marginTop: 2, paddingBottom: 14, position: "relative" },
    stackBack3: { position: "absolute", bottom: 0, left: 18, right: 18, height: 26, borderRadius: 12, backgroundColor: t.borderFaint, borderWidth: 1, borderColor: t.borderInput },
    stackBack2: { position: "absolute", bottom: 7, left: 9, right: 9, height: 26, borderRadius: 13, backgroundColor: t.surfaceAlt, borderWidth: 1, borderColor: t.border },
    stackFront: { backgroundColor: t.surface, borderRadius: 16, borderWidth: 1.5, borderColor: t.borderInput, padding: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    stackLeft: { flex: 1, gap: 2 },
    stackUpNext: { fontSize: 10, fontFamily: F.semibold, color: t.textMuted, letterSpacing: 1, textTransform: "uppercase" },
    stackTitle: { fontSize: 15, fontFamily: F.semibold, color: t.text },
    stackDifficulty: { fontSize: 12, fontFamily: F.regular, color: t.textFaint },
    stackBadge: { alignItems: "center", backgroundColor: t.surfaceAlt, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: t.border, minWidth: 52 },
    stackBadgeText: { fontSize: 17, fontFamily: F.bold, color: t.text, letterSpacing: -0.5 },
    stackBadgeLabel: { fontSize: 10, fontFamily: F.medium, color: t.textMuted, letterSpacing: 0.5 },
  });

function QueueStack({ tasks }: { tasks: Task[] }) {
  const theme = useTheme();
  const qStyles = createQueueStyles(theme);
  const count = tasks.length;
  const next = tasks[0];
  const showThird = count >= 3;
  const showSecond = count >= 2;

  return (
    <View style={qStyles.stackWrapper}>
      {showThird && <View style={qStyles.stackBack3} />}
      {showSecond && <View style={qStyles.stackBack2} />}
      <View style={qStyles.stackFront}>
        <View style={qStyles.stackLeft}>
          <Text style={qStyles.stackUpNext}>up next</Text>
          <Text style={qStyles.stackTitle} numberOfLines={1}>{next.title}</Text>
          {next.difficulty != null && (
            <Text style={qStyles.stackDifficulty}>{DIFFICULTY_LABEL[next.difficulty] ?? ""}</Text>
          )}
        </View>
        <View style={qStyles.stackBadge}>
          <Text style={qStyles.stackBadgeText}>+{count}</Text>
          <Text style={qStyles.stackBadgeLabel}>queued</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main screen styles ───────────────────────────────────────────────────────

const createStyles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
    headerLeft: { gap: 2 },
    appName: { fontFamily: F.bold, color: t.accent, letterSpacing: -0.5, marginBottom: 6 },
    greeting: { fontFamily: F.bold, color: t.text, letterSpacing: -0.5 },
    dateLabel: { fontFamily: F.medium, color: t.textMuted, marginTop: 2 },
    pendingLabel: { fontFamily: F.regular, color: t.textMuted, marginTop: 1 },
    streakBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: t.accentBg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 },
    streakLabel: { fontSize: 15, fontFamily: F.semibold, color: t.accent },
    taskList: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10 },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 32 },
    emptyStateHeading: { fontSize: 22, fontFamily: F.bold, color: t.text },
    emptyStateBody: { fontSize: 15, fontFamily: F.regular, color: t.textMuted, textAlign: "center", lineHeight: 22 },
    emptyStateAccent: { color: t.accent, fontFamily: F.bold },
    popover: { position: "absolute", width: POPOVER_WIDTH, backgroundColor: t.surface, borderRadius: 18, padding: 18, gap: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: t.border },
    caret: { position: "absolute", top: -7, width: 14, height: 7, backgroundColor: "transparent", borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 7, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: t.surface },
    popoverEmoji: { fontSize: 28, marginBottom: 2 },
    popoverTitle: { fontSize: 16, fontFamily: F.bold, color: t.text, letterSpacing: -0.3 },
    popoverBody: { fontSize: 13, fontFamily: F.regular, color: t.textSub, lineHeight: 19 },
    popoverFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: t.borderFaint },
    popoverStreak: { fontSize: 12, fontFamily: F.semibold, color: t.accent },
  });

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function TasksScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const { tasks, streak, loadTasks } = useTaskStore();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const scale = useFontScale();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const badgeRef = useRef<View>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (session?.user?.id) loadTasks();
  }, [session?.user?.id]);

  const activeTasks = sortedActive(tasks);
  const visibleTasks = activeTasks.slice(0, MAX_VISIBLE_TASKS);
  const queuedTasks = activeTasks.slice(MAX_VISIBLE_TASKS);
  const hasQueuedTasks = queuedTasks.length > 0;
  const hasNoTasks = visibleTasks.length === 0;
  const hasStreak = streak > 0;
  const pendingCount = activeTasks.filter((t) => !t.startedAt).length;

  const handleStreakPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    badgeRef.current?.measureInWindow((x, y, width, height) => {
      setPopoverAnchor({ x, y, width, height });
      setPopoverVisible(true);
    });
  };

  const popoverLeft = Math.min(
    Math.max(popoverAnchor.x + popoverAnchor.width / 2 - POPOVER_WIDTH / 2, 12),
    SCREEN_WIDTH - POPOVER_WIDTH - 12
  );
  const popoverTop = popoverAnchor.y + popoverAnchor.height + 10;
  const caretCenter = popoverAnchor.x + popoverAnchor.width / 2 - popoverLeft;
  const clampedCaretCenter = Math.max(16, Math.min(caretCenter, POPOVER_WIDTH - 16));
  const msg = getStreakMessage(streak);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style={theme.statusBar === "light-content" ? "light" : "dark"} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.appName, { fontSize: scale * 26 }]}>flint</Text>
          <Text style={[styles.greeting, { fontSize: scale * 26 }]}>Hello, {firstName}</Text>
          <Text style={[styles.dateLabel, { fontSize: scale * 15 }]}>{getDateLabel()}</Text>
          <Text style={[styles.pendingLabel, { fontSize: scale * 13 }]}>
            {pendingCount === 0 ? "No pending tasks" : `${pendingCount} pending task${pendingCount > 1 ? "s" : ""}`}
          </Text>
        </View>
        {hasStreak && (
          <TouchableOpacity onPress={handleStreakPress} activeOpacity={0.75} hitSlop={8}>
            <View ref={badgeRef} style={styles.streakBadge}>
              <Flame size={15} color={theme.accent} weight="fill" />
              <Text style={styles.streakLabel}>{streak}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.taskList}>
        {hasNoTasks ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateHeading}>all clear.</Text>
            <Text style={styles.emptyStateBody}>
              tap the{" "}<Text style={styles.emptyStateAccent}>+</Text>{" "}below to add a task.{"\n"}flint shows only what matters right now.
            </Text>
          </View>
        ) : (
          <>
            {visibleTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                position={index}
                onActionComplete={() => queryClient.invalidateQueries({ queryKey: ["stats"] })}
              />
            ))}
            {hasQueuedTasks && <QueueStack tasks={queuedTasks} />}
          </>
        )}
      </View>

      <Modal visible={popoverVisible} transparent animationType="none" onRequestClose={() => setPopoverVisible(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setPopoverVisible(false)} />
        <View style={[styles.popover, { top: popoverTop, left: popoverLeft }]}>
          <View style={[styles.caret, { left: clampedCaretCenter - 7 }]} />
          <Text style={styles.popoverEmoji}>{msg.emoji}</Text>
          <Text style={styles.popoverTitle}>{msg.title}</Text>
          <Text style={styles.popoverBody}>{msg.body}</Text>
          <View style={styles.popoverFooter}>
            <Flame size={12} color={theme.accent} weight="fill" />
            <Text style={styles.popoverStreak}>{streak} day{streak !== 1 ? "s" : ""} streak</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
