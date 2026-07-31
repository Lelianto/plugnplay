import { supabase } from "./supabase";

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithOAuth(
  provider: "google" | "github" | "discord",
) {
  const { origin } = window.location;
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: origin },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function getSessionUser() {
  return supabase.auth.getUser();
}
