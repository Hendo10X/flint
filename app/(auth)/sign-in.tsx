import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, G, ClipPath, Defs, Rect } from "react-native-svg";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { F } from "@/constants/fonts";

// ─── Real Google G logo ───────────────────────────────────────────────────────
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <ClipPath id="g">
          <Rect width="24" height="24" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#g)">
        <Path
          d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
          fill="#4285F4"
        />
        <Path
          d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
          fill="#34A853"
        />
        <Path
          d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"
          fill="#FBBC05"
        />
        <Path
          d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
          fill="#EA4335"
        />
      </G>
    </Svg>
  );
}

// ─── Real Apple logo ──────────────────────────────────────────────────────────
function AppleIcon({ size = 20, color = "#000" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 814 1000" fill={color}>
      <Path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 268.9-317.3 56.4 0 103.6 37.1 138.5 37.1 33.1 0 85.3-39.2 149.4-39.2 24.1 0 108.2 2.6 168.2 81.3zm-244.8-162.5c31.4-37.9 53.8-91 53.8-144.1 0-7.7-.6-15.5-1.9-21.9-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 85.6-55.1 139.4 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 134.8-69.7z" />
    </Svg>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const { error: authError } = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? "Sign in failed. Please try again.");
      return;
    }
    router.replace("/(tabs)/" as any);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? "Google sign in failed.");
      return;
    }
    router.replace("/(tabs)/" as any);
  };

  const handleApple = async () => {
    setLoading(true);
    setError(null);
    const { error: authError } = await authClient.signIn.social({
      provider: "apple",
      callbackURL: "/",
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? "Apple sign in failed.");
      return;
    }
    router.replace("/(tabs)/" as any);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandArea}>
            <Text style={styles.logo}>flint</Text>
            <Text style={styles.tagline}>welcome back.</Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="email"
              placeholderTextColor="#C4C4C4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <TextInput
              ref={passwordRef}
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="password"
              placeholderTextColor="#C4C4C4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onSubmitEditing={handleSignIn}
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonLabel}>sign in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogle}
              activeOpacity={0.8}
              disabled={loading}
            >
              <GoogleIcon size={20} />
              <Text style={styles.socialButtonLabel}>continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleApple}
                activeOpacity={0.8}
                disabled={loading}
              >
                <AppleIcon size={19} color="#000" />
                <Text style={styles.socialButtonLabel}>continue with Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>new here? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up" as any)}
              disabled={loading}
            >
              <Text style={styles.footerLink}>create account →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  brandArea: {
    marginBottom: 48,
    gap: 6,
  },
  logo: {
    fontSize: 44,
    fontFamily: F.bold,
    color: "#F97316",
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 22,
    fontFamily: F.medium,
    color: "#111",
    letterSpacing: -0.3,
  },
  form: {
    gap: 14,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: F.medium,
    color: "#DC2626",
  },
  input: {
    height: 54,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    fontSize: 16,
    fontFamily: F.regular,
    color: "#111",
    backgroundColor: "#FAFAFA",
    // iOS auto-centers text in a fixed-height single-line UITextField.
    // Android needs this explicit instruction.
    textAlignVertical: "center",
  },
  inputFocused: {
    borderColor: "#F97316",
    backgroundColor: "#fff",
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonLabel: {
    fontSize: 17,
    fontFamily: F.bold,
    color: "#fff",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  dividerText: {
    fontSize: 13,
    fontFamily: F.medium,
    color: "#C4C4C4",
  },
  socialButton: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialButtonLabel: {
    fontSize: 15,
    fontFamily: F.medium,
    color: "#111",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  footerText: {
    fontSize: 15,
    fontFamily: F.regular,
    color: "#9CA3AF",
  },
  footerLink: {
    fontSize: 15,
    fontFamily: F.semibold,
    color: "#F97316",
  },
});
