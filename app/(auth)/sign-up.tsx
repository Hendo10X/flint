import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { ArrowLeft, Check } from "phosphor-react-native";
import { authClient } from "@/lib/auth-client";
import { F } from "@/constants/fonts";

const TOTAL_STEPS = 4;

const STEPS = [
  { heading: "what should\nwe call you?", placeholder: "your name" },
  { heading: "what's your\nemail?", placeholder: "hello@example.com" },
  { heading: "create a\npassword", placeholder: "at least 8 characters" },
  { heading: "", placeholder: "" },
];

export default function SignUpScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const focusInput = () => {
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const applyStepChange = (nextStep: number) => {
    setStep(nextStep);
    translateY.value = 18;
    opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    if (nextStep < 4) runOnJS(focusInput)();
  };

  const transitionTo = (nextStep: number) => {
    opacity.value = withTiming(
      0,
      { duration: 110, easing: Easing.out(Easing.quad) },
      () => runOnJS(applyStepChange)(nextStep)
    );
  };

  const handleBack = () => {
    if (step <= 1 || step === 4) return;
    setError(null);
    opacity.value = withTiming(
      0,
      { duration: 110, easing: Easing.out(Easing.quad) },
      () => {
        const prev = step - 1;
        runOnJS(setStep)(prev);
        translateY.value = -18;
        opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
        translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      }
    );
  };

  const handleContinue = async () => {
    setError(null);

    if (step === 1) {
      if (!name.trim()) { setError("please enter your name"); return; }
      transitionTo(2);
    } else if (step === 2) {
      if (!email.trim() || !email.includes("@")) {
        setError("please enter a valid email");
        return;
      }
      transitionTo(3);
    } else if (step === 3) {
      if (password.length < 8) {
        setError("password must be at least 8 characters");
        return;
      }
      setLoading(true);
      const { error: authError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setLoading(false);
      if (authError) {
        setError(authError.message ?? "Sign up failed. Please try again.");
        return;
      }
      transitionTo(4);
    } else if (step === 4) {
      router.replace("/(auth)/onboarding" as any);
    }
  };

  const buttonLabel =
    step === 3 ? "create account" : step === 4 ? "open flint" : "continue";

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        {step > 1 && step < 4 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton} hitSlop={8}>
            <ArrowLeft size={20} color="#111" weight="regular" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <View style={styles.progressDots}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i < step ? styles.dotFilled : styles.dotEmpty]}
            />
          ))}
        </View>

        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <Animated.View style={[styles.contentArea, animatedStyle]}>
          {step < 4 ? (
            <>
              <Text style={styles.heading}>{STEPS[step - 1].heading}</Text>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <View style={styles.errorPlaceholder} />
              )}

              {step === 1 && (
                <TextInput
                  ref={inputRef}
                  style={[styles.input, inputFocused && styles.inputFocused]}
                  placeholder={STEPS[0].placeholder}
                  placeholderTextColor="#C4C4C4"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onSubmitEditing={handleContinue}
                  autoFocus
                />
              )}
              {step === 2 && (
                <TextInput
                  ref={inputRef}
                  style={[styles.input, inputFocused && styles.inputFocused]}
                  placeholder={STEPS[1].placeholder}
                  placeholderTextColor="#C4C4C4"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onSubmitEditing={handleContinue}
                />
              )}
              {step === 3 && (
                <TextInput
                  ref={inputRef}
                  style={[styles.input, inputFocused && styles.inputFocused]}
                  placeholder={STEPS[2].placeholder}
                  placeholderTextColor="#C4C4C4"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onSubmitEditing={handleContinue}
                />
              )}
            </>
          ) : (
            <View style={styles.successArea}>
              <View style={styles.successIcon}>
                <Check size={30} color="#F97316" weight="bold" />
              </View>
              <Text style={styles.heading}>{"you're all\nset."}</Text>
              <Text style={styles.successSubtext}>
                {"welcome, " + name + ".\nstart building momentum."}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueButtonLabel}>{buttonLabel}</Text>
            )}
          </TouchableOpacity>

          {step === 1 && (
            <View style={styles.signInRow}>
              <Text style={styles.signInText}>already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.signInLink}>sign in</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotFilled: {
    backgroundColor: "#F97316",
  },
  dotEmpty: {
    backgroundColor: "#E5E7EB",
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  heading: {
    fontSize: 38,
    fontFamily: F.bold,
    color: "#111",
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    fontFamily: F.medium,
    color: "#DC2626",
    marginBottom: 12,
  },
  errorPlaceholder: {
    height: 26,
  },
  input: {
    height: 54,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 17,
    fontFamily: F.regular,
    color: "#111",
    backgroundColor: "#FAFAFA",
  },
  inputFocused: {
    borderColor: "#F97316",
    backgroundColor: "#fff",
  },
  successArea: {
    flex: 1,
    paddingTop: 16,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  successSubtext: {
    fontSize: 17,
    fontFamily: F.regular,
    color: "#9CA3AF",
    lineHeight: 26,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    gap: 20,
  },
  continueButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueButtonLabel: {
    fontSize: 17,
    fontFamily: F.bold,
    color: "#fff",
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 15,
    fontFamily: F.regular,
    color: "#9CA3AF",
  },
  signInLink: {
    fontSize: 15,
    fontFamily: F.semibold,
    color: "#F97316",
  },
});
