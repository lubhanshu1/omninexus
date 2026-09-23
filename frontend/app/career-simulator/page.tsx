"use client";

import {
  useCallback,
  useEffect,
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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

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

export default function OmniNexusDashboard() {
  // =========================================================
  // REACT FLOW STATE
  // =========================================================

  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node>([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>([]);

  // =========================================================
  // CAREER / ANALYTICS STATE
  // =========================================================

  const [readiness, setReadiness] = useState(0);

  const [bottleneck, setBottleneck] =
    useState("Analyzing...");

  const [marketValue, setMarketValue] =
    useState(0);

  const [targetRole, setTargetRole] =
    useState("AI Engineer");

  const [currentSkills, setCurrentSkills] =
    useState<string[]>(["Python"]);

  // =========================================================
  // RESUME / DIGITAL TALENT TWIN STATE
  // =========================================================

  const [resumeText, setResumeText] =
    useState("");

  const [isParsing, setIsParsing] =
    useState(false);

  const [parseMessage, setParseMessage] =
    useState("");

  const [parseError, setParseError] =
    useState("");

  // =========================================================
  // API / UI STATE
  // =========================================================

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [apiStatus, setApiStatus] =
    useState<"online" | "offline" | "checking">(
      "checking"
    );

  // =========================================================
  // AVAILABLE SKILLS
  // =========================================================

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

  // =========================================================
  // BACKEND HEALTH CHECK
  // =========================================================

  const checkBackend = useCallback(async () => {
    try {
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

  // =========================================================
  // CAREER GRAPH ANALYSIS
  // =========================================================

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

  // =========================================================
  // INITIAL BACKEND CHECK
  // =========================================================

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // =========================================================
  // RE-CALCULATE GRAPH WHEN SKILLS / ROLE CHANGE
  // =========================================================

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // =========================================================
  // REACT FLOW CONNECTION
  // =========================================================

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((existingEdges) =>
        addEdge(connection, existingEdges)
      );
    },
    [setEdges]
  );

  // =========================================================
  // DIGITAL TALENT TWIN
  // =========================================================

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

        // Merge extracted skills with existing skills.
        // Removes duplicates automatically.
        setCurrentSkills((previousSkills) => {
          return Array.from(
            new Set([
              ...previousSkills,
              ...extractedSkills,
            ])
          );
        });

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

  // =========================================================
  // ADD / ACQUIRE SKILL
  // =========================================================

  const acquireSkill = (skill: string) => {
    if (currentSkills.includes(skill)) {
      return;
    }

    setCurrentSkills((previousSkills) => [
      ...previousSkills,
      skill,
    ]);
  };

  // =========================================================
  // RESET TIMELINE
  // =========================================================

  const resetTimeline = () => {
    setCurrentSkills(["Python"]);

    setParseMessage("");
    setParseError("");
    setResumeText("");
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans flex overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="w-[320px] bg-slate-900 border-r border-slate-800 flex flex-col z-10 shadow-2xl relative">

        <div className="p-6 pb-4 flex-1 overflow-y-auto">

          {/* BRAND */}

          <div className="mb-6">
            <h1 className="text-2xl font-black tracking-wider text-indigo-400 mb-1">
              OMNINEXUS
            </h1>

            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Workforce OS Simulator
            </p>
          </div>

          {/* BACKEND STATUS */}

          <div className="mb-5 flex items-center justify-between">

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
                    : "Checking API"}
              </span>

            </div>

            <span className="text-[9px] text-slate-600 font-mono">
              :8001
            </span>

          </div>

          {/* TARGET ROLE */}

          <div className="mb-6">

            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 block">
              Target Career Path
            </label>

            <select
              value={targetRole}
              onChange={(event) =>
                setTargetRole(event.target.value)
              }
              className="w-full bg-slate-950 border border-slate-700 text-indigo-300 text-sm rounded-lg p-2.5 focus:border-indigo-500 outline-none font-semibold shadow-inner"
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

          {/* METRICS */}

          <div className="grid grid-cols-2 gap-3 mb-6">

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">

              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Alignment
              </p>

              <p className="text-2xl font-mono font-bold text-emerald-400">
                {readiness}%
              </p>

            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">

              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Market Comp
              </p>

              <p className="text-xl font-mono font-bold text-amber-400">
                $
                {(marketValue / 1000).toFixed(1)}
                k
              </p>

            </div>

          </div>

          {/* BOTTLENECK */}

          <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-900/50 mb-6 shadow-inner">

            <p className="text-[10px] text-indigo-400/80 uppercase tracking-wider mb-1">
              Graph Bottleneck (Centrality)
            </p>

            <p className="text-sm font-semibold text-indigo-200">
              {bottleneck}
            </p>

          </div>

          {/* DIGITAL TALENT TWIN */}

          <div className="mb-4">

            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1 block">
              Digital Talent Twin
            </label>

            <textarea
              value={resumeText}
              onChange={(event) =>
                setResumeText(event.target.value)
              }
              placeholder="Paste resume text... e.g. 'I know Python, SQL, AWS, Pandas and Machine Learning'"
              className="w-full h-28 bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none mb-2 shadow-inner"
            />

            <button
              onClick={parseResume}
              disabled={
                isParsing ||
                !resumeText.trim()
              }
              className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)] ${isParsing ||
                !resumeText.trim()
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
            >
              {isParsing
                ? "Extracting..."
                : "Digital Talent Twin Sync"}
            </button>

            {/* SUCCESS MESSAGE */}

            {parseMessage && (
              <div className="mt-2 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2">

                <p className="text-[10px] text-emerald-400 font-medium">
                  ✓ {parseMessage}
                </p>

              </div>
            )}

            {/* ERROR MESSAGE */}

            {parseError && (
              <div className="mt-2 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2">

                <p className="text-[10px] text-red-400 font-medium">
                  ✕ {parseError}
                </p>

              </div>
            )}

          </div>

          {/* CURRENT SKILLS */}

          <div className="mt-5">

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
                <span
                  key={skill}
                  className="px-2 py-1 rounded-md bg-emerald-950/40 border border-emerald-900/50 text-[9px] text-emerald-400 font-semibold"
                >
                  ✓ {skill}
                </span>
              ))}

            </div>

          </div>

        </div>

        {/* RESET */}

        <div className="p-4 border-t border-slate-800 bg-slate-900">

          <button
            onClick={resetTimeline}
            className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 rounded-lg transition-colors text-[10px] uppercase tracking-wider font-bold cursor-pointer"
          >
            Reset Timeline
          </button>

        </div>

      </aside>

      {/* =====================================================
          REACT FLOW CANVAS
      ====================================================== */}

      <main className="flex-1 relative bg-[#0f172a]">

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          colorMode="dark"
        >

          {/* BACKGROUND */}

          <Background
            color="#1e293b"
            gap={20}
            size={1.5}
          />

          {/* CONTROLS */}

          <Controls className="bg-slate-800 border-slate-700 fill-slate-300" />

          {/* TOP RIGHT STATUS */}

          <Panel
            position="top-right"
            className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 backdrop-blur-sm m-4 flex flex-col gap-1 pointer-events-none"
          >

            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

              Live Math Routing

            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />

              Market Intelligence

            </div>

            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">

              <span
                className={`w-1.5 h-1.5 rounded-full ${apiStatus === "online"
                  ? "bg-emerald-500"
                  : "bg-red-500"
                  }`}
              />

              FastAPI {apiStatus === "online"
                ? "Connected"
                : "Disconnected"}

            </div>

          </Panel>

          {/* TOP LEFT SKILL PANEL */}

          <Panel
            position="top-left"
            className="m-4 w-[calc(100%-12rem)] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-2xl pointer-events-auto"
          >

            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">

              <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
                Simulate Upskilling Trajectory
              </p>

              <div className="flex items-center gap-3">

                {isAnalyzing && (
                  <span className="text-[9px] text-amber-400 font-mono animate-pulse">
                    Recalculating...
                  </span>
                )}

                <p className="text-[9px] text-slate-500 font-mono">
                  Click nodes to acquire capability
                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-2 justify-start">

              {availableSkills.map((skill) => {

                const acquired =
                  currentSkills.includes(skill);

                return (
                  <button
                    key={skill}
                    onClick={() =>
                      acquireSkill(skill)
                    }
                    disabled={acquired}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${acquired
                      ? "bg-emerald-950/40 text-emerald-500 border-emerald-900/50 opacity-70 cursor-not-allowed"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-indigo-500 hover:text-white shadow-sm"
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

        </ReactFlow>

      </main>

    </div>
  );
}