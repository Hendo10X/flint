import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Envelope,
  Palette,
  TextT,
  Bell,
  Lock,
  SignOut,
  CaretRight,
  Check,
} from "phosphor-react-native";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { useSettingsStore, useFontScale, FontSizeKey, FONT_SIZE_LABELS, FONT_SCALE } from "@/store/settings";
import { F } from "@/constants/fonts";

type PhosphorIcon = React.ComponentType<{ size?: number; color?: string; weight?: string }>;

const FONT_SIZE_OPTIONS: { key: FontSizeKey; description: string }[] = [
  { key: "small", description: "Compact — fits more on screen" },
  { key: "medium", description: "Default — balanced and clear" },
  { key: "large", description: "Roomier — easier to read" },
];

function InitialAvatar({ name }: { name: string }) {
  const initial = name?.trim().charAt(0).toUpperCase() ?? "?";
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onPress,
  destructive = false,
  disabled = false,
  showChevron = true,
}: {
  icon: PhosphorIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={disabled}
    >
      <View style={[styles.rowIcon, destructive && styles.rowIconDestructive]}>
        <Icon
          size={18}
          color={destructive ? "#EF4444" : "#6B7280"}
          weight="regular"
        />
      </View>
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
        {label}
      </Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {showChevron && !destructive && onPress ? (
        <CaretRight size={16} color="#D1D5DB" weight="regular" />
      ) : null}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function SettingsScreen() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const { fontSizeKey, setFontSize } = useSettingsStore();
  const scale = useFontScale();

  // Name modal
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [nameFocused, setNameFocused] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Font size modal
  const [fontModalOpen, setFontModalOpen] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  const openNameModal = () => {
    setNameDraft(user?.name ?? "");
    setNameError(null);
    setNameModalOpen(true);
  };

  const saveName = async () => {
    if (!nameDraft.trim()) {
      setNameError("Name cannot be empty");
      return;
    }
    if (nameDraft.trim() === user?.name) {
      setNameModalOpen(false);
      return;
    }
    setSavingName(true);
    setNameError(null);
    const { error } = await authClient.updateUser({ name: nameDraft.trim() });
    setSavingName(false);
    if (error) {
      setNameError(error.message ?? "Failed to update name");
      return;
    }
    setNameModalOpen(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          await authClient.signOut();
          router.replace("/(auth)/sign-in" as any);
        },
      },
    ]);
  };

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.screenTitle, { fontSize: scale * 26 }]}>settings</Text>

        <View style={styles.profileCard}>
          <InitialAvatar name={user?.name ?? ""} />
          <View style={styles.profileText}>
            <Text style={[styles.profileName, { fontSize: scale * 17 }]}>{user?.name ?? "—"}</Text>
            <Text style={[styles.profileEmail, { fontSize: scale * 13 }]}>{user?.email ?? "—"}</Text>
          </View>
        </View>

        <SectionHeader title="profile" />
        <View style={styles.card}>
          <SettingsRow
            icon={User}
            label="name"
            value={firstName}
            onPress={openNameModal}
          />
          <Divider />
          <SettingsRow
            icon={Envelope}
            label="email"
            value={user?.email ?? "—"}
            showChevron={false}
            disabled
          />
        </View>

        <SectionHeader title="appearance" />
        <View style={styles.card}>
          <SettingsRow
            icon={Palette}
            label="theme"
            value="coming soon"
            showChevron={false}
            disabled
          />
          <Divider />
          <SettingsRow
            icon={TextT}
            label="font size"
            value={FONT_SIZE_LABELS[fontSizeKey]}
            onPress={() => setFontModalOpen(true)}
          />
        </View>

        <SectionHeader title="notifications" />
        <View style={styles.card}>
          <SettingsRow
            icon={Bell}
            label="reminders"
            value="coming soon"
            showChevron={false}
            disabled
          />
        </View>

        <SectionHeader title="account" />
        <View style={styles.card}>
          <SettingsRow
            icon={Lock}
            label="change password"
            value="coming soon"
            showChevron={false}
            disabled
          />
          <Divider />
          <SettingsRow
            icon={SignOut}
            label={signingOut ? "signing out…" : "sign out"}
            onPress={handleSignOut}
            destructive
            showChevron={false}
            disabled={signingOut}
          />
        </View>

        <Text style={styles.version}>flint v1.0.0</Text>
      </ScrollView>

      {/* ── Name Modal ── */}
      <Modal
        visible={nameModalOpen}
        transparent
        animationType="none"
        onRequestClose={() => setNameModalOpen(false)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>change name</Text>

            <TextInput
              style={[styles.modalInput, nameFocused && styles.modalInputFocused]}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="your name"
              placeholderTextColor="#C4C4C4"
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              onSubmitEditing={saveName}
            />

            {nameError ? (
              <Text style={styles.modalError}>{nameError}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setNameModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelLabel}>cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, savingName && styles.modalSaveDisabled]}
                onPress={saveName}
                activeOpacity={0.85}
                disabled={savingName}
              >
                {savingName ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveLabel}>save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Font Size Modal ── */}
      <Modal
        visible={fontModalOpen}
        transparent
        animationType="none"
        onRequestClose={() => setFontModalOpen(false)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>text size</Text>
            <Text style={styles.modalSubtitle}>
              Adjusts text throughout the app.
            </Text>

            <View style={styles.fontOptions}>
              {FONT_SIZE_OPTIONS.map((opt, i) => {
                const active = fontSizeKey === opt.key;
                const previewSize = 15 * FONT_SCALE[opt.key];
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.fontOption, active && styles.fontOptionActive]}
                    onPress={() => setFontSize(opt.key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.fontOptionLeft}>
                      <Text
                        style={[
                          styles.fontOptionLabel,
                          { fontSize: previewSize },
                          active && styles.fontOptionLabelActive,
                        ]}
                      >
                        {FONT_SIZE_LABELS[opt.key]}
                      </Text>
                      <Text style={styles.fontOptionDesc}>{opt.description}</Text>
                    </View>
                    {active && (
                      <View style={styles.fontOptionCheck}>
                        <Check size={14} color="#F97316" weight="bold" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalDone}
              onPress={() => setFontModalOpen(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalDoneLabel}>done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontFamily: F.bold,
    color: "#F97316",
    letterSpacing: -0.5,
    marginTop: 12,
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: F.bold,
    color: "#F97316",
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: F.semibold,
    color: "#111",
  },
  profileEmail: {
    fontFamily: F.regular,
    color: "#9CA3AF",
  },
  sectionHeader: {
    fontSize: 11,
    fontFamily: F.semibold,
    color: "#9CA3AF",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDestructive: {
    backgroundColor: "#FEF2F2",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: F.medium,
    color: "#111",
  },
  rowLabelDestructive: {
    color: "#EF4444",
  },
  rowValue: {
    fontSize: 14,
    fontFamily: F.regular,
    color: "#9CA3AF",
    maxWidth: 120,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginLeft: 60,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: F.regular,
    color: "#D1D5DB",
    marginTop: 36,
  },

  // ── Shared modal styles ──
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: F.bold,
    color: "#111",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: F.regular,
    color: "#9CA3AF",
    marginTop: -8,
  },
  modalInput: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: F.regular,
    color: "#111",
    backgroundColor: "#FAFAFA",
  },
  modalInputFocused: {
    borderColor: "#F97316",
    backgroundColor: "#fff",
  },
  modalError: {
    fontSize: 13,
    fontFamily: F.medium,
    color: "#EF4444",
    marginTop: -4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalCancel: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelLabel: {
    fontSize: 16,
    fontFamily: F.semibold,
    color: "#6B7280",
  },
  modalSave: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveDisabled: {
    opacity: 0.6,
  },
  modalSaveLabel: {
    fontSize: 16,
    fontFamily: F.bold,
    color: "#fff",
  },

  // ── Font size options ──
  fontOptions: {
    gap: 10,
  },
  fontOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  fontOptionActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  fontOptionLeft: {
    flex: 1,
    gap: 2,
  },
  fontOptionLabel: {
    fontFamily: F.semibold,
    color: "#374151",
  },
  fontOptionLabelActive: {
    color: "#F97316",
  },
  fontOptionDesc: {
    fontSize: 12,
    fontFamily: F.regular,
    color: "#9CA3AF",
  },
  fontOptionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Done button ──
  modalDone: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  modalDoneLabel: {
    fontSize: 16,
    fontFamily: F.bold,
    color: "#fff",
  },
});
