import { createClient as createBrowserClient } from "./supabase/client";

export async function signUp(email: string, password: string) {
  return createBrowserClient().auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return createBrowserClient().auth.signInWithPassword({ email, password });
}

export async function signInWithOAuth(
  provider: "google" | "github" | "discord",
) {
  return createBrowserClient().auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut() {
  return createBrowserClient().auth.signOut();
}
