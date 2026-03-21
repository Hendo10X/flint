import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTaskStore } from "@/store/tasks";
import { F } from "@/constants/fonts";

const MOCK_LONGEST_STREAK = 14;
const MOCK_STARTED_THIS_WEEK = 11;
const MOCK_COMPLETED_THIS_WEEK = 8;
const MOCK_AVG_DIFFICULTY = 2.4;
const MOCK_DAILY_STARTS = [2, 3, 1, 0, 2, 1, 0];
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const BAR_MAX_HEIGHT = 72;

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function StatsScreen() {
  const { streak } = useTaskStore();
  const maxDailyStarts = Math.max(...MOCK_DAILY_STARTS, 1);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>stats</Text>

        <SectionHeader title="streak" />
        <View style={styles.cardRow}>
          <StatCard value={streak} label="day streak" />
          <StatCard value={MOCK_LONGEST_STREAK} label="longest ever" />
        </View>

        <SectionHeader title="this week" />
        <View style={styles.cardRow}>
          <StatCard value={MOCK_STARTED_THIS_WEEK} label="tasks started" />
          <StatCard value={MOCK_COMPLETED_THIS_WEEK} label="completed" />
        </View>

        <SectionHeader title="daily activity" />
        <View style={styles.barChartCard}>
          <View style={styles.barChart}>
            {MOCK_DAILY_STARTS.map((count, index) => {
              const barHeight = (count / maxDailyStarts) * BAR_MAX_HEIGHT;
              const isEmpty = count === 0;
              return (
                <View key={index} style={styles.barColumn}>
                  <Text style={styles.barCount}>{count > 0 ? count : ""}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: Math.max(barHeight, isEmpty ? 0 : 4) },
                        isEmpty && styles.barFillEmpty,
                      ]}
                    />
                  </View>
                  <Text style={styles.barDay}>{WEEK_DAYS[index]}</Text>
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
                  level <= Math.round(MOCK_AVG_DIFFICULTY)
                    ? styles.difficultyDotFilled
                    : styles.difficultyDotEmpty,
                ]}
              />
            ))}
          </View>
          <Text style={styles.avgDifficultyNote}>
            {MOCK_AVG_DIFFICULTY.toFixed(1)} out of 5 — you pick manageable tasks
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightText}>
            you started {MOCK_STARTED_THIS_WEEK} tasks this week.{"\n"}
            for ADHD brains, starting is the real win. 🔥
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 26,
    fontFamily: F.bold,
    color: "#F97316",
    letterSpacing: -0.5,
    marginTop: 12,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: F.semibold,
    color: "#9CA3AF",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 24,
  },
  cardRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 42,
    fontFamily: F.bold,
    color: "#111",
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: F.medium,
    color: "#9CA3AF",
  },
  barChartCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 20,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: BAR_MAX_HEIGHT + 40,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barCount: {
    fontSize: 11,
    fontFamily: F.medium,
    color: "#9CA3AF",
    height: 16,
  },
  barTrack: {
    flex: 1,
    width: "60%",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#F97316",
    borderRadius: 4,
  },
  barFillEmpty: {
    backgroundColor: "#F0F0F0",
    height: 3,
  },
  barDay: {
    fontSize: 12,
    fontFamily: F.medium,
    color: "#9CA3AF",
  },
  avgDifficultyCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 20,
    gap: 12,
  },
  difficultyDotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  difficultyDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  difficultyDotFilled: {
    backgroundColor: "#F97316",
  },
  difficultyDotEmpty: {
    backgroundColor: "#E5E7EB",
  },
  avgDifficultyNote: {
    fontSize: 13,
    fontFamily: F.regular,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  insightCard: {
    marginTop: 24,
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 20,
  },
  insightText: {
    fontSize: 15,
    fontFamily: F.medium,
    color: "#C2410C",
    lineHeight: 22,
  },
});
