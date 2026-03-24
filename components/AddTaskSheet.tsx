import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { X } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { useTaskStore } from "@/store/tasks";
import { useFontScale } from "@/store/settings";
import { F } from "@/constants/fonts";

const TASK_TYPES = ["work", "school", "personal", "health", "home", "creative"];

const DIFFICULTY_OPTIONS = [
  { label: "easy", value: 1, color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
  { label: "medium", value: 2, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  { label: "hard", value: 3, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
];

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTaskSheet({ visible, onClose }: AddTaskSheetProps) {
  const addTask = useTaskStore((s) => s.addTask);
  const scale = useFontScale();

  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(16);

  const hasTitle = title.trim().length > 0;

  useEffect(() => {
    buttonOpacity.value = withTiming(hasTitle ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.quad),
    });
    buttonTranslateY.value = withTiming(hasTitle ? 0 : 16, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [hasTitle]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const reset = () => {
    setTitle("");
    setSelectedType(null);
    setSelectedDifficulty(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTask(title.trim(), selectedDifficulty, selectedType);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>new task</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
            <X size={18} color="#6B7280" weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title input */}
          <View style={styles.titleRow}>
            <View style={styles.titleAccent} />
            <TextInput
              style={[styles.titleInput, { fontSize: scale * 30, lineHeight: scale * 38 }]}
              placeholder="Task title"
              placeholderTextColor="#D1D5DB"
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              multiline
              maxLength={120}
            />
          </View>

          {/* Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TYPE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {TASK_TYPES.map((type) => {
                const active = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() => setSelectedType(active ? null : type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeChipLabel, active && styles.typeChipLabelActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HOW HARD IS IT TO START?</Text>
            <View style={styles.diffRow}>
              {DIFFICULTY_OPTIONS.map((opt) => {
                const active = selectedDifficulty === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.diffChip,
                      {
                        borderColor: active ? opt.border : "#E5E7EB",
                        backgroundColor: active ? opt.bg : "#F9FAFB",
                      },
                    ]}
                    onPress={() => setSelectedDifficulty(active ? null : opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.diffLabel, { color: active ? opt.color : "#9CA3AF" }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Add button — slides in when title is typed */}
        <Animated.View style={[styles.footer, buttonAnimStyle]}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!hasTitle}
          >
            <Text style={styles.addLabel}>add task</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: F.semibold,
    color: "#111",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 36,
  },

  // Title
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  titleAccent: {
    width: 3.5,
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: "#F97316",
    marginTop: 6,
  },
  titleInput: {
    flex: 1,
    fontSize: 30,
    fontFamily: F.semibold,
    color: "#111",
    lineHeight: 38,
    letterSpacing: -0.5,
    paddingTop: 0,
    paddingBottom: 0,
  },

  // Sections
  section: {
    gap: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: F.semibold,
    color: "#9CA3AF",
    letterSpacing: 1.4,
  },

  // Type chips
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  typeChipActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  typeChipLabel: {
    fontSize: 14,
    fontFamily: F.medium,
    color: "#6B7280",
  },
  typeChipLabelActive: {
    color: "#F97316",
  },

  // Difficulty
  diffRow: {
    flexDirection: "row",
    gap: 12,
  },
  diffChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  diffLabel: {
    fontSize: 15,
    fontFamily: F.semibold,
  },

  // Footer button
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
  },
  addBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    fontSize: 17,
    fontFamily: F.bold,
    color: "#fff",
  },
});
