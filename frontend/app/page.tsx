import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Database,
  Gauge,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const modules = [
  {
    title: "Career Simulator",
    description:
      "Simulate career transitions, identify capability gaps and build an upskilling trajectory.",
    href: "/career-simulator",
    icon: Sparkles,
    accent: "cyan",
    metric: "16%",
    metricLabel: "Current alignment",
  },
  {
    title: "Unified Intelligence",
    description:
      "Fuse career readiness, market opportunity, skill gaps and success-model evidence into one traceable decision layer.",
    href: "/intelligence",
    icon: BrainCircuit,
    accent: "violet",
    metric: "4",
    metricLabel: "Evidence sources unified",
  },
  {
    title: "Talent Matcher",
    description:
      "Analyze candidate capability, role alignment and workforce fit through the talent intelligence layer.",
    href: "/recruiter",
    icon: Network,
    accent: "violet",
    metric: "84%",
    metricLabel: "Match intelligence",
  },
  {
    title: "Skill Intelligence",
    description:
      "Normalize capabilities and compare them with the supplied hackathon market sample to surface opportunity and skill gaps.",
    href: "/skill-intelligence",
    icon: BrainCircuit,
    accent: "cyan",
    metric: "15",
    metricLabel: "Market skills analyzed",
  },
  {
    title: "Workforce Observatory",
    description:
      "Monitor demand, supply, skill gaps, market movement and workforce risk in one intelligence view.",
    href: "/observatory",
    icon: Radar,
    accent: "emerald",
    metric: "99.2%",
    metricLabel: "Prediction signal",
  },
  {
    title: "Future Shock Lab",
    description:
      "Run workforce what-if scenarios, model demand shocks and visualize reskilling impact before making decisions.",
    href: "/future-lab",
    icon: Zap,
    accent: "cyan",
    metric: "2030",
    metricLabel: "Scenario engine",
  },
  {
    title: "System Database",
    description:
      "Explore the underlying workforce graph, capabilities, roles, skills and intelligence records.",
    href: "/database",
    icon: Database,
    accent: "amber",
    metric: "21+",
    metricLabel: "Graph nodes (current taxonomy)",
  },
] as const;

const systemSignals = [
  {
    name: "Graph API",
    value: "Demo snapshot",
    status: "Operational",
    icon: Network,
  },
  {
    name: "Market Intelligence",
    value: "Demo snapshot",
    status: "Connected",
    icon: TrendingUp,
  },
  {
    name: "Forecast Engine",
    value: "96.4%",
    status: "Operational",
    icon: BarChart3,
  },
  {
    name: "Risk Monitor",
    value: "91.8%",
    status: "Active",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030910] text-white">

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[5%] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[130px]" />
        <div className="absolute right-[5%] top-[20%] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.05] blur-[150px]" />
        <div className="absolute bottom-0 left-[40%] h-[400px] w-[400px] rounded-full bg-violet-500/[0.04] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-[1450px] px-5 pb-32 pt-6 sm:px-8 lg:px-10">

        {/* =========================================================
            TOP SYSTEM HEADER
        ========================================================== */}

        <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-slate-800/80 bg-[#07121e]/80 p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06]">
              <BriefcaseBusiness
                size={22}
                className="text-cyan-400"
              />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            </div>

            <div>
              <div className="text-sm font-bold tracking-wide">
                OmniNexus OS
              </div>

              <div className="text-xs text-slate-500">
                Workforce Intelligence Command Center
              </div>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-2.5 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              SYSTEM ONLINE
            </div>

            <div className="hidden rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-400 sm:block">
              DEMO SNAPSHOT GRAPH / AI ENGINE
            </div>

          </div>
        </header>


        {/* =========================================================
            HERO
        ========================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-slate-800/90 bg-[#06111d]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-10 lg:p-12">

          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(34,211,238,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.15) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full border border-cyan-500/10" />
          <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-[230px] w-[230px] rounded-full border border-cyan-500/10" />

          <div className="relative grid gap-12 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">

            <div>

              <div className="mb-5 flex flex-wrap items-center gap-3">

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-[0.22em] text-cyan-400">
                  OMNINEXUS COMMAND CENTER
                </span>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-1.5 text-[10px] font-semibold text-emerald-400">
                  INTELLIGENCE STREAM ACTIVE
                </span>

              </div>

              <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-7xl">
                Workforce intelligence,
                <span className="block text-cyan-400">
                  in one operating system.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                OmniNexus connects career simulation, talent intelligence,
                workforce forecasting and graph-based capabilities into a
                single operational intelligence layer.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <Link
                  href="/career-simulator"
                  className="group flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-[#03111c] transition-all hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                >
                  Launch Career Simulator
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>

                <Link
                  href="/observatory"
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-cyan-500/30 hover:bg-slate-800 hover:text-white"
                >
                  Open Observatory
                  <Radar size={16} />
                </Link>

              </div>

            </div>


            {/* Command status visual */}

            <div className="relative">

              <div className="rounded-2xl border border-slate-800 bg-[#040c15]/80 p-5">

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold tracking-widest text-slate-500">
                      SYSTEM TELEMETRY
                    </div>

                    <div className="mt-1 text-sm font-semibold text-white">
                      Intelligence Core
                    </div>
                  </div>

                  <Activity
                    size={20}
                    className="text-cyan-400"
                  />
                </div>


                <div className="space-y-4">

                  <TelemetryRow
                    label="Graph Intelligence"
                    value="99.98%"
                    width="99.98%"
                  />

                  <TelemetryRow
                    label="Market Feed"
                    value="98.7%"
                    width="98.7%"
                  />

                  <TelemetryRow
                    label="Prediction Engine"
                    value="99.2%"
                    width="99.2%"
                  />

                  <TelemetryRow
                    label="System Sync"
                    value="Demo snapshot"
                    width="100%"
                  />

                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">

                  <span className="text-[10px] font-semibold tracking-widest text-slate-600">
                    NODE NETWORK
                  </span>

                  <span className="text-sm font-black text-indigo-400">
                    840K+
                  </span>

                </div>

              </div>

            </div>

          </div>
        </section>


        {/* =========================================================
            SNAPSHOT METRICS
        ========================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <MetricCard
            icon={Gauge}
            label="Graph Health"
            value="99.98%"
            change="+0.4%"
          />

          <MetricCard
            icon={TrendingUp}
            label="AI Demand"
            value="+8.2%"
            change="30D"
          />

          <MetricCard
            icon={Users}
            label="Talent Supply"
            value="+3.4%"
            change="SNAPSHOT"
          />

          <MetricCard
            icon={Target}
            label="Market Signal (demo)"
            value="+6.1%"
            change="ACTIVE"
          />

        </section>


        {/* =========================================================
            MODULES
        ========================================================== */}

        <section className="mt-12">

          <div className="mb-6 flex items-end justify-between">

            <div>
              <div className="text-[10px] font-bold tracking-[0.25em] text-cyan-400">
                INTELLIGENCE MODULES
              </div>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Your operating surface
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Connected intelligence environments with a shared evidence layer.
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
              <Zap size={14} className="text-cyan-400" />
              Unified navigation
            </div>

          </div>


          <div className="grid gap-4 md:grid-cols-2">

            {modules.map((module) => (
              <ModuleCard
                key={module.href}
                {...module}
              />
            ))}

          </div>

        </section>


        {/* =========================================================
            SYSTEM SIGNALS
        ========================================================== */}

        <section className="mt-12">

          <div className="mb-6">

            <div className="text-[10px] font-bold tracking-[0.25em] text-indigo-400">
              SYSTEM HEALTH
            </div>

            <h2 className="mt-2 text-2xl font-black">
              Intelligence infrastructure
            </h2>

          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {systemSignals.map((signal) => {
              const Icon = signal.icon;

              return (
                <div
                  key={signal.name}
                  className="rounded-2xl border border-slate-800 bg-[#07121e]/80 p-5 transition-all hover:border-slate-700 hover:bg-[#091725]"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-cyan-400">
                      <Icon size={17} />
                    </div>

                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {signal.status}
                    </span>

                  </div>

                  <div className="mt-5 text-sm font-semibold text-slate-300">
                    {signal.name}
                  </div>

                  <div className="mt-1 text-2xl font-black text-white">
                    {signal.value}
                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: signal.value }}
                    />
                  </div>

                </div>
              );
            })}

          </div>

        </section>


        {/* =========================================================
            GRAPH INTELLIGENCE
        ========================================================== */}

        <section className="mt-12 overflow-hidden rounded-2xl border border-slate-800 bg-[#07121e]/80">

          <div className="grid lg:grid-cols-[1fr_0.8fr]">

            <div className="p-7 sm:p-9">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <BrainCircuit size={20} />
                </div>

                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-indigo-400">
                    KNOWLEDGE GRAPH
                  </div>

                  <div className="text-sm font-bold">
                    OmniNexus Intelligence Graph
                  </div>
                </div>

              </div>

              <h3 className="mt-7 text-2xl font-black sm:text-3xl">
                Connect skills.
                <span className="text-indigo-400">
                  {" "}Understand transitions.
                </span>
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                Skills, roles, candidates, market signals and career
                transitions are represented as connected intelligence
                inside the OmniNexus graph.
              </p>

              <Link
                href="/database"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
              >
                Explore System DB
                <ArrowUpRight size={15} />
              </Link>

            </div>


            {/* Graph visual */}

            <div className="relative min-h-[280px] overflow-hidden border-t border-slate-800 bg-[#040b13] lg:border-l lg:border-t-0">

              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(34,211,238,.5) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="absolute left-[18%] top-[35%] h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.8)]" />
              <div className="absolute left-[42%] top-[20%] h-3 w-3 rounded-full bg-indigo-400 shadow-[0_0_18px_rgba(129,140,248,.8)]" />
              <div className="absolute left-[65%] top-[48%] h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.8)]" />
              <div className="absolute left-[78%] top-[72%] h-3 w-3 rounded-full bg-violet-400 shadow-[0_0_18px_rgba(167,139,250,.8)]" />
              <div className="absolute left-[48%] top-[68%] h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(34,211,238,.9)]" />

              <div className="absolute left-[20%] top-[37%] h-px w-[25%] rotate-[-20deg] bg-cyan-400/30" />
              <div className="absolute left-[44%] top-[23%] h-px w-[24%] rotate-[28deg] bg-indigo-400/30" />
              <div className="absolute left-[50%] top-[68%] h-px w-[30%] rotate-[-25deg] bg-cyan-400/30" />
              <div className="absolute left-[66%] top-[51%] h-px w-[17%] rotate-[45deg] bg-emerald-400/30" />

              <div className="absolute bottom-5 left-5 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-[10px] font-semibold text-slate-500 backdrop-blur">
                GRAPH NETWORK ACTIVE
              </div>

            </div>

          </div>

        </section>


        {/* =========================================================
            FOOTER STATUS
        ========================================================== */}

        <footer className="mt-10 flex flex-col gap-3 border-t border-slate-900 pt-6 text-[10px] font-semibold tracking-widest text-slate-600 sm:flex-row sm:items-center sm:justify-between">

          <span>
            OMNINEXUS OS · WORKFORCE INTELLIGENCE
          </span>

          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            CORE MODULES AVAILABLE
          </span>

        </footer>

      </div>
    </main>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function TelemetryRow({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between text-xs">

        <span className="text-slate-500">
          {label}
        </span>

        <span className="font-bold text-emerald-400">
          {value}
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width }}
        />

      </div>

    </div>
  );
}


function MetricCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#07121e]/80 p-4 transition-all hover:border-slate-700">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/[0.06] text-cyan-400">
          <Icon size={17} />
        </div>

        <span className="rounded-md bg-emerald-500/[0.06] px-2 py-1 text-[9px] font-bold text-emerald-400">
          {change}
        </span>

      </div>

      <div className="mt-4 text-[10px] font-bold tracking-widest text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-xl font-black text-white sm:text-2xl">
        {value}
      </div>

    </div>
  );
}


function ModuleCard({
  title,
  description,
  href,
  icon: Icon,
  metric,
  metricLabel,
  accent,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  metric: string;
  metricLabel: string;
  accent: "cyan" | "violet" | "emerald" | "amber";
}) {
  const accentClasses = {
    cyan: {
      icon: "text-cyan-400 bg-cyan-400/[0.06] border-cyan-500/20",
      glow: "hover:border-cyan-500/30",
      metric: "text-cyan-400",
    },
    violet: {
      icon: "text-violet-400 bg-violet-400/[0.06] border-violet-500/20",
      glow: "hover:border-violet-500/30",
      metric: "text-violet-400",
    },
    emerald: {
      icon: "text-emerald-400 bg-emerald-400/[0.06] border-emerald-500/20",
      glow: "hover:border-emerald-500/30",
      metric: "text-emerald-400",
    },
    amber: {
      icon: "text-amber-400 bg-amber-400/[0.06] border-amber-500/20",
      glow: "hover:border-amber-500/30",
      metric: "text-amber-400",
    },
  };

  const styles = accentClasses[accent];

  return (
    <Link
      href={href}
      className={`
        group
        rounded-2xl
        border
        border-slate-800
        bg-[#07121e]/80
        p-6
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:bg-[#091725]
        ${styles.glow}
      `}
    >

      <div className="flex items-start justify-between">

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            ${styles.icon}
          `}
        >
          <Icon size={20} />
        </div>

        <ArrowUpRight
          size={18}
          className="text-slate-700 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-300"
        />

      </div>

      <div className="mt-6">

        <h3 className="text-lg font-bold">
          {title}
        </h3>

        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
          {description}
        </p>

      </div>

      <div className="mt-6 flex items-end justify-between border-t border-slate-800 pt-4">

        <div>
          <div className="text-[9px] font-bold tracking-widest text-slate-600">
            {metricLabel}
          </div>

          <div className={`mt-1 text-xl font-black ${styles.metric}`}>
            {metric}
          </div>
        </div>

        <span className="text-[10px] font-semibold text-slate-600 transition-colors group-hover:text-slate-400">
          OPEN MODULE →
        </span>

      </div>

    </Link>
  );
}