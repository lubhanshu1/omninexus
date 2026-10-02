import Link from "next/link";
import { ArrowLeft, Radar } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#030910] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <section className="w-full rounded-3xl border border-slate-800 bg-[#07121e]/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400">
            <Radar size={24} />
          </div>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-400">
            ROUTE NOT FOUND
          </p>
          <h1 className="mt-2 text-2xl font-black">
            That OmniNexus module does not exist.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            The requested route is not registered in the current intelligence
            workspace.
          </p>
          <Link
            href="/career-simulator"
            className="mx-auto mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-[#03111c] transition hover:bg-cyan-300"
          >
            <ArrowLeft size={16} />
            RETURN TO CAREER SIMULATOR
          </Link>
        </section>
      </div>
    </main>
  );
}
