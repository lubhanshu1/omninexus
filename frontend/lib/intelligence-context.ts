export type IntelligenceContext = {
  skills: string[];
  targetRole: string;
  readiness?: number | null;
  opportunity?: number | null;
  bottleneck?: string | null;
  updatedAt: string;
};

const STORAGE_KEY = "omninexus-intelligence-context";

export function saveIntelligenceContext(
  context: Omit<IntelligenceContext, "updatedAt"> & { updatedAt?: string },
) {
  if (typeof window === "undefined") return;
  try {
    const payload: IntelligenceContext = {
      ...context,
      updatedAt: context.updatedAt ?? new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Intelligence context is an enhancement; the application remains usable
    // if browser storage is unavailable.
  }
}

export function loadIntelligenceContext(): IntelligenceContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IntelligenceContext;
    if (!Array.isArray(parsed.skills) || !parsed.targetRole) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearIntelligenceContext() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
