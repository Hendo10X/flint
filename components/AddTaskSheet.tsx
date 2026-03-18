import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useTaskStore } from "@/store/tasks";

interface AddTaskSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTaskSheet({ visible, onClose }: AddTaskSheetProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const [titleDraft, setTitleDraft] = useState("");

  const submitNewTask = () => {
    if (!titleDraft.trim()) return;
    addTask(titleDraft.trim());
    setTitleDraft("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.prompt}>what's the task?</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="e.g. write the report"
            placeholderTextColor="#D1D5DB"
            value={titleDraft}
            onChangeText={setTitleDraft}
            autoFocus
            onSubmitEditing={submitNewTask}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={submitNewTask}>
            <Text style={styles.addButtonLabel}>add</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  prompt: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  titleInput: {
    fontSize: 16,
    color: "#111",
    borderBottomWidth: 1.5,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 8,
  },
  addButton: {
    backgroundColor: "#F97316",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  addButtonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
