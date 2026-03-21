import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { BottomSheet, Input, TextField, Label } from "heroui-native";
import { useTaskStore } from "@/store/tasks";
import { F } from "@/constants/fonts";

const TASK_TYPES = ["work", "school", "personal", "health", "home", "creative"];

const DIFFICULTY_OPTIONS = [
  { label: "easy", value: 1 },
  { label: "medium", value: 2 },
  { label: "hard", value: 3 },
];

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTaskSheet({ visible, onClose }: AddTaskSheetProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const [titleDraft, setTitleDraft] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  const resetAndClose = () => {
    setTitleDraft("");
    setSelectedType(null);
    setSelectedDifficulty(null);
    onClose();
  };

  const submitNewTask = () => {
    if (!titleDraft.trim()) return;
    addTask(titleDraft.trim(), selectedDifficulty, selectedType);
    resetAndClose();
  };

  return (
    <BottomSheet isOpen={visible} onOpenChange={(open) => !open && resetAndClose()}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content contentContainerClassName="px-6 pb-10">
          <View style={styles.fieldGroup}>
            <BottomSheet.Title className="text-2xl font-bold">
              what's the task?
            </BottomSheet.Title>

            <TextField>
              <Label className="text-base">task name</Label>
              <Input
                className="text-base"
                placeholder="e.g. write the report"
                placeholderTextColor="#9CA3AF"
                value={titleDraft}
                onChangeText={setTitleDraft}
                autoFocus
                onSubmitEditing={submitNewTask}
                returnKeyType="done"
              />
            </TextField>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
              <View style={styles.badgeRow}>
                {TASK_TYPES.map((type) => {
                  const isActive = selectedType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[styles.badge, isActive && styles.badgeActive]}
                      onPress={() => setSelectedType(isActive ? null : type)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.badgeLabel, isActive && styles.badgeLabelActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>how hard is it to start?</Text>
            <View style={styles.difficultyRow}>
              {DIFFICULTY_OPTIONS.map((opt) => {
                const isActive = selectedDifficulty === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.difficultyChip, isActive && styles.difficultyChipActive]}
                    onPress={() => setSelectedDifficulty(isActive ? null : opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.difficultyLabel, isActive && styles.difficultyLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetAndClose} activeOpacity={0.7}>
              <Text style={styles.cancelLabel}>cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={submitNewTask} activeOpacity={0.8}>
              <Text style={styles.addLabel}>add task</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: F.semibold,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgeScroll: {
    marginHorizontal: -4,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  badgeActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  badgeLabel: {
    fontSize: 14,
    fontFamily: F.medium,
    color: "#6B7280",
  },
  badgeLabelActive: {
    color: "#F97316",
  },
  difficultyRow: {
    flexDirection: "row",
    gap: 10,
  },
  difficultyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  difficultyChipActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  difficultyLabel: {
    fontSize: 14,
    fontFamily: F.semibold,
    color: "#6B7280",
  },
  difficultyLabelActive: {
    color: "#F97316",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLabel: {
    fontSize: 16,
    fontFamily: F.semibold,
    color: "#6B7280",
    textAlign: "center",
  },
  addButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    fontSize: 16,
    fontFamily: F.bold,
    color: "#fff",
    textAlign: "center",
  },
});
