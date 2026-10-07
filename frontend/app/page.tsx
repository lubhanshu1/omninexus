"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  BriefcaseBusiness,
  Database,
  Gauge,
  Network,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const modules: Array<{ title: string; description: string; href: string; icon: LucideIcon; accent: "cyan" | "violet" | "emerald" | "amber"; metric: string; metricLabel: string }> = [
  {
    title: "Career Simulator",
    eyebrow: "01 / CAREER",
    description: "Model a transition, expose skill gaps and turn a target role into an actionable path.",
    href: "/career-simulator",
    icon: Sparkles,
    stat: "SKILL GAP",
  },
  {
    title: "Talent Matcher",
    eyebrow: "02 / TALENT",
    description: "Compare candidate capability against role requirements and surface evidence-backed fit.",
    href: "/recruiter",
    icon: Network,
    stat: "MATCH INTELLIGENCE",
  },
  {
    title: "Workforce Observatory",
    eyebrow: "03 / MARKET",
    description: "Read demand, supply, compensation and capability signals from the intelligence layer.",
    href: "/observatory",
    icon: Radar,
    stat: "MARKET SIGNALS",
  },
  {
    title: "Future Shock Lab",
    eyebrow: "04 / SCENARIOS",
    description: "Stress-test workforce assumptions and explore what happens when demand changes.",
    href: "/future-lab",
    icon: Zap,
    stat: "WHAT-IF ENGINE",
  },
  {
    title: "System Database",
    eyebrow: "05 / GRAPH",
    description: "Inspect roles, skills, relationships and the underlying career intelligence graph.",
    href: "/database",
    icon: Database,
    stat: "KNOWLEDGE GRAPH",
  },
];

const signals = [
  ["Market Intelligence", "LIVE", "Demand • supply • salary"],
  ["Career Intelligence", "READY", "Skills • paths • gaps"],
  ["Talent Intelligence", "READY", "Fit • evidence • roles"],
  ["Graph Intelligence", "READY", "Nodes • edges • transitions"],
];

function OrbitalCore() {
  return (
    <div className="relative mx-auto h-[390px] w-[390px] [perspective:1100px] sm:h-[470px] sm:w-[470px]">
      <div className="absolute inset-[12%] rounded-full border border-cyan-400/10 [transform:rotateX(70deg)]" />
      <div className="absolute inset-[6%] rounded-full border border-indigo-400/10 [transform:rotateY(68deg)]" />
      <div className="absolute inset-[18%] rounded-full border border-violet-400/10 [transform:rotateX(62deg)_rotateZ(28deg)]" />

      <div className="absolute inset-0 animate-[spin_24s_linear_infinite] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateY(-18deg)]">
        {[0, 72, 144, 216, 288].map((angle) => (
          <span
            key={angle}
            className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(34,211,238,.9)]"
            style={{
              transform: `rotateZ(${angle}deg) translateX(175px) rotateZ(-${angle}deg)`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-[25%] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateY(-22deg)]">
        <div className="absolute inset-0 rounded-[32px] border border-cyan-300/30 bg-cyan-400/[0.035] shadow-[0_0_90px_rgba(34,211,238,.12),inset_0_0_45px_rgba(34,211,238,.04)] [transform:translateZ(38px)_rotateZ(45deg)]" />
        <div className="absolute inset-0 rounded-[32px] border border-indigo-300/25 bg-indigo-400/[0.025] [transform:translateZ(-38px)_rotateZ(45deg)]" />
        <div className="absolute inset-[12%] rounded-[22px] border border-white/10 bg-[#07121e]/90 backdrop-blur-xl [transform:translateZ(52px)]">
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-300 shadow-[0_0_35px_rgba(34,211,238,.18)]">
              <BrainCircuit size={28} />
            </div>
            <div className="text-[9px] font-black tracking-[0.3em] text-cyan-300">INTELLIGENCE CORE</div>
            <div className="mt-2 text-xl font-black tracking-tight text-white">OMNI / NEXUS</div>
            <div className="mt-2 text-[10px] text-slate-500">CAREER • MARKET • TALENT</div>
          </div>
        </div>
      </div>

      <div className="absolute left-0 top-[20%] rounded-2xl border border-slate-700/80 bg-[#08131f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="text-[8px] font-black tracking-[0.2em] text-slate-600">MARKET SIGNAL</div>
        <div className="mt-1 text-sm font-black text-cyan-300">DEMAND + SUPPLY</div>
      </div>

      <div className="absolute bottom-[13%] right-0 rounded-2xl border border-slate-700/80 bg-[#08131f]/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="text-[8px] font-black tracking-[0.2em] text-slate-600">CAREER PATH</div>
        <div className="mt-1 text-sm font-black text-violet-300">SKILL → ROLE</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02070c] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[8%] top-[8%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.045] blur-[150px]" />
        <div className="absolute right-[2%] top-[15%] h-[560px] w-[560px] rounded-full bg-indigo-500/[0.045] blur-[170px]" />
        <div className="absolute bottom-[-15%] left-[38%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.035] blur-[160px]" />
      </div>

      <div className="mx-auto max-w-[1500px] px-5 pb-24 pt-5 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-40 mb-8 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#050c14]/80 px-4 py-3 shadow-2xl backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,.08)]">
              <BriefcaseBusiness size={19} />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight">OmniNexus</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">Career Intelligence OS</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/career-simulator" className="text-xs font-semibold text-slate-400 transition hover:text-cyan-300">Simulator</Link>
            <Link href="/observatory" className="text-xs font-semibold text-slate-400 transition hover:text-cyan-300">Observatory</Link>
            <Link href="/recruiter" className="text-xs font-semibold text-slate-400 transition hover:text-cyan-300">Talent</Link>
            <Link href="/database" className="text-xs font-semibold text-slate-400 transition hover:text-cyan-300">Graph</Link>
          </nav>

          <Link href="/career-simulator" className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/15">
            Launch OS <ArrowRight size={14} />
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-[34px] border border-white/[0.07] bg-[#050c14]/75 shadow-[0_30px_100px_rgba(0,0,0,.35)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 opacity-[0.16]" style={{ backgroundImage: "linear-gradient(rgba(34,211,238,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.12) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

          <div className="relative grid min-h-[690px] items-center gap-6 px-7 py-10 lg:grid-cols-[1.05fr_.95fr] lg:px-14 lg:py-14">
            <div className="relative z-10">
              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">Hackathon Intelligence Edition</span>
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.05] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> System Online</span>
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-[78px]">
                The intelligence layer
                <span className="block bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">behind a career.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                OmniNexus connects skills, roles, market signals, career paths and talent intelligence into one evidence-driven operating system.
                Explore where you are, where the market is moving and what capability closes the gap.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/career-simulator" className="group flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 text-xs font-black text-[#031018] shadow-[0_0_35px_rgba(34,211,238,.15)] transition hover:bg-cyan-200">
                  Enter Career Simulator <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                </Link>
                <Link href="/observatory" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-white/[0.025] px-5 py-3.5 text-xs font-black text-slate-300 transition hover:border-cyan-400/30 hover:text-white">
                  Explore Market <Radar size={15} />
                </Link>
              </div>

              <div className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    [Activity, "01", "Career"],
                    [TrendingUp, "02", "Market"],
                    [Users, "03", "Talent"],
                    [Network, "04", "Graph"],
                  ] as Array<[LucideIcon, string, string]>
                ).map(([Icon, num, label]) => (
                  <div key={num} className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-4">
                    <Icon size={15} className="text-cyan-300" />
                    <div className="mt-3 text-[9px] font-black tracking-[0.18em] text-slate-600">{num}</div>
                    <div className="mt-1 text-xs font-bold text-slate-300">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <OrbitalCore />
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map(([title, state, detail], i) => (
            <div key={title} className="group rounded-2xl border border-white/[0.06] bg-[#07111b]/80 p-5 transition hover:-translate-y-1 hover:border-cyan-400/20">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{title}</span>
                <span className={`rounded-md px-2 py-1 text-[8px] font-black tracking-widest ${i === 0 ? "bg-emerald-400/10 text-emerald-300" : "bg-cyan-400/10 text-cyan-300"}`}>{state}</span>
              </div>
              <div className="mt-4 text-xs font-semibold text-slate-400">{detail}</div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${76 + i * 6}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-7 max-w-2xl">
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-cyan-300">Intelligence environments</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">One system. Five surfaces.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Each surface answers a different question while sharing the same career intelligence graph.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className={`group relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#07111b]/80 p-6 transition duration-500 hover:-translate-y-2 hover:border-cyan-400/25 hover:shadow-[0_25px_70px_rgba(0,0,0,.3)] ${index === 0 ? "xl:col-span-2" : ""}`}
                >
                  <div className="absolute right-[-40px] top-[-50px] h-40 w-40 rounded-full bg-cyan-400/[0.035] blur-2xl transition group-hover:bg-cyan-400/[0.08]" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-300">
                        <Icon size={20} />
                      </div>
                      <span className="text-[8px] font-black tracking-[0.22em] text-slate-700">{module.eyebrow}</span>
                    </div>
                    <h3 className="mt-7 text-xl font-black">{module.title}</h3>
                    <p className="mt-2 max-w-xl text-xs leading-6 text-slate-500">{module.description}</p>
                    <div className="mt-7 flex items-center justify-between border-t border-white/[0.06] pt-4">
                      <span className="text-[8px] font-black tracking-[0.18em] text-slate-600">{module.stat}</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">Open <ArrowRight size={13} className="transition group-hover:translate-x-1" /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[26px] border border-white/[0.07] bg-[#07111b]/80 p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/[0.07] text-violet-300"><Network size={18} /></div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-violet-300">Graph intelligence</div>
                <div className="text-sm font-black">From isolated skills to connected trajectories.</div>
              </div>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["SKILL", "Python", "foundation"],
                ["ROLE", "Data Scientist", "target"],
                ["PATH", "Skill → Role", "transition"],
              ].map(([kind, value, sub]) => (
                <div key={kind} className="relative rounded-2xl border border-white/[0.06] bg-black/20 p-5">
                  <div className="text-[8px] font-black tracking-[0.2em] text-slate-600">{kind}</div>
                  <div className="mt-3 text-sm font-black text-white">{value}</div>
                  <div className="mt-1 text-[9px] text-slate-600">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] to-violet-400/[0.04] p-7">
            <Gauge className="text-cyan-300" size={20} />
            <div className="mt-6 text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">Operating principle</div>
            <h3 className="mt-2 text-2xl font-black">Evidence before intuition.</h3>
            <p className="mt-3 text-xs leading-6 text-slate-500">The hackathon intelligence layer will replace demo assumptions with analysis derived from the provided datasets.</p>
            <Link href="/observatory" className="mt-6 inline-flex items-center gap-2 text-xs font-black text-cyan-300">View intelligence surface <ArrowRight size={14} /></Link>
          </div>
        </section>

        <footer className="mt-16 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span>OMNINEXUS / CAREER INTELLIGENCE OS</span>
          <span>Hackathon Intelligence Edition</span>
        </footer>
      </div>
    </main>
  );
}
