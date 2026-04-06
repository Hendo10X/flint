import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/constants/themes";

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

const createStyles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    kav: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.borderFaint,
    },
    headerTitle: { fontSize: 17, fontFamily: F.semibold, color: t.text },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: t.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24, gap: 36 },
    titleInput: {
      fontSize: 28,
      fontFamily: F.semibold,
      color: t.text,
      lineHeight: 36,
      letterSpacing: -0.5,
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: 44,
    },
    section: { gap: 14 },
    sectionLabel: { fontSize: 11, fontFamily: F.semibold, color: t.textMuted, letterSpacing: 1.4 },
    chipRow: { flexDirection: "row", gap: 8 },
    typeChip: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 22,
      borderWidth: 1.5,
      borderColor: t.borderInput,
      backgroundColor: t.surfaceAlt,
    },
    typeChipActive: { borderColor: t.accent, backgroundColor: t.accentBg },
    typeChipLabel: { fontSize: 14, fontFamily: F.medium, color: t.textMuted },
    typeChipLabelActive: { color: t.accent },
    diffRow: { flexDirection: "row", gap: 12 },
    diffChip: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      alignItems: "center",
    },
    diffLabel: { fontSize: 15, fontFamily: F.semibold },
    sparkInput: {
      height: 48,
      borderWidth: 1.5,
      borderColor: t.borderInput,
      borderRadius: 14,
      paddingHorizontal: 16,
      fontSize: 15,
      fontFamily: F.regular,
      color: t.text,
      backgroundColor: t.surfaceAlt,
    },
    footer: { paddingHorizontal: 24, paddingBottom: 20, paddingTop: 12 },
    addBtn: {
      height: 56,
      borderRadius: 16,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    addLabel: { fontSize: 17, fontFamily: F.bold, color: "#fff" },
  });

export function AddTaskSheet({ visible, onClose }: AddTaskSheetProps) {
  const addTask = useTaskStore((s) => s.addTask);
  const scale = useFontScale();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [firstSpark, setFirstSpark] = useState("");

  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(16);

  const hasTitle = title.trim().length > 0;

  useEffect(() => {
    buttonOpacity.value = withTiming(hasTitle ? 1 : 0, { duration: 200, easing: Easing.out(Easing.quad) });
    buttonTranslateY.value = withTiming(hasTitle ? 0 : 16, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [hasTitle]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const reset = () => {
    setTitle("");
    setSelectedType(null);
    setSelectedDifficulty(null);
    setFirstSpark("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!title.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTask(title.trim(), selectedDifficulty, selectedType, firstSpark.trim() || null);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>new task</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} hitSlop={12}>
              <X size={18} color={theme.textMuted} weight="bold" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Title input */}
            <TextInput
              style={[styles.titleInput, { fontSize: scale * 28, lineHeight: scale * 36 }]}
              placeholder="what needs doing?"
              placeholderTextColor={theme.textFaint}
              value={title}
              onChangeText={setTitle}
              autoFocus
              returnKeyType="next"
              multiline
              maxLength={120}
            />

            {/* Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {TASK_TYPES.map((type) => {
                  const active = selectedType === type;
                  return (
                    <TouchableOpacity key={type} style={[styles.typeChip, active && styles.typeChipActive]} onPress={() => setSelectedType(active ? null : type)} activeOpacity={0.7}>
                      <Text style={[styles.typeChipLabel, active && styles.typeChipLabelActive]}>{type}</Text>
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
                        active
                          ? { borderColor: opt.border, backgroundColor: opt.bg }
                          : { borderColor: theme.borderInput, backgroundColor: theme.surfaceAlt },
                      ]}
                      onPress={() => setSelectedDifficulty(active ? null : opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.diffLabel, { color: active ? opt.color : theme.textMuted }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* First spark */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>FIRST SPARK</Text>
              <TextInput
                style={styles.sparkInput}
                placeholder="what's the tiniest first step? (optional)"
                placeholderTextColor={theme.textFaint}
                value={firstSpark}
                onChangeText={setFirstSpark}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                maxLength={120}
              />
            </View>
          </ScrollView>

          {/* Add button */}
          <Animated.View style={[styles.footer, buttonAnimStyle]}>
            <TouchableOpacity style={styles.addBtn} onPress={handleSubmit} activeOpacity={0.85} disabled={!hasTitle}>
              <Text style={styles.addLabel}>add task</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
