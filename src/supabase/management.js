const MGMT_URL = "https://api.supabase.com/v1";

export async function listProjects(token) {
  const res = await fetch(`${MGMT_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    const err = new Error("INVALID_TOKEN");
    err.code = "INVALID_TOKEN";
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Supabase API error (${res.status})`);
  }

  return res.json();
}

export async function getProjectApiKey(token, ref) {
  const res = await fetch(`${MGMT_URL}/projects/${ref}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase API error (${res.status})`);
  }

  const keys = await res.json();
  const anon =
    keys.find((k) => k.name === "anon") ??
    keys.find((k) => k.name?.includes("anon")) ??
    keys.find((k) => k.name !== "service_role" && k.name !== "service role");

  if (!anon?.api_key) {
    throw new Error("No anon/publishable key found for this project");
  }

  return anon.api_key;
}

export function projectUrl(ref) {
  return `https://${ref}.supabase.co`;
}
