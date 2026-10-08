"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BrainCircuit, Database, Network, Radar, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { apiUrl } from "@/lib/api";
import AppShell from "@/components/AppShell";

type Snapshot = {
  status: string;
  market?: { top_skills: Array<{skill:string; job_records:number; mean_salary_midpoint:number}>; skills_tracked:number };
  signals?: {experience_salary_rho:number; job_title_anova_f:number; posting_salary_rho:number; interpretation:string};
};

const modules = [
 { title:"Career Simulator", href:"/career-simulator", icon:Sparkles, text:"Build a role-specific skill gap and career transition path." },
 { title:"Unified Intelligence", href:"/intelligence", icon:BrainCircuit, text:"Combine market, skill and success-model evidence into one view." },
 { title:"Talent Matcher", href:"/recruiter", icon:Network, text:"Compare candidate capabilities against workforce requirements." },
 { title:"Skill Intelligence", href:"/skill-intelligence", icon:TrendingUp, text:"Explore demand and salary signals for technical skills." },
 { title:"Workforce Observatory", href:"/observatory", icon:Radar, text:"Monitor market structure, signals and workforce movement." },
 { title:"Future Shock Lab", href:"/future-lab", icon:Zap, text:"Run what-if workforce and reskilling scenarios." },
];

export default function HomePage() {
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
   fetch(apiUrl("/api/v1/observatory/snapshot"),{cache:"no-store"})
     .then(r=>r.ok?r.json():null)
     .then(setSnapshot)
     .catch(()=>setSnapshot(null))
     .finally(()=>setLoading(false));
 },[]);
 const signals=snapshot?.signals;
 return (
  <AppShell>
   <div className="mx-auto max-w-[1500px] px-5 pb-28 pt-8 sm:px-8">
    <section className="relative overflow-hidden rounded-[30px] border border-slate-800 bg-[#07121e] p-7 shadow-2xl sm:p-10 lg:p-14">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{backgroundImage:"linear-gradient(rgba(34,211,238,.12) 1px, transparent 1px),linear-gradient(90deg,rgba(34,211,238,.12) 1px,transparent 1px)",backgroundSize:"44px 44px"}}/>
      <div className="relative grid gap-12 lg:grid-cols-[1.35fr_.8fr] lg:items-center">
       <div>
        <div className="flex flex-wrap gap-2">
         <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold tracking-[.2em] text-cyan-300">OMNINEXUS</span>
         <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">{snapshot ? "LIVE ANALYTICS CONNECTED" : "ANALYTICS INITIALIZING"}</span>
        </div>
        <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">Your career and workforce intelligence layer.</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">OmniNexus connects market demand, skills, compensation, career paths and workforce analytics into one evidence-backed application.</p>
        <div className="mt-8 flex flex-wrap gap-3">
         <Link href="/career-simulator" className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300">Start Career Simulation <ArrowUpRight size={16}/></Link>
         <Link href="/observatory" className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white">Open Observatory <Radar size={16}/></Link>
        </div>
       </div>
       <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
        <div className="flex items-center justify-between"><div><div className="text-[11px] font-bold tracking-[.2em] text-slate-500">INTELLIGENCE CORE</div><div className="mt-1 text-lg font-black">Evidence telemetry</div></div><Database className="text-cyan-400"/></div>
        <div className="mt-6 space-y-5">
         <Metric label="Experience ↔ Salary" value={signals ? signals.experience_salary_rho.toFixed(4) : "—"} />
         <Metric label="Title / Salary ANOVA" value={signals ? signals.job_title_anova_f.toFixed(2) : "—"} />
         <Metric label="Volume ↔ Salary" value={signals ? signals.posting_salary_rho.toFixed(4) : "—"} />
        </div>
       </div>
      </div>
    </section>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      <StatCard label="Tracked market skills" value={loading ? "…" : String(snapshot?.market?.skills_tracked ?? 0)} icon={TrendingUp}/>
      <StatCard label="Evidence signals" value={signals ? "3" : "…"} icon={BrainCircuit}/>
      <StatCard label="Platform status" value={snapshot ? "Online" : "Connecting"} icon={Users}/>
    </section>

    <section className="mt-8 overflow-hidden rounded-[28px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-[#07121e] to-indigo-500/[0.08] p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black tracking-[.18em] text-cyan-300">
            <Zap size={13} />
            OMNINEXUS MOBILE
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Take your career intelligence with you.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">Download the OmniNexus Android app and access your career readiness, skill gaps, market intelligence and Talent Twin from your phone.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
            <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">Android</span>
            <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">Career Intelligence</span>
            <span className="rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">Same OmniNexus account</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <a href="https://github.com/lubhanshu1/omninexus/releases/latest/download/OmniNexus.apk" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300">
            <ArrowUpRight size={17} />
            Download Android App
          </a>
          <Link href="/career-simulator" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-500/30 hover:text-white">
            Continue on Web
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    <section className="mt-12">
      <div className="mb-6"><div className="text-[11px] font-bold tracking-[.2em] text-cyan-400">APPLICATION MODULES</div><h2 className="mt-2 text-3xl font-black">Everything connected through one intelligence layer</h2></div>
      <div className="grid gap-4 md:grid-cols-2">
       {modules.map(m=>{const Icon=m.icon; return <Link key={m.href} href={m.href} className="group rounded-2xl border border-slate-800 bg-[#07121e] p-6 transition hover:-translate-y-0.5 hover:border-cyan-500/30"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Icon size={19}/></div><ArrowUpRight size={17} className="text-slate-600 transition group-hover:text-cyan-300"/></div><h3 className="mt-6 text-xl font-bold">{m.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{m.text}</p></Link>})}
      </div>
    </section>

    {snapshot?.market?.top_skills?.length ? <section className="mt-12 rounded-2xl border border-slate-800 bg-[#07121e] p-6">
      <div className="flex items-center justify-between gap-4"><div><div className="text-[11px] font-bold tracking-[.2em] text-indigo-400">MARKET SIGNAL</div><h2 className="mt-2 text-2xl font-black">Top skills in the analysed sample</h2></div><Link href="/skill-intelligence" className="text-sm font-semibold text-cyan-400">Explore <ArrowUpRight className="inline" size={14}/></Link></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
       {snapshot.market.top_skills.slice(0,10).map((x,i)=><div key={x.skill} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><div className="text-xs text-slate-500">#{i+1}</div><div className="mt-2 font-bold">{x.skill}</div><div className="mt-3 text-xs text-slate-500">{x.job_records.toLocaleString()} records</div><div className="mt-1 text-sm font-bold text-cyan-300">₹{Number(x.mean_salary_midpoint).toFixed(2)}L</div></div>)}
      </div>
     </section> : null}
   </div>
  </AppShell>
 )
}

function Metric({label,value}:{label:string;value:string}){return <div><div className="flex items-center justify-between text-xs"><span className="text-slate-500">{label}</span><span className="font-bold text-slate-200">{value}</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-800"><div className="h-full w-[72%] rounded-full bg-cyan-400"/></div></div>}
function StatCard({label,value,icon:Icon}:{label:string;value:string;icon:React.ElementType}){return <div className="rounded-2xl border border-slate-800 bg-[#07121e] p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><Icon size={17} className="text-cyan-400"/></div><div className="mt-3 text-3xl font-black">{value}</div></div>}
