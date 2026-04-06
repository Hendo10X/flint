import { Redirect } from "expo-router";
import { authClient } from "@/lib/auth-client";

export default function Root() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  if (session) return <Redirect href={"/(tabs)/" as any} />;

  return <Redirect href={"/(auth)/sign-in" as any} />;
}
