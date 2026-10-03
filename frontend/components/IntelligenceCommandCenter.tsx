"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronRight,
  Command,
  Cpu,
  Database,
  GitBranch,
  GraduationCap,
  LineChart,
  Network,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

type AgentKey = "career" | "skills" | "jobs" | "market" | "learning";

const agents: Record<AgentKey, {
  label: string;
  role: string;
  icon: typeof BrainCircuit;
  summary: string;
  output: string[];
}> = {
  career: {
    label: "Career Agent",
    role: "Trajectory reasoning",
    icon: BrainCircuit,
    summary: "Maps your current profile to plausible next-step career transitions.",
    output: ["Trajectory map", "Transition options", "Capability gaps"],
  },
  skills: {
    label: "Skill Agent",
    role: "Capability analysis",
    icon: Target,
    summary: "Finds the capabilities that connect your profile to target roles.",
    output: ["Skill graph", "Gap analysis", "Priority skills"],
  },
  jobs: {
    label: "Job Agent",
    role: "Opportunity discovery",
    icon: BriefcaseBusiness,
    summary: "Connects roles, companies and requirements into an opportunity surface.",
    output: ["Role matches", "Company map", "Requirement signals"],
  },
  market: {
    label: "Market Agent",
    role: "Workforce signals",
    icon: TrendingUp,
    summary: "Turns market movement into signals you can use for career planning.",
    output: ["Demand shifts", "Skill velocity", "Market signals"],
  },
  learning: {
    label: "Learning Agent",
    role: "Adaptive roadmap",
    icon: GraduationCap,
    summary: "Builds a learning sequence around the gaps identified by the graph.",
    output: ["Learning path", "Project ideas", "Milestones"],
  },
};

const graphNodes = [
  { id: "you", label: "YOU", meta: "Profile", x: 50, y: 50, type: "core" },
  { id: "skills", label: "SKILLS", meta: "Capabilities", x: 21, y: 23, type: "skill" },
  { id: "projects", label: "PROJECTS", meta: "Evidence", x: 20, y: 77, type: "project" },
  { id: "jobs", label: "JOBS", meta: "Opportunities", x: 79, y: 23, type: "job" },
  { id: "market", label: "MARKET", meta: "Signals", x: 80, y: 77, type: "market" },
  { id: "learning", label: "LEARNING", meta: "Paths", x: 50, y: 12, type: "learning" },
];

const edges = [
  ["you", "skills"],
  ["you", "projects"],
  ["you", "jobs"],
  ["you", "market"],
  ["you", "learning"],
  ["skills", "learning"],
  ["skills", "jobs"],
  ["projects", "jobs"],
  ["market", "jobs"],
];

export default function IntelligenceCommandCenter() {
  const [activeAgent, setActiveAgent] = useState<AgentKey>("career");
  const [selectedNode, setSelectedNode] = useState("you");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands = useMemo(() => {
    const items = [
      { label: "Open Career Simulator", href: "/career-simulator", icon: Sparkles },
      { label: "Explore Workforce Observatory", href: "/observatory", icon: LineChart },
      { label: "Open Talent Matcher", href: "/recruiter", icon: Users },
      { label: "Explore Future Lab", href: "/future-lab", icon: Zap },
      { label: "Open System Database", href: "/database", icon: Database },
    ];
    return items.filter((item) =>
      item.label.toLowerCase().includes(commandQuery.toLowerCase()),
    );
  }, [commandQuery]);

  const selected = graphNodes.find((node) => node.id === selectedNode) ?? graphNodes[0];
  const active = agents[activeAgent];
  const ActiveIcon = active.icon;

  return (
    <>
      <main className="omni-shell min-h-screen overflow-x-hidden pb-28 text-white lg:pl-[92px]">
        <div className="omni-noise pointer-events-none fixed inset-0 z-0" />

        <div className="relative z-10 mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8 lg:py-7">
          <header className="omni-topbar mb-6 flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="omni-mark flex h-10 w-10 shrink-0 items-center justify-center">
                <Network size={19} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-bold tracking-[0.08em]">OMNINEXUS</span>
                  <span className="hidden border-l border-white/10 pl-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/35 sm:inline">
                    Intelligence OS
                  </span>
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                  Professional trajectory intelligence
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommandOpen(true)}
                className="omni-command-trigger hidden items-center gap-3 px-3 py-2 text-[10px] text-white/45 sm:flex"
              >
                <Search size={14} />
                <span>Search OmniNexus</span>
                <kbd className="ml-2 border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-white/35">⌘K</kbd>
              </button>
              <div className="omni-live flex items-center gap-2 px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em]">
                <span className="omni-pulse h-1.5 w-1.5 rounded-full" />
                Core online
              </div>
            </div>
          </header>

          <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_380px]">
            <div className="omni-panel omni-hero relative overflow-hidden p-6 sm:p-8 lg:p-10">
              <div className="omni-grid pointer-events-none absolute inset-0" />
              <div className="relative">
                <div className="mb-8 flex flex-wrap items-center gap-2">
                  <span className="omni-kicker">01 / Command center</span>
                  <span className="omni-tag">Graph-connected</span>
                  <span className="omni-tag">Agent-ready</span>
                </div>

                <div className="max-w-4xl">
                  <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-lime-300/70">
                    Career intelligence, mapped
                  </p>
                  <h1 className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-6xl lg:text-[82px]">
                    SEE WHERE
                    <span className="block text-white/40">YOUR CAREER</span>
                    <span className="block text-lime-300">CAN GO NEXT.</span>
                  </h1>
                  <p className="mt-7 max-w-2xl text-sm leading-7 text-white/45 sm:text-[15px]">
                    OmniNexus connects skills, projects, jobs, learning and market signals into one navigable intelligence graph — then puts specialist AI agents on top of it.
                  </p>
                </div>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/career-simulator" className="omni-primary group">
                    Launch career simulator
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/observatory" className="omni-secondary">
                    Open market observatory
                    <LineChart size={15} />
                  </Link>
                </div>

                <div className="mt-10 grid max-w-3xl grid-cols-2 border-y border-white/[0.07] sm:grid-cols-4">
                  {[
                    ["GRAPH", "Connected"],
                    ["AGENTS", "05 active"],
                    ["SIGNALS", "Live surface"],
                    ["MODE", "Exploration"],
                  ].map(([label, value]) => (
                    <div key={label} className="border-r border-white/[0.07] px-3 py-4 first:pl-0 last:border-r-0">
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">{label}</div>
                      <div className="mt-1 text-xs font-semibold text-white/80">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="omni-panel flex flex-col p-5">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="omni-kicker">System pulse</div>
                  <h2 className="mt-2 text-lg font-bold">Intelligence core</h2>
                </div>
                <Cpu size={18} className="text-lime-300" />
              </div>

              <div className="space-y-1">
                {[
                  ["Graph engine", "CONNECTED"],
                  ["Career engine", "READY"],
                  ["Market layer", "CONNECTED"],
                  ["Agent layer", "READY"],
                  ["Auth layer", "SECURE"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/[0.06] py-3">
                    <span className="text-xs text-white/45">{label}</span>
                    <span className="flex items-center gap-2 font-mono text-[9px] font-bold text-lime-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-5">
                <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                  <span>Current mode</span>
                  <span className="text-lime-300">NEXUS</span>
                </div>
                <div className="h-1 overflow-hidden bg-white/[0.06]">
                  <div className="h-full w-[78%] bg-lime-300" />
                </div>
              </div>
            </aside>
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_380px]">
            <div className="omni-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div>
                  <div className="omni-kicker">02 / Nexus graph</div>
                  <h2 className="mt-1 text-lg font-bold">Your professional knowledge graph</h2>
                </div>
                <span className="hidden font-mono text-[9px] uppercase tracking-[0.15em] text-white/30 sm:block">
                  Select a node to inspect
                </span>
              </div>

              <div className="grid lg:grid-cols-[minmax(0,1fr)_250px]">
                <div className="omni-graph relative min-h-[470px] overflow-hidden">
                  <div className="omni-graph-grid absolute inset-0" />
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {edges.map(([from, to]) => {
                      const a = graphNodes.find((n) => n.id === from)!;
                      const b = graphNodes.find((n) => n.id === to)!;
                      const highlighted = selectedNode === from || selectedNode === to;
                      return (
                        <line
                          key={from + "-" + to}
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={highlighted ? "rgba(200,255,82,.65)" : "rgba(255,255,255,.10)"}
                          strokeWidth={highlighted ? "0.45" : "0.28"}
                        />
                      );
                    })}
                  </svg>

                  {graphNodes.map((node) => {
                    const activeNode = selectedNode === node.id;
                    const nodeClass = "omni-node " + node.type + (activeNode ? " is-selected" : "");
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className={"absolute -translate-x-1/2 -translate-y-1/2 text-left transition-all duration-300 " + (activeNode ? "scale-110" : "hover:scale-105")}
                        style={{ left: node.x + "%", top: node.y + "%" }}
                      >
                        <div className={nodeClass}>
                          <span className="omni-node-dot" />
                          <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-white">{node.label}</span>
                          <span className="mt-0.5 block text-[8px] text-white/35">{node.meta}</span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="absolute bottom-5 left-5 flex items-center gap-3 font-mono text-[8px] uppercase tracking-[0.15em] text-white/25">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                    Graph layer
                    <span className="ml-2">•</span>
                    <span>Interactive surface</span>
                  </div>
                </div>

                <div className="border-t border-white/[0.07] p-5 lg:border-l lg:border-t-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Selected node</div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-lime-300/20 bg-lime-300/[0.06] text-lime-300">
                      <GitBranch size={17} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{selected.label}</div>
                      <div className="text-[10px] text-white/35">{selected.meta}</div>
                    </div>
                  </div>
                  <p className="mt-5 text-xs leading-6 text-white/40">
                    Explore how this entity connects to the rest of the OmniNexus intelligence model.
                  </p>
                  <div className="mt-5 space-y-2">
                    {graphNodes.filter((n) => n.id !== selected.id).slice(0, 4).map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className="flex w-full items-center justify-between border border-white/[0.06] px-3 py-2.5 text-left text-[10px] text-white/55 transition hover:border-lime-300/20 hover:text-white"
                      >
                        <span>{node.label}</span>
                        <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="omni-panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="omni-kicker">03 / Signals</div>
                  <h2 className="mt-1 text-lg font-bold">Intelligence stream</h2>
                </div>
                <RadioPulse />
              </div>

              <div className="mt-5 space-y-0">
                {[
                  ["19:07", "SKILL SIGNAL", "PyTorch → demand movement"],
                  ["19:05", "JOB SIGNAL", "ML Engineer → new role cluster"],
                  ["19:02", "GRAPH SIGNAL", "Projects ↔ Skills connected"],
                  ["18:58", "MARKET SIGNAL", "AI / ML → rising category"],
                  ["18:54", "CAREER SIGNAL", "Trajectory → transition found"],
                ].map(([time, type, text]) => (
                  <div key={time + type} className="border-b border-white/[0.06] py-4 first:pt-0 last:border-0">
                    <div className="flex gap-3">
                      <span className="font-mono text-[9px] text-white/25">{time}</span>
                      <div>
                        <div className="font-mono text-[8px] font-bold tracking-[0.16em] text-lime-300/70">{type}</div>
                        <div className="mt-1 text-xs text-white/55">{text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/observatory" className="mt-3 flex items-center justify-between border border-white/[0.07] px-3 py-3 text-[10px] font-semibold text-white/50 transition hover:border-lime-300/20 hover:text-white">
                Open full observatory
                <ArrowRight size={13} />
              </Link>
            </div>
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_1fr]">
            <div className="omni-panel p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="omni-kicker">04 / Agent workspace</div>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Specialists, not a generic chatbot.</h2>
                  <p className="mt-2 max-w-2xl text-xs leading-6 text-white/40">
                    Each agent reads a different part of the intelligence model and contributes a focused output to the workspace.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-lime-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                  5 agents ready
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
                <div className="space-y-1">
                  {(Object.keys(agents) as AgentKey[]).map((key) => {
                    const item = agents[key];
                    const Icon = item.icon;
                    const selectedAgent = key === activeAgent;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveAgent(key)}
                        className={"flex w-full items-center gap-3 border px-3 py-3 text-left transition " + (selectedAgent ? "border-lime-300/25 bg-lime-300/[0.06] text-white" : "border-transparent text-white/40 hover:border-white/[0.07] hover:bg-white/[0.02] hover:text-white")}
                      >
                        <Icon size={16} className={selectedAgent ? "text-lime-300" : "text-white/30"} />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold">{item.label}</span>
                          <span className="block truncate font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">{item.role}</span>
                        </span>
                        {selectedAgent && <ChevronRight className="ml-auto text-lime-300" size={13} />}
                      </button>
                    );
                  })}
                </div>

                <div className="omni-agent-workspace relative overflow-hidden border border-white/[0.08] p-5 sm:p-6">
                  <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-lime-300/[0.05] blur-3xl" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center border border-lime-300/20 bg-lime-300/[0.06] text-lime-300">
                          <ActiveIcon size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{active.label}</div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">{active.role}</div>
                        </div>
                      </div>
                      <span className="border border-lime-300/15 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.15em] text-lime-300">Ready</span>
                    </div>

                    <div className="mt-7 max-w-2xl">
                      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25">Agent brief</div>
                      <p className="mt-2 text-base leading-7 text-white/70">{active.summary}</p>
                    </div>

                    <div className="mt-7 grid gap-2 sm:grid-cols-3">
                      {active.output.map((output, index) => (
                        <div key={output} className="border border-white/[0.07] bg-black/10 p-4">
                          <div className="font-mono text-[8px] text-lime-300/50">0{index + 1}</div>
                          <div className="mt-2 text-xs font-semibold text-white/70">{output}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <Link href="/career-simulator" className="omni-agent-action">
                        Run agent analysis
                        <Sparkles size={13} />
                      </Link>
                      <Link href="/observatory" className="omni-agent-action muted">
                        Inspect signals
                        <LineChart size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="omni-panel p-5 sm:p-6">
              <div className="omni-kicker">05 / Operating surface</div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">Move through the system.</h2>

              <div className="mt-6 space-y-2">
                {[
                  { label: "Career simulator", desc: "Model a transition", href: "/career-simulator", icon: Sparkles },
                  { label: "Talent matcher", desc: "Explore role alignment", href: "/recruiter", icon: Users },
                  { label: "Workforce observatory", desc: "Read market movement", href: "/observatory", icon: LineChart },
                  { label: "Future lab", desc: "Run what-if scenarios", href: "/future-lab", icon: Zap },
                  { label: "System database", desc: "Inspect graph records", href: "/database", icon: Database },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="group flex items-center gap-3 border border-white/[0.06] p-3 transition hover:border-lime-300/20 hover:bg-lime-300/[0.03]">
                      <div className="flex h-9 w-9 items-center justify-center border border-white/[0.07] text-white/40 transition group-hover:border-lime-300/20 group-hover:text-lime-300">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white/70 group-hover:text-white">{item.label}</div>
                        <div className="mt-0.5 text-[10px] text-white/30">{item.desc}</div>
                      </div>
                      <ArrowRight size={13} className="text-white/20 transition group-hover:translate-x-0.5 group-hover:text-lime-300" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <footer className="flex flex-col gap-3 border-t border-white/[0.07] py-6 font-mono text-[8px] uppercase tracking-[0.16em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <span>OMNINEXUS / Intelligence operating system</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Core services online</span>
          </footer>
        </div>
      </main>

      {commandOpen && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-md" onMouseDown={() => setCommandOpen(false)}>
          <div className="omni-command-modal w-full max-w-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-4">
              <Command size={17} className="text-lime-300" />
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Search OmniNexus..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
              <button onClick={() => setCommandOpen(false)} className="text-white/30 hover:text-white"><X size={17} /></button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {commands.length ? commands.map((command) => {
                const Icon = command.icon;
                return (
                  <Link
                    key={command.href}
                    href={command.href}
                    onClick={() => setCommandOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-xs text-white/60 transition hover:bg-lime-300/[0.06] hover:text-white"
                  >
                    <Icon size={15} className="text-lime-300/70" />
                    <span>{command.label}</span>
                    <ArrowRight size={13} className="ml-auto text-white/20" />
                  </Link>
                );
              }) : (
                <div className="px-3 py-10 text-center text-xs text-white/25">No command found.</div>
              )}
            </div>
            <div className="border-t border-white/[0.07] px-4 py-3 font-mono text-[8px] uppercase tracking-[0.14em] text-white/20">
              Esc to close · Enter to open · Ctrl/⌘ K to launch
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RadioPulse() {
  return (
    <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.14em] text-lime-300">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300/40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-300" />
      </span>
      Live
    </div>
  );
}
