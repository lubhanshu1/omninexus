"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Terminal, Building, Loader2 } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/signup';

    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (data.status === 'success') {
        sessionStorage.setItem('omninexus_token', data.token);
        router.push('/');
      } else {
        setError(data.message || 'Authentication failed.');
      }
    } catch (err) {
      setError('Neural Engine Offline. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const ssoLogin = () => {
    setLoading(true);
    setTimeout(() => { router.push('/'); }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-slate-900 border-r border-slate-800 relative p-12">
        <div className="z-10 text-center w-full max-w-md">
          <h1 className="text-5xl font-black tracking-widest text-indigo-400 mb-6">OMNINEXUS</h1>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <p className="text-xs text-slate-300 font-bold uppercase">System Status: Online</p>
            </div>
            <div className="space-y-3 font-mono text-xs text-slate-500">
              <p>{'>'} SQLite Database Active...</p>
              <p>{'>'} SQLAlchemy ORM mapped...</p>
              <p className="text-indigo-400">{'>'} Ready for real-time I/O.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0f172a] relative">
        <div className="w-full max-w-md z-10">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Access Node' : 'Register Talent Twin'}</h2>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && <div className="p-3 bg-rose-950/50 text-rose-400 text-xs rounded-lg text-center font-semibold">{error}</div>}
            
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm focus:border-indigo-500" placeholder="name@university.edu" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-slate-200 text-sm focus:border-indigo-500" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-3 font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Authenticate' : 'Create Record')}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-400">
              {isLogin ? "Don't have a Talent Twin? " : "Already established? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 hover:text-indigo-300 font-bold ml-1">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
