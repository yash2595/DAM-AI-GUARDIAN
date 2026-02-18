type AlertPayload = {
  recipients: string[];
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
};

type AlertResponse =
  | { ok: true; fallback?: boolean; previewUrl?: string; message?: string }
  | { ok: false; error: string };

const API_BASE_URL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:5000";

const openMailFallback = (payload: AlertPayload): AlertResponse => {
  if (typeof window === "undefined") {
    return { ok: false, error: "Mail fallback unavailable" };
  }

  const recipients = payload.recipients.join(",");
  const subject = encodeURIComponent(payload.subject);
  const body = encodeURIComponent(payload.body);
  const url = `mailto:${recipients}?subject=${subject}&body=${body}`;

  window.open(url, "_blank");
  return { ok: true, fallback: true };
};

const sendDamFailureAlert = async (payload: AlertPayload): Promise<AlertResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: text || `Request failed (${response.status})` };
    }

    const data = await response.json();
    if (data?.ok === true || data?.success === true) {
      return { ok: true, message: data?.message, previewUrl: data?.previewUrl };
    }

    if (data?.ok === false) {
      return { ok: false, error: data?.error || "Failed to send alert" };
    }

    return { ok: true, message: data?.message };
  } catch (error: any) {
    return openMailFallback(payload);
  }
};

export default sendDamFailureAlert;
