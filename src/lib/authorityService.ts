const STORAGE_KEY = "hydrolake_authority_emails";

const parseEmails = (raw: string): string[] => {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

export const fetchAuthorities = async (): Promise<string[]> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }
    return parseEmails(saved);
  } catch {
    return [];
  }
};

export const saveAuthorities = async (emails: string[]): Promise<{ ok: boolean }> => {
  try {
    const cleaned = emails.map((email) => email.trim()).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, cleaned.join(", "));
    return { ok: true };
  } catch {
    return { ok: false };
  }
};
