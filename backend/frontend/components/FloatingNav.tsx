"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null; // Hide navigation on authentication screen

  const navs = [
    { name: 'Career Simulator (Student)', path: '/' },
    { name: 'Talent Matcher (Recruiter)', path: '/recruiter' },
    { name: 'Workforce Observatory', path: '/observatory' }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full shadow-2xl">
      {navs.map(nav => (
        <Link key={nav.path} href={nav.path}>
          <div className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${pathname === nav.path ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            {nav.name}
          </div>
        </Link>
      ))}
      <Link href="/login">
         <div className="px-5 py-2 rounded-full text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all ml-2 border border-rose-900/50">
           System Logout
         </div>
      </Link>
    </div>
  );
}
