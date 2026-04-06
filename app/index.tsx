import { authClient } from "@/lib/auth-client";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Root() {
  const { data: session, isPending, error } = authClient.useSession();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (error) {
      setHasError(true);
      // Log network errors to prevent crashes
      console.warn("Session check error:", error);
    }
  }, [error]);

  // If there's a network error during session check, treat as unauthenticated
  if (isPending && !hasError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (session && !hasError) return <Redirect href={"/(tabs)/" as any} />;

  return <Redirect href={"/(auth)/sign-in" as any} />;
}
