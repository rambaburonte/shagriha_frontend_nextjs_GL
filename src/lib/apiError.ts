type ApiErrorPayload = {
  message?: unknown;
  fields?: Record<string, unknown>;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return fallback;
  }

  const data = error.data as ApiErrorPayload | string | undefined;
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return fallback;

  const fieldMessage = Object.values(data.fields ?? {}).find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
  if (fieldMessage) return fieldMessage;

  return typeof data.message === "string" && data.message.trim()
    ? data.message
    : fallback;
}
