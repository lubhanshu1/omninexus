"use client";

export default function Observatory() {
  const trends = [
    { skill: "AI Agents", trend: "+145%", color: "text-emerald-400", bar: "w-[90%]" },
    { skill: "RAG", trend: "+112%", color: "text-emerald-400", bar: "w-[85%]" },
    { skill: "MLOps", trend: "+84%", color: "text-emerald-400", bar: "w-[70%]" },
    { skill: "Python", trend: "Stable", color: "text-slate-400", bar: "w-[60%]" },
    { skill: "Basic Data Entry", trend: "-45%", color: "text-rose-400", bar: "w-[20%]" },
  ];

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans p-10 overflow-auto pb-32">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-indigo-400 tracking-wider">WORKFORCE OBSERVATORY</h1>
        <p className="text-sm text-slate-400 mt-2">Temporal skill forecasting and global ecosystem analytics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-5xl">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-bold">Active Nodes (Talent)</p>
          <p className="text-4xl font-mono text-white mt-3">840,291</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-bold">Skill Graph Edges</p>
          <p className="text-4xl font-mono text-white mt-3">2.4M</p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 uppercase font-bold">Market Volatility Index</p>
          <p className="text-4xl font-mono text-amber-400 mt-3">High</p>
        </div>
      </div>

      <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl max-w-5xl">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          Emerging Skill Radar (Temporal Forecast)
        </h2>
        
        <div className="flex flex-col gap-8">
          {trends.map((t, i) => (
            <div key={i} className="flex items-center gap-6">
              <div className="w-32 text-sm font-semibold text-slate-300">{t.skill}</div>
              <div className="flex-1 bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                <div className={`h-full bg-indigo-500 rounded-full ${t.bar}`}></div>
              </div>
              <div className={`w-20 text-right font-mono text-sm font-bold ${t.color}`}>{t.trend}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
