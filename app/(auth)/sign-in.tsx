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
import { router } from "expo-router";
import { GoogleLogo, AppleLogo } from "phosphor-react-native";
import { authClient } from "@/lib/auth-client";
import { F } from "@/constants/fonts";

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
              <GoogleLogo size={18} color="#4285F4" weight="bold" />
              <Text style={styles.socialButtonLabel}>continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleApple}
                activeOpacity={0.8}
                disabled={loading}
              >
                <AppleLogo size={18} color="#000" weight="fill" />
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
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: F.regular,
    color: "#111",
    backgroundColor: "#FAFAFA",
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
