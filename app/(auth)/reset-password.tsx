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
import { router, useLocalSearchParams } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { F } from "@/constants/fonts";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    setError(null);
    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message ?? "Reset failed. The link may have expired.");
      return;
    }
    setDone(true);
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.brandArea}>
            <Text style={styles.logo}>flint</Text>
          </View>
          <View style={styles.centreBox}>
            <Text style={styles.errorTitle}>invalid link</Text>
            <Text style={styles.errorBody}>
              This reset link is missing or has expired. Please request a new one.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(auth)/forgot-password" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonLabel}>request new link</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <View style={styles.brandArea}>
            <Text style={styles.logo}>flint</Text>
          </View>
          <View style={styles.centreBox}>
            <Text style={styles.doneIcon}>🔑</Text>
            <Text style={styles.doneTitle}>password updated</Text>
            <Text style={styles.doneBody}>
              Your password has been reset. You can now sign in with your new password.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/(auth)/sign-in" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonLabel}>sign in →</Text>
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
            <Text style={styles.heading}>set a new password</Text>
            <Text style={styles.subheading}>
              Choose something strong that you'll remember.
            </Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TextInput
              style={[styles.input, passwordFocused && styles.inputFocused]}
              placeholder="new password"
              placeholderTextColor="#C4C4C4"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
              returnKeyType="next"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />

            <TextInput
              style={[styles.input, confirmFocused && styles.inputFocused]}
              placeholder="confirm password"
              placeholderTextColor="#C4C4C4"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              returnKeyType="done"
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
              onSubmitEditing={handleReset}
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleReset}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonLabel}>update password</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.footer}
            onPress={() => router.replace("/(auth)/sign-in" as any)}
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

  // ── States ──
  centreBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 8,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: F.bold,
    color: "#111",
    letterSpacing: -0.3,
  },
  errorBody: {
    fontSize: 15,
    fontFamily: F.regular,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 23,
  },
  doneIcon: {
    fontSize: 52,
  },
  doneTitle: {
    fontSize: 22,
    fontFamily: F.bold,
    color: "#111",
    letterSpacing: -0.3,
  },
  doneBody: {
    fontSize: 15,
    fontFamily: F.regular,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 23,
  },
});
