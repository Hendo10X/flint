import { useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient, getBaseURL } from "@/lib/auth-client";
import { F } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/constants/themes";

const BAR_MAX_HEIGHT = 72;

interface StatsData {
  currentStreak: number;
  longestStreak: number;
  weekStarted: number;
  weekCompleted: number;
  dailyActivity: { date: string; day: string; started: number }[];
  avgDifficulty: number;
}

const EMPTY_STATS: StatsData = {
  currentStreak: 0,
  longestStreak: 0,
  weekStarted: 0,
  weekCompleted: 0,
  dailyActivity: ["M", "T", "W", "T", "F", "S", "S"].map((day) => ({
    date: "",
    day,
    started: 0,
  })),
  avgDifficulty: 0,
};

const createStyles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
    screenTitle: {
      fontSize: 26,
      fontFamily: F.bold,
      color: t.accent,
      letterSpacing: -0.5,
      marginTop: 12,
      marginBottom: 24,
    },
    sectionHeader: {
      fontSize: 12,
      fontFamily: F.semibold,
      color: t.textMuted,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 10,
      marginTop: 24,
    },
    cardRow: { flexDirection: "row", gap: 10 },
    statCard: {
      flex: 1,
      backgroundColor: t.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      padding: 20,
      alignItems: "center",
      gap: 4,
    },
    statValue: {
      fontSize: 42,
      fontFamily: F.bold,
      color: t.text,
      letterSpacing: -1,
    },
    statLabel: {
      fontSize: 13,
      fontFamily: F.medium,
      color: t.textMuted,
    },
    barChartCard: {
      backgroundColor: t.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      padding: 20,
    },
    barChart: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      height: BAR_MAX_HEIGHT + 40,
    },
    barColumn: { flex: 1, alignItems: "center", gap: 6 },
    barCount: {
      fontSize: 11,
      fontFamily: F.medium,
      color: t.textMuted,
      height: 16,
    },
    barTrack: { flex: 1, width: "60%", justifyContent: "flex-end" },
    barFill: { width: "100%", backgroundColor: t.accent, borderRadius: 4 },
    barFillEmpty: { backgroundColor: t.border },
    barDay: { fontSize: 12, fontFamily: F.medium, color: t.textMuted },
    avgDifficultyCard: {
      backgroundColor: t.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      padding: 20,
      gap: 12,
    },
    difficultyDotsRow: { flexDirection: "row", gap: 8 },
    difficultyDot: { width: 16, height: 16, borderRadius: 8 },
    difficultyDotFilled: { backgroundColor: t.accent },
    difficultyDotEmpty: { backgroundColor: t.borderInput },
    avgDifficultyNote: {
      fontSize: 13,
      fontFamily: F.regular,
      color: t.textMuted,
      lineHeight: 18,
    },
    insightCard: {
      marginTop: 24,
      backgroundColor: t.accentBg,
      borderRadius: 16,
      padding: 20,
    },
    insightText: {
      fontSize: 15,
      fontFamily: F.medium,
      color: t.accent,
      lineHeight: 22,
    },
  });

function StatCard({ value, label }: { value: string | number; label: string }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const theme = useTheme();
  const styles = createStyles(theme);
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function AnimatedBar({
  targetHeight,
  isEmpty,
  index,
  triggered,
}: {
  targetHeight: number;
  isEmpty: boolean;
  index: number;
  triggered: boolean;
}) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const height = useSharedValue(0);

  useEffect(() => {
    if (triggered) {
      height.value = withDelay(
        index * 55,
        withTiming(Math.max(targetHeight, isEmpty ? 0 : 4), {
          duration: 420,
          easing: Easing.out(Easing.cubic),
        })
      );
    } else {
      height.value = 0;
    }
  }, [triggered, targetHeight]);

  const animStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[styles.barFill, isEmpty && styles.barFillEmpty, animStyle]}
    />
  );
}

export default function StatsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    }, [])
  );

  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: async () => {
      const cookies = authClient.getCookie?.();
      const res = await fetch(`${getBaseURL()}/api/stats`, {
        headers: cookies ? { Cookie: cookies } : {},
        credentials: "omit",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  const stats = data ?? EMPTY_STATS;
  const maxDailyStarts = Math.max(...stats.dailyActivity.map((d) => d.started), 1);
  const hasData = !isLoading && !!data;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style={theme.statusBar === "light-content" ? "light" : "dark"} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>stats</Text>

        {isLoading && (
          <ActivityIndicator color={theme.accent} style={{ marginBottom: 16 }} />
        )}

        <SectionHeader title="streak" />
        <View style={styles.cardRow}>
          <StatCard value={stats.currentStreak} label="day streak" />
          <StatCard value={stats.longestStreak} label="longest ever" />
        </View>

        <SectionHeader title="this week" />
        <View style={styles.cardRow}>
          <StatCard value={stats.weekStarted} label="tasks started" />
          <StatCard value={stats.weekCompleted} label="completed" />
        </View>

        <SectionHeader title="daily activity" />
        <View style={styles.barChartCard}>
          <View style={styles.barChart}>
            {stats.dailyActivity.map((item, index) => {
              const barHeight = (item.started / maxDailyStarts) * BAR_MAX_HEIGHT;
              const isEmpty = item.started === 0;
              return (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barCount}>{item.started > 0 ? item.started : ""}</Text>
                  <View style={styles.barTrack}>
                    <AnimatedBar
                      targetHeight={barHeight}
                      isEmpty={isEmpty}
                      index={index}
                      triggered={hasData}
                    />
                  </View>
                  <Text style={styles.barDay}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <SectionHeader title="avg difficulty to start" />
        <View style={styles.avgDifficultyCard}>
          <View style={styles.difficultyDotsRow}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[
                  styles.difficultyDot,
                  level <= Math.round(stats.avgDifficulty)
                    ? styles.difficultyDotFilled
                    : styles.difficultyDotEmpty,
                ]}
              />
            ))}
          </View>
          <Text style={styles.avgDifficultyNote}>
            {stats.avgDifficulty.toFixed(1)} out of 3 — you pick manageable tasks
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            you started {stats.weekStarted} tasks this week.{"\n"}
            for ADHD brains, starting is the real win. 🔥
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
