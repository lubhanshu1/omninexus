"use client";
import { useEffect, useState } from 'react';
import { Database, ShieldAlert, Key, Users, Server, RefreshCw } from 'lucide-react';

export default function DatabaseView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/users');
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("DB Offline");
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="min-h-screen bg-[#070d14] text-slate-300 font-sans p-8 md:p-12 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-rose-900/20 border border-rose-500/30 rounded-xl text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
               <Database size={28} />
             </div>
             <div>
               <h1 className="text-3xl font-black text-white tracking-tight">System Database Console</h1>
               <p className="text-sm text-slate-500 font-medium mt-1">Local SQLite Engine &middot; Active Connection</p>
             </div>
          </div>
          <button onClick={fetchUsers} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>

        <div className="flex items-center gap-3 bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl mb-8 text-amber-500/90 text-sm font-medium">
           <ShieldAlert size={18} className="shrink-0" />
           <p><strong>Security Notice:</strong> Data is currently being fetched directly from the local SQLite omninexus.db file via SQLAlchemy.</p>
        </div>

        <div className="bg-[#0a111a] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
           <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#0d141f]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Users size={14} /> Auth_Users Table
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50">
                <Server size={12} /> {users.length} Row(s)
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-slate-800/60 text-[10px] uppercase tracking-widest text-slate-500 bg-[#080d14]">
                   <th className="px-6 py-4 font-bold">User UUID</th>
                   <th className="px-6 py-4 font-bold">Email Address</th>
                   <th className="px-6 py-4 font-bold">Access Role</th>
                   <th className="px-6 py-4 font-bold">Password Hash</th>
                   <th className="px-6 py-4 font-bold">Status</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {users.length === 0 && (
                   <tr><td colSpan={5} className="text-center py-8 text-slate-500">No users found in database. Go to the login screen and sign up!</td></tr>
                 )}
                 {users.map((u, i) => (
                   <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-800/40 transition-colors">
                     <td className="px-6 py-4 font-mono text-xs text-slate-500">{u.uuid}</td>
                     <td className="px-6 py-4 font-medium text-slate-200">{u.email}</td>
                     <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-950/40 text-indigo-400 border border-indigo-900/50">{u.role}</span></td>
                     <td className="px-6 py-4 font-mono text-[10px] text-slate-500 flex items-center gap-2"><Key size={12} /> {u.password_hash}</td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-xs font-bold">
                         <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
                         <span className="text-emerald-400">{u.status}</span>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
