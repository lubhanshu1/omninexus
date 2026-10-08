export type OmniUser = {
  id?: number;
  uuid?: string;
  email: string;
  role?: string;
  status?: string;
};

const TOKEN_KEY = "omninexus_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): Record<string,string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
