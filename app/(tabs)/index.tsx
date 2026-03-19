import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTaskStore, sortedActive } from "@/store/tasks";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskSheet } from "@/components/AddTaskSheet";

const MAX_VISIBLE_TASKS = 3;

export default function TasksScreen() {
  const { tasks, streak } = useTaskStore();
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const activeTasks = sortedActive(tasks);
  const visibleTasks = activeTasks.slice(0, MAX_VISIBLE_TASKS);
  const queuedTaskCount = activeTasks.length - MAX_VISIBLE_TASKS;
  const hasQueuedTasks = queuedTaskCount > 0;
  const hasNoTasks = visibleTasks.length === 0;
  const hasStreak = streak > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.appName}>flint</Text>
        {hasStreak && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakLabel}>🔥 {streak}</Text>
          </View>
        )}
      </View>

      <View style={styles.taskList}>
        {hasNoTasks ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateHeading}>all clear.</Text>
            <Text style={styles.emptyStateBody}>
              add up to 3 tasks to get started.{"\n"}flint shows only what matters right now.
            </Text>
          </View>
        ) : (
          visibleTasks.map((task, index) => (
            <TaskCard key={task.id} task={task} position={index} />
          ))
        )}
      </View>

      {hasQueuedTasks && (
        <Text style={styles.queuedCountHint}>+{queuedTaskCount} more waiting</Text>
      )}

      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() => setAddSheetOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.addTaskButtonLabel}>+ add task</Text>
      </TouchableOpacity>

      <AddTaskSheet
        visible={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#F97316",
    letterSpacing: -0.5,
  },
  streakBadge: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  streakLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#F97316",
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyStateHeading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  emptyStateBody: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
  },
  queuedCountHint: {
    textAlign: "center",
    fontSize: 13,
    color: "#D1D5DB",
    marginBottom: 8,
  },
  addTaskButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    alignItems: "center",
  },
  addTaskButtonLabel: {
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
