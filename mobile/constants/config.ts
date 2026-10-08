export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://omninexus-api-prod.onrender.com";

export const apiUrl = (path: string) =>
  API_BASE_URL + (path.startsWith("/") ? path : "/" + path);
