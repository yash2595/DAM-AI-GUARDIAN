const STORAGE_KEY = "hydrolake_authority_emails";
const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:5000";

const parseEmails = (raw: string): string[] => {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

export const fetchAuthorities = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/authorities`);
    if (res.ok) {
      const data = await res.json();
      if (data?.authorities && Array.isArray(data.authorities)) {
        // Also sync to localStorage as fallback cache
        localStorage.setItem(STORAGE_KEY, data.authorities.join(", "));
        return data.authorities;
      }
    }
  } catch {
    // fall through to localStorage cache
  }
  // Fallback: localStorage cache
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseEmails(saved) : [];
  } catch {
    return [];
  }
};

export const saveAuthorities = async (emails: string[]): Promise<{ ok: boolean }> => {
  const cleaned = emails.map((email) => email.trim()).filter(Boolean);
  // Sync to localStorage immediately for fast reads
  localStorage.setItem(STORAGE_KEY, cleaned.join(", "));
  try {
    const res = await fetch(`${API_BASE_URL}/api/authorities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorities: cleaned })
    });
    if (res.ok) return { ok: true };
  } catch {
    // localStorage was already updated, so treat as soft success
  }
  return { ok: true };
};
