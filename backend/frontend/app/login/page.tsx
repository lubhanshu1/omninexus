"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = (persona: string, path: string) => {
    setLoading(persona);
    setTimeout(() => { router.push(path); }, 1500);
  };

  const personas = [
    { id: 'student', title: 'Student & Talent', desc: 'Career Optimizer & Skill Graph', path: '/', color: 'bg-emerald-500' },
    { id: 'recruiter', title: 'Enterprise Recruiter', desc: 'AI Talent Matcher & Discovery', path: '/recruiter', color: 'bg-indigo-500' },
    { id: 'university', title: 'University Admin', desc: 'Curriculum Digital Twin', path: '/observatory', color: 'bg-amber-500' },
    { id: 'enterprise', title: 'Workforce Planner', desc: 'Market Intelligence & Forecasting', path: '/observatory', color: 'bg-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      
      <div className="z-10 text-center mb-12">
        <h1 className="text-5xl font-black tracking-widest text-indigo-400 mb-4 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">OMNINEXUS</h1>
        <p className="text-slate-400 font-mono text-sm tracking-wider">TEMPORAL WORKFORCE INTELLIGENCE OS</p>
      </div>

      <div className="z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {personas.map(p => (
          <button 
            key={p.id} onClick={() => handleLogin(p.title, p.path)} disabled={loading !== null}
            className={`p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-600 text-left transition-all group hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4 overflow-hidden relative ${loading === p.title ? 'border-indigo-500' : ''}`}
          >
            {loading === p.title && <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm z-20 flex items-center justify-center font-mono text-indigo-300 font-bold animate-pulse">Authenticating Node...</div>}
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${p.color} shadow-[0_0_10px_currentColor]`}></div>
              <h2 className="text-xl font-bold text-slate-200 group-hover:text-white transition-colors">{p.title}</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium">{p.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
