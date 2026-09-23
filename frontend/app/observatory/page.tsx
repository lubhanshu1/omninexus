"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Cloud,
  Cpu,
  Database,
  GitBranch,
  Gauge,
  Globe2,
  LayoutDashboard,
  LineChart,
  Menu,
  MessageSquare,
  Network,
  Radio,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

type ForecastRange = "7D" | "30D" | "90D" | "1Y";

type Skill = {
  name: string;
  demand: number;
  supply: number;
  growth: string;
  scarcity: string;
};

const skills: Skill[] = [
  { name: "AI Agents", demand: 94, supply: 48, growth: "+48%", scarcity: "Critical" },
  { name: "RAG", demand: 91, supply: 52, growth: "+39%", scarcity: "High" },
  { name: "MLOps", demand: 88, supply: 44, growth: "+36%", scarcity: "Critical" },
  { name: "LLM Engineering", demand: 86, supply: 50, growth: "+31%", scarcity: "High" },
  { name: "PyTorch", demand: 81, supply: 57, growth: "+24%", scarcity: "High" },
  { name: "Cloud", demand: 77, supply: 62, growth: "+19%", scarcity: "Medium" },
  { name: "Docker", demand: 73, supply: 68, growth: "+14%", scarcity: "Medium" },
  { name: "AWS", demand: 71, supply: 64, growth: "+12%", scarcity: "Medium" },
];

const marketRows = [
  { region: "Bengaluru", demand: 94, supply: 71, value: "₹17.2L", signal: "+8.4%" },
  { region: "Delhi NCR", demand: 86, supply: 63, value: "₹15.8L", signal: "+6.9%" },
  { region: "Hyderabad", demand: 82, supply: 66, value: "₹14.9L", signal: "+5.8%" },
  { region: "Pune", demand: 76, supply: 61, value: "₹14.1L", signal: "+4.8%" },
  { region: "Mumbai", demand: 73, supply: 58, value: "₹15.4L", signal: "+4.1%" },
  { region: "Chandigarh", demand: 68, supply: 55, value: "₹11.8L", signal: "+3.7%" },
];

const changeFeed = [
  {
    icon: TrendingUp,
    title: "AI Engineer demand increased",
    detail: "Demand index moved above the previous 30-day baseline.",
    value: "+14.2%",
    tone: "emerald",
  },
  {
    icon: Network,
    title: "RAG capability demand accelerating",
    detail: "Graph dependency count increased across AI roles.",
    value: "+9.8%",
    tone: "cyan",
  },
  {
    icon: Cpu,
    title: "MLOps remains structurally scarce",
    detail: "Talent supply continues to lag projected demand.",
    value: "HIGH",
    tone: "amber",
  },
  {
    icon: BrainCircuit,
    title: "PyTorch demand remains stable",
    detail: "Capability continues appearing in downstream role paths.",
    value: "+4.7%",
    tone: "indigo",
  },
  {
    icon: ShieldAlert,
    title: "Skill-gap concentration detected",
    detail: "Several role families share the same infrastructure bottleneck.",
    value: "WATCH",
    tone: "rose",
  },
];

const riskItems = [
  { name: "MLOps", score: 91, level: "CRITICAL", color: "rose" },
  { name: "AI Agents", score: 86, level: "HIGH", color: "amber" },
  { name: "LLM Engineering", score: 79, level: "HIGH", color: "amber" },
  { name: "Cloud Infrastructure", score: 61, level: "MEDIUM", color: "indigo" },
  { name: "Data Engineering", score: 43, level: "LOW", color: "emerald" },
];

function MiniSparkline({
  points,
  positive = true,
}: {
  points: number[];
  positive?: boolean;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coordinates = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((point - min) / range) * 82 - 9;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-12 w-full">
      <polyline
        points={coordinates}
        fill="none"
        stroke={positive ? "#22d3ee" : "#fb7185"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
          {eyebrow}
        </p>
        <h2 className="text-xl font-black tracking-tight text-white md:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  tone = "cyan",
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  trend?: string;
  tone?: "cyan" | "emerald" | "rose" | "amber" | "indigo";
}) {
  const tones = {
    cyan: "text-cyan-400 border-cyan-500/20",
    emerald: "text-emerald-400 border-emerald-500/20",
    rose: "text-rose-400 border-rose-500/20",
    amber: "text-amber-400 border-amber-500/20",
    indigo: "text-indigo-400 border-indigo-500/20",
  };

  return (
    <div
      className={`group rounded-2xl border bg-[#0b1420] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-[#0d1724] ${tones[tone]}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
          <Icon size={15} className={tones[tone].split(" ")[0]} />
          {label}
        </div>

        {trend && (
          <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      <div className="text-3xl font-black tracking-tight text-white">
        {value}
      </div>

      <p className="mt-2 text-[10px] font-medium text-slate-500">{sub}</p>
    </div>
  );
}

function StatusPill({
  children,
  tone = "cyan",
}: {
  children: React.ReactNode;
  tone?: "cyan" | "emerald" | "amber" | "rose" | "indigo";
}) {
  const styles = {
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    rose: "border-rose-500/20 bg-rose-500/5 text-rose-400",
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-bold ${styles[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
      {children}
    </span>
  );
}

function GraphNode({
  children,
  className = "",
  tone = "cyan",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "cyan" | "indigo" | "emerald" | "violet";
}) {
  const tones = {
    cyan: "border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
    indigo: "border-indigo-500/30 bg-indigo-500/5 text-indigo-300",
    emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    violet: "border-violet-500/40 bg-violet-500/10 text-violet-200",
  };

  return (
    <div
      className={`relative z-10 rounded-xl border px-4 py-3 text-center text-xs font-bold shadow-[0_0_25px_rgba(0,0,0,0.2)] ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Observatory() {
  const [target, setTarget] = useState("AI Engineer");
  const [range, setRange] = useState<ForecastRange>("30D");
  const [scenario, setScenario] = useState(25);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [selectedChange, setSelectedChange] = useState<number | null>(null);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [compactMode, setCompactMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("just now");

  const projectedDemand = useMemo(() => {
    return Math.round(5839 * (1 + scenario / 100));
  }, [scenario]);

  const projectedSupply = useMemo(() => {
    return Math.round(3421 * (1 + scenario / 250));
  }, [scenario]);

  const gap = Math.max(
    0,
    Math.round(((projectedDemand - projectedSupply) / projectedDemand) * 100)
  );

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated("just now");
    }, 1100);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const askCopilot = (preset?: string) => {
    const question = (preset ?? copilotInput).trim();
    if (!question) return;

    const lower = question.toLowerCase();
    let answer =
      `For ${target}, the current intelligence snapshot points to MLOps and RAG as high-impact transition capabilities. ` +
      `The indexed demand is 5,839 against a talent supply index of 3,421, producing a modeled gap of 41.5%.`;

    if (lower.includes("mlops") || lower.includes("bottleneck")) {
      answer =
        "MLOps is flagged because its indexed demand is high while supply remains comparatively constrained. " +
        "The current risk monitor gives MLOps a 91/100 risk index, making it the strongest structural bottleneck in this snapshot.";
    } else if (lower.includes("25%") || lower.includes("demand")) {
      answer =
        `At a +${scenario}% demand scenario, the model projects demand at ${projectedDemand.toLocaleString()} and supply at ${projectedSupply.toLocaleString()}, ` +
        `with a modeled talent gap of ${gap}%.`;
    } else if (lower.includes("transition") || lower.includes("next skill")) {
      answer =
        "The current transition path is Python → ML/Deep Learning → RAG/PyTorch/MLOps → AI Engineer. " +
        "MLOps is the next capability highlighted by the recommendation layer.";
    } else if (lower.includes("market") || lower.includes("signal")) {
      answer =
        "Bengaluru currently has the highest indexed demand in this snapshot, followed by Delhi NCR and Hyderabad. " +
        "The regional signal is strongest in Bengaluru at +8.4%.";
    }

    setCopilotMessages((messages) => [
      ...messages,
      { role: "user", text: question },
      { role: "assistant", text: answer },
    ]);
    setCopilotInput("");
    setCopilotOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCopilotOpen(true);
      }

      if (event.key === "Escape") {
        setCopilotOpen(false);
        setNotifications(false);
        setMobileNav(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050a10] text-slate-300">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[25%] top-[-15%] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.035] blur-[140px]" />
        <div className="absolute right-[-10%] top-[25%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.035] blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[30%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.025] blur-[140px]" />
      </div>

      {/* MOBILE NAV */}
      {mobileNav && (
        <div
          className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileNav(false)}
        >
          <aside
            className="h-full w-72 overflow-y-auto border-r border-slate-800 bg-[#07101a] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <Activity size={19} />
                </div>
                <div>
                  <div className="text-sm font-black text-white">
                    OmniNexus OS
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Workforce Intelligence
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMobileNav(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4">
              <SidebarLinks compactMode={compactMode} setCompactMode={setCompactMode} />
            </div>
          </aside>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[250px] border-r border-slate-800/80 bg-[#07101a] md:flex md:flex-col">
        <div className="flex h-[76px] items-center border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
              <Activity size={20} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white">
                OmniNexus OS
              </div>
              <div className="text-[10px] font-medium text-slate-500">
                Workforce Intelligence
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-6 pb-28 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800 hover:scrollbar-thumb-slate-700">
          <SidebarLinks compactMode={compactMode} setCompactMode={setCompactMode} />
        </div>

        <div className="border-t border-slate-800/80 p-4">
          <div className="rounded-xl border border-slate-800 bg-[#09131e] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                System Status
              </span>
              <span className="text-[9px] font-bold text-emerald-400">
                LIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                ["Graph API", "99.98%"],
                ["Market Feed", "98.7%"],
                ["Prediction", "99.2%"],
                ["Data Sync", "100%"],
              ].map(([name, value]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{name}</span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="min-h-screen md:ml-[250px]">
        {/* TOP BAR */}
        <header className="sticky top-0 z-50 flex h-[70px] items-center justify-between border-b border-slate-800/80 bg-[#07101a]/90 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileNav(true)}
              className="rounded-lg border border-slate-800 p-2 text-slate-400 md:hidden"
            >
              <Menu size={18} />
            </button>

            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <span>OmniNexus OS</span>
              <ChevronRight size={13} />
              <span>Operations Desk</span>
              <ChevronRight size={13} />
              <span className="font-semibold text-slate-200">
                Observatory
              </span>
            </div>

            <div className="sm:hidden text-sm font-black text-white">
              Observatory
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setNotifications((v) => !v)}
              className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
            >
              <Bell size={16} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400" />
            </button>

            <button
              onClick={handleRefresh}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-[10px] font-black text-emerald-400">
                GRAPH ONLINE
              </span>
            </div>

            <Settings
              size={17}
              className="hidden cursor-pointer text-slate-500 hover:text-white sm:block"
            />

            <Sun
              size={17}
              className="hidden cursor-pointer text-slate-500 hover:text-white sm:block"
            />

            <div className="hidden h-7 w-px bg-slate-800 sm:block" />

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-xs font-black text-indigo-300">
                LS
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-white">
                  Lubhanshu Saini
                </div>
                <div className="text-[9px] text-slate-500">
                  Intelligence Operator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* NOTIFICATION DROPDOWN */}
        {notifications && (
          <div className="fixed right-4 top-[78px] z-[60] w-[330px] rounded-2xl border border-slate-700 bg-[#0a141f] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-black text-white">System Alerts</div>
              <button
                onClick={() => setNotifications(false)}
                className="text-slate-500 hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex gap-2">
                  <AlertTriangle size={15} className="text-rose-400" />
                  <div>
                    <div className="text-xs font-bold text-rose-300">
                      MLOps scarcity elevated
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      Structural risk threshold exceeded.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex gap-2">
                  <Radio size={15} className="text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-cyan-300">
                      Market feed synchronized
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      Latest intelligence snapshot available.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className={`mx-auto max-w-[1450px] px-4 py-7 pb-44 sm:px-6 lg:px-8 md:pb-36 ${
            compactMode ? "space-y-6" : "space-y-10"
          }`}
        >
          {/* STATUS STRIP */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="emerald">INTELLIGENCE STREAM ACTIVE</StatusPill>
            <StatusPill tone="cyan">MARKET FEED CONNECTED</StatusPill>
            <StatusPill tone="indigo">840K+ GRAPH NODES</StatusPill>

            <div className="ml-auto hidden text-[10px] font-bold uppercase tracking-widest text-slate-600 lg:block">
              SNAPSHOT / 23 SEP 2026 / LIVE · UPDATED {lastUpdated.toUpperCase()}
            </div>
          </div>

          {/* HERO */}
          <section id="overview" className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-slate-800/80 bg-[#07101a] p-6 md:p-7">
            <div className="absolute right-[-100px] top-[-180px] h-[450px] w-[450px] rounded-full bg-cyan-500/[0.035] blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_350px] lg:items-end">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                    Workforce Observatory
                  </span>
                  <span className="rounded-md border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[8px] font-black text-cyan-400">
                    COMMAND CENTER
                  </span>
                </div>

                <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white md:text-5xl">
                  Workforce intelligence,
                  <span className="block text-cyan-400">
                    in one view.
                  </span>
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                  Monitor market demand, capability scarcity, workforce risk,
                  career economics and structural skill transitions through the
                  OmniNexus intelligence graph.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Intelligence Target
                </label>

                <div className="relative">
                  <BriefcaseBusiness
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
                  />

                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0b1420] py-3.5 pl-11 pr-10 text-sm font-bold text-white outline-none transition focus:border-cyan-500/50"
                  >
                    <option>AI Engineer</option>
                    <option>ML Engineer</option>
                    <option>Data Scientist</option>
                    <option>MLOps Engineer</option>
                    <option>AI Product Engineer</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* KPI GRID */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={Activity}
              label="AI Demand Index"
              value="5,839"
              sub="Sector benchmark"
              trend="+8.2%"
              tone="cyan"
            />

            <MetricCard
              icon={Users}
              label="Talent Supply"
              value="3,421"
              sub="Indexed talent pool"
              trend="+3.4%"
              tone="emerald"
            />

            <MetricCard
              icon={GitBranch}
              label="Skill Gap"
              value="41.5%"
              sub="Demand vs supply"
              trend="WATCH"
              tone="rose"
            />

            <MetricCard
              icon={CircleDollarSign}
              label="Market Value"
              value="₹14.45L"
              sub={`${target} average`}
              trend="+6.1%"
              tone="amber"
            />

            <MetricCard
              icon={LineChart}
              label="30D Signal"
              value="+4.2%"
              sub="Market movement"
              trend="RISING"
              tone="emerald"
            />
          </section>

          {/* QUICK COMMAND BAR */}
          <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-[#09131e] p-2">
            {[
              "Overview",
              "Forecast",
              "Skills",
              "Risk",
              "Scenarios",
              "AI Copilot",
            ].map((item, index) => (
              <button
                key={item}
                onClick={() => {
                  const sectionMap: Record<string, string> = {
                    Overview: "overview",
                    Forecast: "forecast",
                    Skills: "skills",
                    Risk: "risk",
                    Scenarios: "scenarios",
                  };

                  if (item === "AI Copilot") {
                    setCopilotOpen(true);
                    return;
                  }

                  scrollToSection(sectionMap[item]);
                }}
                className={`rounded-xl px-4 py-2.5 text-[10px] font-black transition ${
                  index === 0
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-500 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}

            <div className="ml-auto hidden text-[9px] font-bold uppercase tracking-widest text-slate-600 md:block">
              LIVE GRAPH / {target}
            </div>
          </section>

          {/* FORECAST + HEALTH */}
          <section id="forecast" className="scroll-mt-24">
            <SectionHeader
              eyebrow="01 / Market Intelligence"
              title="Demand trajectory"
              description="Live market projection based on capability demand, indexed talent supply and graph-derived structural signals."
              action={
                <div className="flex rounded-xl border border-slate-800 bg-[#09131e] p-1">
                  {(["7D", "30D", "90D", "1Y"] as ForecastRange[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setRange(item)}
                        className={`rounded-lg px-3 py-1.5 text-[9px] font-black transition ${range === item
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-slate-600 hover:text-slate-300"
                          }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              }
            />

            <div className="grid gap-5 xl:grid-cols-[1.7fr_0.8fr]">
              {/* FORECAST */}
              <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-5 md:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-white">
                      {target} demand trajectory
                    </div>
                    <div className="mt-1 text-[10px] text-slate-600">
                      Forecast window: {range}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[9px] font-bold">
                    <span className="flex items-center gap-2 text-cyan-400">
                      <span className="h-1.5 w-5 rounded-full bg-cyan-400" />
                      Demand
                    </span>
                    <span className="flex items-center gap-2 text-indigo-400">
                      <span className="h-1.5 w-5 rounded-full bg-indigo-400" />
                      Projection
                    </span>
                  </div>
                </div>

                <div className="relative h-[260px] overflow-hidden rounded-xl border border-slate-800 bg-[#060c13]">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(#1e3a50 1px, transparent 1px)",
                      backgroundSize: "22px 22px",
                    }}
                  />

                  {[20, 40, 60, 80].map((y) => (
                    <div
                      key={y}
                      className="absolute left-0 right-0 border-t border-slate-800/60"
                      style={{ top: `${y}%` }}
                    />
                  ))}

                  <svg
                    viewBox="0 0 1000 320"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <defs>
                      <linearGradient id="forecastArea" x1="0" x2="0" y1="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#22d3ee"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="#22d3ee"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0 245 C100 235 140 218 220 224 C300 230 340 190 430 202 C510 213 560 173 640 166 C710 159 750 130 820 112 C885 95 930 82 1000 54 L1000 320 L0 320 Z"
                      fill="url(#forecastArea)"
                    />

                    <path
                      d="M0 245 C100 235 140 218 220 224 C300 230 340 190 430 202 C510 213 560 173 640 166"
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="5"
                    />

                    <path
                      d="M640 166 C710 159 750 130 820 112 C885 95 930 82 1000 54"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="5"
                      strokeDasharray="12 10"
                    />

                    <circle cx="640" cy="166" r="7" fill="#22d3ee" />
                  </svg>

                  <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-bold text-slate-600">
                    <span>NOW</span>
                    <span>+30D</span>
                    <span>+60D</span>
                    <span>+90D</span>
                    <span>+120D</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    ["Current demand", "5,839"],
                    ["Projected demand", "6,921"],
                    ["Confidence", "92%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-800 bg-[#07101a] p-3"
                    >
                      <div className="text-[9px] text-slate-600">{label}</div>
                      <div className="mt-1 text-sm font-black text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INTELLIGENCE HEALTH */}
              <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-5 md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-white">
                      Intelligence health
                    </div>
                    <div className="mt-1 text-[10px] text-slate-600">
                      System-wide signal quality
                    </div>
                  </div>

                  <Gauge size={18} className="text-cyan-400" />
                </div>

                <div className="space-y-3">
                  {[
                    ["Graph API", "99.98%", "emerald"],
                    ["Market Intelligence", "98.7%", "emerald"],
                    ["Forecast Engine", "96.4%", "cyan"],
                    ["Skill Index", "94.8%", "cyan"],
                    ["Risk Monitor", "91.2%", "amber"],
                  ].map(([name, value, tone]) => (
                    <div
                      key={name}
                      className="rounded-xl border border-slate-800 bg-[#07101a] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          {name}
                        </span>
                        <span
                          className={`text-[10px] font-black ${tone === "amber"
                            ? "text-amber-400"
                            : "text-emerald-400"
                            }`}
                        >
                          {value}
                        </span>
                      </div>

                      <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${tone === "amber"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                            }`}
                          style={{ width: value }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400">
                      All systems operational
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-600">LIVE</span>
                </div>
              </div>
            </div>
          </section>

          {/* CHANGES + DECISION */}
          <section id="changes" className="scroll-mt-24">
            <SectionHeader
              eyebrow="02 / Intelligence Stream"
              title="What changed?"
              description="The latest material movements detected by the workforce intelligence graph."
            />

            <div className="grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-4">
                <div className="space-y-2">
                  {changeFeed.map((item, index) => {
                    const Icon = item.icon;
                    const selected = selectedChange === index;

                    return (
                      <button
                        key={item.title}
                        onClick={() =>
                          setSelectedChange(selected ? null : index)
                        }
                        className={`w-full rounded-xl border p-4 text-left transition ${selected
                          ? "border-cyan-500/30 bg-cyan-500/[0.04]"
                          : "border-slate-800 bg-[#07101a] hover:border-slate-700"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                            <Icon size={15} className="text-cyan-400" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-200">
                              {item.title}
                            </div>

                            {selected && (
                              <div className="mt-1 text-[10px] leading-5 text-slate-500">
                                {item.detail}
                              </div>
                            )}
                          </div>

                          <span
                            className={`rounded-md px-2 py-1 text-[9px] font-black ${item.tone === "rose"
                              ? "bg-rose-500/10 text-rose-400"
                              : item.tone === "amber"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                              }`}
                          >
                            {item.value}
                          </span>

                          <ChevronRight
                            size={14}
                            className={`text-slate-700 transition ${selected ? "rotate-90" : ""
                              }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI DECISION CENTER */}
              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] via-[#09131e] to-[#09131e] p-6">
                <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-cyan-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                        AI Decision Center
                      </span>
                    </div>

                    <span className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[8px] font-black text-emerald-400">
                      92% CONFIDENCE
                    </span>
                  </div>

                  <h3 className="text-2xl font-black tracking-tight text-white">
                    Prioritize MLOps + RAG
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-slate-500">
                    The intelligence graph identifies MLOps as the highest
                    structural bottleneck for the selected role. RAG is the
                    next capability with strong downstream dependency growth.
                  </p>

                  <div className="mt-5 space-y-2">
                    {[
                      ["Primary bottleneck", "MLOps"],
                      ["Downstream dependencies", "5"],
                      ["Market signal", "Strong"],
                      ["Transition value", "+14.8%"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#07101a] px-3 py-2.5"
                      >
                        <span className="text-[9px] text-slate-600">
                          {label}
                        </span>
                        <span className="text-[10px] font-black text-slate-200">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCopilotOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-3 text-[10px] font-black text-[#041018] transition hover:bg-cyan-300"
                    >
                      Ask AI Copilot
                      <ArrowRight size={13} />
                    </button>

                    <button
                      onClick={() => scrollToSection("scenarios")}
                      className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-[10px] font-black text-slate-300 transition hover:border-cyan-500/30 hover:text-white"
                    >
                      Open Scenario
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SKILL INTELLIGENCE */}
          <section id="skills" className="scroll-mt-24">
            <SectionHeader
              eyebrow="03 / Capability Intelligence"
              title="Skill demand intelligence"
              description="Compare market demand, indexed talent supply and growth pressure across high-impact capabilities."
              action={
                <button
                  onClick={() => setShowAllSkills((v) => !v)}
                  className="rounded-lg border border-slate-800 bg-[#09131e] px-3 py-2 text-[9px] font-black text-slate-400 hover:text-white"
                >
                  {showAllSkills ? "Collapse" : "Expand Intelligence"}
                </button>
              }
            />

            <div className="grid gap-5 xl:grid-cols-[1.55fr_0.75fr]">
              <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-5">
                <div className="mb-5 grid grid-cols-[1.2fr_1fr_1fr_0.6fr] gap-4 border-b border-slate-800 pb-3 text-[8px] font-black uppercase tracking-widest text-slate-600">
                  <span>Capability</span>
                  <span>Demand</span>
                  <span>Supply</span>
                  <span>Growth</span>
                </div>

                <div className="space-y-3">
                  {(showAllSkills ? skills : skills.slice(0, 6)).map(
                    (skill) => (
                      <div
                        key={skill.name}
                        className="grid grid-cols-[1.2fr_1fr_1fr_0.6fr] items-center gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-[#07101a]">
                            <Cpu size={12} className="text-cyan-400" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-300">
                            {skill.name}
                          </span>
                        </div>

                        <div>
                          <div className="mb-1 flex justify-between text-[8px]">
                            <span className="text-slate-600">Demand</span>
                            <span className="font-bold text-cyan-400">
                              {skill.demand}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-cyan-400"
                              style={{ width: `${skill.demand}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex justify-between text-[8px]">
                            <span className="text-slate-600">Supply</span>
                            <span className="font-bold text-indigo-400">
                              {skill.supply}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-indigo-400"
                              style={{ width: `${skill.supply}%` }}
                            />
                          </div>
                        </div>

                        <span className="text-right text-[9px] font-black text-emerald-400">
                          {skill.growth}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-[#09131e] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                    Early Market Signals
                  </span>
                </div>

                <div className="space-y-3">
                  {skills.slice(0, 5).map((skill, index) => (
                    <div
                      key={skill.name}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#07101a] p-3"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-[9px] font-black text-amber-400">
                        0{index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[10px] font-bold text-slate-300">
                          {skill.name}
                        </div>
                        <div className="mt-1 text-[8px] text-slate-600">
                          {skill.scarcity} scarcity
                        </div>
                      </div>

                      <span className="text-[9px] font-black text-emerald-400">
                        {skill.growth}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CAPABILITY GRAPH */}
          <section id="graph" className="scroll-mt-24">
            <SectionHeader
              eyebrow="04 / Structural Graph"
              title="Workforce capability graph"
              description="Explore how current capabilities connect to intermediate skills and the selected target role."
              action={
                <div className="flex items-center gap-2">
                  <span className="hidden text-[9px] text-slate-600 sm:block">
                    LIVE GRAPH
                  </span>
                  <button
                    onClick={() => askCopilot("Explain the workforce capability graph for this target role.")}
                    className="rounded-lg border border-slate-800 p-2 text-slate-500 transition hover:border-cyan-500/30 hover:text-cyan-400"
                    title="Ask Copilot about the graph"
                  >
                    <Search size={14} />
                  </button>
                </div>
              }
            />

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#09131e] p-4 md:p-7">
              <div
                className="relative min-h-[380px] overflow-hidden rounded-xl border border-slate-800 bg-[#060c13]"
                style={{
                  backgroundImage:
                    "radial-gradient(#173247 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 1000 420"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="170"
                    y1="210"
                    x2="380"
                    y2="105"
                    stroke="#164e63"
                    strokeWidth="2"
                  />
                  <line
                    x1="170"
                    y1="210"
                    x2="380"
                    y2="210"
                    stroke="#164e63"
                    strokeWidth="2"
                  />
                  <line
                    x1="170"
                    y1="210"
                    x2="380"
                    y2="315"
                    stroke="#164e63"
                    strokeWidth="2"
                  />

                  <line
                    x1="520"
                    y1="105"
                    x2="700"
                    y2="105"
                    stroke="#312e81"
                    strokeWidth="2"
                  />
                  <line
                    x1="520"
                    y1="210"
                    x2="700"
                    y2="210"
                    stroke="#312e81"
                    strokeWidth="2"
                  />
                  <line
                    x1="520"
                    y1="315"
                    x2="700"
                    y2="315"
                    stroke="#312e81"
                    strokeWidth="2"
                  />

                  <line
                    x1="700"
                    y1="105"
                    x2="875"
                    y2="210"
                    stroke="#6d28d9"
                    strokeWidth="2"
                  />
                  <line
                    x1="700"
                    y1="210"
                    x2="875"
                    y2="210"
                    stroke="#6d28d9"
                    strokeWidth="2"
                  />
                  <line
                    x1="700"
                    y1="315"
                    x2="875"
                    y2="210"
                    stroke="#6d28d9"
                    strokeWidth="2"
                  />
                </svg>

                <div className="absolute left-[6%] top-1/2 w-[150px] -translate-y-1/2 md:w-[180px]">
                  <div className="mb-2 text-center text-[8px] font-black uppercase tracking-widest text-emerald-400">
                    Current
                  </div>
                  <GraphNode tone="emerald">
                    <div>Python</div>
                    <div className="mt-1 text-[8px] font-medium opacity-60">
                      acquired capability
                    </div>
                  </GraphNode>
                </div>

                <div className="absolute left-[34%] top-[25%] w-[145px] md:w-[170px]">
                  <GraphNode>Machine Learning</GraphNode>
                </div>

                <div className="absolute left-[34%] top-1/2 w-[145px] -translate-y-1/2 md:w-[170px]">
                  <GraphNode>Deep Learning</GraphNode>
                </div>

                <div className="absolute left-[34%] top-[68%] w-[145px] md:w-[170px]">
                  <GraphNode>Cloud / Docker</GraphNode>
                </div>

                <div className="absolute left-[57%] top-[25%] w-[145px] md:w-[170px]">
                  <GraphNode tone="indigo">RAG</GraphNode>
                </div>

                <div className="absolute left-[57%] top-1/2 w-[145px] -translate-y-1/2 md:w-[170px]">
                  <GraphNode tone="indigo">PyTorch</GraphNode>
                </div>

                <div className="absolute left-[57%] top-[68%] w-[145px] md:w-[170px]">
                  <GraphNode tone="indigo">MLOps</GraphNode>
                </div>

                <div className="absolute right-[4%] top-1/2 w-[145px] -translate-y-1/2 md:w-[170px]">
                  <div className="mb-2 text-center text-[8px] font-black uppercase tracking-widest text-violet-400">
                    Target
                  </div>
                  <GraphNode tone="violet">
                    <div className="text-sm">AI Engineer</div>
                    <div className="mt-1 text-[8px] font-medium opacity-60">
                      target role
                    </div>
                  </GraphNode>
                </div>

                <div className="absolute bottom-4 left-5 flex flex-wrap gap-4 text-[8px] font-bold">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Acquired
                  </span>
                  <span className="flex items-center gap-2 text-indigo-400">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    Transition
                  </span>
                  <span className="flex items-center gap-2 text-violet-400">
                    <span className="h-2 w-2 rounded-full bg-violet-400" />
                    Target
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* MARKET HEATMAP */}
          <section id="market" className="scroll-mt-24">
            <SectionHeader
              eyebrow="05 / Geographic Intelligence"
              title="Workforce market heatmap"
              description="Regional demand, supply and market-value signals for the selected capability class."
            />

            <div className="grid gap-5 xl:grid-cols-[1.5fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-5">
                <div className="mb-4 grid grid-cols-[1fr_1.5fr_0.6fr_0.6fr] gap-4 border-b border-slate-800 pb-3 text-[8px] font-black uppercase tracking-widest text-slate-600">
                  <span>Region</span>
                  <span>Demand / Supply</span>
                  <span>Value</span>
                  <span>Signal</span>
                </div>

                <div className="space-y-4">
                  {marketRows.map((row) => (
                    <div
                      key={row.region}
                      className="grid grid-cols-[1fr_1.5fr_0.6fr_0.6fr] items-center gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <Globe2 size={13} className="text-cyan-400" />
                        <span className="text-[10px] font-bold text-slate-300">
                          {row.region}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-cyan-500/60"
                            style={{ width: `${row.demand}%` }}
                          />
                          <div
                            className="absolute inset-y-0 left-0 rounded-full border-r border-indigo-400"
                            style={{ width: `${row.supply}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[7px] text-slate-600">
                          <span>D {row.demand}%</span>
                          <span>S {row.supply}%</span>
                        </div>
                      </div>

                      <span className="text-[9px] font-black text-amber-400">
                        {row.value}
                      </span>

                      <span className="text-right text-[9px] font-black text-emerald-400">
                        {row.signal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.08] to-[#09131e] p-6">
                <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-indigo-400">
                  Highest Demand
                </div>

                <h3 className="text-3xl font-black text-white">
                  Bengaluru
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Highest indexed demand for {target} across the current
                  market snapshot.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    ["Talent availability", "71%"],
                    ["Demand intensity", "94%"],
                    ["Salary signal", "+8.4%"],
                    ["Hiring pressure", "HIGH"],
                    ["Role velocity", "3.4x"],
                  ].map(([name, value]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between border-b border-slate-800/70 pb-2"
                    >
                      <span className="text-[9px] text-slate-600">{name}</span>
                      <span className="text-[10px] font-black text-slate-300">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SCENARIO SIMULATOR */}
          <section id="scenarios" className="scroll-mt-24">
            <SectionHeader
              eyebrow="06 / Scenario Intelligence"
              title="Scenario simulator"
              description="Model workforce conditions under different demand-growth assumptions."
            />

            <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-5 md:p-7">
              <div className="grid gap-7 xl:grid-cols-[1.4fr_1fr]">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white">
                        AI demand scenario
                      </div>
                      <div className="mt-1 text-[10px] text-slate-600">
                        Adjust projected market growth.
                      </div>
                    </div>

                    <div className="text-2xl font-black text-cyan-400">
                      +{scenario}%
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={scenario}
                    onChange={(e) => setScenario(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-400"
                  />

                  <div className="mt-2 flex justify-between text-[8px] font-bold text-slate-600">
                    <span>0%</span>
                    <span>10%</span>
                    <span>25%</span>
                    <span>40%</span>
                    <span>50%</span>
                  </div>

                  <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.035] p-4">
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={15} className="text-cyan-400" />
                      <span className="text-[10px] font-black text-cyan-400">
                        Scenario interpretation
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      At a +{scenario}% demand increase, the projected talent
                      gap reaches approximately{" "}
                      <span className="font-black text-white">{gap}%</span>.
                      This increases pressure on scarce transition skills.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
                  {[
                    ["Projected demand", projectedDemand.toLocaleString(), "+25%"],
                    ["Projected supply", projectedSupply.toLocaleString(), "+10%"],
                    ["Skill gap", `${gap}%`, "elevated"],
                    ["Market value", "₹16.1L", "+11.4%"],
                  ].map(([label, value, change]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-800 bg-[#07101a] p-4"
                    >
                      <div className="text-[8px] uppercase tracking-widest text-slate-600">
                        {label}
                      </div>
                      <div className="mt-2 text-xl font-black text-white">
                        {value}
                      </div>
                      <div className="mt-1 text-[8px] font-bold text-emerald-400">
                        {change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* RISK MONITOR */}
          <section id="risk" className="scroll-mt-24">
            <SectionHeader
              eyebrow="07 / Workforce Risk"
              title="Structural risk monitor"
              description="Monitor capability bottlenecks and workforce conditions that can affect role transitions."
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              {riskItems.map((risk) => {
                const colorMap: Record<string, string> = {
                  rose: "text-rose-400 bg-rose-400",
                  amber: "text-amber-400 bg-amber-400",
                  indigo: "text-indigo-400 bg-indigo-400",
                  emerald: "text-emerald-400 bg-emerald-400",
                };

                return (
                  <div
                    key={risk.name}
                    className="rounded-2xl border border-slate-800 bg-[#09131e] p-5"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">
                        {risk.name}
                      </span>
                      <AlertTriangle
                        size={13}
                        className={colorMap[risk.color].split(" ")[0]}
                      />
                    </div>

                    <div
                      className={`text-xs font-black ${colorMap[risk.color].split(" ")[0]}`}
                    >
                      {risk.level}
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${colorMap[risk.color].split(" ")[1]}`}
                        style={{ width: `${risk.score}%` }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between text-[8px] text-slate-600">
                      <span>Risk index</span>
                      <span>{risk.score}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* TRANSITION ENGINE */}
          <section>
            <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.055] to-indigo-500/[0.045] p-6 md:p-8">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={15} className="text-cyan-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                      Capability Recommendation Engine
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                    Next capability transition:{" "}
                    <span className="text-cyan-400">MLOps</span>
                  </h2>

                  <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">
                    Based on the current market graph, capability dependencies
                    and supply-demand imbalance, MLOps is the next high-value
                    transition for the selected workforce path.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCopilotOpen(true)}
                    className="rounded-xl bg-cyan-400 px-4 py-3 text-[10px] font-black text-[#041018] hover:bg-cyan-300"
                  >
                    Simulate Transition
                  </button>

                  <Link
                    href="/recruiter"
                    className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-[10px] font-black text-slate-300 transition hover:border-cyan-500/30 hover:text-white"
                  >
                    Find Talent
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SYSTEM TELEMETRY */}
          <section>
            <SectionHeader
              eyebrow="08 / System Telemetry"
              title="OmniNexus infrastructure"
              description="Live health of the intelligence stack powering the Observatory."
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  icon: Database,
                  value: "840K+",
                  label: "Graph nodes",
                  status: "SYNCED",
                },
                {
                  icon: Radio,
                  value: "99.98%",
                  label: "API uptime",
                  status: "HEALTHY",
                },
                {
                  icon: Cloud,
                  value: "3.2ms",
                  label: "Graph latency",
                  status: "OPTIMAL",
                },
                {
                  icon: Shield,
                  value: "5 AXES",
                  label: "Risk coverage",
                  status: "ACTIVE",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-800 bg-[#09131e] p-5"
                  >
                    <Icon size={17} className="text-cyan-400" />
                    <div className="mt-5 text-2xl font-black text-white">
                      {item.value}
                    </div>
                    <div className="mt-1 text-[9px] text-slate-600">
                      {item.label}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {item.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FINAL DECISION PANEL */}
          <section className="rounded-3xl border border-slate-800 bg-[#07101a] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Target size={16} className="text-violet-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
                    Executive Decision Layer
                  </span>
                </div>

                <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                  Workforce transition readiness
                </h2>

                <p className="mt-3 max-w-2xl text-xs leading-6 text-slate-500">
                  OmniNexus currently identifies{" "}
                  <span className="font-bold text-white">MLOps</span> and{" "}
                  <span className="font-bold text-white">RAG</span> as the
                  highest-leverage capabilities for the {target} transition.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Readiness", "68%", "emerald"],
                    ["Graph confidence", "92%", "cyan"],
                    ["Transition pressure", "HIGH", "amber"],
                  ].map(([label, value, tone]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-slate-800 bg-[#09131e] p-4"
                    >
                      <div className="text-[8px] uppercase tracking-widest text-slate-600">
                        {label}
                      </div>
                      <div
                        className={`mt-2 text-xl font-black ${tone === "emerald"
                          ? "text-emerald-400"
                          : tone === "cyan"
                            ? "text-cyan-400"
                            : "text-amber-400"
                          }`}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.035] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    Recommended Action
                  </span>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                </div>

                <div className="text-xl font-black text-white">
                  Upskill MLOps
                </div>

                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  Highest structural dependency and strong market demand
                  signal.
                </p>

                <button
                  onClick={() => setCopilotOpen(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-[10px] font-black text-[#041018] hover:bg-cyan-300"
                >
                  Analyze With AI
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </section>

          {/* Persistent dock safe-area spacer */}
          <div className="h-16 md:h-20" aria-hidden="true" />
        </div>
      </main>

      {/* AI COPILOT BUTTON */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-28 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500 text-[#041018] shadow-[0_0_35px_rgba(34,211,238,0.25)] transition hover:scale-105 hover:bg-cyan-300 md:bottom-24 md:right-8"
        title="Open OmniNexus AI Copilot"
      >
        <BrainCircuit size={22} />
      </button>

      {/* AI COPILOT */}
      {copilotOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md">
          <div className="absolute bottom-4 right-4 flex h-[min(720px,calc(100vh-32px))] w-[min(440px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-cyan-500/20 bg-[#07101a] shadow-[0_20px_100px_rgba(0,0,0,0.6)] md:bottom-6 md:right-6">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <BrainCircuit size={19} />
                </div>

                <div>
                  <div className="text-sm font-black text-white">
                    OmniNexus Copilot
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Intelligence graph connected
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCopilotOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">
                    AI Analysis
                  </span>
                </div>

                <p className="text-xs leading-6 text-slate-400">
                  For <span className="font-bold text-white">{target}</span>,
                  the graph currently identifies{" "}
                  <span className="font-bold text-cyan-400">MLOps</span> as
                  the highest-impact capability gap, followed by{" "}
                  <span className="font-bold text-cyan-400">RAG</span>.
                </p>
              </div>

              {copilotMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl border p-4 ${
                    message.role === "user"
                      ? "ml-8 border-indigo-500/20 bg-indigo-500/[0.04]"
                      : "mr-4 border-cyan-500/20 bg-cyan-500/[0.035]"
                  }`}
                >
                  <div className="mb-2 text-[8px] font-black uppercase tracking-widest text-slate-600">
                    {message.role === "user" ? "You" : "OmniNexus AI"}
                  </div>
                  <p className="text-[11px] leading-5 text-slate-400">
                    {message.text}
                  </p>
                </div>
              ))}

              {[
                "Why is MLOps currently a bottleneck?",
                "What happens if AI demand rises 25%?",
                "Show the next capability transition.",
                "Explain the market signal.",
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => askCopilot(question)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-[#09131e] p-3 text-left text-[10px] font-bold text-slate-400 transition hover:border-cyan-500/30 hover:text-white"
                >
                  <MessageSquare size={13} className="text-slate-600" />
                  {question}
                </button>
              ))}

              <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-4">
                <div className="mb-3 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  Current Intelligence Context
                </div>

                <div className="space-y-2">
                  {[
                    ["Target role", target],
                    ["Demand index", "5,839"],
                    ["Talent supply", "3,421"],
                    ["Skill gap", "41.5%"],
                    ["Primary bottleneck", "MLOps"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between border-b border-slate-800/70 pb-2"
                    >
                      <span className="text-[9px] text-slate-600">
                        {label}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#050a10] p-2">
                <input
                  placeholder="Ask OmniNexus anything..."
                  className="flex-1 bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-slate-700"
                />

                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400 text-[#041018]">
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SYSTEM DOCK */}
      <div
        className="pointer-events-none fixed bottom-3 left-1/2 z-[60] w-[calc(100%-16px)] -translate-x-1/2 md:left-[calc(50%+125px)] md:w-[min(980px,calc(100%-300px))]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="pointer-events-auto flex items-center justify-between gap-1 rounded-2xl border border-slate-700/80 bg-[#091426]/96 p-1.5 shadow-[0_20px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none">
            <Link
              href="/career-simulator"
              className="shrink-0 rounded-xl px-3 py-2.5 text-[9px] font-bold text-slate-500 transition hover:bg-slate-800/70 hover:text-white sm:px-4 sm:text-[10px]"
            >
              Career Simulator
            </Link>

            <Link
              href="/recruiter"
              className="shrink-0 rounded-xl px-3 py-2.5 text-[9px] font-bold text-slate-500 transition hover:bg-slate-800/70 hover:text-white sm:px-4 sm:text-[10px]"
            >
              Talent Matcher
            </Link>

            <Link
              href="/observatory"
              aria-current="page"
              className="shrink-0 rounded-xl bg-cyan-500 px-4 py-2.5 text-[9px] font-black text-[#041018] shadow-[0_0_24px_rgba(34,211,238,0.2)] sm:px-5 sm:text-[10px]"
            >
              Observatory
            </Link>

            <Link
              href="/database"
              className="hidden shrink-0 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-500 transition hover:bg-slate-800/70 hover:text-white sm:block"
            >
              System DB
            </Link>
          </div>

          <div className="hidden shrink-0 items-center gap-2 border-l border-slate-800 pl-2 sm:flex">
            <span className="flex items-center gap-1.5 px-2 text-[8px] font-black uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Live
            </span>

            <button
              onClick={() => setCopilotOpen(true)}
              className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5 text-[9px] font-black text-cyan-400 transition hover:bg-cyan-500/10"
            >
              Copilot
            </button>

            <button
              onClick={handleRefresh}
              className="rounded-xl border border-slate-800 p-2.5 text-slate-500 transition hover:border-cyan-500/30 hover:text-cyan-400"
              title="Refresh intelligence"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="shrink-0 rounded-xl border border-slate-800 px-3 py-2.5 text-[9px] font-black text-slate-500 transition hover:border-slate-700 hover:text-white"
            title="Back to top"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarLinks({
  compactMode,
  setCompactMode,
}: {
  compactMode: boolean;
  setCompactMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <div className="mb-7">
        <div className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          Workspace
        </div>

        <nav className="space-y-1">
          <Link
            href="/observatory"
            className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] px-3 py-3 text-sm font-bold text-cyan-400"
          >
            <LayoutDashboard size={16} />
            Overview
          </Link>

          <button
            type="button"
            onClick={() =>
              document.getElementById("forecast")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-800/50 hover:text-white"
          >
            <LineChart size={16} />
            Forecast
          </button>

          <Link
            href="/recruiter"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-800/50 hover:text-white"
          >
            <Users size={16} />
            Talent Operations
          </Link>

          <Link
            href="/career-simulator"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-800/50 hover:text-white"
          >
            <GitBranch size={16} />
            Career Simulator
          </Link>
        </nav>
      </div>

      <div className="mb-7">
        <div className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          Intelligence
        </div>

        <nav className="space-y-1">
          {[
            [Network, "Skill Intelligence"],
            [Globe2, "Market Intelligence"],
            [ShieldAlert, "Workforce Risk"],
          ].map(([Icon, label]) => (
            <button
              key={label as string}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${label === "Workforce Risk"
                ? "bg-slate-800/40 text-slate-300"
                : "text-slate-500 hover:bg-slate-800/50 hover:text-white"
                }`}
            >
              <Icon size={16} />
              {label as string}
            </button>
          ))}
        </nav>
      </div>

      <div>
        <div className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          Controls
        </div>

        <button
          onClick={() => setCompactMode((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-800/50 hover:text-white"
          aria-pressed={compactMode}
        >
          <span className="flex items-center gap-3">
            <Settings size={16} />
            Compact mode
          </span>

          <span
            className={`h-4 w-7 rounded-full p-0.5 transition ${
              compactMode ? "bg-cyan-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`block h-3 w-3 rounded-full transition ${
                compactMode ? "translate-x-3 bg-slate-950" : "bg-slate-300"
              }`}
            />
          </span>
        </button>
      </div>
    </>
  );
}