"use client";
import { useEffect, useState } from "react";
import { BrainCircuit, Search, Target, TrendingUp, ArrowUpRight } from "lucide-react";
import { apiUrl } from "@/lib/api";

type Signal = { skill: string; postings?: number; demand_index?: number; salary_mid_lakh?: number; opportunity_score?: number | null; known_market_signal: boolean };
type Result = { normalized_skills: string[]; skill_gaps: { skill: string; priority: string; reason: string }[]; market_signals: Signal[]; overall_opportunity_score: number; source_note: string };

export default function SkillIntelligencePage() {
  const [skills, setSkills] = useState("Python, SQL");
  const [role, setRole] = useState("Data Scientist");
  const [result, setResult] = useState<Result | null>(null);
  const [leaders, setLeaders] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(apiUrl("/api/v1/skill-intelligence/leaderboard?limit=8")).then(r => r.json()).then(data => setLeaders(data.items || [])).catch(() => undefined);
  }, []);

  async function analyze() {
    setLoading(true); setError("");
    try {
      const list = skills.split(",").map(x => x.trim()).filter(Boolean);
      const response = await fetch(apiUrl("/api/v1/skill-intelligence/analyze"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skills: list, target_role: role }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Analysis failed");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed"); } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-[#030910] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-slate-800/80 bg-[#07121e]/80 p-6 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
          <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-400"><BrainCircuit size={15} /> Hackathon Intelligence Layer</div><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Skill Intelligence</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Normalize capabilities, compare them with the supplied hackathon market sample, and surface interpretable skill gaps.</p></div>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400">OmniNexus Home <ArrowUpRight size={15} /></a>
        </div>
        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-slate-800 bg-[#07111d]/95 p-5">
            <div className="mb-4 flex items-center gap-2"><Target size={17} className="text-violet-400" /><h2 className="font-black">Profile analysis</h2></div>
            <label className="text-xs font-bold text-slate-500">Your skills</label>
            <textarea value={skills} onChange={e => setSkills(e.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#040a11] p-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50" placeholder="Python, SQL, Machine Learning" />
            <label className="mt-4 block text-xs font-bold text-slate-500">Target role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#040a11] p-4 text-sm text-slate-200 outline-none"><option>Data Scientist</option><option>AI Engineer</option><option>Machine Learning Engineer</option><option>MLOps Engineer</option><option>AI Product Engineer</option></select>
            <button onClick={analyze} disabled={loading} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-[#041018] hover:bg-cyan-300 disabled:opacity-50"><Search size={16} /> {loading ? "Analyzing..." : "Run Intelligence Analysis"}</button>
            {error && <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300">{error}</p>}
          </div>
          <div className="rounded-3xl border border-slate-800 bg-[#07111d]/95 p-5">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Market leaderboard</p><h2 className="mt-1 text-xl font-black">Opportunity signals</h2></div><TrendingUp className="text-emerald-400" size={18} /></div>
            <div className="space-y-2">{leaders.map((item, index) => <div key={item.skill} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-xl border border-slate-800 bg-[#040a11] p-3"><span className="text-xs font-black text-slate-600">0{index + 1}</span><div><p className="text-sm font-bold text-slate-200">{item.skill}</p><p className="text-[10px] text-slate-600">{item.postings} sample mentions · ₹{item.salary_mid_lakh}L salary-band midpoint</p></div><span className="text-sm font-black text-cyan-400">{item.opportunity_score}</span></div>)}</div>
          </div>
        </section>
        {result && <section className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.03] p-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Overall opportunity</p><div className="mt-3 text-6xl font-black">{result.overall_opportunity_score}</div><p className="mt-2 text-sm text-slate-500">0–100 composite signal using 60% demand percentile and 40% salary percentile.</p><div className="mt-5 flex flex-wrap gap-2">{result.normalized_skills.map(skill => <span key={skill} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">✓ {skill}</span>)}</div><div className="mt-6"><p className="text-xs font-black uppercase tracking-wider text-amber-400">Priority gaps</p><div className="mt-2 space-y-2">{result.skill_gaps.length ? result.skill_gaps.map(gap => <div key={gap.skill} className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-3"><div className="flex justify-between"><span className="text-sm font-bold">{gap.skill}</span><span className="text-[10px] font-black uppercase text-amber-400">{gap.priority}</span></div></div>) : <p className="text-sm text-emerald-400">No configured role gaps detected.</p>}</div></div></div>
          <div className="rounded-3xl border border-slate-800 bg-[#07111d]/95 p-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Evidence</p><h2 className="mt-1 text-xl font-black">Your normalized market signals</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-[10px] uppercase tracking-wider text-slate-600"><tr><th className="pb-3">Skill</th><th className="pb-3">Demand</th><th className="pb-3">Salary</th><th className="pb-3">Opportunity</th></tr></thead><tbody>{result.market_signals.map(item => <tr key={item.skill} className="border-t border-slate-800"><td className="py-3 font-bold text-slate-200">{item.skill}</td><td className="py-3 text-slate-400">{item.demand_index ?? "—"}</td><td className="py-3 text-slate-400">{item.salary_mid_lakh ? "₹" + item.salary_mid_lakh + "L" : "—"}</td><td className="py-3 font-black text-cyan-400">{item.opportunity_score ?? "—"}</td></tr>)}</tbody></table></div><p className="mt-5 border-t border-slate-800 pt-4 text-xs leading-5 text-slate-600">{result.source_note}</p></div>
        </section>}
      </div>
    </main>
  );
}