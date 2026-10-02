"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  UserPlus,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

/* =========================================================
   OMNINEXUS API CONFIGURATION
   ========================================================= */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" &&
  !["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "https://omninexus-api-prod.onrender.com"
    : "http://localhost:8001");

const HEALTH_ENDPOINT = `${API_BASE_URL}/api/v1/health`;

const LOGIN_ENDPOINT = `${API_BASE_URL}/api/v1/auth/login`;

const SIGNUP_ENDPOINT = `${API_BASE_URL}/api/v1/auth/signup`;

/* =========================================================
   TYPES
   ========================================================= */

type HealthState = "checking" | "online" | "offline";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type ApiResponse = Record<string, JsonValue>;

type HealthResponse = {
  status?: string;
  service?: string;
  message?: string;
};

/* =========================================================
   SAFE API HELPERS
   ========================================================= */

/**
 * Converts any backend error shape into a human-readable string.
 *
 * This specifically prevents:
 *
 *     [object Object]
 *
 * from appearing in the UI.
 */
function extractApiMessage(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => extractApiMessage(item))
      .filter(Boolean);

    return messages.join(" • ");
  }

  if (typeof value === "object") {
    const object = value as Record<string, unknown>;

    const preferredKeys = [
      "message",
      "detail",
      "error",
      "msg",
      "reason",
      "description",
    ];

    for (const key of preferredKeys) {
      if (key in object) {
        const message = extractApiMessage(object[key]);

        if (message) {
          return message;
        }
      }
    }

    try {
      const serialized = JSON.stringify(object);

      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      // Ignore serialization errors.
    }
  }

  return "";
}

/**
 * Safely extracts a JWT/access token from common API response shapes.
 */
function extractToken(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "";
  }

  const object = data as Record<string, unknown>;

  const directToken =
    object.token ??
    object.access_token ??
    object.accessToken ??
    object.jwt;

  if (typeof directToken === "string") {
    return directToken;
  }

  const nestedCandidates = [
    object.data,
    object.result,
    object.user,
    object.auth,
  ];

  for (const candidate of nestedCandidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const nested = candidate as Record<string, unknown>;

    const nestedToken =
      nested.token ??
      nested.access_token ??
      nested.accessToken ??
      nested.jwt;

    if (typeof nestedToken === "string") {
      return nestedToken;
    }
  }

  return "";
}

/**
 * Safely parses a backend response regardless of whether
 * FastAPI returns JSON, text, HTML, or an empty body.
 */
async function parseApiResponse(
  response: Response
): Promise<{
  data: ApiResponse;
  rawText: string;
}> {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const json = await response.json();

      if (json && typeof json === "object") {
        return {
          data: json as ApiResponse,
          rawText: JSON.stringify(json),
        };
      }

      return {
        data: {
          message: extractApiMessage(json),
        },
        rawText: String(json),
      };
    } catch {
      return {
        data: {},
        rawText: "",
      };
    }
  }

  const text = await response.text();

  return {
    data: text
      ? {
        message: text,
      }
      : {},
    rawText: text,
  };
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Login() {
  const router = useRouter();

  /* -------------------------------------------------------
     AUTH STATE
     ------------------------------------------------------- */

  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* -------------------------------------------------------
     BACKEND HEALTH
     ------------------------------------------------------- */

  const [healthState, setHealthState] =
    useState<HealthState>("checking");

  const [healthMessage, setHealthMessage] =
    useState("Connecting to OmniNexus API...");

  const [healthService, setHealthService] =
    useState("FastAPI Intelligence Layer");

  /* =========================================================
     BACKEND HEALTH CHECK
     ========================================================= */

  const checkBackendHealth = useCallback(
    async () => {
      if (loading) {
        return;
      }

      setHealthState("checking");

      setHealthMessage(
        "Connecting to OmniNexus API..."
      );

      try {
        const controller =
          new AbortController();

        const timeout = window.setTimeout(() => {
          controller.abort();
        }, 5000);

        const response = await fetch(
          HEALTH_ENDPOINT,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        window.clearTimeout(timeout);

        const { data } =
          await parseApiResponse(response);

        if (!response.ok) {
          const message =
            extractApiMessage(data) ||
            `Backend returned HTTP ${response.status}.`;

          throw new Error(message);
        }

        const status =
          typeof data.status === "string"
            ? data.status.toLowerCase()
            : "";

        const service =
          typeof data.service === "string"
            ? data.service
            : "";

        if (service) {
          setHealthService(service);
        }

        if (
          status === "healthy" ||
          status === "ok"
        ) {
          setHealthState("online");

          setHealthMessage(
            "OmniNexus API connected"
          );
        } else {
          setHealthState("online");

          setHealthMessage(
            "API Responding"
          );
        }
      } catch (err) {
        console.error(
          "OmniNexus health check failed:",
          err
        );

        setHealthState("offline");

        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          setHealthMessage(
            "API connection timed out"
          );
        } else if (err instanceof Error) {
          setHealthMessage(
            err.message ||
            "OmniNexus API is offline"
          );
        } else {
          setHealthMessage(
            "OmniNexus API is offline"
          );
        }
      }
    },
    [loading]
  );

  /* =========================================================
     INITIAL HEALTH CHECK
     ========================================================= */

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  /* =========================================================
     HEALTH CONFIGURATION
     ========================================================= */

  const healthConfig = useMemo(
    () => ({
      checking: {
        label: "CONNECTING",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        dot: "bg-amber-400",
        glow: "shadow-[0_0_15px_rgba(251,191,36,0.45)]",
        icon: Activity,
      },

      online: {
        label: "SYSTEM ONLINE",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        dot: "bg-emerald-400",
        glow: "shadow-[0_0_15px_rgba(52,211,153,0.55)]",
        icon: Wifi,
      },

      offline: {
        label: "SYSTEM OFFLINE",
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        dot: "bg-rose-400",
        glow: "shadow-[0_0_15px_rgba(244,63,94,0.45)]",
        icon: WifiOff,
      },
    }),
    []
  );

  const currentHealth =
    healthConfig[healthState];

  const HealthIcon = currentHealth.icon;

  /* =========================================================
     FORM VALIDATION
     ========================================================= */

  const validateForm = (): boolean => {
    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      setError(
        "Email is required."
      );

      return false;
    }

    if (!normalizedEmail.includes("@")) {
      setError(
        "Enter a valid email address."
      );

      return false;
    }

    if (!password) {
      setError(
        "Password is required."
      );

      return false;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     AUTHENTICATION
     ========================================================= */

  const handleAuth = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const endpoint = isLogin
      ? LOGIN_ENDPOINT
      : SIGNUP_ENDPOINT;

    try {
      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const { data, rawText } =
        await parseApiResponse(
          response
        );

      /* -----------------------------------------------------
         HTTP ERROR
         ----------------------------------------------------- */

      if (!response.ok) {
        const backendMessage =
          extractApiMessage(data) ||
          rawText ||
          `Request failed with status ${response.status}.`;

        throw new Error(
          backendMessage
        );
      }

      /* -----------------------------------------------------
         EXTRACT RESPONSE STATUS
         ----------------------------------------------------- */

      const responseStatus =
        typeof data.status === "string"
          ? data.status.toLowerCase()
          : "";

      const responseMessage =
        extractApiMessage(data);

      /* -----------------------------------------------------
         LOGIN
         ----------------------------------------------------- */

      if (isLogin) {
        const token =
          extractToken(data);

        if (!token) {
          throw new Error(
            responseMessage ||
            "Authentication succeeded, but the backend did not return an access token."
          );
        }

        /*
         * Store JWT for the current browser session.
         */
        sessionStorage.setItem(
          "omninexus_token",
          token
        );

        /*
         * Global authentication marker.
         */
        localStorage.setItem(
          "omninexus_authenticated",
          "true"
        );

        /*
         * Optional user email for UI components.
         */
        localStorage.setItem(
          "omninexus_user_email",
          email.trim()
        );

        /*
         * Store login timestamp.
         */
        localStorage.setItem(
          "omninexus_login_time",
          new Date().toISOString()
        );

        setSuccess(
          "Signed in. Opening your workspace..."
        );

        /*
         * Give the interface a short moment to
         * display the successful state.
         */
        window.setTimeout(() => {
          router.push(
            "/career-simulator"
          );

          router.refresh();
        }, 650);

        return;
      }

      /* -----------------------------------------------------
         SIGNUP
         ----------------------------------------------------- */

      /*
       * Some APIs return a token immediately after signup.
       * If that happens, we can authenticate directly.
       */
      const signupToken =
        extractToken(data);

      if (signupToken) {
        sessionStorage.setItem(
          "omninexus_token",
          signupToken
        );

        localStorage.setItem(
          "omninexus_authenticated",
          "true"
        );

        localStorage.setItem(
          "omninexus_user_email",
          email.trim()
        );

        setSuccess(
          "Account created. Opening your workspace..."
        );

        window.setTimeout(() => {
          router.push(
            "/career-simulator"
          );

          router.refresh();
        }, 650);

        return;
      }

      /*
       * Normal signup flow:
       * switch back to Login.
       */
      setSuccess(
        responseMessage ||
        "Account created successfully. You can now sign in."
      );

      setIsLogin(true);

      setPassword("");

      setShowPassword(false);
    } catch (err) {
      console.error(
        "OmniNexus authentication error:",
        err
      );

      let message =
        "Unable to communicate with the OmniNexus API.";

      if (err instanceof Error) {
        message =
          err.message ||
          message;
      } else {
        const extracted =
          extractApiMessage(err);

        if (extracted) {
          message = extracted;
        }
      }

      /*
       * Extra protection against the exact issue
       * visible in your screenshot.
       */
      if (
        message === "[object Object]"
      ) {
        message =
          "The backend returned an unreadable error object. Check the FastAPI response.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     MODE SWITCH
     ========================================================= */

  const toggleMode = () => {
    if (loading) {
      return;
    }

    setIsLogin(
      (current) => !current
    );

    setError("");

    setSuccess("");

    setPassword("");

    setShowPassword(false);
  };

  /* =========================================================
     CLEAR FORM
     ========================================================= */

  const clearForm = () => {
    if (loading) {
      return;
    }

    setEmail("");

    setPassword("");

    setError("");

    setSuccess("");

    setShowPassword(false);
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b14] text-white">
      {/* =====================================================
          BACKGROUND SYSTEM EFFECTS
          ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Indigo glow */}
        <div
          className="
            absolute
            -left-48
            -top-48
            h-[600px]
            w-[600px]
            rounded-full
            bg-indigo-600/[0.10]
            blur-[140px]
          "
        />

        {/* Cyan glow */}
        <div
          className="
            absolute
            -right-48
            bottom-[-100px]
            h-[650px]
            w-[650px]
            rounded-full
            bg-cyan-500/[0.08]
            blur-[140px]
          "
        />

        {/* Green infrastructure glow */}
        <div
          className="
            absolute
            left-[35%]
            top-[35%]
            h-[300px]
            w-[300px]
            rounded-full
            bg-emerald-500/[0.035]
            blur-[120px]
          "
        />

        {/* Dot grid */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)]
            bg-[size:24px_24px]
          "
        />

        {/* Scan line */}
        <div
          className="
            absolute
            left-0
            right-0
            top-1/2
            h-px
            bg-gradient-to-r
            from-transparent
            via-cyan-400/10
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          MAIN LAYOUT
          ===================================================== */}

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* ===================================================
            LEFT SYSTEM PANEL
            =================================================== */}

        <section
          className="
            hidden
            min-h-screen
            flex-col
            justify-center
            border-r
            border-slate-800/70
            bg-[#08111f]/65
            px-12
            backdrop-blur-xl
            lg:flex
            lg:w-[48%]
            lg:px-16
            xl:w-1/2
            xl:px-24
          "
        >
          <div className="mx-auto w-full max-w-xl">
            {/* -------------------------------------------------
                BRAND
                ------------------------------------------------- */}

            <div className="mb-10">
              <div
                className="
                  mb-5
                  inline-flex
                  items-center
                  gap-3
                  rounded-full
                  border
                  border-cyan-500/20
                  bg-cyan-500/[0.04]
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  tracking-[0.2em]
                  text-cyan-400
                "
              >
                <Activity
                  size={14}
                />

                OMNINEXUS OS

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              </div>

              <h1
                className="
                  text-6xl
                  font-black
                  tracking-[0.16em]
                  text-indigo-400
                  xl:text-7xl
                "
              >
                OMNINEXUS
              </h1>

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-slate-500
                "
              >
                Workforce Intelligence
                Operating System
              </p>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
                A unified intelligence layer
                for career simulation, talent
                discovery, workforce analytics,
                and graph-driven decision
                systems.
              </p>
            </div>

            {/* -------------------------------------------------
                SYSTEM CARD
                ------------------------------------------------- */}

            <div
              className="
                rounded-2xl
                border
                border-slate-800
                bg-[#030712]/80
                p-6
                shadow-[0_20px_80px_rgba(0,0,0,0.35)]
              "
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      border
                      ${currentHealth.bg}
                      ${currentHealth.border}
                    `}
                  >
                    <HealthIcon
                      size={18}
                      className={
                        currentHealth.color
                      }
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Neural Infrastructure
                    </p>

                    <p
                      className={`
                        mt-1
                        text-xs
                        font-semibold
                        ${currentHealth.color}
                      `}
                    >
                      {healthMessage}
                    </p>
                  </div>
                </div>

                <span
                  className={`
                    h-2.5
                    w-2.5
                    rounded-full
                    ${currentHealth.dot}
                    ${currentHealth.glow}
                    ${healthState ===
                      "checking"
                      ? "animate-pulse"
                      : ""
                    }
                  `}
                />
              </div>

              <div className="space-y-4 font-mono text-xs">
                {/* FastAPI */}
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">
                    {">"}
                  </span>

                  <span className="text-slate-500">
                    FastAPI Intelligence Layer
                  </span>

                  <span className="ml-auto text-emerald-400">
                    :8001
                  </span>
                </div>

                {/* SQLite */}
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">
                    {">"}
                  </span>

                  <span className="text-slate-500">
                    SQLite Data Engine
                  </span>

                  <span
                    className={`
                      ml-auto
                      ${healthState ===
                        "online"
                        ? "text-emerald-400"
                        : "text-slate-600"
                      }
                    `}
                  >
                    {healthState ===
                      "online"
                      ? "READY"
                      : "WAITING"}
                  </span>
                </div>

                {/* SQLAlchemy */}
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">
                    {">"}
                  </span>

                  <span className="text-slate-500">
                    SQLAlchemy ORM
                  </span>

                  <span className="ml-auto text-emerald-400">
                    MAPPED
                  </span>
                </div>

                {/* Graph */}
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">
                    {">"}
                  </span>

                  <span className="text-slate-500">
                    Graph Intelligence
                  </span>

                  <span className="ml-auto text-emerald-400">
                    ACTIVE
                  </span>
                </div>
              </div>

              {/* API SERVICE */}
              <div className="mt-6 border-t border-slate-800 pt-5">
                <div className="flex items-center gap-3">
                  <Server
                    size={15}
                    className="text-cyan-400"
                  />

                  <span className="text-[10px] uppercase tracking-widest text-slate-600">
                    Service
                  </span>

                  <span className="ml-auto max-w-[220px] truncate text-[10px] text-slate-500">
                    {healthService}
                  </span>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------
                MODULE CARDS
                ------------------------------------------------- */}

            <div className="mt-8 grid grid-cols-3 gap-3">
              {/* Career */}
              <div
                className="
                  group
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/40
                  p-4
                  transition-all
                  hover:border-indigo-500/30
                  hover:bg-indigo-500/[0.04]
                "
              >
                <Cpu
                  size={18}
                  className="
                    mb-3
                    text-indigo-400
                    transition-transform
                    group-hover:scale-110
                  "
                />

                <p className="text-xs font-semibold text-slate-300">
                  Career
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  Simulation
                </p>
              </div>

              {/* Talent */}
              <div
                className="
                  group
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/40
                  p-4
                  transition-all
                  hover:border-cyan-500/30
                  hover:bg-cyan-500/[0.04]
                "
              >
                <Network
                  size={18}
                  className="
                    mb-3
                    text-cyan-400
                    transition-transform
                    group-hover:scale-110
                  "
                />

                <p className="text-xs font-semibold text-slate-300">
                  Talent
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  Intelligence
                </p>
              </div>

              {/* System */}
              <div
                className="
                  group
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/40
                  p-4
                  transition-all
                  hover:border-emerald-500/30
                  hover:bg-emerald-500/[0.04]
                "
              >
                <Database
                  size={18}
                  className="
                    mb-3
                    text-emerald-400
                    transition-transform
                    group-hover:scale-110
                  "
                />

                <p className="text-xs font-semibold text-slate-300">
                  System
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  Database
                </p>
              </div>
            </div>

            {/* Architecture footer */}
            <div className="mt-7 flex items-center gap-6 text-[9px] uppercase tracking-[0.2em] text-slate-700">
              <span>AI GRAPH</span>
              <span>•</span>
              <span>REAL-TIME API</span>
              <span>•</span>
              <span>SECURE AUTH</span>
            </div>
          </div>
        </section>

        {/* ===================================================
            RIGHT AUTH PANEL
            =================================================== */}

        <section
          className="
            flex
            min-h-screen
            flex-1
            items-center
            justify-center
            bg-[#0b1322]/60
            px-5
            py-10
            sm:px-8
            sm:py-12
            lg:px-14
            xl:px-24
          "
        >
          <div className="w-full max-w-lg">
            {/* -------------------------------------------------
                MOBILE BRAND
                ------------------------------------------------- */}

            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-indigo-500/30
                    bg-indigo-500/10
                  "
                >
                  <Activity
                    size={21}
                    className="text-indigo-400"
                  />
                </div>

                <div>
                  <h1 className="text-xl font-black tracking-[0.2em] text-indigo-400">
                    OMNINEXUS
                  </h1>

                  <p className="text-[10px] uppercase tracking-widest text-slate-600">
                    Workforce Intelligence OS
                  </p>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------
                HEADER
                ------------------------------------------------- */}

            <div className="mb-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Zap
                      size={13}
                      className="text-indigo-400"
                    />

                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-400">
                      Secure Access Layer
                    </p>
                  </div>

                  <h2 className="text-3xl font-black text-white sm:text-4xl">
                    {isLogin
                      ? "Access OmniNexus"
                      : "Create account"}
                  </h2>

                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                    {isLogin
                      ? "Authenticate to access the OmniNexus workforce intelligence environment."
                      : "Create your secure identity inside the OmniNexus intelligence graph."}
                  </p>
                </div>

                <div
                  className="
                    hidden
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-indigo-500/20
                    bg-indigo-500/[0.06]
                    sm:flex
                  "
                >
                  {isLogin ? (
                    <LogIn
                      size={20}
                      className="text-indigo-400"
                    />
                  ) : (
                    <UserPlus
                      size={20}
                      className="text-indigo-400"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                AUTH CARD
                ================================================= */}

            <div
              className="
                rounded-2xl
                border
                border-slate-800/80
                bg-[#08111f]/85
                p-5
                shadow-[0_30px_100px_rgba(0,0,0,0.4)]
                backdrop-blur-xl
                sm:p-8
              "
            >
              {/* -------------------------------------------------
                  CONNECTION STATUS
                  ------------------------------------------------- */}

              <div
                className={`
                  mb-6
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  px-4
                  py-3
                  ${currentHealth.bg}
                  ${currentHealth.border}
                `}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`
                      h-2
                      w-2
                      rounded-full
                      ${currentHealth.dot}
                      ${healthState ===
                        "checking"
                        ? "animate-pulse"
                        : ""
                      }
                    `}
                  />

                  <div>
                    <p
                      className={`
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-widest
                        ${currentHealth.color}
                      `}
                    >
                      {currentHealth.label}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      FastAPI · localhost:8001
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkBackendHealth}
                  disabled={
                    healthState ===
                    "checking"
                  }
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-[10px]
                    font-semibold
                    text-slate-500
                    transition
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <RefreshCw
                    size={11}
                    className={
                      healthState ===
                        "checking"
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {healthState ===
                    "checking"
                    ? "CHECKING..."
                    : "RECHECK"}
                </button>
              </div>

              {/* -------------------------------------------------
                  ERROR
                  ------------------------------------------------- */}

              {error && (
                <div
                  className="
                    mb-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-rose-500/20
                    bg-rose-500/[0.07]
                    px-4
                    py-3
                  "
                >
                  <AlertCircle
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-rose-400
                    "
                  />

                  <div>
                    <p className="text-xs font-semibold leading-5 text-rose-400">
                      {error}
                    </p>

                    {healthState ===
                      "offline" && (
                        <p className="mt-2 text-[10px] leading-4 text-rose-400/60">
                          Confirm that FastAPI is
                          running on localhost:8001.
                        </p>
                      )}
                  </div>
                </div>
              )}

              {/* -------------------------------------------------
                  SUCCESS
                  ------------------------------------------------- */}

              {success && (
                <div
                  className="
                    mb-5
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/[0.06]
                    px-4
                    py-3
                  "
                >
                  <CheckCircle2
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-emerald-400
                    "
                  />

                  <p className="text-xs font-semibold leading-5 text-emerald-400">
                    {success}
                  </p>
                </div>
              )}

              {/* =================================================
                  FORM
                  ================================================= */}

              <form
                onSubmit={handleAuth}
                className="space-y-5"
              >
                {/* -------------------------------------------------
                    EMAIL
                    ------------------------------------------------- */}

                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-slate-500
                    "
                  >
                    Identity / Email
                  </label>

                  <div className="relative">
                    <Mail
                      className="
                        absolute
                        left-4
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-600
                      "
                    />

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      disabled={loading}
                      onChange={(event) => {
                        setEmail(
                          event.target.value
                        );

                        if (error) {
                          setError("");
                        }
                      }}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-slate-800
                        bg-[#030712]/80
                        pl-11
                        pr-4
                        text-sm
                        text-slate-200
                        outline-none
                        transition-all
                        placeholder:text-slate-700
                        focus:border-indigo-500/60
                        focus:bg-slate-950
                        focus:ring-2
                        focus:ring-indigo-500/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      placeholder="name@university.edu"
                    />
                  </div>
                </div>

                {/* -------------------------------------------------
                    PASSWORD
                    ------------------------------------------------- */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-widest
                        text-slate-500
                      "
                    >
                      Security Key
                    </label>

                    <span className="text-[9px] font-mono text-slate-700">
                      ENCRYPTED
                    </span>
                  </div>

                  <div className="relative">
                    <Lock
                      className="
                        absolute
                        left-4
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-slate-600
                      "
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      minLength={6}
                      autoComplete={
                        isLogin
                          ? "current-password"
                          : "new-password"
                      }
                      value={password}
                      disabled={loading}
                      onChange={(event) => {
                        setPassword(
                          event.target.value
                        );

                        if (error) {
                          setError("");
                        }
                      }}
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-slate-800
                        bg-[#030712]/80
                        pl-11
                        pr-12
                        text-sm
                        text-slate-200
                        outline-none
                        transition-all
                        placeholder:text-slate-700
                        focus:border-indigo-500/60
                        focus:bg-slate-950
                        focus:ring-2
                        focus:ring-indigo-500/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                      placeholder="••••••••"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      disabled={loading}
                      className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        h-8
                        w-8
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-lg
                        text-slate-600
                        transition
                        hover:bg-slate-800
                        hover:text-slate-300
                        disabled:opacity-40
                      "
                    >
                      {showPassword ? (
                        <EyeOff
                          size={16}
                        />
                      ) : (
                        <Eye
                          size={16}
                        />
                      )}
                    </button>
                  </div>

                  {!isLogin && (
                    <p className="mt-2 text-[10px] text-slate-700">
                      Minimum password length:
                      6 characters.
                    </p>
                  )}
                </div>

                {/* -------------------------------------------------
                    SUBMIT
                    ------------------------------------------------- */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    relative
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-3
                    overflow-hidden
                    rounded-xl
                    bg-indigo-600
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_0_35px_rgba(99,102,241,0.18)]
                    transition-all
                    duration-200
                    hover:bg-indigo-500
                    hover:shadow-[0_0_45px_rgba(99,102,241,0.28)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {/* Shine animation */}
                  <span
                    className="
                      absolute
                      inset-0
                      -translate-x-full
                      bg-gradient-to-r
                      from-transparent
                      via-white/10
                      to-transparent
                      transition-transform
                      duration-700
                      group-hover:translate-x-full
                    "
                  />

                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      <span>
                        {isLogin
                          ? "SIGNING IN..."
                          : "CREATING ACCOUNT..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isLogin
                          ? "AUTHENTICATE"
                          : "CREATE TALENT TWIN"}
                      </span>

                      <ArrowRight
                        size={17}
                        className="
                          transition-transform
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}
                </button>

                {/* Backend warning */}
                {healthState ===
                  "offline" && (
                    <div className="flex items-center justify-center gap-2 text-center">
                      <WifiOff
                        size={12}
                        className="text-rose-500"
                      />

                      <span className="text-[10px] text-slate-600">
                        Authentication is
                        unavailable while the
                        Neural Engine is offline.
                      </span>
                    </div>
                  )}
              </form>

              {/* =================================================
                  MODE SWITCH
                  ================================================= */}

              <div className="mt-7 border-t border-slate-800/70 pt-6 text-center">
                <p className="text-xs text-slate-500">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}

                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={loading}
                    className="
                      ml-2
                      font-bold
                      text-indigo-400
                      transition
                      hover:text-indigo-300
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isLogin
                      ? "Create one"
                      : "Sign in"}
                  </button>
                </p>
              </div>

              {/* Clear form */}
              {(email ||
                password ||
                error ||
                success) && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={clearForm}
                      disabled={loading}
                      className="
                      text-[10px]
                      uppercase
                      tracking-widest
                      text-slate-700
                      transition
                      hover:text-slate-400
                      disabled:opacity-40
                    "
                    >
                      Clear Interface
                    </button>
                  </div>
                )}
            </div>

            {/* =================================================
                SECURITY FOOTER
                ================================================= */}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={12}
                  className="text-emerald-500"
                />

                <span className="text-[9px] uppercase tracking-widest text-slate-600">
                  Secure sign-in
                </span>
              </div>

              <div className="h-3 w-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <Database
                  size={12}
                  className="text-cyan-500"
                />

                <span className="text-[9px] uppercase tracking-widest text-slate-600">
                  SQLite
                </span>
              </div>

              <div className="h-3 w-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <Network
                  size={12}
                  className="text-indigo-500"
                />

                <span className="text-[9px] uppercase tracking-widest text-slate-600">
                  Graph OS
                </span>
              </div>

              <div className="h-3 w-px bg-slate-800" />

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={12}
                  className="text-emerald-500"
                />

                <span className="text-[9px] uppercase tracking-widest text-slate-600">
                  API Ready
                </span>
              </div>
            </div>

            {/* API endpoint */}
            <div className="mt-5 text-center">
              <p className="font-mono text-[9px] text-slate-800">
                NEURAL ENDPOINT ·{" "}
                {API_BASE_URL}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}