"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  GitBranch,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const roleProfiles: Record<string, { readiness: number; market: number; critical: string[] }> = {
  "AI Engineer": { readiness: 22, market: 14.2, critical: ["Machine Learning", "LLMs", "RAG", "MLOps"] },
  "ML Engineer": { readiness: 26, market: 13.6, critical: ["Machine Learning", "Deep Learning", "PyTorch", "MLOps"] },
  "Data Scientist": { readiness: 34, market: 11.8, critical: ["Statistics", "SQL", "Machine Learning", "Data Analysis"] },
  "MLOps Engineer": { readiness: 18, market: 15.1, critical: ["Docker", "CI/CD", "Kubernetes", "MLOps"] },
  "AI Product Engineer": { readiness: 29, market: 13.1, critical: ["LLMs", "RAG", "AI Agents", "Cloud"] },
};

const skillImpact: Record<string, number> = {
  "Machine Learning": 14,
  "Deep Learning": 12,
  PyTorch: 10,
  LLMs: 16,
  RAG: 13,
  "AI Agents": 12,
  MLOps: 18,
  Docker: 8,
  "Cloud Computing": 9,
  "CI/CD": 7,
  Kubernetes: 6,
};

type FutureLabSkill = {
  skill: string;
  impact: number;
  coverage: number;
  priority: string;
};

type FutureLabSimulation = {
  readiness: number;
  demand: number;
  supply: number;
  gap: number;
  market_value: number;
  hiring_need: number;
  risk: number;
  skills: FutureLabSkill[];
  recommended_transition?: string;
  model_version?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function FutureLabPage() {
  const [role, setRole] = useState("AI Engineer");
  const [demandShock, setDemandShock] = useState(25);
  const [reskill, setReskill] = useState(12);

  const profile = roleProfiles[role];

  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole && roleProfiles[requestedRole]) setRole(requestedRole);
  }, []);
  const [apiSimulation, setApiSimulation] = useState<FutureLabSimulation | null>(null);
  const [apiStatus, setApiStatus] = useState<"syncing" | "live" | "fallback">("syncing");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)
      ? "https://omninexus-api-prod.onrender.com"
      : "http://localhost:8001");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setApiSimulation(null);
      setApiStatus("syncing");
      fetch(API_BASE_URL + "/api/v1/future-lab/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ target_role: role, demand_shock: demandShock, reskill_people: reskill }),
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Future Lab API unavailable");
          return response.json();
        })
        .then((payload) => {
          if (!controller.signal.aborted) {
            setApiSimulation(payload.simulation);
            setApiStatus("live");
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setApiSimulation(null);
            setApiStatus("fallback");
          }
        });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [demandShock, reskill, role]);

  const simulation = useMemo(() => {
    const readinessBoost = Math.round(reskill * 2.15);
    const shockPenalty = Math.round(demandShock * 0.22);
    const readiness = clamp(profile.readiness + readinessBoost - shockPenalty, 5, 98);
    const baseDemand = 5839;
    const baseSupply = 3421;
    const demand = Math.round(baseDemand * (1 + demandShock / 100));
    const supply = Math.round(baseSupply * (1 + reskill / 180));
    const gap = Math.round(((demand - supply) / demand) * 100);
    const value = profile.market + readiness * 0.045;
    const hiringNeed = Math.max(0, Math.round((demand - supply) / 180));
    const risk = clamp(Math.round(48 + demandShock * 0.72 - reskill * 0.9), 8, 96);
    return { readiness, demand, supply, gap, value, hiringNeed, risk };
  }, [demandShock, profile, reskill]);

  const displayedSimulation = apiSimulation
    ? {
        readiness: apiSimulation.readiness,
        demand: apiSimulation.demand,
        supply: apiSimulation.supply,
        gap: apiSimulation.gap,
        value: apiSimulation.market_value,
        hiringNeed: apiSimulation.hiring_need,
        risk: apiSimulation.risk,
      }
    : simulation;

  const localProjectedSkills = useMemo(() => {
    return profile.critical.map((skill, index) => {
      const impact = skillImpact[skill] ?? 8;
      const coverage = clamp(28 + reskill * 2.4 + (3 - index) * 5 - demandShock * 0.35, 8, 97);
      return {
        skill,
        impact,
        coverage: Math.round(coverage),
        priority: index === 0 ? "Critical" : index < 3 ? "High" : "Medium",
      };
    });
  }, [demandShock, profile, reskill]);

  const projectedSkills = apiSimulation?.skills ?? localProjectedSkills;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050a10] text-slate-300">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[12%] top-[-15%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.035] blur-[140px]" />
        <div className="absolute right-[-10%] top-[30%] h-[520px] w-[520px] rounded-full bg-violet-500/[0.03] blur-[140px]" />
      </div>

      <div className="mx-auto max-w-[1380px] px-4 py-6 pb-20 sm:px-6 lg:px-8">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/observatory" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#09131e] text-slate-500 transition hover:border-cyan-500/30 hover:text-cyan-400" aria-label="Back to Observatory">
              <ArrowLeft size={17} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-cyan-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">OmniNexus Intelligence Lab</span>
              </div>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">Future Shock Simulator</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
            <span className={"h-1.5 w-1.5 rounded-full " + (apiStatus === "fallback" ? "bg-amber-400" : "bg-emerald-400")} />
            <span className={"text-[9px] font-black uppercase tracking-widest " + (apiStatus === "fallback" ? "text-amber-400" : "text-emerald-400")}>
              {apiStatus === "live" ? "Intelligence API live" : apiStatus === "fallback" ? "Local model fallback" : "Syncing intelligence"}
            </span>
          </div>
        </header>

        <section className="mb-6 overflow-hidden rounded-3xl border border-slate-800 bg-[#07101a]">
          <div className="grid lg:grid-cols-[1fr_390px]">
            <div className="p-6 md:p-8">
              <div className="mb-4 flex items-center gap-2">
                <BrainCircuit size={17} className="text-cyan-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">What-if workforce intelligence</span>
              </div>
              <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">See how demand shocks change your workforce.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">Adjust the scenario, simulate reskilling and watch capability pressure, readiness and hiring requirements change together.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={"/career-simulator?role=" + encodeURIComponent(role)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 transition hover:border-cyan-400/40">
                  Open Career Simulator <ArrowRight size={13} />
                </Link>
                <Link href="/recruiter" className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-[#09131e] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition hover:border-slate-700 hover:text-white">
                  Talent Matcher
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Role</div>
                  <div className="mt-2 text-sm font-black text-white">{role}</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Demand shock</div>
                  <div className="mt-2 text-sm font-black text-amber-400">+{demandShock}%</div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#09131e] p-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">Reskilling cohort</div>
                  <div className="mt-2 text-sm font-black text-emerald-400">{reskill} people</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 bg-[#09131e] p-6 lg:border-l lg:border-t-0 md:p-8">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Target role</label>
              <select value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#07101a] px-3 py-3 text-sm font-bold text-white outline-none focus:border-cyan-500/50">
                {Object.keys(roleProfiles).map((item) => <option key={item}>{item}</option>)}
              </select>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Demand shock</label>
                  <span className="text-xs font-black text-amber-400">+{demandShock}%</span>
                </div>
                <input type="range" min="0" max="50" step="5" value={demandShock} onChange={(event) => setDemandShock(Number(event.target.value))} className="w-full accent-cyan-400" />
                <div className="mt-1 flex justify-between text-[8px] text-slate-700"><span>BASELINE</span><span>+50%</span></div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Reskill workforce</label>
                  <span className="text-xs font-black text-emerald-400">{reskill} people</span>
                </div>
                <input type="range" min="0" max="30" step="1" value={reskill} onChange={(event) => setReskill(Number(event.target.value))} className="w-full accent-emerald-400" />
                <div className="mt-1 flex justify-between text-[8px] text-slate-700"><span>NONE</span><span>30 PEOPLE</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [Gauge, "Readiness", displayedSimulation.readiness + "%", "Post-scenario capability readiness", "cyan"],
            [TrendingUp, "Market demand", displayedSimulation.demand.toLocaleString(), "Projected demand index", "violet"],
            [Users, "Talent supply", displayedSimulation.supply.toLocaleString(), "Modeled available capacity", "emerald"],
            [ShieldAlert, "Workforce risk", displayedSimulation.risk + "/100", "Capability pressure index", "amber"],
          ].map(([Icon, label, value, sub, tone]) => {
            const I = Icon as typeof Gauge;
            const color = tone === "emerald" ? "text-emerald-400" : tone === "amber" ? "text-amber-400" : tone === "violet" ? "text-violet-400" : "text-cyan-400";
            return (
              <div key={String(label)} className="rounded-2xl border border-slate-800 bg-[#09131e] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{String(label)}</span>
                  <I size={16} className={color} />
                </div>
                <div className={"mt-4 text-3xl font-black " + color}>{String(value)}</div>
                <div className="mt-1 text-[9px] text-slate-600">{String(sub)}</div>
              </div>
            );
          })}
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-[#07101a] p-6 md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-cyan-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Workforce Digital Twin</span>
                </div>
                <h3 className="mt-2 text-xl font-black text-white">Capability pressure map</h3>
              </div>
              <div className="rounded-lg border border-slate-800 px-2.5 py-1.5 text-[8px] font-black text-slate-600">100-PERSON MODEL</div>
            </div>

            <div className="space-y-4">
              {projectedSkills.map((item, index) => {
                const bar = item.coverage < 35 ? "bg-rose-400" : item.coverage < 60 ? "bg-amber-400" : "bg-emerald-400";
                const badge = item.priority === "Critical" ? "bg-rose-500/10 text-rose-400" : item.priority === "High" ? "bg-amber-500/10 text-amber-400" : "bg-indigo-500/10 text-indigo-400";
                return (
                  <div key={item.skill}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.skill}</span>
                        <span className={"rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase " + badge}>{item.priority}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-500">{item.coverage}% covered</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className={"h-full rounded-full " + bar} style={{ width: item.coverage + "%" }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[8px] text-slate-700">
                      <span>Impact {item.impact}/20</span>
                      <span>{index === 0 ? "Primary bottleneck" : "Downstream capability"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#07101a] p-6 md:p-7">
            <div className="mb-5 flex items-center gap-2">
              <Target size={16} className="text-violet-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">Explainable AI</span>
            </div>
            <h3 className="text-xl font-black text-white">Why this scenario matters</h3>
            <p className="mt-2 text-xs leading-5 text-slate-500">The model connects demand pressure with reskilling capacity rather than showing a single opaque score.</p>

            <div className="mt-6 space-y-3">
              {[
                ["Demand pressure", "+" + demandShock + "%", demandShock >= 35 ? "High" : demandShock >= 20 ? "Medium" : "Low"],
                ["Talent gap", displayedSimulation.gap + "%", displayedSimulation.gap >= 45 ? "Critical" : displayedSimulation.gap >= 30 ? "High" : "Moderate"],
                ["Reskill leverage", reskill + " people", reskill >= 18 ? "Strong" : reskill >= 8 ? "Moderate" : "Low"],
              ].map(([label, value, level]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#09131e] p-3">
                  <div>
                    <div className="text-[9px] text-slate-600">{label}</div>
                    <div className="mt-1 text-xs font-black text-white">{value}</div>
                  </div>
                  <span className="text-[8px] font-black uppercase text-cyan-400">{level}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-cyan-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Model insight</span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                {displayedSimulation.hiringNeed > 0
                  ? "The scenario leaves an estimated hiring requirement of " + displayedSimulation.hiringNeed + " specialists in the modeled workforce."
                  : "Reskilling capacity is sufficient to absorb the modeled demand shock without additional specialist hiring."}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.035] p-6 md:p-7">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Rocket size={17} className="text-cyan-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">Recommended transition</span>
              </div>
              <h3 className="mt-2 text-xl font-black text-white">Reskill toward {profile.critical[0]} → {profile.critical[1]}</h3>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">Prioritize the first capability because it has the highest modeled structural impact for the selected role. Then build the downstream capability to unlock the next transition.</p>
            </div>
            <Link href="/career-simulator" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-[10px] font-black text-[#041018] transition hover:bg-cyan-300">
              Continue in Career Simulator
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [CheckCircle2, "Scenario traceable", "Every score is derived from visible inputs."],
            [CircleDollarSign, "Career economics", "Modeled market signal ₹" + displayedSimulation.value.toFixed(1) + "L"],
            [Activity, "Decision ready", "Use the result as a planning signal, not a black-box verdict."],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Activity;
            return (
              <div key={String(title)} className="rounded-2xl border border-slate-800 bg-[#09131e] p-4">
                <I size={15} className="text-slate-500" />
                <div className="mt-3 text-xs font-black text-white">{String(title)}</div>
                <div className="mt-1 text-[9px] leading-4 text-slate-600">{String(text)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
