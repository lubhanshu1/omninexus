"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BrainCircuit, BriefcaseBusiness, Database, Network, Settings2, Sparkles, Users } from "lucide-react";

const items = [
  { href:"/", label:"Command Center", icon:BriefcaseBusiness },
  { href:"/career-simulator", label:"Career Simulator", icon:Sparkles },
  { href:"/intelligence", label:"Intelligence", icon:BrainCircuit },
  { href:"/recruiter", label:"Talent Matcher", icon:Network },
  { href:"/skill-intelligence", label:"Skills", icon:Activity },
  { href:"/observatory", label:"Observatory", icon:Users },
  { href:"/future-lab", label:"Future Lab", icon:Sparkles },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#050b12]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <BriefcaseBusiness size={18}/>
            </span>
            <span>
              <span className="block text-sm font-black tracking-wide">OmniNexus</span>
              <span className="block text-[11px] text-slate-500">Career & Workforce Intelligence</span>
            </span>
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            {items.map(({href,label,icon:Icon}) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return <Link key={href} href={href} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                <Icon size={14}/>{label}
              </Link>;
            })}
          </div>
          <Link href="/database" className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400/40 hover:text-white">
            <Database size={14}/> System DB
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <nav className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-2xl border border-slate-700/80 bg-[#07111f]/95 p-2 shadow-2xl backdrop-blur-xl lg:hidden">
        {items.slice(0,5).map(({href,label,icon:Icon}) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return <Link key={href} href={href} aria-label={label} className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-cyan-400 text-slate-950" : "text-slate-400 hover:bg-slate-800"}`}>
            <Icon size={17}/>
          </Link>;
        })}
        <Link href="/database" aria-label="System Database" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800"><Settings2 size={17}/></Link>
      </nav>
    </div>
  );
}
