const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_BASE_URL =
  configuredApiUrl && configuredApiUrl.length > 0
    ? configuredApiUrl.replace(/\/$/, "")
    : "https://omninexus-api-prod.onrender.com";

export const apiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

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
