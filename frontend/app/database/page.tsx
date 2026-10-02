"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  Filter,
  Fingerprint,
  HardDrive,
  Mail,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  Wifi,
  WifiOff,
  X,
  XCircle,
  Zap,
} from "lucide-react";

/* ==========================================================================
   TYPES
   ========================================================================== */

type UserRecord = {
  id?: number | null;
  uuid?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  last_active?: string | null;
  is_active?: boolean | string | number | null;
};

type ApiResponse = {
  status?: string;
  count?: number;
  data?: UserRecord[];
  detail?: string;
  message?: string;
};

type HealthState = "ONLINE" | "OFFLINE" | "CHECKING" | "UNKNOWN";
type FilterType = "ALL" | "ACTIVE" | "INACTIVE";
type SortType = "NEWEST" | "OLDEST" | "EMAIL" | "ROLE" | "STATUS";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8001";

const AUTO_REFRESH_MS = 30000;

/* ==========================================================================
   HELPERS
   ========================================================================== */

function isUserActive(user: UserRecord): boolean {
  const value = user.is_active;

  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["true", "1", "active", "yes", "online", "enabled"].includes(normalized)) {
      return true;
    }

    if (
      ["false", "0", "inactive", "no", "offline", "disabled"].includes(
        normalized
      )
    ) {
      return false;
    }
  }

  return user.status?.trim().toLowerCase() === "active";
}

function formatRole(role?: string | null) {
  if (!role) return "Talent Node";

  return role
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getIdentity(user: UserRecord) {
  if (user.uuid) return user.uuid;

  if (user.id !== undefined && user.id !== null) {
    return `usr_${user.id}`;
  }

  return "usr_unknown";
}

function getNodeLabel(user: UserRecord) {
  if (user.id !== undefined && user.id !== null) {
    return String(user.id).padStart(4, "0");
  }

  if (user.uuid) {
    return user.uuid.replace(/^usr_/i, "").toUpperCase();
  }

  return "UNKNOWN";
}

function safeText(value?: string | null, fallback = "Unknown") {
  return value?.trim() || fallback;
}

function formatLatency(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function latencyState(ms: number | null) {
  if (ms === null) return "UNKNOWN";
  if (ms < 250) return "FAST";
  if (ms < 600) return "NORMAL";
  if (ms < 1200) return "SLOW";
  return "HIGH";
}

function connectedDot(online: boolean) {
  return online
    ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]"
    : "bg-amber-400";
}

/* ==========================================================================
   MAIN
   ========================================================================== */

export default function DatabaseView() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [sort, setSort] = useState<SortType>("NEWEST");

  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const [lastUpdated, setLastUpdated] = useState("");
  const [lastRefreshDate, setLastRefreshDate] = useState("");

  const [apiHealth, setApiHealth] = useState<HealthState>("CHECKING");
  const [dbHealth, setDbHealth] = useState<HealthState>("CHECKING");
  const [authHealth, setAuthHealth] = useState<HealthState>("CHECKING");

  const [registryLatency, setRegistryLatency] = useState<number | null>(null);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  const [copied, setCopied] = useState("");
  const [exporting, setExporting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showControls, setShowControls] = useState(false);

  /* ========================================================================
     COPY
     ======================================================================== */

  const copyValue = async (value: string, label: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);

      window.setTimeout(() => {
        setCopied("");
      }, 1800);
    } catch (copyError) {
      console.error("Copy failed:", copyError);
    }
  };

  /* ========================================================================
     HEALTH
     ======================================================================== */

  const checkHealth = useCallback(async () => {
    const started = performance.now();
    setApiHealth("CHECKING");

    try {
      const response = await fetch(`${API_URL}/api/v1/health`, {
        method: "GET",
        cache: "no-store",
      });

      const elapsed = performance.now() - started;
      setHealthLatency(elapsed);

      if (!response.ok) {
        setApiHealth("OFFLINE");
        return;
      }

      setApiHealth("ONLINE");
    } catch (healthError) {
      console.error("Health check failed:", healthError);
      setApiHealth("OFFLINE");
    }
  }, []);

  /* ========================================================================
     FETCH REGISTRY
     ======================================================================== */

  const fetchUsers = useCallback(
    async (manualRefresh = false) => {
      if (typeof window === "undefined") return;

      const token = sessionStorage.getItem("omninexus_token");

      if (!token) {
        setAuthHealth("OFFLINE");
        setApiHealth("UNKNOWN");
        setDbHealth("UNKNOWN");
        setError("Authentication required. Please sign in again.");
        setUsers([]);
        setLoading(false);
        return;
      }

      setAuthHealth("ONLINE");

      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const started = performance.now();

      try {
        const response = await fetch(`${API_URL}/api/v1/admin/users`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const elapsed = performance.now() - started;
        setRegistryLatency(elapsed);

        let data: ApiResponse = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.status === 401) {
          sessionStorage.removeItem("omninexus_token");
          setAuthHealth("OFFLINE");
          setApiHealth("ONLINE");
          setDbHealth("UNKNOWN");
          setUsers([]);
          setError("Session expired. Please sign in again.");
          return;
        }

        if (response.status === 403) {
          setAuthHealth("ONLINE");
          setApiHealth("ONLINE");
          setDbHealth("ONLINE");
          setError(
            "Access denied. Your account does not have permission to access the database console."
          );
          return;
        }

        if (!response.ok) {
          setApiHealth("OFFLINE");
          setDbHealth("UNKNOWN");

          throw new Error(
            data.detail ||
            data.message ||
            `Database request failed with status ${response.status}.`
          );
        }

        if (data.status !== "success") {
          throw new Error(
            data.detail ||
            data.message ||
            "Unable to load user records."
          );
        }

        const records = Array.isArray(data.data) ? data.data : [];

        setUsers(records);
        setApiHealth("ONLINE");
        setDbHealth("ONLINE");

        const now = new Date();

        setLastUpdated(
          now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );

        setLastRefreshDate(
          now.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        );
      } catch (requestError) {
        console.error("OmniNexus database error:", requestError);

        setApiHealth("OFFLINE");
        setDbHealth("OFFLINE");

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to connect to the OmniNexus database."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* ========================================================================
     INITIAL LOAD
     ======================================================================== */

  useEffect(() => {
    checkHealth();
    fetchUsers();
  }, [checkHealth, fetchUsers]);

  /* ========================================================================
     AUTO REFRESH
     ======================================================================== */

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = window.setInterval(() => {
      checkHealth();
      fetchUsers(true);
    }, AUTO_REFRESH_MS);

    return () => window.clearInterval(interval);
  }, [autoRefresh, checkHealth, fetchUsers]);

  /* ========================================================================
     VISIBILITY
     ======================================================================== */

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkHealth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [checkHealth]);

  /* ========================================================================
     KEYBOARD SHORTCUTS
     ======================================================================== */

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
        return;
      }

      if (
        event.key.toLowerCase() === "r" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const target = event.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();

        if (tag !== "input" && tag !== "textarea" && tag !== "select") {
          fetchUsers(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [fetchUsers]);

  /* ========================================================================
     METRICS
     ======================================================================== */

  const activeUsers = useMemo(
    () => users.filter((user) => isUserActive(user)),
    [users]
  );

  const inactiveUsers = useMemo(
    () => users.filter((user) => !isUserActive(user)),
    [users]
  );

  const activeRatio =
    users.length > 0
      ? Math.round((activeUsers.length / users.length) * 100)
      : 0;

  const uniqueRoles = useMemo(
    () =>
      new Set(
        users.map((user) => formatRole(user.role))
      ).size,
    [users]
  );

  const systemOnline =
    apiHealth === "ONLINE" &&
    dbHealth === "ONLINE" &&
    authHealth === "ONLINE";

  /* ========================================================================
     FILTER / SEARCH / SORT
     ======================================================================== */

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = users.filter((user) => {
      const active = isUserActive(user);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && active) ||
        (filter === "INACTIVE" && !active);

      if (!matchesFilter) return false;
      if (!query) return true;

      return (
        user.email?.toLowerCase().includes(query) ||
        user.uuid?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.status?.toLowerCase().includes(query) ||
        String(user.id ?? "").includes(query)
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "OLDEST":
          return (a.id ?? 0) - (b.id ?? 0);

        case "EMAIL":
          return (a.email ?? "").localeCompare(b.email ?? "");

        case "ROLE":
          return (a.role ?? "").localeCompare(b.role ?? "");

        case "STATUS":
          return (a.status ?? "").localeCompare(b.status ?? "");

        case "NEWEST":
        default:
          return (b.id ?? 0) - (a.id ?? 0);
      }
    });
  }, [users, search, filter, sort]);

  /* ========================================================================
     EXPORT CSV
     ======================================================================== */

  const exportRegistry = () => {
    if (!filteredUsers.length) return;

    setExporting(true);

    try {
      const headers = [
        "ID",
        "UUID",
        "Email",
        "Role",
        "Status",
        "Last Active",
        "Active",
      ];

      const rows = filteredUsers.map((user) => [
        user.id ?? "",
        user.uuid ?? "",
        user.email ?? "",
        formatRole(user.role),
        user.status ?? "",
        user.last_active ?? "",
        isUserActive(user) ? "Active" : "Inactive",
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `omninexus-registry-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } finally {
      window.setTimeout(() => setExporting(false), 500);
    }
  };

  /* ========================================================================
     EXPORT JSON
     ======================================================================== */

  const exportJson = () => {
    if (!filteredUsers.length) return;

    setExporting(true);

    try {
      const payload = {
        exported_at: new Date().toISOString(),
        source: "OmniNexus Identity Registry",
        count: filteredUsers.length,
        records: filteredUsers,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `omninexus-registry-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } finally {
      window.setTimeout(() => setExporting(false), 500);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilter("ALL");
    setSort("NEWEST");
  };

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  /* ========================================================================
     UI
     ======================================================================== */

  return (
    <main className="min-h-screen bg-[#040911] text-slate-300 font-sans px-4 sm:px-6 lg:px-8 pt-8 pb-36">
      <div className="max-w-[1500px] mx-auto">

        {/* HERO */}
        <section className="mb-8">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">
            <div className="flex items-start gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/15 to-transparent text-cyan-400 shadow-[0_0_45px_rgba(34,211,238,0.12)]">
                <Database size={36} />
                <span
                  className={`absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-[#040911] ${connectedDot(
                    systemOnline
                  )}`}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] text-white">
                    System Database
                    <span className="block text-cyan-400">
                      Command Center
                    </span>
                  </h1>

                  <ConnectionBadge
                    state={systemOnline ? "ONLINE" : "DEGRADED"}
                  />
                </div>

                <p className="mt-3 max-w-2xl text-sm sm:text-base leading-6 text-slate-500">
                  OmniNexus identity infrastructure, authenticated registry
                  management, live database telemetry and operational
                  diagnostics.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <MiniBadge>
                    <Server size={12} />
                    API :8001
                  </MiniBadge>

                  <MiniBadge>
                    <Database size={12} />
                    SQLITE
                  </MiniBadge>

                  <MiniBadge>
                    <ShieldCheck size={12} />
                    JWT SECURED
                  </MiniBadge>

                  <MiniBadge>
                    <Activity size={12} />
                    LIVE TELEMETRY
                  </MiniBadge>

                  <MiniBadge>
                    <Zap size={12} />
                    AUTO SYNC {autoRefresh ? "ON" : "OFF"}
                  </MiniBadge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowControls((value) => !value)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-cyan-500/30 hover:text-cyan-300"
              >
                <SlidersHorizontal size={17} />
                Controls
              </button>

              <button
                onClick={exportJson}
                disabled={exporting || !filteredUsers.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-violet-500/30 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FileJson size={17} />
                JSON
              </button>

              <button
                onClick={exportRegistry}
                disabled={exporting || !filteredUsers.length}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0b1421] px-4 py-3 text-sm font-bold text-slate-400 transition hover:border-cyan-500/30 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={17} />
                CSV
              </button>

              <button
                onClick={() => fetchUsers(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Syncing..." : "Refresh Registry"}
              </button>
            </div>
          </div>

          {showControls && (
            <div className="mt-5 rounded-2xl border border-slate-800 bg-[#07111d] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-widest text-white">
                    COMMAND CONTROLS
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Press R to manually refresh. Press Escape to close the
                    identity drawer.
                  </p>
                </div>

                <button
                  onClick={() => setAutoRefresh((value) => !value)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black tracking-wider transition ${autoRefresh
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-slate-700 bg-slate-900 text-slate-500"
                    }`}
                >
                  <Activity size={14} />
                  AUTO REFRESH {autoRefresh ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* HEALTH */}
        <section className="mb-7 rounded-3xl border border-slate-800 bg-gradient-to-br from-[#091321] to-[#060d16] p-5 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.25)]">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Activity size={19} />
              </div>

              <div>
                <h2 className="text-sm font-black tracking-[0.15em] text-white">
                  DATABASE HEALTH
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Live infrastructure diagnostics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-emerald-400">
                {autoRefresh ? "LIVE" : "MANUAL"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            <HealthCard
              icon={<Server size={17} />}
              label="API"
              value={apiHealth}
              state={apiHealth}
            />

            <HealthCard
              icon={<Database size={17} />}
              label="DATABASE"
              value={dbHealth}
              state={dbHealth}
            />

            <HealthCard
              icon={<ShieldCheck size={17} />}
              label="AUTH"
              value={authHealth}
              state={authHealth}
            />

            <HealthCard
              icon={<Zap size={17} />}
              label="API RESPONSE"
              value={formatLatency(healthLatency)}
              state={
                healthLatency === null
                  ? "UNKNOWN"
                  : healthLatency < 1200
                    ? "ONLINE"
                    : "OFFLINE"
              }
            />

            <HealthCard
              icon={<HardDrive size={17} />}
              label="REGISTRY QUERY"
              value={formatLatency(registryLatency)}
              state={
                registryLatency === null
                  ? "UNKNOWN"
                  : registryLatency < 1200
                    ? "ONLINE"
                    : "OFFLINE"
              }
            />
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <section className="mb-7 rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <AlertTriangle
                  size={22}
                  className="mt-0.5 shrink-0 text-rose-400"
                />

                <div>
                  <h2 className="font-bold text-rose-300">
                    Connection diagnostic
                  </h2>

                  <p className="mt-1 text-sm text-rose-300/70">{error}</p>
                </div>
              </div>

              {(error.toLowerCase().includes("authentication") ||
                error.toLowerCase().includes("session") ||
                error.toLowerCase().includes("sign in")) && (
                  <button
                    onClick={handleLoginRedirect}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300 hover:bg-rose-500/20"
                  >
                    Sign In Again
                  </button>
                )}
            </div>
          </section>
        )}

        {/* STATISTICS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-7">
          <LargeMetric
            label="TOTAL IDENTITIES"
            value={users.length}
            description="Registered talent nodes"
            icon={<Users size={24} />}
            iconClass="text-cyan-400"
          />

          <LargeMetric
            label="ACTIVE NODES"
            value={activeUsers.length}
            description={`${activeRatio}% active ratio`}
            icon={<CheckCircle2 size={24} />}
            iconClass="text-emerald-400"
          />

          <LargeMetric
            label="INACTIVE NODES"
            value={inactiveUsers.length}
            description="Currently inactive"
            icon={<XCircle size={24} />}
            iconClass="text-amber-400"
          />

          <LargeMetric
            label="ACCESS ROLES"
            value={uniqueRoles}
            description="Distinct role classes"
            icon={<ShieldCheck size={24} />}
            iconClass="text-violet-400"
          />

          <LargeMetric
            label="CURRENT QUERY"
            value={filteredUsers.length}
            description={
              search
                ? `Searching "${search}"`
                : filter === "ALL"
                  ? "All identities"
                  : `${filter.toLowerCase()} identities`
            }
            icon={<Search size={24} />}
            iconClass="text-fuchsia-400"
          />
        </section>

        {/* TELEMETRY */}
        <section className="mb-7 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Telemetry
            label="ACTIVE RATIO"
            value={`${activeRatio}%`}
            icon={<Activity size={15} />}
          />

          <Telemetry
            label="REGISTRY LATENCY"
            value={formatLatency(registryLatency)}
            icon={<Zap size={15} />}
            sub={
              registryLatency !== null
                ? latencyState(registryLatency)
                : undefined
            }
          />

          <Telemetry
            label="LAST SYNC"
            value={lastUpdated || "WAITING"}
            icon={<Clock3 size={15} />}
          />

          <Telemetry
            label="SYNC DATE"
            value={lastRefreshDate || "WAITING"}
            icon={<Database size={15} />}
          />

          <Telemetry
            label="REGISTRY STATE"
            value={systemOnline ? "HEALTHY" : "CHECKING"}
            icon={systemOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
          />
        </section>

        {/* SECURITY */}
        <section className="mb-7 rounded-2xl border border-amber-500/20 bg-amber-500/[0.035] p-5">
          <div className="flex items-start gap-4">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-bold text-amber-300">
                  Secure identity registry
                </h2>

                <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-400">
                  PROTECTED
                </span>
              </div>

              <p className="mt-1 text-sm text-amber-300/60">
                Records are retrieved through the authenticated OmniNexus
                API. Password hashes and other sensitive authentication data
                are never exposed to this frontend.
              </p>
            </div>
          </div>
        </section>

        {/* REGISTRY */}
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-[#09121e] shadow-[0_0_60px_rgba(0,0,0,0.25)]">
          <div className="border-b border-slate-800 p-5 sm:p-7">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                  <UserRound size={20} />
                </div>

                <div>
                  <h2 className="text-sm font-black tracking-[0.15em] text-white">
                    AUTH USERS REGISTRY
                  </h2>

                  <p className="mt-1 text-xs text-slate-600">
                    Registered OmniNexus talent identities
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search identity..."
                    aria-label="Search identities"
                    className="w-full sm:w-72 rounded-xl border border-slate-800 bg-[#060d16] py-3 pl-10 pr-10 text-sm text-white outline-none placeholder:text-slate-700 focus:border-cyan-500/40"
                  />

                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex rounded-xl border border-slate-800 bg-[#060d16] p-1">
                  {(["ALL", "ACTIVE", "INACTIVE"] as FilterType[]).map(
                    (option) => (
                      <button
                        key={option}
                        onClick={() => setFilter(option)}
                        className={`rounded-lg px-3 py-2 text-[10px] font-black tracking-widest transition ${filter === option
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "text-slate-600 hover:text-slate-300"
                          }`}
                      >
                        {option}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                {lastUpdated && (
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={13} />
                    Updated {lastUpdated}
                  </span>
                )}

                <span className="inline-flex items-center gap-2">
                  <Server size={13} />
                  API :8001
                </span>

                <span className="inline-flex items-center gap-2">
                  <Database size={13} />
                  SQLite
                </span>

                <span className="inline-flex items-center gap-2">
                  <Activity size={13} />
                  {autoRefresh ? "30s auto sync" : "manual sync"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Filter
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <select
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortType)
                    }
                    className="appearance-none rounded-full border border-slate-800 bg-[#060d16] py-2 pl-8 pr-8 text-[10px] font-bold tracking-wider text-slate-500 outline-none"
                    aria-label="Sort registry"
                  >
                    <option value="NEWEST">Newest</option>
                    <option value="OLDEST">Oldest</option>
                    <option value="EMAIL">Email</option>
                    <option value="ROLE">Role</option>
                    <option value="STATUS">Status</option>
                  </select>

                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-700"
                  />
                </div>

                <button
                  onClick={exportJson}
                  disabled={exporting || !filteredUsers.length}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#060d16] px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:border-violet-500/30 hover:text-violet-300 disabled:opacity-40"
                >
                  <FileJson size={13} />
                  JSON
                </button>

                <button
                  onClick={exportRegistry}
                  disabled={exporting || !filteredUsers.length}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-[#060d16] px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:border-cyan-500/30 hover:text-cyan-300 disabled:opacity-40"
                >
                  <Download size={13} />
                  CSV
                </button>

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-bold text-emerald-400">
                  <Users size={14} />
                  {filteredUsers.length} Records
                </span>
              </div>
            </div>

            {(search || filter !== "ALL") && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black tracking-widest text-slate-700">
                  CURRENT QUERY
                </span>

                {search && (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[10px] font-bold text-cyan-400">
                    {search}
                  </span>
                )}

                {filter !== "ALL" && (
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-[10px] font-bold text-violet-300">
                    {filter}
                  </span>
                )}

                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold tracking-wider text-slate-600 hover:text-white"
                >
                  CLEAR
                </button>
              </div>
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070e17]">
                  <th className="px-6 py-4 text-left text-[10px] font-black tracking-[0.18em] text-slate-600">
                    IDENTITY
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black tracking-[0.18em] text-slate-600">
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black tracking-[0.18em] text-slate-600">
                    ACCESS ROLE
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black tracking-[0.18em] text-slate-600">
                    ACTIVITY
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-black tracking-[0.18em] text-slate-600">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-black tracking-[0.18em] text-slate-600">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <LoadingRows />
                ) : filteredUsers.length === 0 ? (
                  <EmptyTableState />
                ) : (
                  filteredUsers.map((user, index) => (
                    <DesktopUserRow
                      key={user.id ?? user.uuid ?? index}
                      user={user}
                      onOpen={() => setSelectedUser(user)}
                      onCopy={copyValue}
                      copied={copied}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="md:hidden">
            {loading ? (
              <div className="p-5">
                <LoadingMobileCards />
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyMobileState />
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredUsers.map((user, index) => (
                  <MobileUserCard
                    key={user.id ?? user.uuid ?? index}
                    user={user}
                    onOpen={() => setSelectedUser(user)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-800 bg-[#070e17] px-5 py-4 sm:px-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] font-bold tracking-wider text-slate-700">
              <div className="flex flex-wrap gap-2">
                <span>OMNINEXUS IDENTITY REGISTRY</span>
                <span>·</span>
                <span>AUTHENTICATED ACCESS</span>
                <span>·</span>
                <span>{users.length} IDENTITIES</span>
              </div>

              <span
                className={`flex items-center gap-2 ${systemOnline ? "text-emerald-500" : "text-amber-500"
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${systemOnline ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                />
                {systemOnline ? "SYSTEM ONLINE" : "SYSTEM DEGRADED"}
              </span>
            </div>
          </div>
        </section>

        {/* DIAGNOSTICS */}
        <section className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Diagnostic
            label="API STATUS"
            value={apiHealth}
            active={apiHealth === "ONLINE"}
            icon={<Server size={15} />}
          />

          <Diagnostic
            label="DATABASE STATUS"
            value={dbHealth}
            active={dbHealth === "ONLINE"}
            icon={<Database size={15} />}
          />

          <Diagnostic
            label="AUTH STATUS"
            value={authHealth}
            active={authHealth === "ONLINE"}
            icon={<ShieldCheck size={15} />}
          />

          <Diagnostic
            label="QUERY LATENCY"
            value={
              registryLatency === null
                ? "—"
                : formatLatency(registryLatency)
            }
            active={
              registryLatency !== null && registryLatency < 1200
            }
            icon={<Zap size={15} />}
          />
        </section>
      </div>

      {/* DRAWER */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          copied={copied}
          onCopy={copyValue}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </main>
  );
}

/* ==========================================================================
   BADGES
   ========================================================================== */

function ConnectionBadge({ state }: { state: string }) {
  const online = state === "ONLINE";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black tracking-widest ${online
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
        }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
          }`}
      />
      {state}
    </span>
  );
}

function MiniBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-[9px] font-bold tracking-widest text-slate-600">
      {children}
    </span>
  );
}

/* ==========================================================================
   HEALTH CARD
   ========================================================================== */

function HealthCard({
  icon,
  label,
  value,
  state,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  state: HealthState;
}) {
  const online = state === "ONLINE";
  const checking = state === "CHECKING";

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#070f1a] p-4">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${online
            ? "bg-emerald-500/10 text-emerald-400"
            : checking
              ? "bg-cyan-500/10 text-cyan-400"
              : "bg-rose-500/10 text-rose-400"
            }`}
        >
          {icon}
        </div>

        <span
          className={`h-2 w-2 rounded-full ${online
            ? "bg-emerald-400"
            : checking
              ? "bg-cyan-400 animate-pulse"
              : "bg-rose-400"
            }`}
        />
      </div>

      <p className="mt-4 text-[9px] font-black tracking-[0.18em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${online
          ? "text-emerald-400"
          : checking
            ? "text-cyan-400"
            : state === "UNKNOWN"
              ? "text-slate-500"
              : "text-rose-400"
          }`}
      >
        {value}
      </p>
    </div>
  );
}

/* ==========================================================================
   LARGE METRIC
   ========================================================================== */

function LargeMetric({
  label,
  value,
  description,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#09111d] p-6 transition hover:border-slate-700 hover:bg-[#0b1522]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-slate-600">
            {label}
          </p>

          <p className="mt-4 text-4xl font-black tracking-tight text-white">
            {value}
          </p>

          <p className="mt-2 text-[10px] font-medium text-slate-600">
            {description}
          </p>
        </div>

        <div className={iconClass}>{icon}</div>
      </div>
    </div>
  );
}

/* ==========================================================================
   TELEMETRY
   ========================================================================== */

function Telemetry({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#070f19] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="text-cyan-400">{icon}</div>

        <div className="min-w-0">
          <p className="text-[8px] font-black tracking-[0.18em] text-slate-700">
            {label}
          </p>

          <div className="mt-0.5 flex items-center gap-2">
            <p className="truncate text-xs font-black text-slate-300">
              {value}
            </p>

            {sub && (
              <span className="text-[8px] font-black text-emerald-500">
                {sub}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   DESKTOP ROW
   ========================================================================== */

function DesktopUserRow({
  user,
  onOpen,
  onCopy,
  copied,
}: {
  user: UserRecord;
  onOpen: () => void;
  onCopy: (value: string, label: string) => void;
  copied: string;
}) {
  const active = isUserActive(user);
  const identity = getIdentity(user);

  return (
    <tr
      onClick={onOpen}
      className="group cursor-pointer border-b border-slate-800/70 transition hover:bg-cyan-500/[0.025]"
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-4">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${active
              ? "border-cyan-500/20 bg-cyan-500/[0.06] text-cyan-400"
              : "border-amber-500/20 bg-amber-500/[0.06] text-amber-400"
              }`}
          >
            <Fingerprint size={19} />

            <span
              className={`absolute right-0.5 top-0.5 h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-amber-400"
                }`}
            />
          </div>

          <div className="min-w-0">
            <p
              className="font-mono text-sm font-bold text-slate-200"
              title={identity}
            >
              {identity}
            </p>

            <p className="mt-1 text-[9px] font-bold tracking-[0.15em] text-slate-700">
              NODE #{getNodeLabel(user)}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <Mail size={15} className="shrink-0 text-slate-600" />

          <span
            className="max-w-[250px] truncate text-sm font-medium text-slate-300"
            title={safeText(user.email)}
          >
            {safeText(user.email, "No email")}
          </span>

          <button
            onClick={(event) => {
              event.stopPropagation();
              if (user.email) onCopy(user.email, "email");
            }}
            className="opacity-0 transition group-hover:opacity-100 text-slate-600 hover:text-cyan-400"
            title="Copy email"
            aria-label="Copy email"
          >
            {copied === "email" ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </td>

      <td className="px-6 py-5">
        <span className="inline-flex rounded-lg border border-indigo-500/20 bg-indigo-500/[0.07] px-3 py-1.5 text-[10px] font-black tracking-wider text-indigo-300">
          {formatRole(user.role)}
        </span>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock3 size={14} />
          {safeText(user.last_active, "Unknown")}
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${active
              ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
              : "bg-amber-400"
              }`}
          />

          <span
            className={`text-sm font-medium ${active ? "text-emerald-300" : "text-amber-300"
              }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-[10px] font-bold tracking-wider text-slate-500 transition hover:border-cyan-500/30 hover:text-cyan-300"
        >
          <Eye size={13} />
          VIEW
        </button>
      </td>
    </tr>
  );
}

/* ==========================================================================
   MOBILE CARD
   ========================================================================== */

function MobileUserCard({
  user,
  onOpen,
}: {
  user: UserRecord;
  onOpen: () => void;
}) {
  const active = isUserActive(user);

  return (
    <button
      onClick={onOpen}
      className="w-full text-left p-5 transition hover:bg-cyan-500/[0.025]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400">
            <Fingerprint size={19} />
          </div>

          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-bold text-slate-200">
              {getIdentity(user)}
            </p>

            <p className="mt-1 text-[9px] font-bold tracking-widest text-slate-700">
              NODE #{getNodeLabel(user)}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${active
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
            }`}
        >
          {active ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Mail size={13} />
          <span className="truncate">{safeText(user.email, "No email")}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={13} />
          {formatRole(user.role)}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Clock3 size={13} />
          {safeText(user.last_active, "Unknown")}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 text-[10px] font-black tracking-widest text-cyan-500">
        VIEW DETAILS
        <ExternalLink size={12} />
      </div>
    </button>
  );
}

/* ==========================================================================
   DRAWER
   ========================================================================== */

function UserDrawer({
  user,
  copied,
  onCopy,
  onClose,
}: {
  user: UserRecord;
  copied: string;
  onCopy: (value: string, label: string) => void;
  onClose: () => void;
}) {
  const active = isUserActive(user);

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Close user details"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-slate-800 bg-[#07101a] shadow-[-20px_0_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <UserRound size={18} />
            </div>

            <div>
              <p className="text-[10px] font-black tracking-widest text-cyan-400">
                IDENTITY DETAIL
              </p>

              <p className="mt-1 text-sm font-bold text-white">Talent Node</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-2xl border border-slate-800 bg-[#091522] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                <Fingerprint size={30} />
              </div>

              <div className="min-w-0">
                <p className="break-all font-mono text-lg font-black text-white">
                  {getIdentity(user)}
                </p>

                <p className="mt-1 text-[10px] font-bold tracking-widest text-slate-600">
                  NODE #{getNodeLabel(user)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-black tracking-wider text-indigo-300">
                {formatRole(user.role)}
              </span>

              <span
                className={`inline-flex items-center gap-2 text-xs font-bold ${active ? "text-emerald-400" : "text-amber-400"
                  }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                />
                {active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <DetailRow
              label="EMAIL ADDRESS"
              value={safeText(user.email, "No email")}
              icon={<Mail size={15} />}
              copyValue={user.email ?? ""}
              copyLabel="drawer-email"
              copied={copied}
              onCopy={onCopy}
            />

            <DetailRow
              label="UUID"
              value={safeText(user.uuid, "No UUID")}
              icon={<Fingerprint size={15} />}
              copyValue={user.uuid ?? ""}
              copyLabel="drawer-uuid"
              copied={copied}
              onCopy={onCopy}
            />

            <DetailRow
              label="DATABASE ID"
              value={String(user.id ?? "Not available")}
              icon={<Database size={15} />}
            />

            <DetailRow
              label="ROLE"
              value={formatRole(user.role)}
              icon={<ShieldCheck size={15} />}
            />

            <DetailRow
              label="STATUS"
              value={active ? "Active" : "Inactive"}
              icon={active ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            />

            <DetailRow
              label="LAST ACTIVE"
              value={safeText(user.last_active, "Unknown")}
              icon={<Clock3 size={15} />}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.035] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 text-emerald-400"
              />

              <div>
                <p className="text-xs font-bold text-emerald-300">
                  Secure identity
                </p>

                <p className="mt-1 text-[11px] leading-5 text-emerald-300/50">
                  Sensitive authentication data is not exposed by this
                  registry interface.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 p-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-700 bg-[#0d1927] py-3 text-sm font-bold text-slate-300 transition hover:border-cyan-500/30 hover:text-cyan-300"
          >
            Close Identity
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ==========================================================================
   DETAIL ROW
   ========================================================================== */

function DetailRow({
  label,
  value,
  icon,
  copyValue,
  copyLabel,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  copyValue?: string;
  copyLabel?: string;
  copied?: string;
  onCopy?: (value: string, label: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#08121e] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-600">{icon}</div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black tracking-[0.18em] text-slate-700">
            {label}
          </p>

          <p className="mt-1 break-all text-sm font-medium text-slate-300">
            {value}
          </p>
        </div>

        {copyValue && copyLabel && onCopy && (
          <button
            onClick={() => onCopy(copyValue, copyLabel)}
            className="shrink-0 rounded-lg border border-slate-800 p-2 text-slate-600 hover:border-cyan-500/30 hover:text-cyan-400"
            title={`Copy ${label.toLowerCase()}`}
          >
            {copied === copyLabel ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   DIAGNOSTIC
   ========================================================================== */

function Diagnostic({
  label,
  value,
  active,
  icon,
}: {
  label: string;
  value: string;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#07101a] px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${active
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-amber-500/10 text-amber-400"
            }`}
        >
          {icon}
        </div>

        <div>
          <p className="text-[8px] font-black tracking-[0.18em] text-slate-700">
            {label}
          </p>

          <p
            className={`mt-0.5 text-[11px] font-black ${active ? "text-emerald-400" : "text-amber-400"
              }`}
          >
            {value}
          </p>
        </div>
      </div>

      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-amber-400"
          }`}
      />
    </div>
  );
}

/* ==========================================================================
   EMPTY STATES
   ========================================================================== */

function EmptyTableState() {
  return (
    <tr>
      <td colSpan={6} className="px-6 py-20 text-center">
        <EmptyContent />
      </td>
    </tr>
  );
}

function EmptyMobileState() {
  return (
    <div className="px-5 py-20 text-center">
      <EmptyContent />
    </div>
  );
}

function EmptyContent() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-700">
        <Users size={30} />
      </div>

      <p className="font-bold text-slate-400">No matching identities</p>

      <p className="mt-1 max-w-sm text-sm text-slate-700">
        No records match the current search or filter configuration.
      </p>
    </div>
  );
}

/* ==========================================================================
   LOADING
   ========================================================================== */

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-slate-800/70">
          <td className="px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-800" />
              <div className="space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-800" />
                <div className="h-2 w-16 animate-pulse rounded bg-slate-900" />
              </div>
            </div>
          </td>

          <td className="px-6 py-6">
            <div className="h-3 w-48 animate-pulse rounded bg-slate-800" />
          </td>

          <td className="px-6 py-6">
            <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-800" />
          </td>

          <td className="px-6 py-6">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
          </td>

          <td className="px-6 py-6">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-800" />
          </td>

          <td className="px-6 py-6">
            <div className="ml-auto h-8 w-16 animate-pulse rounded-lg bg-slate-800" />
          </td>
        </tr>
      ))}
    </>
  );
}

function LoadingMobileCards() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-800 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-800" />

            <div className="space-y-2">
              <div className="h-3 w-28 animate-pulse rounded bg-slate-800" />
              <div className="h-2 w-16 animate-pulse rounded bg-slate-900" />
            </div>
          </div>

          <div className="mt-5 h-3 w-48 animate-pulse rounded bg-slate-800" />
          <div className="mt-3 h-3 w-32 animate-pulse rounded bg-slate-900" />
        </div>
      ))}
    </div>
  );
}
