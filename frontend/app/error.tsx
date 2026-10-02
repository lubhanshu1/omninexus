"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OmniNexus route error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#030910] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <section className="w-full rounded-3xl border border-rose-500/20 bg-[#07121e]/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-400">
            <AlertTriangle size={24} />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-rose-400">
            SYSTEM EXCEPTION
          </p>
          <h1 className="mt-2 text-2xl font-black">
            This intelligence module hit an unexpected error.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            The rest of OmniNexus is unaffected. Retry the module, and if the
            problem persists, check the API status and browser console.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mx-auto mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-[#03111c] transition hover:bg-cyan-300"
          >
            <RefreshCw size={16} />
            RETRY MODULE
          </button>
        </section>
      </div>
    </main>
  );
}
