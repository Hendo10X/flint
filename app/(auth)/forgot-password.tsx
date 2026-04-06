import { useState } from "react";
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
import { authClient } from "@/lib/auth-client";
import { F } from "@/constants/fonts";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await authClient.requestPasswordReset({
      email: trimmed,
      redirectTo: "flint://reset-password",
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.brandArea}>
            <Text style={styles.logo}>flint</Text>
          </View>

          <View style={styles.sentBox}>
            <Text style={styles.sentIcon}>✉️</Text>
            <Text style={styles.sentTitle}>check your email</Text>
            <Text style={styles.sentBody}>
              We sent a reset link to{" "}
              <Text style={styles.sentEmail}>{email.trim().toLowerCase()}</Text>.
              {"\n\n"}Tap the link in the email to set a new password.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(auth)/sign-in" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonLabel}>← back to sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.brandArea}>
            <Text style={styles.logo}>flint</Text>
            <Text style={styles.heading}>forgot your password?</Text>
            <Text style={styles.subheading}>
              No worries. Enter your email and we'll send you a reset link.
            </Text>
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
              autoFocus
              returnKeyType="done"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              onSubmitEditing={handleSubmit}
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonLabel}>send reset link</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.footer}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>← back to sign in</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  brandArea: {
    gap: 10,
    marginBottom: 40,
  },
  logo: {
    fontSize: 44,
    fontFamily: F.bold,
    color: "#F97316",
    letterSpacing: -1.5,
  },
  heading: {
    fontSize: 22,
    fontFamily: F.medium,
    color: "#111",
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 15,
    fontFamily: F.regular,
    color: "#9CA3AF",
    lineHeight: 22,
  },
  form: {
    gap: 14,
    flex: 1,
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
  footer: {
    alignItems: "center",
    paddingTop: 24,
  },
  footerLink: {
    fontSize: 15,
    fontFamily: F.semibold,
    color: "#F97316",
  },

  // ── Sent state ──
  sentBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 8,
  },
  sentIcon: {
    fontSize: 52,
  },
  sentTitle: {
    fontSize: 22,
    fontFamily: F.bold,
    color: "#111",
    letterSpacing: -0.3,
  },
  sentBody: {
    fontSize: 15,
    fontFamily: F.regular,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 23,
  },
  sentEmail: {
    fontFamily: F.semibold,
    color: "#4B5563",
  },
  backButton: {
    alignItems: "center",
    paddingTop: 8,
  },
  backButtonLabel: {
    fontSize: 15,
    fontFamily: F.semibold,
    color: "#F97316",
  },
});
