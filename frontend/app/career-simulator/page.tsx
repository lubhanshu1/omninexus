"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  Activity,
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  Clipboard,
  Cloud,
  Code2,
  Cpu,
  Database,
  Download,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  LineChart,
  Loader2,
  LockKeyhole,
  Network,
  RefreshCw,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserRound,
  WandSparkles,
  X,
  Zap,
  Clock3,
  MousePointer2,
  BookOpen,
  Lightbulb,
  FlaskConical,
  TerminalSquare,
  ActivitySquare,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

import { API_BASE_URL, authHeaders } from "@/lib/api";

const API_URL = API_BASE_URL

/* =========================================================
   TYPES
========================================================= */

type ApiStatus =
  | "online"
  | "offline"
  | "checking";

type AnalysisResponse = {
  status?: string;
  flow_nodes?: Node[];
  flow_edges?: Edge[];
  readiness_score?: number;
  bottleneck_skill?: string;
  market_value?: number;
  market_opportunity_score?: number;
  market_signals?: Array<{ skill: string; postings?: number; demand_index?: number; salary_mid_lakh?: number; opportunity_score?: number | null; known_market_signal?: boolean }>;
  market_skill_gaps?: Array<{ skill: string; priority: string; reason: string }>;
  market_source_note?: string;
  normalized_skills?: string[];
  message?: string;
};

type ParseResumeResponse = {
  status?: string;
  extracted_skills?: string[];
  message?: string;
};

type RoleProfile = {
  description: string;
  focus: string[];
  color: string;
};

type IntelligenceSnapshot = {
  readiness: number;
  marketValue: number;
  bottleneck: string;
  skills: number;
  targetRole: string;
  timestamp: string;
};

type SkillIntelligence = {
  name: string;
  status: "Acquired" | "Gap" | "Target" | "Out of scope";
  priority: "Critical" | "High" | "Medium" | "Low";
  severity: number;
  hours: number;
  why: string;
  prerequisites: string[];
  impact: number;
};

const skillIntelligence: Record<string, SkillIntelligence> = {
  "Python": { name: "Python", status: "Acquired", priority: "Low", severity: 0, hours: 0, why: "Core language layer for AI, data and automation workflows.", prerequisites: [], impact: 4 },
  "Machine Learning": { name: "Machine Learning", status: "Gap", priority: "Critical", severity: 92, hours: 42, why: "It is the main bridge from Python into production AI systems and unlocks several downstream capabilities.", prerequisites: ["Python", "Statistics"], impact: 13 },
  "Deep Learning": { name: "Deep Learning", status: "Gap", priority: "Critical", severity: 86, hours: 55, why: "Deep learning provides the representation-learning foundation behind modern vision, language and generative AI systems.", prerequisites: ["Machine Learning", "Python"], impact: 12 },
  "PyTorch": { name: "PyTorch", status: "Gap", priority: "High", severity: 78, hours: 30, why: "A practical deep-learning framework that converts theory into trainable, deployable models.", prerequisites: ["Deep Learning", "Python"], impact: 9 },
  "LLMs": { name: "LLMs", status: "Gap", priority: "Critical", severity: 90, hours: 38, why: "Large language models are a central capability for current AI engineering and intelligent product systems.", prerequisites: ["Deep Learning", "Python"], impact: 12 },
  "RAG": { name: "RAG", status: "Gap", priority: "High", severity: 74, hours: 24, why: "Retrieval-augmented generation connects LLMs to private or current knowledge and is highly useful in production systems.", prerequisites: ["LLMs", "Python"], impact: 8 },
  "AI Agents": { name: "AI Agents", status: "Gap", priority: "High", severity: 72, hours: 28, why: "Agentic workflows turn models into systems that can reason over tools, state and multi-step tasks.", prerequisites: ["LLMs", "RAG"], impact: 8 },
  "MLOps": { name: "MLOps", status: "Gap", priority: "Critical", severity: 88, hours: 46, why: "MLOps is the production layer that makes models reproducible, observable, deployable and maintainable.", prerequisites: ["Docker", "Machine Learning"], impact: 11 },
  "Docker": { name: "Docker", status: "Gap", priority: "High", severity: 61, hours: 18, why: "Containerization provides a repeatable runtime for APIs, models and ML services.", prerequisites: ["Python"], impact: 7 },
  "Cloud Computing": { name: "Cloud Computing", status: "Gap", priority: "High", severity: 65, hours: 32, why: "Cloud infrastructure lets AI systems move from a local prototype to scalable services.", prerequisites: ["Docker"], impact: 7 },
  "AWS": { name: "AWS", status: "Gap", priority: "Medium", severity: 54, hours: 30, why: "AWS provides production primitives for hosting, storage, compute and ML workloads.", prerequisites: ["Cloud Computing"], impact: 6 },
  "Kubernetes": { name: "Kubernetes", status: "Gap", priority: "Medium", severity: 48, hours: 42, why: "Kubernetes becomes useful when containerized workloads need orchestration and scaling.", prerequisites: ["Docker", "Cloud Computing"], impact: 5 },
  "CI/CD": { name: "CI/CD", status: "Gap", priority: "Medium", severity: 45, hours: 20, why: "Automated delivery pipelines reduce friction between code changes, testing and production deployment.", prerequisites: ["Git", "Docker"], impact: 5 },
  "SQL": { name: "SQL", status: "Gap", priority: "Medium", severity: 38, hours: 16, why: "SQL remains a foundational data-access skill across analytics and AI products.", prerequisites: [], impact: 4 },
  "Data Analysis": { name: "Data Analysis", status: "Gap", priority: "Medium", severity: 42, hours: 24, why: "Strong data analysis improves experimentation, feature understanding and model diagnosis.", prerequisites: ["Python", "SQL"], impact: 5 },
};

const projectRecommendations: Record<string, { title: string; description: string; stack: string[] }> = {
  "MLOps": { title: "Production ML Deployment Pipeline", description: "Build a complete model delivery system with training, versioning, API deployment and monitoring.", stack: ["Docker", "FastAPI", "MLflow", "AWS"] },
  "Machine Learning": { title: "End-to-End ML Prediction Platform", description: "Train, evaluate and serve a real prediction model through a production-style API.", stack: ["Python", "scikit-learn", "FastAPI", "PostgreSQL"] },
  "Deep Learning": { title: "Deep Learning Vision Lab", description: "Train and deploy a neural network with experiment tracking and inference monitoring.", stack: ["PyTorch", "FastAPI", "Docker", "MLflow"] },
  "PyTorch": { title: "Neural Model Serving Lab", description: "Build, train and serve a PyTorch model behind a low-latency inference endpoint.", stack: ["PyTorch", "FastAPI", "Docker", "ONNX"] },
  "LLMs": { title: "Enterprise LLM Copilot", description: "Build a domain-specific assistant with evaluation, prompt versioning and guardrails.", stack: ["Python", "LLM API", "FastAPI", "PostgreSQL"] },
  "RAG": { title: "Private Knowledge RAG Engine", description: "Create a retrieval pipeline that grounds responses in a searchable document corpus.", stack: ["Python", "Embeddings", "Vector DB", "FastAPI"] },
  "AI Agents": { title: "Tool-Using AI Agent", description: "Build an agent that can plan, call tools, persist state and report execution traces.", stack: ["Python", "LLMs", "FastAPI", "Redis"] },
  "Docker": { title: "Containerized AI Service", description: "Package an ML API with health checks, environment configuration and reproducible builds.", stack: ["Docker", "FastAPI", "GitHub Actions", "Cloud"] },
  "Cloud Computing": { title: "Cloud AI Launchpad", description: "Deploy a complete AI service with managed storage, compute, secrets and observability.", stack: ["AWS", "Docker", "FastAPI", "Terraform"] },
};


/* =========================================================
   ROLE PROFILES
========================================================= */

const roleProfiles: Record<string, RoleProfile> = {
  "AI Engineer": {
    description:
      "Explore the skills and experience commonly needed for this role.",
    focus: [
      "Machine Learning",
      "Deep Learning",
      "Python",
      "LLMs",
      "RAG",
      "AI Agents",
      "MLOps",
    ],
    color: "cyan",
  },

  "Data Scientist": {
    description:
      "Transform data into predictive insights using statistics, machine learning and experimentation.",
    focus: [
      "Python",
      "SQL",
      "Data Analysis",
      "Machine Learning",
      "Deep Learning",
      "Statistics",
      "Visualization",
    ],
    color: "violet",
  },

  "MLOps Engineer": {
    description:
      "Design reliable ML infrastructure, deployment pipelines and production model operations.",
    focus: [
      "Python",
      "Docker",
      "Kubernetes",
      "AWS",
      "MLOps",
      "CI/CD",
      "Machine Learning",
    ],
    color: "emerald",
  },

  "AI Product Engineer": {
    description:
      "Combine software engineering, AI capabilities and product thinking to ship intelligent applications.",
    focus: [
      "Python",
      "LLMs",
      "RAG",
      "AI Agents",
      "Cloud Computing",
      "Docker",
      "SQL",
    ],
    color: "amber",
  },

  "Machine Learning Engineer": {
    description:
      "Engineer scalable machine-learning systems from experimentation through production.",
    focus: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "PyTorch",
      "Docker",
      "MLOps",
      "SQL",
    ],
    color: "blue",
  },
};

/* =========================================================
   AVAILABLE SKILLS
========================================================= */

const buildLocalGraph = (skills: string[], role: string): { nodes: Node[]; edges: Edge[]; readiness: number; bottleneck: string; marketValue: number } => {
  const profile = roleProfiles[role] || roleProfiles["AI Engineer"];
  const focus = profile.focus;
  const acquired = new Set(skills.map((skill) => skill.toLowerCase()));
  const matched = focus.filter((skill) => acquired.has(skill.toLowerCase())).length;
  const readiness = Math.round((matched / Math.max(focus.length, 1)) * 100);
  const bottleneck = focus.find((skill) => !acquired.has(skill.toLowerCase())) || "No bottleneck detected";
  const marketValue = Math.min(150000, 60000 + skills.length * 5000);

  const nodes: Node[] = focus.map((skill, index) => {
    const isAcquired = acquired.has(skill.toLowerCase());
    const isBottleneck = skill === bottleneck;
    const id = `local-${skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    return {
      id,
      position: {
        x: (index % 3) * 260 + (Math.floor(index / 3) % 2) * 60,
        y: Math.floor(index / 3) * 150 + (index % 2) * 20,
      },
      data: { label: skill },
      style: {
        width: 190,
        padding: "12px 14px",
        borderRadius: 12,
        border: isBottleneck
          ? "2px solid #f59e0b"
          : isAcquired
            ? "1.5px solid #10b981"
            : "1.5px solid #00e5ff",
        background: isBottleneck
          ? "#3b2608"
          : isAcquired
            ? "#06352a"
            : "#071526",
        color: isBottleneck ? "#fbbf24" : isAcquired ? "#34d399" : "#67e8f9",
        fontWeight: 800,
        fontSize: 12,
        textAlign: "center" as const,
        boxShadow: isBottleneck
          ? "0 0 28px rgba(245,158,11,0.35)"
          : isAcquired
            ? "0 0 20px rgba(16,185,129,0.22)"
            : "0 0 18px rgba(0,229,255,0.16)",
      },
    };
  });

  const edges: Edge[] = focus.slice(1).map((skill, index) => ({
    id: `local-edge-${index}`,
    source: nodes[index].id,
    target: nodes[index + 1].id,
    animated: true,
    style: {
      stroke: index % 2 === 0 ? "#00e5ff" : "#8b7cff",
      strokeWidth: 3,
      opacity: 1,
      strokeLinecap: "round" as const,
      filter: "drop-shadow(0 0 4px rgba(0,229,255,0.45))",
    },
  }));

  return { nodes, edges, readiness, bottleneck, marketValue };
};

const availableSkills = [
  "Machine Learning",
  "Deep Learning",
  "PyTorch",
  "LLMs",
  "RAG",
  "AI Agents",
  "Cloud Computing",
  "AWS",
  "Docker",
  "Kubernetes",
  "MLOps",
  "CI/CD",
  "SQL",
  "Data Analysis",
  "Python",
];

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function StatusDot({
  status,
}: {
  status: ApiStatus;
}) {
  return (
    <span
      className={`h-2 w-2 rounded-full ${status === "online"
        ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
        : status === "offline"
          ? "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.7)]"
          : "bg-amber-400 animate-pulse"
        }`}
    />
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = "cyan",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail?: string;
  accent?: string;
}) {
  const accentClasses: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    emerald:
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    violet:
      "text-violet-400 bg-violet-500/10 border-violet-500/20",
    amber:
      "text-amber-400 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className="group rounded-2xl border border-slate-800/80 bg-[#08111d]/90 p-4 transition hover:border-slate-700 hover:bg-[#0a1522]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-white">
            {value}
          </p>

          {detail && (
            <p className="mt-1 text-[9px] font-medium text-slate-500">
              {detail}
            </p>
          )}
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accentClasses[accent] || accentClasses.cyan}`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-500">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black tracking-tight text-white">
          {title}
        </h2>

        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function OmniNexusDashboard() {
  /* =======================================================
     REACT FLOW
  ======================================================= */

  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node>([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>([]);

  /* =======================================================
     CAREER STATE
  ======================================================= */

  const [readiness, setReadiness] = useState(0);

  const [bottleneck, setBottleneck] =
    useState("Analyzing...");

  const [marketValue, setMarketValue] =
    useState(0);

  const [marketOpportunity, setMarketOpportunity] =
    useState(0);

  const [marketSignals, setMarketSignals] =
    useState<NonNullable<AnalysisResponse["market_signals"]>>([]);

  const [marketGaps, setMarketGaps] =
    useState<NonNullable<AnalysisResponse["market_skill_gaps"]>>([]);

  const [targetRole, setTargetRole] =
    useState("AI Engineer");
  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole && roleProfiles[requestedRole]) {
      setTargetRole(requestedRole);
    }
  }, []);

  const [currentSkills, setCurrentSkills] =
    useState<string[]>(["Python"]);

  /* =======================================================
     RESUME STATE
  ======================================================= */

  const [resumeText, setResumeText] =
    useState("");

  const [isParsing, setIsParsing] =
    useState(false);

  const [parseMessage, setParseMessage] =
    useState("");

  const [parseError, setParseError] =
    useState("");

  /* =======================================================
     API STATE
  ======================================================= */

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [apiStatus, setApiStatus] =
    useState<ApiStatus>("checking");

  const [latency, setLatency] =
    useState<number | null>(null);

  const [lastUpdated, setLastUpdated] =
    useState<string>("Not analyzed");

  const [copied, setCopied] =
    useState(false);

  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [simulatedSkills, setSimulatedSkills] = useState<string[]>([]);
  const [liveClock, setLiveClock] = useState<Date | null>(null);
  const [artifactTick, setArtifactTick] = useState(0);
  const [showAllArtifacts, setShowAllArtifacts] = useState(false);

  /* =======================================================
     ROLE
  ======================================================= */

  const selectedRole =
    roleProfiles[targetRole] ||
    roleProfiles["AI Engineer"];

  /* =======================================================
     DERIVED INTELLIGENCE
  ======================================================= */

  const prioritySkills = useMemo(() => {
    return selectedRole.focus
      .filter(
        (skill) => !currentSkills.includes(skill)
      )
      .slice(0, 7);
  }, [selectedRole.focus, currentSkills]);

  const skillCoverage = useMemo(() => {
    if (selectedRole.focus.length === 0) {
      return 0;
    }

    const matched =
      selectedRole.focus.filter((skill) =>
        currentSkills.includes(skill)
      ).length;

    return Math.round(
      (matched / selectedRole.focus.length) * 100
    );
  }, [selectedRole.focus, currentSkills]);

  const activeNodes = useMemo(() => {
    return currentSkills.length;
  }, [currentSkills]);

  const careerLevel = useMemo(() => {
    if (readiness >= 85) return "Advanced";
    if (readiness >= 70) return "Production Ready";
    if (readiness >= 50) return "Developing";
    return "Foundation";
  }, [readiness]);

  const selectedSkillIntel = useMemo(() => {
    if (!selectedSkill) return null;
    const base = skillIntelligence[selectedSkill];
    if (base) return { ...base, status: currentSkills.includes(selectedSkill) ? "Acquired" as const : base.status };
    return {
      name: selectedSkill, status: currentSkills.includes(selectedSkill) ? "Acquired" as const : "Gap" as const, priority: "Medium" as const, severity: currentSkills.includes(selectedSkill) ? 0 : 50, hours: 20, impact: 6,
      why: `${selectedSkill} is part of the capability graph for ${targetRole}. Inspect it, then simulate acquiring it to see the projected effect.`, prerequisites: []
    };
  }, [selectedSkill, currentSkills, targetRole]);

  const simulationGain = useMemo(() => {
    return simulatedSkills.reduce((total, skill) => total + (skillIntelligence[skill]?.impact ?? 5), 0);
  }, [simulatedSkills]);

  const simulatedReadiness = Math.min(100, readiness + simulationGain);

  const nextProjectSkill = bottleneck !== "Analyzing..." && !currentSkills.includes(bottleneck) ? bottleneck : prioritySkills[0];
  const recommendedProject = projectRecommendations[nextProjectSkill] || projectRecommendations["Machine Learning"];

  const liveMarket = useMemo(() => {
    const observed = marketSignals.map((signal) => Number(signal.demand_index ?? 0)).filter((value) => value > 0);
    return observed.length ? observed : [0];
  }, [marketSignals]);

  const systemArtifacts = useMemo(() => {
    const now = liveClock
      ? liveClock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      : "--:--:--";
    return [
      `${now}  graph.engine → ${nodes.length} nodes / ${edges.length} edges`,
      `${now}  career.model → readiness ${readiness}% / alignment ${skillCoverage}%`,
      `${now}  market.feed → ${targetRole} capability demand recalculated`,
      `${now}  route.optimizer → bottleneck ${bottleneck}`,
      `${now}  talent.twin → ${currentSkills.length} capabilities active`,
    ];
  }, [liveClock, nodes.length, edges.length, readiness, skillCoverage, targetRole, bottleneck, currentSkills.length]);

  /* =======================================================
     LIVE ARTIFACT CLOCK
  ======================================================= */

  useEffect(() => {
    setLiveClock(new Date());
    const timer = window.setInterval(() => {
      setLiveClock(new Date());
      setArtifactTick((v) => v + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  /* =======================================================
     BACKEND HEALTH
  ======================================================= */

  const checkBackend = useCallback(async () => {
    const started = performance.now();

    setApiStatus("checking");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/health`,
        {
          method: "GET",
          cache: "no-store",
}
      );

      const elapsed = Math.round(
        performance.now() - started
      );

      setLatency(elapsed);

      if (!response.ok) {
        throw new Error(
          `Backend unavailable: ${response.status}`
        );
      }

      setApiStatus("online");
    } catch (error) {
      console.error(
        "OmniNexus backend health error:",
        error
      );

      setLatency(
        Math.round(performance.now() - started)
      );

      setApiStatus("offline");
    }
  }, []);

  /* =======================================================
     CAREER GRAPH ANALYSIS
  ======================================================= */

  const analysisRequestRef = useRef(0);

  const fetchGraph = useCallback(async () => {
    const requestId = ++analysisRequestRef.current;
    setIsAnalyzing(true);

const started = performance.now();

    try {
      const response = await fetch(
        `${API_URL}/api/v1/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            current_skills: currentSkills,
            target_role: targetRole,
          }),
          cache: "no-store",
}
      );

      const elapsed = Math.round(
        performance.now() - started
      );

      setLatency(elapsed);

      if (!response.ok) {
        throw new Error(
          `Analysis request failed: ${response.status}`
        );
      }

      const data: AnalysisResponse =
        await response.json();

      if (requestId !== analysisRequestRef.current) return;

      if (response.ok && data.status === "success") {
        if (data.flow_nodes) {
          setNodes(data.flow_nodes);
        }

        if (data.flow_edges) {
          setEdges(data.flow_edges);
        }

        setReadiness(
          Math.max(0, Math.min(100, Number(data.readiness_score ?? 0)))
        );
        setBottleneck(data.bottleneck_skill || "No bottleneck detected");
        setMarketValue(Number(data.market_value ?? 0));
        setMarketOpportunity(Number(data.market_opportunity_score ?? 0));
        setMarketSignals(data.market_signals ?? []);
        setMarketGaps(data.market_skill_gaps ?? []);

        setLastUpdated(
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } else {
        throw new Error(
          data.message || `Analysis service returned HTTP ${response.status}.`
        );
      }
    } catch (error) {
      if (requestId !== analysisRequestRef.current) return;
      console.warn("OmniNexus analysis fallback:", error);

      // IMPORTANT: analysis failure is not the same as API failure.
      // The health endpoint owns the API ONLINE/OFFLINE indicator.
      // If a role is not implemented by FastAPI yet, the UI continues
      // with deterministic local career intelligence instead of showing
      // a false "API OFFLINE" state.
      const local = buildLocalGraph(currentSkills, targetRole);
      setNodes(local.nodes);
      setEdges(local.edges);
      setReadiness(local.readiness);
      setBottleneck(local.bottleneck);
      setMarketValue(local.marketValue);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " · local intelligence"
      );
    } finally {
      if (requestId === analysisRequestRef.current) setIsAnalyzing(false);
    }
  }, [
    currentSkills,
    targetRole,
    setNodes,
    setEdges,
  ]);

  /* =======================================================
     INITIAL HEALTH CHECK
  ======================================================= */

  useEffect(() => {
    checkBackend();
    const interval = window.setInterval(checkBackend, 10000);
    return () => window.clearInterval(interval);
  }, [checkBackend]);

  /* =======================================================
     INITIAL / AUTOMATIC ANALYSIS
  ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => fetchGraph(), 250);
    return () => window.clearTimeout(timer);
  }, [fetchGraph]);

  /* =======================================================
     REACT FLOW CONNECTION
  ======================================================= */

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((existingEdges) =>
        addEdge(connection, existingEdges)
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = (node.data || {}) as Record<string, unknown>;
    const label = String(data.label || data.name || data.skill || data.title || node.id);
    setSelectedSkill(label.replace(/^CURRENT:\s*/i, "").replace(/^GAP:\s*/i, "").replace(/^TARGET:\s*/i, "").trim());
  }, []);

  const simulateSkill = (skill: string) => {
    if (currentSkills.includes(skill)) return;
    setSimulatedSkills((previous) => previous.includes(skill) ? previous : [...previous, skill]);
  };

  const commitSimulation = () => {
    if (!simulatedSkills.length) return;
    setCurrentSkills((previous) => Array.from(new Set([...previous, ...simulatedSkills])));
    setSimulatedSkills([]);
  };

  /* =======================================================
     RESUME PARSER
  ======================================================= */

  const parseResume = async () => {
    const cleanedResume =
      resumeText.trim();

    if (!cleanedResume) {
      setParseError(
        "Please paste your resume text first."
      );

      setParseMessage("");

      return;
    }

    setIsParsing(true);
    setParseError("");
    setParseMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/parse-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_text: cleanedResume,
          }),
          cache: "no-store",
        }
      );

      const data: ParseResumeResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          `Resume parsing failed: ${response.status}`
        );
      }

      if (
        data.status === "success" &&
        Array.isArray(data.extracted_skills)
      ) {
        const extractedSkills =
          data.extracted_skills;

        setCurrentSkills(
          (previousSkills) =>
            Array.from(
              new Set([
                ...previousSkills,
                ...extractedSkills,
              ])
            )
        );

        setParseMessage(
          extractedSkills.length > 0
            ? `Talent Twin synced — ${extractedSkills.length} skill${extractedSkills.length === 1
              ? ""
              : "s"
            } detected.`
            : "Resume processed, but no supported skills were detected."
        );

        setResumeText("");

        setApiStatus("online");
      } else {
        setParseMessage(
          data.message ||
          "Resume processed, but no skills were returned."
        );
      }
    } catch (error) {
      console.warn("Profile insights backend parser unavailable; using local extraction.", error);

      const normalized = cleanedResume.toLowerCase();
      const locallyDetected = availableSkills.filter((skill) =>
        normalized.includes(skill.toLowerCase())
      );

      if (locallyDetected.length > 0) {
        setCurrentSkills((previousSkills) =>
          Array.from(new Set([...previousSkills, ...locallyDetected]))
        );
        setParseMessage(
          `Local Talent Twin extraction completed — ${locallyDetected.length} supported skill${locallyDetected.length === 1 ? "" : "s"} detected.`
        );
        setParseError("");
      } else {
        setParseError(
          error instanceof Error
            ? `${error.message} No supported skills were detected locally.`
            : "Unable to connect to the resume parser and no supported skills were detected."
        );
      }
    } finally {
      setIsParsing(false);
    }
  };

  /* =======================================================
     ACQUIRE SKILL
  ======================================================= */

  const acquireSkill = (skill: string) => {
    if (currentSkills.includes(skill)) {
      return;
    }

    setCurrentSkills(
      (previousSkills) => [
        ...previousSkills,
        skill,
      ]
    );
  };

  /* =======================================================
     REMOVE SKILL
  ======================================================= */

  const removeSkill = (skill: string) => {
    if (skill === "Python") {
      return;
    }

    setCurrentSkills(
      (previousSkills) =>
        previousSkills.filter(
          (item) => item !== skill
        )
    );
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetTimeline = () => {
    setCurrentSkills(["Python"]);

    setReadiness(0);
    setBottleneck("Analyzing...");
    setMarketValue(0);

    setParseMessage("");
    setParseError("");
    setResumeText("");

    setNodes([]);
    setEdges([]);

    setLastUpdated("Not analyzed");
  };

  /* =======================================================
     COPY CAREER SNAPSHOT
  ======================================================= */

  const copySnapshot = async () => {
    const snapshot = `
OMNINEXUS CAREER INTELLIGENCE

Target Role: ${targetRole}
Career Level: ${careerLevel}
Readiness: ${readiness}%
Skill Coverage: ${skillCoverage}%
Market Value: $${(marketValue / 1000).toFixed(1)}k
Bottleneck: ${bottleneck}
Current Skills: ${currentSkills.join(", ")}
Priority Skills: ${prioritySkills.length
        ? prioritySkills.join(", ")
        : "None"
      }
`;

    try {
      await navigator.clipboard.writeText(
        snapshot.trim()
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        1800
      );
    } catch (error) {
      console.error(
        "Unable to copy snapshot:",
        error
      );
    }
  };

  /* =======================================================
     EXPORT CAREER REPORT
  ======================================================= */

  const exportReport = () => {
    const report = `
OMNINEXUS CAREER INTELLIGENCE REPORT
=====================================

Target Role
-----------
${targetRole}

Career Level
------------
${careerLevel}

Readiness Score
---------------
${readiness}%

Skill Coverage
--------------
${skillCoverage}%

Market Value
------------
$${(marketValue / 1000).toFixed(1)}k

Main skill gap
------------------
${bottleneck}
Current Skills
--------------
${currentSkills.join("\n")}

Priority Skills
---------------
${prioritySkills.length
        ? prioritySkills.join("\n")
        : "No immediate priority skills."
      }

Generated
---------
${new Date().toLocaleString()}
`;

    const blob = new Blob(
      [report],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      `omninexus-career-${targetRole
        .toLowerCase()
        .replace(/\s+/g, "-")}.txt`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     READINESS RING
  ======================================================= */

  const readinessGradient = {
    background: `conic-gradient(
      #22d3ee ${readiness}%,
      #172033 ${readiness}% 100%
    )`,
  };

  /* =======================================================
     UI — OMNINEXUS LIVE ARTIFACT COMMAND CENTER
  ======================================================= */

  const liveEdges = useMemo(() => edges.map((edge, index) => ({
    ...edge,
    animated: true,
    style: {
      ...(edge.style || {}),
      stroke: index % 3 === 0 ? "#22d3ee" : "#6366f1",
      strokeWidth: 3,
      opacity: 1,
      strokeLinecap: "round" as const,
      filter: "drop-shadow(0 0 4px rgba(0,229,255,0.45))",
    },
  })), [edges]);

  const liveNodes = useMemo(() => nodes.map((node) => ({
    ...node,
    style: {
      ...(node.style || {}),
      boxShadow: "0 0 22px rgba(34,211,238,0.12)",
      borderRadius: 10,
    },
  })), [nodes]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#030810] text-slate-200 font-sans">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[5%] top-[-15%] h-[520px] w-[520px] rounded-full bg-cyan-500/[0.045] blur-[130px]" />
        <div className="absolute right-[-12%] top-[18%] h-[520px] w-[520px] rounded-full bg-violet-500/[0.035] blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[35%] h-[450px] w-[450px] rounded-full bg-emerald-500/[0.025] blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1900px] px-3 pb-32 pt-4 sm:px-5 lg:px-7">
        <header className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                Career Planning
              </span>
              <span className="rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">Career workspace</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 sm:flex"><BrainCircuit size={22} /></div>
              <div>
                <h1 className="text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">Career <span className="text-cyan-400">Simulator</span></h1>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">See where your skills stand today and what to learn next for your target role.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#07111d]/90 px-3 py-2">
              <StatusDot status={apiStatus} />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{apiStatus === "online" ? "API ONLINE" : apiStatus === "offline" ? "API OFFLINE" : "CHECKING"}</span>
              <span className="border-l border-slate-800 pl-2 font-mono text-[9px] text-slate-600">{latency !== null ? `${latency}ms` : "--"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-3 py-2 font-mono text-[9px] text-emerald-400"><Clock3 size={12} /> {liveClock ? liveClock.toLocaleTimeString() : "--:--:--"}</div>
            <button onClick={() => { checkBackend(); fetchGraph(); }} disabled={isAnalyzing} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#07111d] px-3 py-2 text-[9px] font-black uppercase tracking-wider text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 disabled:opacity-50"><RefreshCw size={13} className={isAnalyzing ? "animate-spin" : ""} /> Refresh Intelligence</button>
            <button onClick={exportReport} className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[9px] font-black uppercase tracking-wider text-cyan-400 hover:bg-cyan-500/15"><Download size={13} /> Export</button>
          </div>
        </header>

        <section className="mb-4 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#07111d]/95">
          <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400"><Target size={18} /></div><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">Active Simulation Target</p><p className="text-sm font-black text-white">{targetRole}</p></div></div>
            <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
              <select aria-label="Career target role" value={targetRole} onChange={(e) => { setTargetRole(e.target.value); setSelectedSkill(null); }} className="w-full rounded-xl border border-slate-800 bg-[#040a11] px-3 py-2.5 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500/40 sm:max-w-xs">{Object.keys(roleProfiles).map((role) => <option key={role}>{role}</option>)}</select>
              <button onClick={fetchGraph} disabled={isAnalyzing} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-[#041018] hover:bg-cyan-300 disabled:opacity-50">{isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Run Simulation</button>
            </div>
          </div>
          <div className="border-t border-slate-800/70 px-4 py-2.5 text-[10px] text-slate-500">{selectedRole.description}</div>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <MetricCard icon={Gauge} label="Career Readiness" value={`${readiness}%`} detail={careerLevel} accent="cyan" />
          <MetricCard icon={Layers3} label="Skill Coverage" value={`${skillCoverage}%`} detail={`${activeNodes} detected capabilities`} accent="violet" />
          <MetricCard icon={TrendingUp} label="Market Value" value={`₹${new Intl.NumberFormat("en-IN").format(Math.round(marketValue))}`} detail="Estimated skill-index value (INR)" accent="amber" />
          <MetricCard icon={Target} label="Market Opportunity" value={`${marketOpportunity}`} detail="Hackathon sample signal (0–100)" accent="violet" />
          <MetricCard icon={Activity} label="Analysis Latency" value={latency !== null ? `${latency}ms` : "--"} detail={`Updated ${lastUpdated}`} accent="emerald" />
        </section>

        <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500">Readiness Intelligence</p><h2 className="mt-1 text-lg font-black text-white">How close are you?</h2></div><span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-slate-600"><ActivitySquare size={12} /> Live model</span></div>
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative h-32 w-32 shrink-0"><div className="absolute inset-0 rounded-full p-[6px]" style={{ background: `conic-gradient(#22d3ee ${readiness}%, #172033 ${readiness}% 100%)` }}><div className="flex h-full w-full items-center justify-center rounded-full bg-[#07111d]"><div className="text-center"><p className="text-3xl font-black text-white">{readiness}</p><p className="text-[8px] font-black uppercase tracking-widest text-slate-600">readiness</p></div></div></div></div>
              <div className="min-w-0 flex-1"><div className="mb-4 flex items-center justify-between text-[9px] font-black uppercase tracking-wider"><span className="text-slate-600">Capability alignment</span><span className="text-cyan-400">{skillCoverage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-900"><div className="h-full rounded-full bg-cyan-400 transition-all duration-700" style={{ width: `${skillCoverage}%` }} /></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl border border-slate-800 bg-[#040a11] p-3"><p className="text-[7px] font-black uppercase tracking-wider text-slate-600">Career level</p><p className="mt-1 text-sm font-black text-white">{careerLevel}</p></div><div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.025] p-3"><p className="text-[7px] font-black uppercase tracking-wider text-amber-500">Primary bottleneck</p><p className="mt-1 truncate text-sm font-black text-amber-400">{bottleneck}</p></div></div></div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.07] to-[#07111d] p-4"><div className="flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400"><CircleAlert size={17} /></div><span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-amber-400">Key gap</span></div><p className="mt-5 text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Main skill gap</p><h2 className="mt-2 text-2xl font-black text-white">{bottleneck}</h2><p className="mt-2 text-[10px] leading-relaxed text-slate-500">The graph currently prioritizes this highest-value missing capability for your transition toward {targetRole}.</p></div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[290px_minmax(0,1fr)_310px]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4">
              <div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400"><UserRound size={16} /></div><div><p className="text-[8px] font-black uppercase tracking-[0.18em] text-violet-400">Profile insights</p><p className="text-xs font-bold text-white">Resume insights</p></div></div>
              <textarea aria-label="Resume text" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder={"Paste your resume text here...\n\nExample:\nPython developer with Machine Learning, SQL, AWS, Docker and RAG experience..."} className="h-28 w-full resize-none rounded-xl border border-slate-800 bg-[#040a11] p-3 text-[9px] leading-relaxed text-slate-300 outline-none placeholder:text-slate-700 focus:border-violet-500/40" />
              <button onClick={parseResume} disabled={isParsing || !resumeText.trim()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500/15 py-2.5 text-[9px] font-black uppercase tracking-wider text-violet-300 hover:bg-violet-500/20 disabled:opacity-40">{isParsing ? <Loader2 size={13} className="animate-spin" /> : <WandSparkles size={13} />}{isParsing ? "Extracting..." : "Sync Talent Twin"}</button>
              {parseMessage && <p className="mt-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] p-2.5 text-[8px] leading-relaxed text-emerald-400">✓ {parseMessage}</p>}
              {parseError && <p className="mt-2 rounded-xl border border-rose-500/15 bg-rose-500/[0.05] p-2.5 text-[8px] leading-relaxed text-rose-400">! {parseError}</p>}
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">Capability Registry</p><p className="mt-1 text-xs font-black text-white">Detected Skills</p></div><span className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 text-[8px] font-black text-emerald-400">{currentSkills.length}</span></div><div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">{currentSkills.map((skill) => <button key={skill} onClick={() => setSelectedSkill(skill)} className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-2 py-1.5 text-[8px] font-bold text-emerald-400 hover:border-cyan-500/30">✓ {skill}</button>)}</div></div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400"><Rocket size={16} /></div><div><p className="text-[8px] font-black uppercase tracking-[0.18em] text-amber-500">Next Transitions</p><p className="text-xs font-black text-white">Priority Capabilities</p></div></div><div className="space-y-1.5">{prioritySkills.slice(0, 6).map((skill, index) => <button key={skill} onClick={() => { setSelectedSkill(skill); simulateSkill(skill); }} className="flex w-full items-center gap-2 rounded-xl border border-slate-800 bg-[#040a11] p-2.5 text-left hover:border-cyan-500/30"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[8px] font-black text-slate-500">0{index + 1}</span><span className="min-w-0 flex-1 truncate text-[9px] font-bold text-slate-300">{skill}</span><ChevronRight size={12} className="text-slate-700" /></button>)}</div></div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><p className="mb-3 text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">Acquire Capability</p><div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">{availableSkills.map((skill) => { const acquired = currentSkills.includes(skill); return <button key={skill} onClick={() => { setSelectedSkill(skill); simulateSkill(skill); }} disabled={acquired} className={`rounded-lg border px-2 py-1.5 text-[8px] font-bold ${acquired ? "border-emerald-500/10 bg-emerald-500/[0.03] text-emerald-500/40" : "border-slate-800 bg-[#040a11] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-400"}`}>{acquired ? "✓ " : "+ "}{skill}</button>; })}</div></div>
          </aside>

          <div className="min-w-0 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#050b13]">
              <div className="flex flex-col gap-3 border-b border-slate-800/80 p-3.5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400"><Network size={16} /></div><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-500">Skill map</p><p className="text-sm font-black text-white">Career Transition Map</p></div></div><div className="flex items-center gap-2"><span className="flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.05] px-2 py-1 text-[7px] font-black uppercase tracking-wider text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Skill path</span><span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[7px] text-slate-600">{nodes.length} nodes</span><span className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[7px] text-slate-600">{edges.length} edges</span></div></div>
              <div className="h-[510px] w-full bg-[#010409] sm:h-[590px]">
                <ReactFlow nodes={liveNodes} edges={liveEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} fitView colorMode="dark" minZoom={0.2} maxZoom={2.2} proOptions={{ hideAttribution: true }}>
                  <Background color="#1b2a3d" gap={22} size={1} />
                  <Controls className="!border-slate-700 !bg-[#07111d] !shadow-xl" />
                  <Panel position="top-left" className="!m-3 rounded-xl !border !border-slate-800 !bg-[#07111d]/90 !p-2.5 !backdrop-blur-xl"><div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-wider text-cyan-400"><MousePointer2 size={11} /> Click any node for intelligence</div></Panel>
                  <Panel position="top-right" className="!m-3 rounded-xl !border !border-slate-800 !bg-[#07111d]/90 !p-3 !backdrop-blur-xl"><div className="space-y-2"><div className="flex items-center gap-2 text-[7px] font-black uppercase text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Skill path</div><div className="flex items-center gap-2 text-[7px] font-black uppercase text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Career analysis</div><div className="flex items-center gap-2 text-[7px] font-black uppercase text-slate-500"><StatusDot status={apiStatus} /> FastAPI {apiStatus === "online" ? "Connected" : apiStatus === "offline" ? "Disconnected" : "Checking"}</div></div></Panel>
                  <Panel position="bottom-left" className="!m-3 hidden rounded-xl !border !border-slate-800 !bg-[#07111d]/90 !p-2.5 sm:block"><div className="flex items-center gap-4 text-[7px] font-bold text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />Acquired</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />Transition</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />Gap</span></div></Panel>
                </ReactFlow>
              </div>
            </div>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-500">Next-Best-Skill Copilot</p><h3 className="mt-1 text-sm font-black text-white">Shortest useful transition</h3></div><Sparkles size={15} className="text-cyan-400" /></div><div className="space-y-2">{prioritySkills.slice(0, 4).map((skill, index) => <button key={skill} onClick={() => setSelectedSkill(skill)} className="flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-[#040a11] p-2.5 text-left hover:border-cyan-500/25"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-[8px] font-black text-indigo-300">{index + 1}</span><div className="min-w-0 flex-1"><p className="text-[9px] font-bold text-slate-300">{skill}</p><p className="text-[7px] text-slate-600">{skillIntelligence[skill]?.hours ?? 20}h estimated · {skillIntelligence[skill]?.priority ?? "Medium"} priority</p></div><span className="text-[8px] font-black text-emerald-400">+{skillIntelligence[skill]?.impact ?? 5}%</span></button>)}</div></div>

              <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-400">Capability Radar</p><h3 className="mt-1 text-sm font-black text-white">Current vs target signal</h3></div><Target size={15} className="text-violet-400" /></div><div className="space-y-3">{["Core/Data", "ML", "GenAI", "Cloud", "MLOps"].map((label, i) => { const values = [skillCoverage, Math.min(100, skillCoverage + (currentSkills.includes("Machine Learning") ? 25 : 0)), Math.min(100, skillCoverage + (currentSkills.includes("LLMs") ? 25 : 0)), Math.min(100, skillCoverage + (currentSkills.includes("Cloud Computing") ? 25 : 0)), Math.min(100, skillCoverage + (currentSkills.includes("MLOps") ? 25 : 0))]; return <div key={label}><div className="mb-1 flex justify-between text-[7px] font-black uppercase tracking-wider"><span className="text-slate-500">{label}</span><span className="text-cyan-400">{values[i]}%</span></div><div className="h-1.5 rounded-full bg-slate-900"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500" style={{ width: `${values[i]}%` }} /></div></div>; })}</div></div>
            </section>

            <section className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-500">Market Pulse</p><h3 className="mt-1 text-sm font-black text-white">Hackathon sample evidence</h3></div><TrendingUp size={15} className="text-emerald-400" /></div><div className="flex h-24 items-end gap-1 rounded-xl border border-slate-800 bg-[#040a11] p-3">{liveMarket.map((value, i) => <div key={i} className="flex-1 rounded-t bg-cyan-400/60 transition-all duration-700" style={{ height: value + "%" }} />)}</div><div className="mt-2 grid grid-cols-3 gap-2 text-[7px] font-black uppercase tracking-wider text-slate-600"><span>Demand percentile</span><span className="text-center">{marketSignals.length ? marketSignals.length + " skills" : "Run analysis"}</span><span className="text-right text-emerald-400">{marketOpportunity || "—"}</span></div>{marketSignals.length > 0 && <div className="mt-3 space-y-1.5">{marketSignals.slice(0,4).map((signal) => <div key={signal.skill} className="flex items-center justify-between rounded-lg border border-slate-800 bg-[#040a11] px-2.5 py-2"><span className="text-[8px] font-bold text-slate-300">{signal.skill}</span><span className="text-[8px] font-black text-cyan-400">{signal.opportunity_score ?? "—"}</span></div>)}</div>}{marketGaps.length > 0 && <div className="mt-3 border-t border-slate-800 pt-3"><p className="text-[7px] font-black uppercase tracking-wider text-amber-500">Market-backed gaps</p><div className="mt-1 flex flex-wrap gap-1">{marketGaps.slice(0,4).map((gap) => <span key={gap.skill} className="rounded-md border border-amber-500/10 bg-amber-500/[0.03] px-1.5 py-1 text-[7px] text-amber-300">{gap.skill}</span>)}</div></div>}</section>

            <section className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center justify-between"><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Execution Timeline</p><h3 className="mt-1 text-sm font-black text-white">Career transition phases</h3></div><GitBranch size={15} className="text-amber-400" /></div><div className="grid grid-cols-1 gap-2 md:grid-cols-3">{[{ n: "01", t: "Foundation", d: `Build ${prioritySkills[0] || "core capability"}`, s: "Current" }, { n: "02", t: "Bottleneck", d: `Resolve ${bottleneck}`, s: "Focus" }, { n: "03", t: "Production", d: `Ship a ${targetRole} system`, s: "Next" }].map(x => <div key={x.n} className="rounded-xl border border-slate-800 bg-[#040a11] p-3"><div className="flex items-center justify-between"><span className="text-[8px] font-black text-cyan-400">{x.n}</span><span className="rounded-full border border-slate-800 px-1.5 py-0.5 text-[6px] font-black uppercase text-slate-600">{x.s}</span></div><p className="mt-2 text-[10px] font-black text-white">{x.t}</p><p className="mt-1 text-[8px] leading-relaxed text-slate-600">{x.d}</p></div>)}</div></section>

            <section className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400"><FlaskConical size={14} /></div><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">Project Intelligence</p><h3 className="text-sm font-black text-white">Recommended project for your next gap</h3></div></div><div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.025] p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-[7px] font-black uppercase tracking-wider text-rose-400">Missing: {nextProjectSkill || "—"}</p><h4 className="mt-1 text-base font-black text-white">{recommendedProject.title}</h4><p className="mt-1 max-w-2xl text-[9px] leading-relaxed text-slate-500">{recommendedProject.description}</p></div><Rocket size={22} className="text-emerald-400" /></div><div className="mt-3 flex flex-wrap gap-1.5">{recommendedProject.stack.map((item) => <span key={item} className="rounded-lg border border-slate-800 bg-[#040a11] px-2 py-1 text-[7px] font-bold text-slate-400">{item}</span>)}</div></div></section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/15 bg-[#07111d]/95 p-4"><div className="mb-4 flex items-center justify-between"><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-500">Skill details</p><h3 className="mt-1 text-sm font-black text-white">Skill details</h3></div><Network size={15} className="text-cyan-400" /></div>{selectedSkillIntel ? <div className="space-y-3"><div className="rounded-xl border border-slate-800 bg-[#040a11] p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-[7px] font-black uppercase tracking-wider text-slate-600">Selected capability</p><h4 className="mt-1 text-base font-black text-white">{selectedSkillIntel.name}</h4></div><span className={`rounded-full border px-2 py-1 text-[7px] font-black uppercase ${selectedSkillIntel.status === "Acquired" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>{selectedSkillIntel.status}</span></div></div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl border border-slate-800 bg-[#040a11] p-2.5"><p className="text-[7px] uppercase text-slate-600">Priority</p><p className="mt-1 text-[10px] font-black text-cyan-400">{selectedSkillIntel.priority}</p></div><div className="rounded-xl border border-slate-800 bg-[#040a11] p-2.5"><p className="text-[7px] uppercase text-slate-600">Gap severity</p><p className="mt-1 text-[10px] font-black text-amber-400">{selectedSkillIntel.severity}%</p></div><div className="rounded-xl border border-slate-800 bg-[#040a11] p-2.5"><p className="text-[7px] uppercase text-slate-600">Learning time</p><p className="mt-1 text-[10px] font-black text-violet-400">{selectedSkillIntel.hours ? `${selectedSkillIntel.hours}h` : "Ready"}</p></div><div className="rounded-xl border border-slate-800 bg-[#040a11] p-2.5"><p className="text-[7px] uppercase text-slate-600">Readiness impact</p><p className="mt-1 text-[10px] font-black text-emerald-400">+{selectedSkillIntel.impact}%</p></div></div><div><p className="mb-1 text-[7px] font-black uppercase tracking-wider text-slate-600">Why it matters</p><p className="text-[9px] leading-relaxed text-slate-500">{selectedSkillIntel.why}</p></div><div><p className="mb-1 text-[7px] font-black uppercase tracking-wider text-slate-600">Prerequisites</p><div className="flex flex-wrap gap-1">{selectedSkillIntel.prerequisites.length ? selectedSkillIntel.prerequisites.map((p) => <span key={p} className="rounded-md border border-slate-800 px-1.5 py-1 text-[7px] text-slate-500">{p}</span>) : <span className="text-[8px] text-emerald-400">No prerequisites</span>}</div></div>{selectedSkillIntel.status !== "Acquired" && <button onClick={() => simulateSkill(selectedSkillIntel.name)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-2.5 text-[9px] font-black uppercase tracking-wider text-[#041018] hover:bg-cyan-300"><Zap size={13} /> Explore skill path</button>}</div> : <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-[#040a11] p-5 text-center"><MousePointer2 size={22} className="text-slate-700" /><p className="mt-3 text-[9px] font-bold text-slate-500">Select a skill in the map to see why it matters.</p></div>}</div>

            <div className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.05] to-[#07111d] p-4"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300"><Zap size={14} /></div><div><p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300">Acquisition Simulation</p><h3 className="text-sm font-black text-white">What happens if you learn it?</h3></div></div><div className="mt-4 rounded-xl border border-slate-800 bg-[#040a11] p-3"><div className="flex items-center justify-between"><span className="text-[8px] font-black uppercase text-slate-600">Current readiness</span><span className="text-lg font-black text-white">{readiness}%</span></div><div className="my-2 h-1.5 rounded-full bg-slate-900"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${readiness}%` }} /></div>{simulatedSkills.length ? <><div className="space-y-1.5 pt-2">{simulatedSkills.map((skill) => <div key={skill} className="flex items-center justify-between text-[8px]"><span className="text-slate-400">+ {skill}</span><span className="font-black text-emerald-400">+{skillIntelligence[skill]?.impact ?? 5}%</span></div>)}</div><div className="mt-3 border-t border-slate-800 pt-3"><div className="flex items-center justify-between"><span className="text-[8px] font-black uppercase text-slate-600">Simulated readiness</span><span className="text-xl font-black text-cyan-400">{simulatedReadiness}%</span></div><button onClick={commitSimulation} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-2.5 text-[9px] font-black uppercase tracking-wider text-[#041018]"><Check size={13} /> Apply Acquisition</button></div></> : <p className="pt-2 text-[8px] leading-relaxed text-slate-600">Click a skill node or priority capability to simulate acquiring it before changing your real Talent Twin.</p>}</div></div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#07111d]/95 p-4"><div className="mb-3 flex items-center gap-2"><BookOpen size={14} className="text-amber-400" /><p className="text-[8px] font-black uppercase tracking-[0.18em] text-amber-500">Live Artifacts</p></div><div className="space-y-2 font-mono">{(showAllArtifacts ? systemArtifacts : systemArtifacts.slice(0, 4)).map((line, i) => <div key={`${line}-${i}`} className="border-l border-cyan-500/20 pl-2 text-[7px] leading-relaxed text-slate-600"><span className="text-cyan-500">›</span> {line}</div>)}</div><button onClick={() => setShowAllArtifacts(v => !v)} className="mt-3 w-full rounded-lg border border-slate-800 py-2 text-[7px] font-black uppercase tracking-wider text-slate-500 hover:text-cyan-400">{showAllArtifacts ? "Collapse feed" : "Expand live feed"}</button></div>
          </aside>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[{ icon: Server, label: "API", value: apiStatus === "online" ? "ONLINE" : apiStatus === "offline" ? "OFFLINE" : "CHECKING", good: apiStatus === "online" }, { icon: Database, label: "Graph Engine", value: nodes.length ? "ACTIVE" : "IDLE", good: nodes.length > 0 }, { icon: ShieldCheck, label: "Analysis", value: isAnalyzing ? "RUNNING" : "READY", good: !isAnalyzing }, { icon: Activity, label: "Live Clock", value: liveClock ? liveClock.toLocaleTimeString() : "--:--:--", good: true }].map(({ icon: Icon, label, value, good }) => <div key={label} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#07111d] p-2.5"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-slate-500"><Icon size={13} /></div><div className="min-w-0"><p className="text-[6px] font-black uppercase tracking-[0.16em] text-slate-600">{label}</p><p className={`mt-0.5 truncate font-mono text-[8px] font-black ${good ? "text-emerald-400" : "text-amber-400"}`}>{value}</p></div><span className={`ml-auto h-1.5 w-1.5 rounded-full ${good ? "bg-emerald-400" : "bg-amber-400"}`} /></div>)}
        </section>
      </main>
    </div>
  );
}