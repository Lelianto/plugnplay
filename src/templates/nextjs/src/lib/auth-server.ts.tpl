import { createClient } from "./supabase/server";

export async function getSessionUser() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return user;
}
