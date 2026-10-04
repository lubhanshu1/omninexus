const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

const isBrowserLocal =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const isConfiguredLocalhost =
  !!configuredApiUrl &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    configuredApiUrl.replace(/\/$/, "")
  );

// Production deployments always use the Render API; local development can use localhost.
const PRODUCTION_API_URL =
  "https://omninexus-api-prod.onrender.com";

export const API_BASE_URL =
  configuredApiUrl &&
  configuredApiUrl.length > 0 &&
  (!isConfiguredLocalhost || isBrowserLocal)
    ? configuredApiUrl.replace(/\/$/, "")
    : isBrowserLocal
      ? "http://localhost:8001"
      : PRODUCTION_API_URL;

export const apiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error("OmniNexus API URL is not configured.");
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

// Final bug-fix deployment trigger: keep Vercel aligned with the hardened main branch.
