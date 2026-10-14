import * as SecureStore from "expo-secure-store";
import { apiUrl } from "../constants/config";

const TOKEN_KEY = "omninexus_token";

export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (token:string) => SecureStore.setItemAsync(TOKEN_KEY, token);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

async function request(path:string, options:RequestInit = {}) {
  const token = await getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type","application/json");
  if (token) headers.set("Authorization","Bearer " + token);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {...options, headers, signal: controller.signal});
  } catch (error) {
    if (controller.signal.aborted) throw new Error("The API took too long to respond. Please retry in a moment.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.detail || "OmniNexus API request failed.");
  return body;
}

export async function login(email:string,password:string) {
  const body = await request("/api/v1/auth/login",{method:"POST",body:JSON.stringify({email,password})});
  if (!body.token) throw new Error("Authentication token was not returned.");
  await setToken(body.token); return body;
}
export async function signup(email:string,password:string) {
  const body = await request("/api/v1/auth/signup",{method:"POST",body:JSON.stringify({email,password})});
  if (!body.token) throw new Error("Authentication token was not returned.");
  await setToken(body.token); return body;
}
export const me = () => request("/api/v1/auth/me");
export async function logout() {
  try {
    await request("/api/v1/auth/logout",{method:"POST"});
  } catch {
    // Always clear the local session even if the API is offline or the token expired.
  } finally {
    await clearToken();
  }
}
export const analyzeCareer = (current_skills:string[],target_role:string) =>
  request("/api/v1/analyze",{method:"POST",body:JSON.stringify({current_skills,target_role})});
export const observatory = () => request("/api/v1/observatory/snapshot");
