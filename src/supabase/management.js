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

  const projects = await res.json();
  if (!Array.isArray(projects)) {
    throw new Error("Supabase API returned an unexpected projects response");
  }

  return projects
    .filter((project) => isNonEmptyString(project?.ref))
    .map((project) => ({
      ref: project.ref,
      name: isNonEmptyString(project.name) ? project.name : project.ref,
    }));
}

export async function getProjectApiKey(token, ref) {
  if (!isValidProjectRef(ref)) {
    throw new Error("Invalid Supabase project ref");
  }

  const res = await fetch(`${MGMT_URL}/projects/${ref}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase API error (${res.status})`);
  }

  const keys = await res.json();
  if (!Array.isArray(keys)) {
    throw new Error("Supabase API returned an unexpected API keys response");
  }

  const anon =
    keys.find((key) => normalizeKeyName(key?.name) === "anon") ??
    keys.find((key) => normalizeKeyName(key?.name).includes("anon")) ??
    keys.find((key) => !normalizeKeyName(key?.name).includes("service_role"));

  if (!isNonEmptyString(anon?.api_key)) {
    throw new Error("No anon/publishable key found for this project");
  }

  return anon.api_key;
}

export function projectUrl(ref) {
  if (!isValidProjectRef(ref)) {
    throw new Error("Invalid Supabase project ref");
  }

  return `https://${ref}.supabase.co`;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeKeyName(name) {
  return isNonEmptyString(name)
    ? name.toLowerCase().replace(/\s+/g, "_")
    : "";
}

function isValidProjectRef(ref) {
  return /^[a-z0-9-]+$/.test(ref);
}
