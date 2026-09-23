"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null; 

  const navs = [
    { name: 'Career Simulator', path: '/' },
    { name: 'Talent Matcher', path: '/recruiter' },
    { name: 'Observatory', path: '/observatory' },
    { name: 'System DB', path: '/database' }
  ];

  return (
    <div className="fixed bottom-6 left-[344px] right-8 z-50 flex items-center justify-between p-2 pl-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2">
        {navs.map(nav => (
          <Link key={nav.path} href={nav.path}>
            <div className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${pathname === nav.path ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              {nav.name}
            </div>
          </Link>
        ))}
      </div>
      <Link href="/login">
         <div className="px-6 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all border border-rose-900/50 shadow-sm">
           System Logout
         </div>
      </Link>
    </div>
  );
}
