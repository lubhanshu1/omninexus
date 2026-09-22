"use client";
import { useState } from 'react';

export default function RecruiterDashboard() {
  const [role, setRole] = useState('AI Engineer');
  const [analyzing, setAnalyzing] = useState(false);

  const candidates = [
    { name: "Lubhanshu S.", score: 95, current: "Python, Docker, Cloud", missing: "MLOps", status: "High Graph Proximity", color: "text-emerald-400" },
    { name: "Candidate B", score: 82, current: "Python, SQL", missing: "PyTorch, Docker", status: "Moderate Match", color: "text-amber-400" },
    { name: "Candidate C", score: 64, current: "Data Analysis", missing: "Cloud, PyTorch, MLOps", status: "Upskilling Required", color: "text-rose-400" }
  ];

  const handleSearch = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 1200);
  }

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans p-10 overflow-auto pb-32">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-indigo-400 tracking-wider">AI TALENT MATCHER</h1>
        <p className="text-sm text-slate-400 mt-2">Graph-based candidate discovery and structural skill gap analysis</p>
      </header>

      <div className="flex gap-4 mb-8 max-w-3xl">
        <input 
          type="text" value={role} onChange={(e) => setRole(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-5 py-4 w-full text-indigo-300 focus:outline-none focus:border-indigo-500 font-semibold"
        />
        <button onClick={handleSearch} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)] whitespace-nowrap">
          {analyzing ? 'Scanning Subgraphs...' : 'Find Matches'}
        </button>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {candidates.map((c, i) => (
          <div key={i} className={`p-6 rounded-xl border ${analyzing ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all bg-slate-900 border-slate-800 flex items-center justify-between hover:border-slate-700`}>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                {c.name} 
                <span className={`text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-800 ${c.color}`}>{c.status}</span>
              </h3>
              <p className="text-sm text-slate-400 mt-3"><span className="text-emerald-500 font-semibold">Acquired Nodes:</span> {c.current}</p>
              <p className="text-sm text-slate-400 mt-1"><span className="text-rose-500 font-semibold">Structural Gap:</span> {c.missing}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-[10px] uppercase text-slate-500 tracking-widest mb-1 font-bold">Role Alignment</p>
              <div className={`text-4xl font-mono font-bold ${c.color}`}>{c.score}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
