const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const isLocalHost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL =
  configuredApiUrl && configuredApiUrl.length > 0
    ? configuredApiUrl.replace(/\/$/, "")
    : isLocalHost
      ? "http://localhost:8001"
      : "";

export const apiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured for this deployment.");
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export const getStoredToken = () =>
  typeof window === "undefined"
    ? ""
    : window.sessionStorage.getItem("omninexus_token") || "";

export const authHeaders = (): Record<string, string> => {
  const token = getStoredToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};
