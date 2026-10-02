export default function Loading() {
  return (
    <main className="min-h-screen bg-[#030910] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-cyan-500/15 bg-[#07121e]/80 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl border border-cyan-400/30 bg-cyan-400/10" />
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-400">
            OMNINEXUS OS
          </p>
          <h1 className="mt-2 text-xl font-black text-white">
            Initializing intelligence layer
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Loading the current workspace…
          </p>
          <div className="mx-auto mt-6 h-1 max-w-xs overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400" />
          </div>
        </div>
      </div>
    </main>
  );
}
