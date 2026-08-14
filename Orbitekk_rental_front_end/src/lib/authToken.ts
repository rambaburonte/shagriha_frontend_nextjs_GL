const TOKEN_KEY = "shagriha.accessToken";
const IDENTITY_KEY = "shagriha.identity";

let accessToken: string | null = null;

export type StoredAuthIdentity = {
  userId: string;
  username?: string;
};

export const getAccessToken = () => {
  if (!accessToken && typeof window !== "undefined") {
    accessToken = window.localStorage.getItem(TOKEN_KEY);
  }
  return accessToken;
};
export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window === "undefined") return;

  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
};

export const getStoredAuthIdentity = (): StoredAuthIdentity | null => {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(IDENTITY_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as StoredAuthIdentity;
  } catch {
    window.localStorage.removeItem(IDENTITY_KEY);
    return null;
  }
};

export const setStoredAuthIdentity = (identity: StoredAuthIdentity | null) => {
  if (typeof window === "undefined") return;
  if (identity) window.localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  else window.localStorage.removeItem(IDENTITY_KEY);
};
