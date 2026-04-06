import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Flame,
  Lightning,
  Sparkle,
  Browsers,
  Snowflake,
  Shuffle,
  Stack,
  ArrowDown,
  Target,
} from "phosphor-react-native";
import { authClient } from "@/lib/auth-client";
import { useTaskStore } from "@/store/tasks";
import { F } from "@/constants/fonts";

// ─── Types ────────────────────────────────────────────────────────────────────

type PhosphorIcon = React.ComponentType<{ size?: number; color?: string; weight?: string }>;
type FlavorKey = "spiral" | "freeze" | "scatter" | "hyperfocus";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface FlavorOption {
  key: FlavorKey;
  Icon: PhosphorIcon;
  label: string;
}

const FLAVOR_OPTIONS: FlavorOption[] = [
  { key: "spiral",     Icon: Browsers,  label: "open 47 tabs and spiral" },
  { key: "freeze",     Icon: Snowflake, label: "freeze and stare at the wall" },
  { key: "scatter",    Icon: Shuffle,   label: "start everything, finish nothing" },
  { key: "hyperfocus", Icon: Flame,     label: "hyperfocus on the wrong thing" },
];

const FLAVOR_REPLY: Record<FlavorKey, { heading: string; body: string }> = {
  spiral: {
    heading: "ah, a classic spiral.",
    body: "flint closes those tabs. you only see 3 tasks at a time. no rabbit holes, no endless list. just the next thing.",
  },
  freeze: {
    heading: "the wall stare. iconic.",
    body: "the fix? make starting stupidly easy. flint sorts tasks by how hard they are to START — easiest goes first so you get a quick win before the scary stuff.",
  },
  scatter: {
    heading: "the scatter. a classic.",
    body: "flint literally only shows 3 tasks. you cannot start 6 things at once. it's not a bug — it's the whole point. you're welcome.",
  },
  hyperfocus: {
    heading: "the hyperfocus trap.",
    body: "flint lets you set a 'first spark' on every task — the tiniest possible first action. it's how you trick yourself into starting the right thing.",
  },
};

const TOTAL_STEPS = 7;

// ─── Sub-components ──────────────────────────────────────────────────────────

function BigIcon({ icon: Icon }: { icon: PhosphorIcon }) {
  return (
    <View style={styles.bigIconWrapper}>
      <Icon size={34} color="#F97316" weight="fill" />
    </View>
  );
}

function TipCard({ icon: Icon, text }: { icon: PhosphorIcon; text: string }) {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipIconBox}>
        <Icon size={16} color="#F97316" weight="fill" />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function ExampleRow({
  color,
  task,
  diff,
}: {
  color: string;
  task: string;
  diff: string;
}) {
  return (
    <View style={styles.exampleRow}>
      <View style={[styles.exampleDot, { backgroundColor: color }]} />
      <Text style={styles.exampleTask}>{task}</Text>
      <Text style={styles.exampleDiff}>{diff}</Text>
    </View>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step - 1) / (total - 1)) * 100;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "friend";
  const addTask = useTaskStore((s) => s.addTask);

  const [step, setStep] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorKey | null>(null);
  const [firstTask, setFirstTask] = useState("");
  const [taskInputFocused, setTaskInputFocused] = useState(false);
  const taskInputRef = useRef<TextInput>(null);

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const SPRING = { damping: 13, stiffness: 220, mass: 0.75 };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // ── Animation helpers ────────────────────────────────────────────────────

  const applyStep = (next: number, direction: 1 | -1 = 1) => {
    setStep(next);
    opacity.value = 1;
    translateY.value = direction * 32;
    scale.value = 0.93;
    translateY.value = withSpring(0, SPRING);
    scale.value = withSpring(1, SPRING);
    if (next === 6) setTimeout(() => taskInputRef.current?.focus(), 80);
  };

  const goTo = (next: number, direction: 1 | -1 = 1) => {
    opacity.value = withTiming(0, { duration: 60 }, () => {
      runOnJS(applyStep)(next, direction);
    });
  };

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 4 && !selectedFlavor) return;
    if (step === 6) {
      if (firstTask.trim()) {
        addTask(firstTask.trim(), null, null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      goTo(7);
      return;
    }
    if (step === 7) {
      router.replace("/(tabs)/" as any);
      return;
    }
    goTo(step + 1);
  };

  const handleBack = () => {
    if (step <= 1) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goTo(step - 1, -1);
  };

  const handleFlavorSelect = (key: FlavorKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedFlavor(key);
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const continueLabel =
    step === 6
      ? firstTask.trim() ? "add to flint →" : "skip for now"
      : step === 7
      ? "open flint"
      : "continue →";

  const canContinue = step !== 4 || selectedFlavor !== null;
  const flavor = selectedFlavor ? FLAVOR_REPLY[selectedFlavor] : null;
  const flavorIcon = FLAVOR_OPTIONS.find((f) => f.key === selectedFlavor)?.Icon ?? Flame;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {step > 1 && step < 7 ? (
          <TouchableOpacity onPress={handleBack} style={styles.navBtn} hitSlop={8}>
            <ArrowLeft size={20} color="#111" weight="regular" />
          </TouchableOpacity>
        ) : (
          <View style={styles.navBtn} />
        )}
        <ProgressBar step={step} total={TOTAL_STEPS} />
        <View style={styles.navBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, animatedStyle]}>

            {/* ── Step 1: Welcome ── */}
            {step === 1 && (
              <>
                <BigIcon icon={Flame} />
                <Text style={styles.heading}>{"welcome,\n" + firstName + "."}</Text>
                <Text style={styles.body}>
                  you just made a decision. for a lot of us, that's genuinely the hardest part.
                </Text>
                <Text style={[styles.body, styles.bodySpaced]}>
                  flint is built for brains that think in bursts — not to-do lists.
                </Text>
              </>
            )}

            {/* ── Step 2: How flint works ── */}
            {step === 2 && (
              <>
                <Text style={styles.heading}>{"flint isn't\na to-do list."}</Text>
                <Text style={styles.body}>
                  most apps drown you in tasks. flint does the opposite.
                </Text>
                <View style={styles.tipGroup}>
                  <TipCard
                    icon={Stack}
                    text="only 3 tasks visible at once — no infinite scroll of doom"
                  />
                  <TipCard
                    icon={ArrowDown}
                    text="tasks sorted by how hard they are to start, easiest first"
                  />
                  <TipCard
                    icon={Target}
                    text="set a tiny 'first spark' action to get unstuck instantly"
                  />
                  <TipCard
                    icon={Flame}
                    text="daily streaks reward showing up — even just one task counts"
                  />
                </View>
              </>
            )}

            {/* ── Step 3: The difficulty trick ── */}
            {step === 3 && (
              <>
                <BigIcon icon={Lightning} />
                <Text style={styles.heading}>{"the start\ndifficulty trick."}</Text>
                <Text style={styles.body}>
                  when you add a task, you rate how hard it is{" "}
                  <Text style={styles.accent}>to start</Text> — not to finish.
                </Text>
                <Text style={[styles.body, styles.bodySpaced]}>
                  easy tasks show up first, so you get a quick win before tackling
                  the scary ones. momentum beats motivation every time.
                </Text>
                <View style={styles.exampleCard}>
                  <Text style={styles.exampleLabel}>EXAMPLE</Text>
                  <ExampleRow
                    color="#16A34A"
                    task="reply to slack message"
                    diff=" — easy to start"
                  />
                  <ExampleRow
                    color="#D97706"
                    task="write the project report"
                    diff=" — medium"
                  />
                  <ExampleRow
                    color="#DC2626"
                    task="call the dentist"
                    diff=" — somehow always hard"
                  />
                </View>
              </>
            )}

            {/* ── Step 4: ADHD flavor question ── */}
            {step === 4 && (
              <>
                <Text style={styles.heading}>{"one quick\nquestion."}</Text>
                <Text style={styles.body}>
                  when you're overwhelmed, you usually...
                </Text>
                <View style={styles.flavorGrid}>
                  {FLAVOR_OPTIONS.map((opt) => {
                    const active = selectedFlavor === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[styles.flavorCard, active && styles.flavorCardActive]}
                        onPress={() => handleFlavorSelect(opt.key)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.flavorIconBox, active && styles.flavorIconBoxActive]}>
                          <opt.Icon
                            size={18}
                            color={active ? "#F97316" : "#9CA3AF"}
                            weight="fill"
                          />
                        </View>
                        <Text style={[styles.flavorLabel, active && styles.flavorLabelActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {!selectedFlavor && (
                  <Text style={styles.hintText}>tap one to continue</Text>
                )}
              </>
            )}

            {/* ── Step 5: Personalized response ── */}
            {step === 5 && flavor && (
              <>
                <BigIcon icon={flavorIcon} />
                <Text style={styles.heading}>{flavor.heading}</Text>
                <Text style={styles.body}>{flavor.body}</Text>
                <Text style={[styles.body, styles.bodySpaced]}>
                  flint was designed specifically for this. you're in the right place.
                </Text>
              </>
            )}

            {/* ── Step 6: First task ── */}
            {step === 6 && (
              <>
                <Text style={styles.heading}>{"one thing\nyou've been\nputting off."}</Text>
                <Text style={styles.body}>
                  what's been living rent-free in your head? add it — even if it feels too small.
                  <Text style={styles.accent}> especially</Text> if it feels too small.
                </Text>
                <TextInput
                  ref={taskInputRef}
                  style={[styles.taskInput, taskInputFocused && styles.taskInputFocused]}
                  placeholder="e.g. reply to that one email"
                  placeholderTextColor="#D1D5DB"
                  value={firstTask}
                  onChangeText={setFirstTask}
                  autoCapitalize="sentences"
                  returnKeyType="done"
                  onFocus={() => setTaskInputFocused(true)}
                  onBlur={() => setTaskInputFocused(false)}
                  onSubmitEditing={handleContinue}
                  maxLength={100}
                  textAlignVertical="center"
                />
              </>
            )}

            {/* ── Step 7: Spark ignited ── */}
            {step === 7 && (
              <>
                <BigIcon icon={Sparkle} />
                <Text style={styles.heading}>{"spark\nignited."}</Text>
                <Text style={styles.body}>
                  your brain does remarkable things. flint just helps it pick where to start.
                </Text>
                {firstTask.trim() ? (
                  <View style={styles.taskPreview}>
                    <Text style={styles.taskPreviewLabel}>YOUR FIRST TASK</Text>
                    <Text style={styles.taskPreviewText}>"{firstTask.trim()}"</Text>
                    <Text style={styles.taskPreviewHint}>
                      it's waiting for you. tap it, set a first spark, and go.
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.body, styles.bodySpaced]}>
                    tap the{" "}
                    <Text style={styles.accent}>+</Text>
                    {" "}button when you're ready to add your first task.
                  </Text>
                )}
              </>
            )}

          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!canContinue}
          >
            <Text style={styles.continueBtnLabel}>{continueLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F97316",
    borderRadius: 2,
  },

  // Content
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 16,
  },
  content: { flex: 1 },

  // Big icon (replaces emoji)
  bigIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  heading: {
    fontSize: 38,
    fontFamily: F.bold,
    color: "#111",
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    fontFamily: F.regular,
    color: "#6B7280",
    lineHeight: 25,
  },
  bodySpaced: { marginTop: 14 },
  accent: {
    fontFamily: F.semibold,
    color: "#F97316",
  },

  // Tip cards
  tipGroup: { marginTop: 24, gap: 10 },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  tipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: F.medium,
    color: "#374151",
    lineHeight: 20,
  },

  // Example card
  exampleCard: {
    marginTop: 24,
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  exampleLabel: {
    fontSize: 10,
    fontFamily: F.semibold,
    color: "#F97316",
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exampleDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    flexShrink: 0,
  },
  exampleTask: {
    fontSize: 14,
    fontFamily: F.medium,
    color: "#111",
  },
  exampleDiff: {
    fontSize: 13,
    fontFamily: F.regular,
    color: "#9CA3AF",
  },

  // Flavor selector
  flavorGrid: { marginTop: 20, gap: 10 },
  flavorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  flavorCardActive: {
    borderColor: "#F97316",
    backgroundColor: "#FFF7ED",
  },
  flavorIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  flavorIconBoxActive: {
    backgroundColor: "#FED7AA",
  },
  flavorLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: F.medium,
    color: "#374151",
    lineHeight: 21,
  },
  flavorLabelActive: { color: "#F97316" },
  hintText: {
    marginTop: 16,
    fontSize: 13,
    fontFamily: F.regular,
    color: "#C4C4C4",
    textAlign: "center",
  },

  // Task input
  taskInput: {
    marginTop: 24,
    height: 54,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: F.regular,
    color: "#111",
    backgroundColor: "#FAFAFA",
  },
  taskInputFocused: {
    borderColor: "#F97316",
    backgroundColor: "#fff",
  },

  // Task preview (step 7)
  taskPreview: {
    marginTop: 24,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  taskPreviewLabel: {
    fontSize: 10,
    fontFamily: F.semibold,
    color: "#9CA3AF",
    letterSpacing: 1.4,
  },
  taskPreviewText: {
    fontSize: 17,
    fontFamily: F.semibold,
    color: "#111",
    lineHeight: 24,
    marginTop: 2,
  },
  taskPreviewHint: {
    fontSize: 13,
    fontFamily: F.regular,
    color: "#9CA3AF",
    lineHeight: 19,
    marginTop: 4,
  },

  // Footer
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 12,
  },
  continueBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnDisabled: { backgroundColor: "#FED7AA" },
  continueBtnLabel: {
    fontSize: 17,
    fontFamily: F.bold,
    color: "#fff",
  },
});
