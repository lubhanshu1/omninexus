"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
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
  type NodeMouseHandler,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

/* =========================================================
   TYPES
========================================================= */

type AnalysisResponse = {
  status?: string;
  flow_nodes?: Node[];
  flow_edges?: Edge[];
  readiness_score?: number;
  bottleneck_skill?: string;
  market_value?: number;
  message?: string;
};

type ParseResumeResponse = {
  status?: string;
  extracted_skills?: string[];
  message?: string;
};

type ApiStatus = "online" | "offline" | "checking";

type SkillMeta = {
  importance: number;
  demand: number;
  difficulty: number;
  learningTime: string;
  category: string;
  description: string;
  prerequisites: string[];
  nextSkills: string[];
};

/* =========================================================
   SKILL INTELLIGENCE DATABASE
   Frontend metadata only.
   Backend analysis remains the source of truth for scores.
========================================================= */

const SKILL_INTELLIGENCE: Record<string, SkillMeta> = {
  Python: {
    importance: 95,
    demand: 96,
    difficulty: 35,
    learningTime: "4–8 weeks",
    category: "Programming",
    description:
      "Core programming capability used across AI, data science, automation and backend engineering.",
    prerequisites: [],
    nextSkills: ["Machine Learning", "Data Analysis", "Cloud Computing"],
  },

  "Machine Learning": {
    importance: 96,
    demand: 95,
    difficulty: 68,
    learningTime: "6–10 weeks",
    category: "Artificial Intelligence",
    description:
      "Fundamental capability for building predictive models and intelligent systems.",
    prerequisites: ["Python", "Data Analysis"],
    nextSkills: ["Deep Learning", "MLOps", "PyTorch"],
  },

  "Deep Learning": {
    importance: 94,
    demand: 92,
    difficulty: 82,
    learningTime: "8–14 weeks",
    category: "Artificial Intelligence",
    description:
      "Advanced neural-network capability for computer vision, NLP and modern AI systems.",
    prerequisites: ["Python", "Machine Learning"],
    nextSkills: ["PyTorch", "LLMs"],
  },

  PyTorch: {
    importance: 91,
    demand: 90,
    difficulty: 76,
    learningTime: "5–8 weeks",
    category: "AI Framework",
    description:
      "Deep-learning framework used for model development, experimentation and production AI.",
    prerequisites: ["Python", "Deep Learning"],
    nextSkills: ["LLMs", "MLOps"],
  },

  LLMs: {
    importance: 98,
    demand: 99,
    difficulty: 84,
    learningTime: "6–12 weeks",
    category: "Generative AI",
    description:
      "Large Language Model capability for building modern generative-AI applications.",
    prerequisites: ["Python", "Deep Learning"],
    nextSkills: ["RAG", "AI Agents"],
  },

  RAG: {
    importance: 93,
    demand: 96,
    difficulty: 80,
    learningTime: "3–6 weeks",
    category: "Generative AI",
    description:
      "Retrieval-Augmented Generation combines language models with external knowledge sources.",
    prerequisites: ["LLMs"],
    nextSkills: ["AI Agents"],
  },

  "AI Agents": {
    importance: 96,
    demand: 98,
    difficulty: 87,
    learningTime: "4–8 weeks",
    category: "Agentic AI",
    description:
      "Capability for creating systems that reason, use tools and execute multi-step workflows.",
    prerequisites: ["LLMs", "RAG"],
    nextSkills: ["MLOps", "Cloud Computing"],
  },

  "Cloud Computing": {
    importance: 88,
    demand: 94,
    difficulty: 65,
    learningTime: "5–8 weeks",
    category: "Cloud",
    description:
      "Cloud infrastructure knowledge for deploying scalable software and AI systems.",
    prerequisites: ["Python"],
    nextSkills: ["AWS", "Docker"],
  },

  AWS: {
    importance: 90,
    demand: 97,
    difficulty: 63,
    learningTime: "4–8 weeks",
    category: "Cloud",
    description:
      "Cloud platform capability for deploying, scaling and operating production systems.",
    prerequisites: ["Cloud Computing"],
    nextSkills: ["Docker", "MLOps"],
  },

  Docker: {
    importance: 84,
    demand: 92,
    difficulty: 55,
    learningTime: "2–4 weeks",
    category: "Infrastructure",
    description:
      "Containerization capability for reproducible development and deployment.",
    prerequisites: ["Python"],
    nextSkills: ["Kubernetes", "MLOps"],
  },

  Kubernetes: {
    importance: 82,
    demand: 88,
    difficulty: 85,
    learningTime: "5–9 weeks",
    category: "Infrastructure",
    description:
      "Container orchestration capability for distributed production workloads.",
    prerequisites: ["Docker", "Cloud Computing"],
    nextSkills: ["MLOps"],
  },

  MLOps: {
    importance: 97,
    demand: 94,
    difficulty: 86,
    learningTime: "6–10 weeks",
    category: "Machine Learning Operations",
    description:
      "Production ML capability covering deployment, monitoring, automation and model lifecycle management.",
    prerequisites: ["Machine Learning", "Docker", "Cloud Computing"],
    nextSkills: ["Kubernetes", "CI/CD"],
  },

  "CI/CD": {
    importance: 80,
    demand: 90,
    difficulty: 58,
    learningTime: "2–5 weeks",
    category: "DevOps",
    description:
      "Automation capability for continuously testing, integrating and deploying software.",
    prerequisites: ["Docker"],
    nextSkills: ["MLOps", "Kubernetes"],
  },

  SQL: {
    importance: 86,
    demand: 96,
    difficulty: 45,
    learningTime: "3–6 weeks",
    category: "Data",
    description:
      "Database querying capability required across data, backend and analytics roles.",
    prerequisites: [],
    nextSkills: ["Data Analysis"],
  },

  "Data Analysis": {
    importance: 91,
    demand: 94,
    difficulty: 55,
    learningTime: "4–8 weeks",
    category: "Data",
    description:
      "Capability for extracting insights from structured and unstructured data.",
    prerequisites: ["Python", "SQL"],
    nextSkills: ["Machine Learning"],
  },
};

/* =========================================================
   FALLBACK SKILL METADATA
========================================================= */

const getSkillMeta = (skill: string): SkillMeta => {
  return (
    SKILL_INTELLIGENCE[skill] || {
      importance: 75,
      demand: 75,
      difficulty: 65,
      learningTime: "4–8 weeks",
      category: "Emerging Capability",
      description:
        "Capability identified by the OmniNexus career graph.",
      prerequisites: [],
      nextSkills: [],
    }
  );
};

/* =========================================================
   MAIN DASHBOARD
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

  const [targetRole, setTargetRole] =
    useState("AI Engineer");

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

  /* =======================================================
     INTELLIGENCE PANEL
  ======================================================= */

  const [selectedSkill, setSelectedSkill] =
    useState<string | null>(null);

  const [showIntelligence, setShowIntelligence] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("Career Simulator");

  /* =======================================================
     AVAILABLE SKILLS
  ======================================================= */

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
  ];

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const missingSkills = useMemo(() => {
    return availableSkills.filter(
      (skill) => !currentSkills.includes(skill)
    );
  }, [currentSkills]);

  const acquiredPercentage = useMemo(() => {
    if (availableSkills.length === 0) return 0;

    return Math.round(
      (currentSkills.filter((skill) =>
        availableSkills.includes(skill)
      ).length /
        availableSkills.length) *
      100
    );
  }, [currentSkills, availableSkills.length]);

  const selectedSkillMeta = selectedSkill
    ? getSkillMeta(selectedSkill)
    : null;

  /* =======================================================
     BACKEND HEALTH CHECK
  ======================================================= */

  const checkBackend = useCallback(async () => {
    try {
      setApiStatus("checking");

      const response = await fetch(
        `${API_URL}/api/v1/health`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      setApiStatus("online");
    } catch {
      setApiStatus("offline");
    }
  }, []);

  /* =======================================================
     CAREER GRAPH ANALYSIS
  ======================================================= */

  const fetchGraph = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_skills: currentSkills,
            target_role: targetRole,
          }),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Analysis request failed: ${response.status}`
        );
      }

      const data: AnalysisResponse =
        await response.json();

      if (data.status === "success") {
        if (data.flow_nodes) {
          setNodes(data.flow_nodes);
        }

        if (data.flow_edges) {
          setEdges(data.flow_edges);
        }

        setReadiness(
          Number(data.readiness_score ?? 0)
        );

        setBottleneck(
          data.bottleneck_skill ||
          "No bottleneck detected"
        );

        setMarketValue(
          Number(data.market_value ?? 0)
        );

        setApiStatus("online");
      } else {
        console.error(
          "Analysis API returned:",
          data
        );
      }
    } catch (error) {
      console.error(
        "OmniNexus analysis error:",
        error
      );

      setApiStatus("offline");
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    currentSkills,
    targetRole,
    setNodes,
    setEdges,
  ]);

  /* =======================================================
     INITIAL BACKEND CHECK
  ======================================================= */

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  /* =======================================================
     GRAPH RECALCULATION
  ======================================================= */

  useEffect(() => {
    fetchGraph();
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

  /* =======================================================
     NODE CLICK
  ======================================================= */

  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      const nodeLabel =
        typeof node.data?.label === "string"
          ? node.data.label
          : "";

      if (!nodeLabel) return;

      const cleanLabel = nodeLabel
        .replace(/^CURRENT:\s*/i, "")
        .replace(/^TARGET:\s*/i, "")
        .replace(/^GAP:\s*/i, "")
        .trim();

      setSelectedSkill(cleanLabel);
      setShowIntelligence(true);
    },
    []
  );

  /* =======================================================
     DIGITAL TALENT TWIN
  ======================================================= */

  const parseResume = async () => {
    const cleanedResume = resumeText.trim();

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

        setCurrentSkills((previousSkills) =>
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
      console.error(
        "Digital Talent Twin error:",
        error
      );

      setParseError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the resume parser."
      );
    } finally {
      setIsParsing(false);
    }
  };

  /* =======================================================
     ACQUIRE SKILL
  ======================================================= */

  const acquireSkill = (skill: string) => {
    if (currentSkills.includes(skill)) return;

    setCurrentSkills((previousSkills) => [
      ...previousSkills,
      skill,
    ]);
  };

  /* =======================================================
     INSPECT SKILL
  ======================================================= */

  const inspectSkill = (skill: string) => {
    setSelectedSkill(skill);
    setShowIntelligence(true);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetTimeline = () => {
    setCurrentSkills(["Python"]);
    setParseMessage("");
    setParseError("");
    setResumeText("");
    setSelectedSkill(null);
    setShowIntelligence(false);
  };

  /* =======================================================
     FORMAT MONEY
  ======================================================= */

  const formattedMarketValue =
    marketValue > 0
      ? `$${(marketValue / 1000).toFixed(1)}k`
      : "$0.0k";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="h-screen w-full bg-[#05070d] text-slate-200 font-sans flex overflow-hidden">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside className="w-[350px] min-w-[350px] bg-[#0b1120] border-r border-slate-800/80 flex flex-col z-20 shadow-2xl">

        {/* SIDEBAR SCROLL AREA */}

        <div className="flex-1 overflow-y-auto p-6">

          {/* BRAND */}

          <div className="mb-7">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.15)]">
                <span className="text-indigo-400 font-black">
                  N
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-wider text-indigo-400">
                  OMNINEXUS
                </h1>

                <p className="text-[9px] text-slate-500 uppercase tracking-[0.25em]">
                  Workforce OS
                </p>
              </div>

            </div>

          </div>

          {/* BACKEND STATUS */}

          <div className="mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span
                  className={`w-2 h-2 rounded-full ${apiStatus === "online"
                    ? "bg-emerald-400 animate-pulse"
                    : apiStatus === "offline"
                      ? "bg-red-400"
                      : "bg-amber-400 animate-pulse"
                    }`}
                />

                <span className="text-[9px] uppercase tracking-widest text-slate-400">
                  {apiStatus === "online"
                    ? "Backend Online"
                    : apiStatus === "offline"
                      ? "Backend Offline"
                      : "Checking Backend"}
                </span>

              </div>

              <span className="text-[9px] text-slate-600 font-mono">
                :8001
              </span>

            </div>

            <div className="mt-2 flex justify-between text-[8px] text-slate-600 font-mono">
              <span>FASTAPI</span>
              <span>
                {apiStatus === "online"
                  ? "CONNECTED"
                  : "STANDBY"}
              </span>
            </div>

          </div>

          {/* TARGET ROLE */}

          <div className="mb-6">

            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-2 block">
              Target Career Path
            </label>

            <select
              value={targetRole}
              onChange={(event) =>
                setTargetRole(event.target.value)
              }
              className="w-full bg-slate-950 border border-slate-700 text-indigo-300 text-sm rounded-xl p-3 focus:border-indigo-500 outline-none font-semibold shadow-inner"
            >
              <option value="AI Engineer">
                AI Engineer
              </option>

              <option value="Data Scientist">
                Data Scientist
              </option>

              <option value="MLOps Engineer">
                MLOps Engineer
              </option>
            </select>

          </div>

          {/* READINESS CARD */}

          <div className="mb-6 rounded-2xl border border-indigo-900/50 bg-indigo-950/20 p-4">

            <div className="flex items-center justify-between mb-2">

              <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">
                Career Readiness
              </span>

              <span className="text-xs text-slate-500 font-mono">
                {readiness}/100
              </span>

            </div>

            <div className="text-4xl font-black text-emerald-400 mb-3">
              {readiness}%
            </div>

            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, readiness)
                  )}%`,
                }}
              />

            </div>

            <div className="flex justify-between mt-2 text-[8px] text-slate-500 uppercase">
              <span>Current</span>
              <span>Target</span>
            </div>

          </div>

          {/* METRICS */}

          <div className="grid grid-cols-2 gap-3 mb-6">

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">

              <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                Alignment
              </p>

              <p className="text-2xl font-mono font-bold text-emerald-400">
                {readiness}%
              </p>

            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">

              <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">
                Market Comp
              </p>

              <p className="text-xl font-mono font-bold text-amber-400">
                {formattedMarketValue}
              </p>

            </div>

          </div>

          {/* BOTTLENECK */}

          <button
            onClick={() =>
              bottleneck &&
              inspectSkill(bottleneck)
            }
            className="w-full text-left p-4 bg-indigo-950/30 hover:bg-indigo-950/50 rounded-xl border border-indigo-900/50 mb-6 shadow-inner transition-all"
          >

            <p className="text-[9px] text-indigo-400/80 uppercase tracking-wider mb-1">
              Graph Bottleneck
            </p>

            <p className="text-sm font-semibold text-indigo-200">
              {bottleneck}
            </p>

            <p className="text-[8px] text-slate-500 mt-2">
              Click to inspect capability intelligence
            </p>

          </button>

          {/* DIGITAL TALENT TWIN */}

          <div className="mb-6">

            <div className="flex items-center justify-between mb-2">

              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Digital Talent Twin
              </label>

              <span className="text-[8px] text-indigo-400 font-mono">
                AI PROFILE
              </span>

            </div>

            <textarea
              value={resumeText}
              onChange={(event) =>
                setResumeText(event.target.value)
              }
              placeholder="Paste resume text... e.g. 'I know Python, SQL, AWS, Pandas and Machine Learning'"
              className="w-full h-32 bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none mb-2 shadow-inner"
            />

            <button
              onClick={parseResume}
              disabled={
                isParsing ||
                !resumeText.trim()
              }
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${isParsing ||
                !resumeText.trim()
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                }`}
            >
              {isParsing
                ? "Analyzing Talent Profile..."
                : "Sync Digital Talent Twin"}
            </button>

            {parseMessage && (
              <div className="mt-2 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2">
                <p className="text-[10px] text-emerald-400">
                  ✓ {parseMessage}
                </p>
              </div>
            )}

            {parseError && (
              <div className="mt-2 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2">
                <p className="text-[10px] text-red-400">
                  ✕ {parseError}
                </p>
              </div>
            )}

          </div>

          {/* CAPABILITY COVERAGE */}

          <div className="mb-6">

            <div className="flex items-center justify-between mb-2">

              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Capability Coverage
              </p>

              <span className="text-[10px] text-indigo-400 font-mono">
                {acquiredPercentage}%
              </span>

            </div>

            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">

              <div
                className="h-full bg-indigo-500 transition-all duration-700"
                style={{
                  width: `${acquiredPercentage}%`,
                }}
              />

            </div>

            <div className="grid grid-cols-2 gap-2">

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">

                <p className="text-lg font-bold text-emerald-400">
                  {currentSkills.length}
                </p>

                <p className="text-[8px] uppercase text-slate-500">
                  Acquired
                </p>

              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">

                <p className="text-lg font-bold text-slate-300">
                  {missingSkills.length}
                </p>

                <p className="text-[8px] uppercase text-slate-500">
                  Remaining
                </p>

              </div>

            </div>

          </div>

          {/* CURRENT SKILLS */}

          <div>

            <div className="flex items-center justify-between mb-2">

              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Detected Capabilities
              </p>

              <span className="text-[10px] text-indigo-400 font-mono">
                {currentSkills.length}
              </span>

            </div>

            <div className="flex flex-wrap gap-1.5">

              {currentSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() =>
                    inspectSkill(skill)
                  }
                  className="px-2 py-1 rounded-md bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-900/50 text-[9px] text-emerald-400 font-semibold transition-all"
                >
                  ✓ {skill}
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* RESET */}

        <div className="p-4 border-t border-slate-800 bg-[#0b1120]">

          <button
            onClick={resetTimeline}
            className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 rounded-xl transition-colors text-[10px] uppercase tracking-wider font-bold"
          >
            Reset Career Timeline
          </button>

        </div>

      </aside>

      {/* ===================================================
          MAIN CANVAS
      =================================================== */}

      <main className="flex-1 relative bg-[#05070d]">

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          colorMode="dark"
        >

          {/* BACKGROUND */}

          <Background
            color="#172033"
            gap={22}
            size={1}
          />

          {/* CONTROLS */}

          <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />

          {/* =================================================
              TOP RIGHT STATUS
          ================================================= */}

          <Panel
            position="top-right"
            className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 backdrop-blur-xl m-4 flex flex-col gap-2 pointer-events-none shadow-2xl"
          >

            <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Math Routing
            </div>

            <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Market Intelligence
            </div>

            <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${apiStatus === "online"
                  ? "bg-emerald-500"
                  : apiStatus === "offline"
                    ? "bg-red-500"
                    : "bg-amber-500"
                  }`}
              />
              FastAPI{" "}
              {apiStatus === "online"
                ? "Connected"
                : apiStatus === "offline"
                  ? "Disconnected"
                  : "Checking"}
            </div>

          </Panel>

          {/* =================================================
              TOP SKILL SIMULATOR
          ================================================= */}

          <Panel
            position="top-left"
            className="m-4 mr-6 w-[calc(100%-15rem)] max-w-[1050px] bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl pointer-events-auto"
          >

            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">

              <div>

                <p className="text-[10px] text-indigo-300 uppercase tracking-[0.2em] font-bold">
                  Simulate Upskilling Trajectory
                </p>

                <p className="text-[9px] text-slate-600 mt-1">
                  Acquire capabilities and observe the career graph recalculate in real time.
                </p>

              </div>

              <div className="flex items-center gap-3">

                {isAnalyzing && (
                  <span className="text-[9px] text-amber-400 font-mono animate-pulse">
                    RE-CALCULATING
                  </span>
                )}

                <span className="text-[9px] text-slate-500 font-mono">
                  {currentSkills.length} ACTIVE CAPABILITIES
                </span>

              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              {availableSkills.map((skill) => {

                const acquired =
                  currentSkills.includes(skill);

                return (
                  <button
                    key={skill}
                    onClick={() => {
                      if (acquired) {
                        inspectSkill(skill);
                      } else {
                        acquireSkill(skill);
                      }
                    }}
                    className={`px-3 py-2 rounded-full text-[10px] font-bold transition-all border ${acquired
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                      : "bg-slate-800 hover:bg-indigo-900/50 text-slate-300 border-slate-700 hover:border-indigo-500 hover:text-white"
                      }`}
                  >
                    {acquired
                      ? `✓ ${skill}`
                      : `+ ${skill}`}
                  </button>
                );

              })}

            </div>

          </Panel>

          {/* =================================================
              CENTER HUD
          ================================================= */}

          <Panel
            position="bottom-left"
            className="m-4 pointer-events-none"
          >

            <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-xl px-4 py-3">

              <div className="text-[8px] uppercase tracking-widest text-slate-600 mb-1">
                Active Target
              </div>

              <div className="text-xs font-bold text-indigo-300">
                {targetRole}
              </div>

              <div className="mt-2 text-[8px] text-slate-500">
                Click any graph node for intelligence
              </div>

            </div>

          </Panel>

        </ReactFlow>

        {/* =================================================
            CAREER INTELLIGENCE OVERLAY
        ================================================= */}

        {showIntelligence &&
          selectedSkill &&
          selectedSkillMeta && (
            <div className="absolute right-5 top-24 w-[360px] max-h-[calc(100vh-150px)] overflow-y-auto z-30">

              <div className="rounded-2xl border border-indigo-500/30 bg-[#0b1120]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(79,70,229,0.15)]">

                {/* HEADER */}

                <div className="p-5 border-b border-slate-800">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-[8px] uppercase tracking-[0.2em] text-indigo-400 mb-2">
                        Skill Intelligence
                      </p>

                      <h2 className="text-xl font-black text-white">
                        {selectedSkill}
                      </h2>

                      <p className="text-[9px] text-slate-500 mt-1">
                        {selectedSkillMeta.category}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        setShowIntelligence(false)
                      }
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      ×
                    </button>

                  </div>

                </div>

                {/* SCORES */}

                <div className="p-5 space-y-4">

                  {/* IMPORTANCE */}

                  <div>

                    <div className="flex justify-between mb-1">

                      <span className="text-[9px] uppercase tracking-wider text-slate-500">
                        Career Importance
                      </span>

                      <span className="text-[10px] text-indigo-300 font-mono">
                        {selectedSkillMeta.importance}%
                      </span>

                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${selectedSkillMeta.importance}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* DEMAND */}

                  <div>

                    <div className="flex justify-between mb-1">

                      <span className="text-[9px] uppercase tracking-wider text-slate-500">
                        Market Demand
                      </span>

                      <span className="text-[10px] text-amber-300 font-mono">
                        {selectedSkillMeta.demand}%
                      </span>

                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{
                          width: `${selectedSkillMeta.demand}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* DIFFICULTY */}

                  <div>

                    <div className="flex justify-between mb-1">

                      <span className="text-[9px] uppercase tracking-wider text-slate-500">
                        Learning Difficulty
                      </span>

                      <span className="text-[10px] text-rose-300 font-mono">
                        {selectedSkillMeta.difficulty}%
                      </span>

                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-rose-400 rounded-full"
                        style={{
                          width: `${selectedSkillMeta.difficulty}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">

                    <p className="text-[9px] uppercase tracking-wider text-indigo-400 mb-2">
                      Capability Brief
                    </p>

                    <p className="text-xs leading-5 text-slate-300">
                      {selectedSkillMeta.description}
                    </p>

                  </div>

                  {/* LEARNING TIME */}

                  <div className="grid grid-cols-2 gap-3">

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">

                      <p className="text-[8px] uppercase text-slate-600">
                        Estimated Learning
                      </p>

                      <p className="text-xs font-bold text-white mt-1">
                        {selectedSkillMeta.learningTime}
                      </p>

                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">

                      <p className="text-[8px] uppercase text-slate-600">
                        Current Status
                      </p>

                      <p
                        className={`text-xs font-bold mt-1 ${currentSkills.includes(
                          selectedSkill
                        )
                          ? "text-emerald-400"
                          : "text-amber-400"
                          }`}
                      >
                        {currentSkills.includes(
                          selectedSkill
                        )
                          ? "ACQUIRED"
                          : "GAP"}
                      </p>

                    </div>

                  </div>

                  {/* PREREQUISITES */}

                  {selectedSkillMeta.prerequisites
                    .length > 0 && (
                      <div>

                        <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-2">
                          Prerequisites
                        </p>

                        <div className="flex flex-wrap gap-1.5">

                          {selectedSkillMeta.prerequisites.map(
                            (skill) => {

                              const hasSkill =
                                currentSkills.includes(
                                  skill
                                );

                              return (
                                <button
                                  key={skill}
                                  onClick={() =>
                                    inspectSkill(
                                      skill
                                    )
                                  }
                                  className={`px-2 py-1 rounded-md text-[9px] border ${hasSkill
                                    ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-400"
                                    : "bg-amber-950/20 border-amber-900/50 text-amber-400"
                                    }`}
                                >
                                  {hasSkill
                                    ? "✓"
                                    : "○"}{" "}
                                  {skill}
                                </button>
                              );

                            }
                          )}

                        </div>

                      </div>
                    )}

                  {/* NEXT SKILLS */}

                  {selectedSkillMeta.nextSkills
                    .length > 0 && (
                      <div>

                        <p className="text-[9px] uppercase tracking-wider text-slate-500 mb-2">
                          Recommended Next Capabilities
                        </p>

                        <div className="space-y-2">

                          {selectedSkillMeta.nextSkills.map(
                            (skill) => (
                              <button
                                key={skill}
                                onClick={() =>
                                  inspectSkill(skill)
                                }
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-indigo-900/30 border border-slate-700 hover:border-indigo-500/50 transition-all"
                              >
                                <span className="text-[10px] text-slate-300">
                                  {skill}
                                </span>

                                <span className="text-indigo-400">
                                  →
                                </span>
                              </button>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  {/* ACTION */}

                  {!currentSkills.includes(
                    selectedSkill
                  ) && (
                      <button
                        onClick={() => {
                          acquireSkill(selectedSkill);
                          setShowIntelligence(false);
                        }}
                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all"
                      >
                        Acquire Capability
                      </button>
                    )}

                </div>

              </div>

            </div>
          )}

        {/* =================================================
            BOTTOM NAVIGATION
        ================================================= */}

        <div className="absolute bottom-4 left-4 right-4 z-20">

          <div className="mx-auto max-w-[1100px] rounded-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-xl shadow-2xl p-2 flex items-center">

            {[
              "Career Simulator",
              "Talent Matcher",
              "Observatory",
              "System DB",
            ].map((section) => (

              <button
                key={section}
                onClick={() =>
                  setActiveSection(section)
                }
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeSection === section
                  ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
              >
                {section}
              </button>

            ))}

            <button
              onClick={resetTimeline}
              className="ml-2 px-5 py-3 rounded-xl text-xs font-bold text-rose-400 border border-rose-900/50 hover:bg-rose-950/40 transition-all"
            >
              Reset
            </button>

          </div>

        </div>

        {/* =================================================
            ACTIVE SECTION INDICATOR
        ================================================= */}

        {activeSection !== "Career Simulator" && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">

            <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/80 backdrop-blur-xl px-8 py-5 text-center shadow-2xl">

              <p className="text-[9px] uppercase tracking-[0.25em] text-indigo-400 mb-2">
                OmniNexus Module
              </p>

              <h2 className="text-lg font-black text-white">
                {activeSection}
              </h2>

              <p className="text-[9px] text-slate-500 mt-2">
                Module ready for expansion
              </p>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}