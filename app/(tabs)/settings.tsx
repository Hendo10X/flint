import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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
  Flame,
  Lightning,
  Timer,
  TrendUp,
  Brain,
  Heart,
  Info,
} from "phosphor-react-native";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import {
  useSettingsStore,
  useFontScale,
  FontSizeKey,
  FONT_SIZE_LABELS,
  FONT_SCALE,
} from "@/store/settings";
import { F } from "@/constants/fonts";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/store/toast";
import {
  Theme,
  ThemeMode,
  LightAccent,
  DarkAccent,
  THEME_MODE_LABELS,
  LIGHT_ACCENT_LABELS,
  DARK_ACCENT_LABELS,
  LIGHT_ACCENT_COLORS,
  DARK_ACCENT_COLORS,
} from "@/constants/themes";

type PhosphorIcon = React.ComponentType<{ size?: number; color?: string; weight?: string }>;

const FONT_SIZE_OPTIONS: { key: FontSizeKey; description: string }[] = [
  { key: "small", description: "Compact — fits more on screen" },
  { key: "medium", description: "Default — balanced and clear" },
  { key: "large", description: "Roomier — easier to read" },
];

// ── Reanimated inline sheet (replaces transparent Modal) ─────────────────────

function Sheet({
  open,
  onClose,
  keyboard = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  keyboard?: boolean;
  children: React.ReactNode;
}) {
  const t = useTheme();
  const styles = createStyles(t);
  const [mounted, setMounted] = useState(false);
  const translateY = useSharedValue(800);
  const backdropOpacity = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Mount on open; unmount after exit animation
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      translateY.value = withTiming(800, { duration: 280 });
      backdropOpacity.value = withTiming(0, { duration: 280 }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [open]);

  // Start entry animation once mounted
  useEffect(() => {
    if (mounted && open) {
      translateY.value = withTiming(0, { duration: 280 });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [mounted]);

  if (!mounted) return null;

  const panel = (
    <Animated.View style={[styles.modalSheet, sheetStyle]}>
      {children}
    </Animated.View>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.sheetBackdrop, backdropStyle]}
        pointerEvents="auto"
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.sheetPositioner}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
        >
          {panel}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.sheetPositioner} pointerEvents="box-none">
          {panel}
        </View>
      )}
    </View>
  );
}

// ── Sub-components (each calls useTheme internally) ─────────────────────────

function InitialAvatar({ name }: { name: string }) {
  const t = useTheme();
  const styles = createStyles(t);
  const initial = name?.trim().charAt(0).toUpperCase() ?? "?";
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const t = useTheme();
  const styles = createStyles(t);
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
  const t = useTheme();
  const styles = createStyles(t);
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
          color={destructive ? "#EF4444" : t.textMuted}
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
        <CaretRight size={16} color={t.textFaint} weight="regular" />
      ) : null}
    </TouchableOpacity>
  );
}

function Divider() {
  const t = useTheme();
  const styles = createStyles(t);
  return <View style={styles.divider} />;
}

function AboutPillar({
  icon: Icon,
  color,
  bg,
  title,
  body,
}: {
  icon: PhosphorIcon;
  color: string;
  bg: string;
  title: string;
  body: string;
}) {
  const t = useTheme();
  const styles = createStyles(t);
  return (
    <View style={styles.pillar}>
      <View style={[styles.pillarIcon, { backgroundColor: bg }]}>
        <Icon size={20} color={color} weight="fill" />
      </View>
      <View style={styles.pillarText}>
        <Text style={styles.pillarTitle}>{title}</Text>
        <Text style={styles.pillarBody}>{body}</Text>
      </View>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const t = useTheme();
  const styles = createStyles(t);
  const { height: screenHeight } = useWindowDimensions();

  const { data: session } = authClient.useSession();
  const user = session?.user;

  const {
    fontSizeKey,
    setFontSize,
    themeMode,
    lightAccent,
    darkAccent,
    setThemeMode,
    setLightAccent,
    setDarkAccent,
  } = useSettingsStore();
  const scale = useFontScale();

  // Name modal
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [nameFocused, setNameFocused] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Font size modal
  const [fontModalOpen, setFontModalOpen] = useState(false);

  // Theme modal
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  const [signingOut, setSigningOut] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Compute the label shown in the settings row for the current theme
  const currentThemeLabel = (() => {
    const modeLabel = THEME_MODE_LABELS[themeMode];
    if (themeMode === "light") {
      return `${modeLabel} · ${LIGHT_ACCENT_LABELS[lightAccent]}`;
    }
    if (themeMode === "dark") {
      return `${modeLabel} · ${DARK_ACCENT_LABELS[darkAccent]}`;
    }
    return modeLabel;
  })();

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
    toast("Name updated.", "success");
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
      <StatusBar style={t.statusBar === "light-content" ? "light" : "dark"} />
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
            value={currentThemeLabel}
            onPress={() => setThemeModalOpen(true)}
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

        <SectionHeader title="about" />
        <View style={styles.card}>
          <SettingsRow
            icon={Info}
            label="about flint"
            onPress={() => setAboutModalOpen(true)}
          />
        </View>

        <Text style={styles.version}>flint v1.0.0</Text>
      </ScrollView>

      {/* ── Name Sheet ── */}
      <Sheet open={nameModalOpen} onClose={() => setNameModalOpen(false)} keyboard>
        <Text style={styles.modalTitle}>change name</Text>

        <TextInput
          style={[styles.modalInput, nameFocused && styles.modalInputFocused]}
          value={nameDraft}
          onChangeText={setNameDraft}
          placeholder="your name"
          placeholderTextColor={t.textFaint}
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
      </Sheet>

      {/* ── Theme Sheet ── */}
      <Sheet open={themeModalOpen} onClose={() => setThemeModalOpen(false)}>
        <Text style={styles.modalTitle}>theme</Text>

        {/* Mode cards */}
        <View style={styles.themeModeRow}>
          {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
            const active = themeMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.themeModeCard, active && styles.themeModeCardActive]}
                onPress={() => setThemeMode(mode)}
                activeOpacity={0.7}
              >
                <Text style={[styles.themeModeLabel, active && styles.themeModeLabelActive]}>
                  {THEME_MODE_LABELS[mode]}
                </Text>
                {active && (
                  <View style={styles.themeModeCheck}>
                    <Check size={12} color={t.accent} weight="bold" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Accent options */}
        {themeMode === "system" ? (
          <Text style={styles.themeSystemNote}>
            Follows your device setting. The accent colour adjusts automatically.
          </Text>
        ) : themeMode === "light" ? (
          <View style={styles.accentOptions}>
            <Text style={styles.accentLabel}>accent colour</Text>
            {(["orange", "lavender", "teal"] as LightAccent[]).map((accent) => {
              const active = lightAccent === accent;
              const dotColor = LIGHT_ACCENT_COLORS[accent];
              return (
                <TouchableOpacity
                  key={accent}
                  style={[styles.accentRow, active && styles.accentRowActive]}
                  onPress={() => setLightAccent(accent)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.accentDot, { backgroundColor: dotColor }]} />
                  <Text style={[styles.accentRowLabel, active && styles.accentRowLabelActive]}>
                    {LIGHT_ACCENT_LABELS[accent]}
                  </Text>
                  {active && (
                    <View style={styles.accentCheck}>
                      <Check size={12} color={t.accent} weight="bold" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.accentOptions}>
            <Text style={styles.accentLabel}>accent colour</Text>
            {(["orange", "lemon", "coral"] as DarkAccent[]).map((accent) => {
              const active = darkAccent === accent;
              const dotColor = DARK_ACCENT_COLORS[accent];
              return (
                <TouchableOpacity
                  key={accent}
                  style={[styles.accentRow, active && styles.accentRowActive]}
                  onPress={() => setDarkAccent(accent)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.accentDot, { backgroundColor: dotColor }]} />
                  <Text style={[styles.accentRowLabel, active && styles.accentRowLabelActive]}>
                    {DARK_ACCENT_LABELS[accent]}
                  </Text>
                  {active && (
                    <View style={styles.accentCheck}>
                      <Check size={12} color={t.accent} weight="bold" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={styles.modalDone}
          onPress={() => setThemeModalOpen(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.modalDoneLabel}>done</Text>
        </TouchableOpacity>
      </Sheet>

      {/* ── About Sheet ── */}
      <Sheet open={aboutModalOpen} onClose={() => setAboutModalOpen(false)}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.aboutScroll}
          style={{ maxHeight: screenHeight * 0.58 }}
        >
          {/* Logo lockup */}
          <View style={styles.aboutLogoRow}>
            <View style={styles.aboutFlameCircle}>
              <Flame size={32} color={t.accent} weight="fill" />
            </View>
            <View>
              <Text style={styles.aboutAppName}>flint</Text>
              <Text style={styles.aboutVersion}>version 1.0.0</Text>
            </View>
          </View>

          {/* Tagline */}
          <Text style={styles.aboutTagline}>
            Built for the beautifully distracted.
          </Text>

          {/* Main description */}
          <Text style={styles.aboutBody}>
            Most productivity apps are built for people who just need a
            gentle nudge. Flint is built for the rest of us — the ones
            who know exactly what needs to get done, but can't find the
            spark to actually start.
          </Text>
          <Text style={styles.aboutBody}>
            ADHD doesn't mean you're lazy, broken, or disorganised. It
            means your brain runs on a different kind of fuel. Flint
            hands you that fuel — one task, one moment, one streak at a
            time.
          </Text>

          {/* Pillars */}
          <Text style={styles.aboutPillarsTitle}>what makes flint different</Text>

          <View style={styles.aboutPillars}>
            <AboutPillar
              icon={Brain}
              color="#8B5CF6"
              bg="#F5F3FF"
              title="built around your brain"
              body="No overwhelming lists. No guilt trips. Flint shows you one task at a time so your brain doesn't have to negotiate with itself."
            />
            <AboutPillar
              icon={Lightning}
              color="#F59E0B"
              bg="#FFFBEB"
              title="friction-free capture"
              body="The moment a task pops into your head, get it out. Tap +, type it, done. No categories, no due dates, no faff."
            />
            <AboutPillar
              icon={Timer}
              color="#3B82F6"
              bg="#EFF6FF"
              title="a timer that doesn't judge"
              body="Reset it. Pause it. Start over. The Flint timer is your co-pilot, not your boss. Progress is progress."
            />
            <AboutPillar
              icon={TrendUp}
              color="#10B981"
              bg="#ECFDF5"
              title="streaks that build momentum"
              body="Every day you start something counts. Streaks in Flint are about showing up, not perfection."
            />
          </View>

          {/* Footer */}
          <View style={styles.aboutFooter}>
            <Heart size={14} color={t.accent} weight="fill" />
            <Text style={styles.aboutFooterText}>
              Made with love for the ADHD community.
            </Text>
          </View>
        </ScrollView>

        {/* Button always pinned at the bottom of the sheet */}
        <TouchableOpacity
          style={styles.modalDone}
          onPress={() => setAboutModalOpen(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.modalDoneLabel}>got it</Text>
        </TouchableOpacity>
      </Sheet>

      {/* ── Font Size Sheet ── */}
      <Sheet open={fontModalOpen} onClose={() => setFontModalOpen(false)}>
        <Text style={styles.modalTitle}>text size</Text>
        <Text style={styles.modalSubtitle}>
          Adjusts text throughout the app.
        </Text>

        <View style={styles.fontOptions}>
          {FONT_SIZE_OPTIONS.map((opt) => {
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
                    <Check size={14} color={t.accent} weight="bold" />
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
      </Sheet>
    </SafeAreaView>
  );
}

// ── Styles factory ───────────────────────────────────────────────────────────

const createStyles = (t: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: t.bg,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    screenTitle: {
      fontFamily: F.bold,
      color: t.accent,
      letterSpacing: -0.5,
      marginTop: 12,
      marginBottom: 24,
    },
    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.surface,
      borderRadius: 16,
      padding: 16,
      gap: 14,
      borderWidth: 1,
      borderColor: t.border,
      marginBottom: 8,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: t.accentBg,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: {
      fontSize: 22,
      fontFamily: F.bold,
      color: t.accent,
    },
    profileText: {
      flex: 1,
      gap: 2,
    },
    profileName: {
      fontFamily: F.semibold,
      color: t.text,
    },
    profileEmail: {
      fontFamily: F.regular,
      color: t.textMuted,
    },
    sectionHeader: {
      fontSize: 11,
      fontFamily: F.semibold,
      color: t.textMuted,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginTop: 24,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: t.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
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
      backgroundColor: t.surfaceAlt,
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
      color: t.text,
    },
    rowLabelDestructive: {
      color: "#EF4444",
    },
    rowValue: {
      fontSize: 14,
      fontFamily: F.regular,
      color: t.textMuted,
      maxWidth: 120,
    },
    divider: {
      height: 1,
      backgroundColor: t.borderFaint,
      marginLeft: 60,
    },
    version: {
      textAlign: "center",
      fontSize: 12,
      fontFamily: F.regular,
      color: t.textFaint,
      marginTop: 36,
    },

    // ── Sheet overlay helpers ──
    sheetBackdrop: {
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    sheetPositioner: {
      flex: 1,
      justifyContent: "flex-end",
    },

    // ── Shared modal styles ──
    modalSheet: {
      backgroundColor: t.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 28,
      paddingBottom: 40,
      gap: 16,
      maxHeight: "88%",
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: F.bold,
      color: t.text,
    },
    modalSubtitle: {
      fontSize: 14,
      fontFamily: F.regular,
      color: t.textMuted,
      marginTop: -8,
    },
    modalInput: {
      height: 52,
      borderWidth: 1.5,
      borderColor: t.borderInput,
      borderRadius: 14,
      paddingHorizontal: 16,
      fontSize: 16,
      fontFamily: F.regular,
      color: t.text,
      backgroundColor: t.surfaceAlt,
    },
    modalInputFocused: {
      borderColor: t.accent,
      backgroundColor: t.surface,
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
      borderColor: t.borderInput,
      alignItems: "center",
      justifyContent: "center",
    },
    modalCancelLabel: {
      fontSize: 16,
      fontFamily: F.semibold,
      color: t.textSub,
    },
    modalSave: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      backgroundColor: t.accent,
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

    // ── Theme modal ──
    themeModeRow: {
      flexDirection: "row",
      gap: 10,
    },
    themeModeCard: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 8,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: t.borderInput,
      backgroundColor: t.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    themeModeCardActive: {
      borderColor: t.accent,
      backgroundColor: t.accentBg,
    },
    themeModeLabel: {
      fontSize: 14,
      fontFamily: F.semibold,
      color: t.textSub,
    },
    themeModeLabelActive: {
      color: t.accent,
    },
    themeModeCheck: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: t.accentBg,
      borderWidth: 1.5,
      borderColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    themeSystemNote: {
      fontSize: 14,
      fontFamily: F.regular,
      color: t.textMuted,
      lineHeight: 20,
    },
    accentOptions: {
      gap: 8,
    },
    accentLabel: {
      fontSize: 11,
      fontFamily: F.semibold,
      color: t.textMuted,
      letterSpacing: 1.1,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    accentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: t.borderInput,
      backgroundColor: t.surfaceAlt,
    },
    accentRowActive: {
      borderColor: t.accent,
      backgroundColor: t.accentBg,
    },
    accentDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    accentRowLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: F.medium,
      color: t.textSub,
    },
    accentRowLabelActive: {
      color: t.accent,
    },
    accentCheck: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: t.accentBg,
      borderWidth: 1.5,
      borderColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
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
      borderColor: t.borderInput,
      backgroundColor: t.surfaceAlt,
    },
    fontOptionActive: {
      borderColor: t.accent,
      backgroundColor: t.accentBg,
    },
    fontOptionLeft: {
      flex: 1,
      gap: 2,
    },
    fontOptionLabel: {
      fontFamily: F.semibold,
      color: t.textSub,
    },
    fontOptionLabelActive: {
      color: t.accent,
    },
    fontOptionDesc: {
      fontSize: 12,
      fontFamily: F.regular,
      color: t.textMuted,
    },
    fontOptionCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: t.accentBg,
      borderWidth: 1.5,
      borderColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },

    // ── About sheet inner layout ──
    aboutScroll: {
      paddingBottom: 4,
    },
    aboutLogoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 20,
    },
    aboutFlameCircle: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: t.accentBg,
      borderWidth: 1.5,
      borderColor: t.accentBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    aboutAppName: {
      fontSize: 28,
      fontFamily: F.bold,
      color: t.text,
      letterSpacing: -0.5,
    },
    aboutVersion: {
      fontSize: 13,
      fontFamily: F.regular,
      color: t.textMuted,
      marginTop: 1,
    },
    aboutTagline: {
      fontSize: 18,
      fontFamily: F.bold,
      color: t.accent,
      letterSpacing: -0.3,
      marginBottom: 16,
      lineHeight: 24,
    },
    aboutBody: {
      fontSize: 14,
      fontFamily: F.regular,
      color: t.textSub,
      lineHeight: 22,
      marginBottom: 12,
    },
    aboutPillarsTitle: {
      fontSize: 11,
      fontFamily: F.semibold,
      color: t.textMuted,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginTop: 12,
      marginBottom: 14,
    },
    aboutPillars: {
      gap: 12,
      marginBottom: 24,
    },
    pillar: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    pillarIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 1,
    },
    pillarText: {
      flex: 1,
      gap: 3,
    },
    pillarTitle: {
      fontSize: 14,
      fontFamily: F.semibold,
      color: t.text,
    },
    pillarBody: {
      fontSize: 13,
      fontFamily: F.regular,
      color: t.textMuted,
      lineHeight: 19,
    },
    aboutFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingTop: 4,
    },
    aboutFooterText: {
      fontSize: 13,
      fontFamily: F.regular,
      color: t.textMuted,
    },

    // ── Done button ──
    modalDone: {
      height: 52,
      borderRadius: 14,
      backgroundColor: t.accent,
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
