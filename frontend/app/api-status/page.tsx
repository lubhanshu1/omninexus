"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiUrl } from "@/lib/api";
import { Activity, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function ApiStatusPage() {
  const [state,setState] = useState<"checking"|"online"|"offline">("checking");
  const [payload,setPayload] = useState<unknown>(null);

  useEffect(() => {
    fetch(apiUrl("/api/v1/health"), { cache:"no-store" })
      .then(async r => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data?.detail || "Health check failed");
        setPayload(data);
        setState("online");
      })
      .catch(() => setState("offline"));
  },[]);

  return <main className="mx-auto min-h-screen max-w-4xl px-5 py-16">
    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15}/> Command Center</Link>
    <section className="rounded-3xl border border-slate-800 bg-[#07121e] p-8">
      <div className="flex items-center gap-3"><Activity className="text-cyan-400"/><h1 className="text-3xl font-black">API Connectivity</h1></div>
      <div className="mt-8 flex items-center gap-3">
        {state === "online" ? <CheckCircle2 className="text-emerald-400"/> : state === "offline" ? <XCircle className="text-rose-400"/> : <Activity className="animate-pulse text-amber-400"/>}
        <span className="font-semibold">{state === "online" ? "Backend online" : state === "offline" ? "Backend unavailable" : "Checking backend..."}</span>
      </div>
      {payload && <pre className="mt-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 text-xs text-slate-300">{JSON.stringify(payload,null,2)}</pre>}
    </section>
  </main>;
}
