"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BrainCircuit, Database, Gauge, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { loadIntelligenceContext, saveIntelligenceContext } from "@/lib/intelligence-context";

type Intelligence = {
  profile: { skills: string[]; target_role?: string | null; readiness_score?: number | null };
  market: { overall_opportunity_score: number; signals: Array<{ skill: string; postings?: number; demand_index?: number; salary_mid_lakh?: number; opportunity_score?: number | null; known_market_signal: boolean }>; source_note: string };
  skill_gap: { required: string[]; missing: string[]; count: number };
  success_signals: {
    junior: Array<{ feature: string; importance: number }>;
    senior: Array<{ feature: string; importance: number }>;
    metrics: { jds: { selected_model: string; accuracy: number; roc_auc: number }; sds: { selected_model: string; accuracy: number; roc_auc: number } };
    interpretation_note: string;
  };
  evidence: Array<{ label: string; value: string }>;
  traceability: { datasets: string[]; note: string };
};

export default function IntelligencePage() {
  const [skills, setSkills] = useState("Python, SQL");
  const [role, setRole] = useState("Data Scientist");
  const [result, setResult] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const context = loadIntelligenceContext();
    if (!context) return;
    if (context.skills.length) setSkills(context.skills.join(", "));
    if (context.targetRole) setRole(context.targetRole);
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/v1/intelligence/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: skills.split(",").map((value) => value.trim()).filter(Boolean),
          target_role: role,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Intelligence analysis failed.");
      setResult(data);
      saveIntelligenceContext({
        skills: data.profile?.skills || skills.split(",").map((value) => value.trim()).filter(Boolean),
        targetRole: data.profile?.target_role || role,
        readiness: data.profile?.readiness_score ?? null,
        opportunity: Number(data.market?.overall_opportunity_score ?? 0),
        bottleneck: data.skill_gap?.missing?.[0] || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Intelligence analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#02070d] px-5 pb-32 pt-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[30px] border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%),#07111d] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
              <BrainCircuit size={16} /> OmniNexus Intelligence Engine
            </div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white">
              System Home <ArrowUpRight size={15} />
            </Link>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Market evidence → skill intelligence → career decision.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            A single evidence-backed layer combining the supplied hackathon market sample,
            statistical findings, and interpretable success-model signals. This layer now
            consumes the shared context produced by Career Simulator, Skill Intelligence,
            and Workforce Observatory so the same profile and target role travel across the OS.
          </p>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="rounded-[26px] border border-slate-800 bg-[#07111d] p-6">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-violet-300" />
              <h2 className="font-black">Run a profile intelligence scan</h2>
            </div>
            <label className="mt-6 block text-xs font-black uppercase tracking-wider text-slate-500">Current skills</label>
            <textarea value={skills} onChange={(event) => setSkills(event.target.value)} rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#030910] p-4 text-sm text-slate-200 outline-none focus:border-cyan-400/50"
              placeholder="Python, SQL, Machine Learning" />
            <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500">Target role</label>
            <select value={role} onChange={(event) => setRole(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#030910] p-4 text-sm text-slate-200 outline-none">
              <option>Data Scientist</option>
              <option>AI Engineer</option>
              <option>Machine Learning Engineer</option>
              <option>MLOps Engineer</option>
              <option>AI Product Engineer</option>
            </select>
            <button onClick={runAnalysis} disabled={loading}
              className="mt-4 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-[#031018] transition hover:bg-cyan-200 disabled:opacity-50">
              {loading ? "Running evidence scan..." : "Run Intelligence Scan"}
            </button>
            {error && <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300">{error}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Metric icon={<Gauge size={18} />} label="Readiness" value={result?.profile.readiness_score != null ? `${result.profile.readiness_score}%` : "—"} />
            <Metric icon={<TrendingUp size={18} />} label="Opportunity" value={result ? String(result.market.overall_opportunity_score) : "—"} />
            <Metric icon={<Target size={18} />} label="Skill gaps" value={result ? String(result.skill_gap.count) : "—"} />
          </div>
        </section>

        {result && (
          <>
            <section className="mt-5 grid gap-5 lg:grid-cols-2">
              <SignalPanel title="Market signals" icon={<TrendingUp size={17} />} accent="text-emerald-300">
                <div className="space-y-2">
                  {result.market.signals.map((signal) => (
                    <div key={signal.skill} className="rounded-xl border border-slate-800 bg-[#030910] p-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-200">{signal.skill}</span>
                        <span className="font-black text-cyan-300">{signal.opportunity_score ?? "—"}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {signal.postings ?? "—"} sample mentions · {signal.salary_mid_lakh ? `₹${signal.salary_mid_lakh}L` : "salary unavailable"} midpoint
                      </div>
                    </div>
                  ))}
                </div>
              </SignalPanel>

              <SignalPanel title="Skill gap" icon={<Target size={17} />} accent="text-amber-300">
                {result.skill_gap.missing.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {result.skill_gap.missing.map((skill) => (
                      <div key={skill} className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-3 text-sm font-bold text-amber-200">
                        {skill}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 text-sm font-bold text-emerald-300">
                    No configured role skill gaps detected.
                  </div>
                )}
                <p className="mt-4 text-xs leading-5 text-slate-500">Required skills are the current OmniNexus role profile; market evidence is shown separately so recommendations remain traceable.</p>
              </SignalPanel>
            </section>

            <section className="mt-5 grid gap-5 lg:grid-cols-2">
              <SignalPanel title="Junior success signals" icon={<BrainCircuit size={17} />} accent="text-violet-300">
                <ImportanceList items={result.success_signals.junior} />
                <ModelMetric name={result.success_signals.metrics.jds.selected_model} metric={result.success_signals.metrics.jds} />
              </SignalPanel>
              <SignalPanel title="Senior success signals" icon={<ShieldCheck size={17} />} accent="text-cyan-300">
                <ImportanceList items={result.success_signals.senior} />
                <ModelMetric name={result.success_signals.metrics.sds.selected_model} metric={result.success_signals.metrics.sds} />
              </SignalPanel>
            </section>

            <section className="mt-5 rounded-[26px] border border-slate-800 bg-[#07111d] p-6">
              <div className="flex items-center gap-2 text-cyan-300"><Database size={17} /><h2 className="font-black">Evidence traceability</h2></div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {result.evidence.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-800 bg-[#030910] p-4">
                    <p className="text-xs font-black text-slate-300">{item.label}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {result.traceability.datasets.map((dataset) => <span key={dataset} className="rounded-full border border-cyan-500/15 bg-cyan-500/5 px-3 py-1.5 text-xs font-bold text-cyan-300">{dataset}</span>)}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-600">{result.success_signals.interpretation_note} {result.traceability.note}</p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-slate-800 bg-[#07111d] p-5">
      <div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span></div>
      <div className="mt-6 text-4xl font-black">{value}</div>
      <p className="mt-2 text-xs text-slate-600">Evidence-backed signal</p>
    </div>
  );
}

function SignalPanel({ title, icon, accent, children }: { title: string; icon: React.ReactNode; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[26px] border border-slate-800 bg-[#07111d] p-6">
      <div className={`mb-4 flex items-center gap-2 ${accent}`}><span>{icon}</span><h2 className="font-black">{title}</h2></div>
      {children}
    </div>
  );
}

function ImportanceList({ items }: { items: Array<{ feature: string; importance: number }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.feature}>
          <div className="mb-1 flex justify-between text-xs"><span className="font-bold text-slate-300">{item.feature}</span><span className="font-black text-slate-500">{(item.importance * 100).toFixed(1)}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-900"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.importance * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function ModelMetric({ name, metric }: { name: string; metric: { accuracy: number; roc_auc: number } }) {
  return <div className="mt-5 rounded-xl border border-slate-800 bg-[#030910] p-3 text-xs text-slate-500"><span className="font-bold text-slate-300">{name}</span> selected model · Accuracy {(metric.accuracy * 100).toFixed(1)}% · ROC-AUC {(metric.roc_auc * 100).toFixed(1)}%</div>;
}
