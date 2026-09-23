"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Lightbulb,
  MessageSquareText,
  CircleDot,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  Download,
  FileText,
  Filter,
  GitMerge,
  Bookmark,
  BookmarkCheck,
  Network,
  Radar,
  RefreshCw,
  Search,
  Server,
  Sparkles,
  Target,
  Upload,
  X,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8001";

const AVAILABLE_SKILLS = [
  "Python",
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

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  "AI Engineer": [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "PyTorch",
    "LLMs",
    "MLOps",
  ],
  "Data Scientist": [
    "Python",
    "SQL",
    "Data Analysis",
    "Machine Learning",
    "Pandas",
  ],
  "MLOps Engineer": [
    "Python",
    "Docker",
    "Kubernetes",
    "MLOps",
    "CI/CD",
    "Cloud Computing",
    "AWS",
  ],
};

type Candidate = {
  name: string;
  score: number;
  current: string[];
  missing: string[];
  status: string;
  evidence: string;
  evidenceScore: number;
  timeToReady: string;
};

type AnalysisResult = {
  readiness_score?: number;
  bottleneck_skill?: string;
  market_value?: number;
  flow_nodes?: any[];
  flow_edges?: any[];
  status?: string;
};


type SkillIntelligence = {
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  hours: number;
  impact: number;
  dependencies: string[];
  description: string;
  evidence: string[];
  interviewQuestions: string[];
};

const SKILL_INTELLIGENCE: Record<string, SkillIntelligence> = {
  Python: { difficulty: "Foundational", hours: 25, impact: 7, dependencies: [], description: "Core programming capability used across AI, data and automation workflows.", evidence: ["Production scripts", "APIs / automation", "Data-processing projects"], interviewQuestions: ["Explain Python mutability.", "How do you handle exceptions?", "List vs tuple vs set vs dictionary?"] },
  "Machine Learning": { difficulty: "Intermediate", hours: 80, impact: 18, dependencies: ["Python", "Data Analysis"], description: "Predictive modelling capability connecting candidate data skills to production AI workflows.", evidence: ["End-to-end ML project", "Model evaluation report", "Deployed prediction API"], interviewQuestions: ["Explain bias vs variance.", "How do you handle class imbalance?", "When would you choose Random Forest over a linear model?"] },
  "Deep Learning": { difficulty: "Advanced", hours: 100, impact: 15, dependencies: ["Python", "Machine Learning"], description: "Neural-network capability for modern perception, language and representation-learning systems.", evidence: ["Neural-network project", "Training/evaluation pipeline", "Transfer-learning experiment"], interviewQuestions: ["Explain backpropagation.", "What causes vanishing gradients?", "CNN vs Transformer?"] },
  PyTorch: { difficulty: "Intermediate", hours: 55, impact: 11, dependencies: ["Python", "Deep Learning"], description: "Practical framework capability for building, training and evaluating neural models.", evidence: ["Custom PyTorch model", "Training loop", "Experiment tracking"], interviewQuestions: ["What is a tensor?", "Explain the PyTorch training loop.", "What is autograd?"] },
  LLMs: { difficulty: "Advanced", hours: 90, impact: 20, dependencies: ["Python", "Deep Learning"], description: "Large-language-model capability for generative AI products and intelligent agents.", evidence: ["LLM application", "Evaluation harness", "Prompt/model comparison"], interviewQuestions: ["What is tokenization?", "Explain attention.", "How would you evaluate an LLM application?"] },
  RAG: { difficulty: "Advanced", hours: 55, impact: 12, dependencies: ["Python", "LLMs"], description: "Retrieval-augmented generation capability for grounded knowledge applications.", evidence: ["Document Q&A system", "Vector retrieval pipeline", "RAG evaluation"], interviewQuestions: ["Why use RAG?", "How do embeddings work?", "How would you reduce retrieval errors?"] },
  "AI Agents": { difficulty: "Advanced", hours: 70, impact: 16, dependencies: ["Python", "LLMs", "RAG"], description: "Tool-using AI capability for multi-step reasoning and workflow automation.", evidence: ["Tool-using agent", "Agent evaluation", "Guardrailed workflow"], interviewQuestions: ["Agent vs chatbot?", "How do you prevent tool misuse?", "How would you evaluate an agent?"] },
  "Cloud Computing": { difficulty: "Intermediate", hours: 45, impact: 9, dependencies: ["Networking", "Linux"], description: "Infrastructure capability for deploying and scaling software and AI workloads.", evidence: ["Cloud deployment", "Architecture diagram", "Monitoring setup"], interviewQuestions: ["IaaS vs PaaS vs SaaS?", "How would you design a scalable API?", "What is horizontal scaling?"] },
  AWS: { difficulty: "Intermediate", hours: 45, impact: 9, dependencies: ["Cloud Computing"], description: "AWS-specific deployment and infrastructure capability.", evidence: ["Deployed AWS service", "IAM/networking configuration", "Cloud architecture"], interviewQuestions: ["What is IAM?", "EC2 vs Lambda?", "How would you secure an AWS API?"] },
  Docker: { difficulty: "Intermediate", hours: 25, impact: 7, dependencies: ["Linux"], description: "Containerization capability for reproducible application deployment.", evidence: ["Dockerfile", "Containerized API", "Multi-container setup"], interviewQuestions: ["Image vs container?", "What is a Dockerfile?", "Container vs virtual machine?"] },
  Kubernetes: { difficulty: "Advanced", hours: 70, impact: 12, dependencies: ["Docker", "Cloud Computing"], description: "Container orchestration capability for distributed production workloads.", evidence: ["Deployment manifests", "Service/ingress setup", "Autoscaling"], interviewQuestions: ["Pod vs deployment?", "What does a service do?", "How does Kubernetes scale workloads?"] },
  MLOps: { difficulty: "Advanced", hours: 75, impact: 13, dependencies: ["Docker", "CI/CD", "Cloud Computing"], description: "Operational capability for deploying, monitoring and maintaining ML systems.", evidence: ["Model CI/CD", "Model registry", "Drift monitoring"], interviewQuestions: ["What is model drift?", "How do you deploy an ML model?", "What changes in CI/CD for ML?"] },
  "CI/CD": { difficulty: "Intermediate", hours: 30, impact: 8, dependencies: ["Git", "Docker"], description: "Automated software delivery capability for repeatable testing and deployment.", evidence: ["GitHub Actions pipeline", "Automated tests", "Deployment workflow"], interviewQuestions: ["CI vs CD?", "What should a deployment pipeline validate?", "Blue-green vs rolling deployment?"] },
  SQL: { difficulty: "Foundational", hours: 30, impact: 6, dependencies: ["Data Analysis"], description: "Database querying capability for extracting and transforming structured data.", evidence: ["Complex SQL queries", "Schema design", "Analytics dashboard"], interviewQuestions: ["INNER vs LEFT JOIN?", "What is an index?", "Explain normalization."] },
  "Data Analysis": { difficulty: "Intermediate", hours: 45, impact: 8, dependencies: ["Python", "SQL"], description: "Analytical capability for transforming raw data into measurable insights.", evidence: ["EDA notebook", "Dashboard", "Statistical analysis"], interviewQuestions: ["How do you handle missing data?", "Correlation vs causation?", "How do you detect outliers?"] },
  Pandas: { difficulty: "Foundational", hours: 20, impact: 5, dependencies: ["Python"], description: "Tabular data manipulation capability for analysis and ML preparation.", evidence: ["Data-cleaning notebook", "Feature engineering", "ETL workflow"], interviewQuestions: ["loc vs iloc?", "How do you handle missing values?", "How do you optimize a large dataframe workflow?"] },
};

const DEFAULT_SKILL_INTELLIGENCE: SkillIntelligence = {
  difficulty: "Intermediate",
  hours: 40,
  impact: 6,
  dependencies: [],
  description: "Capability metadata is being estimated from the current talent graph.",
  evidence: ["Project evidence", "Assessment result", "Verified work sample"],
  interviewQuestions: ["Explain the core concept.", "Describe a project where you used it.", "How would you validate your implementation?"],
};

export default function RecruiterDashboard() {
  const [role, setRole] = useState("AI Engineer");
  const [roleQuery, setRoleQuery] = useState("AI Engineer");

  const [resumeText, setResumeText] = useState("");
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  const [analyzing, setAnalyzing] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const [filter, setFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");

  const [selectedCandidate, setSelectedCandidate] =
    useState<Candidate | null>(null);

  const [shortlistedNames, setShortlistedNames] = useState<string[]>([]);
  const [recommendationStep, setRecommendationStep] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<
    "matcher" | "skills" | "evidence"
  >("matcher");

  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showSkillIntelligence, setShowSkillIntelligence] = useState(false);
  const [skillSimulation, setSkillSimulation] = useState<string[]>([]);
  const [graphZoom, setGraphZoom] = useState(1);
  const [graphFullscreen, setGraphFullscreen] = useState(false);
  const [recruiterNote, setRecruiterNote] = useState("");

  /*
   * ------------------------------------------------------------
   * BACKEND HEALTH
   * ------------------------------------------------------------
   */

  const checkBackend = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/health`, {
        method: "GET",
        cache: "no-store",
      });

      setBackendOnline(response.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackend();

    const interval = setInterval(checkBackend, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("omninexus-recruiter-shortlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setShortlistedNames(parsed);
      }
    } catch { }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "omninexus-recruiter-shortlist",
        JSON.stringify(shortlistedNames)
      );
    } catch { }
  }, [shortlistedNames]);

  /*
   * ------------------------------------------------------------
   * ROLE REQUIREMENTS
   * ------------------------------------------------------------
   */

  const targetRequirements = useMemo(() => {
    return (
      ROLE_REQUIREMENTS[role] || [
        "Python",
        "Machine Learning",
        "SQL",
      ]
    );
  }, [role]);

  /*
   * ------------------------------------------------------------
   * RESUME PARSER
   * ------------------------------------------------------------
   */

  const parseResume = async () => {
    if (!resumeText.trim()) return;

    setParsingResume(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/parse-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_text: resumeText,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        const skills = Array.isArray(data.extracted_skills)
          ? data.extracted_skills
          : [];

        setExtractedSkills(skills);

        /*
         * Automatically run graph analysis after
         * extracting the candidate capabilities.
         */
        await analyzeCandidate(skills);
      } else {
        /*
         * Graceful fallback if the backend returns a different
         * response shape.
         */
        const fallbackSkills = AVAILABLE_SKILLS.filter((skill) =>
          resumeText.toLowerCase().includes(skill.toLowerCase())
        );

        setExtractedSkills(fallbackSkills);

        if (fallbackSkills.length > 0) {
          await analyzeCandidate(fallbackSkills);
        }
      }
    } catch (error) {
      console.error("Resume parsing failed:", error);

      /*
       * Local fallback keeps the UI usable if FastAPI
       * temporarily goes offline.
       */
      const fallbackSkills = AVAILABLE_SKILLS.filter((skill) =>
        resumeText.toLowerCase().includes(skill.toLowerCase())
      );

      setExtractedSkills(fallbackSkills);

      if (fallbackSkills.length > 0) {
        await analyzeCandidate(fallbackSkills);
      }
    } finally {
      setParsingResume(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * REAL GRAPH ANALYSIS
   * ------------------------------------------------------------
   */

  const analyzeCandidate = async (
    skills: string[] = extractedSkills
  ) => {
    setAnalyzing(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_skills:
              skills.length > 0 ? skills : ["Python"],
            target_role: role,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAnalysis(data);
        setBackendOnline(true);
      }
    } catch (error) {
      console.error("Talent analysis failed:", error);
      setBackendOnline(false);

      /*
       * Local calculation so the interface doesn't become
       * unusable if the backend temporarily disconnects.
       */
      const localScore = calculateLocalScore(skills);

      setAnalysis({
        status: "local",
        readiness_score: localScore,
        bottleneck_skill:
          calculateMissingSkills(skills)[0] || "None",
        market_value: calculateMarketValue(skills),
      });
    } finally {
      setTimeout(() => {
        setAnalyzing(false);
      }, 500);
    }
  };

  /*
   * ------------------------------------------------------------
   * LOCAL INTELLIGENCE FALLBACK
   * ------------------------------------------------------------
   */

  const normalizeSkill = (skill: string) =>
    skill.toLowerCase().trim();

  const calculateMissingSkills = (skills: string[]) => {
    return targetRequirements.filter(
      (required) =>
        !skills.some(
          (skill) =>
            normalizeSkill(skill) === normalizeSkill(required)
        )
    );
  };

  const calculateLocalScore = (skills: string[]) => {
    if (!targetRequirements.length) return 0;

    const matched = targetRequirements.filter((required) =>
      skills.some(
        (skill) =>
          normalizeSkill(skill) === normalizeSkill(required)
      )
    );

    return Math.round(
      (matched.length / targetRequirements.length) * 100
    );
  };

  const calculateMarketValue = (skills: string[]) => {
    const base = 55000;
    const bonus = skills.length * 5000;

    return Math.min(base + bonus, 150000);
  };

  /*
   * ------------------------------------------------------------
   * CURRENT SKILL SET
   * ------------------------------------------------------------
   */

  const currentSkills =
    extractedSkills.length > 0
      ? extractedSkills
      : ["Python"];

  const missingSkills = calculateMissingSkills(currentSkills);

  const readiness =
    analysis?.readiness_score ??
    calculateLocalScore(currentSkills);

  const marketValue =
    analysis?.market_value ??
    calculateMarketValue(currentSkills);

  /*
   * ------------------------------------------------------------
   * CANDIDATE MODEL
   * ------------------------------------------------------------
   *
   * Lubhanshu is generated from the actual current skill
   * state instead of having a permanently hard-coded score.
   */

  const candidates: Candidate[] = useMemo(() => {
    const primaryScore = Math.max(
      0,
      Math.min(100, Math.round(readiness))
    );

    const candidateA: Candidate = {
      name: "Lubhanshu Saini",
      score: primaryScore,
      current: currentSkills,
      missing: missingSkills,
      status:
        primaryScore >= 80
          ? "High Graph Proximity"
          : primaryScore >= 50
            ? "Moderate Match"
            : "Upskilling Required",
      evidence: extractedSkills.length
        ? "FastAPI Resume Parser + Skill Graph"
        : "Skill Profile + Career Graph",
      evidenceScore: extractedSkills.length
        ? 92
        : 68,
      timeToReady:
        missingSkills.length === 0
          ? "Ready Now"
          : missingSkills.length <= 2
            ? "Est. 2–6 Weeks"
            : "Est. 2–4 Months",
    };

    const candidateB: Candidate = {
      name: "Candidate B",
      score: Math.max(0, primaryScore - 13),
      current: ["Python", "SQL"],
      missing: ["PyTorch", "Docker"],
      status: "Moderate Match",
      evidence: "Resume Parser",
      evidenceScore: 72,
      timeToReady: "Est. 2.5 Months",
    };

    const candidateC: Candidate = {
      name: "Candidate C",
      score: Math.max(0, primaryScore - 29),
      current: ["Data Analysis"],
      missing: ["Cloud Computing", "PyTorch", "MLOps"],
      status: "Upskilling Required",
      evidence: "Assessment Pending",
      evidenceScore: 42,
      timeToReady: "Est. 6+ Months",
    };

    return [candidateA, candidateB, candidateC];
  }, [
    readiness,
    currentSkills,
    missingSkills,
    extractedSkills.length,
  ]);

  /*
   * ------------------------------------------------------------
   * FILTERED CANDIDATES
   * ------------------------------------------------------------
   */

  const filteredCandidates = candidates.filter((candidate) => {
    if (filter === "high") return candidate.score >= 80;
    if (filter === "medium")
      return candidate.score >= 50 && candidate.score < 80;
    if (filter === "low") return candidate.score < 50;

    return true;
  });

  /*
   * ------------------------------------------------------------
   * SEARCH
   * ------------------------------------------------------------
   */

  const handleSearch = async () => {
    const selectedRole =
      roleQuery.trim() || "AI Engineer";

    setRole(selectedRole);

    await analyzeCandidate(currentSkills);
  };

  /*
   * ------------------------------------------------------------
   * SKILL TOGGLE
   * ------------------------------------------------------------
   */

  const toggleSkill = async (skill: string) => {
    const exists = currentSkills.some(
      (item) =>
        normalizeSkill(item) === normalizeSkill(skill)
    );

    let updatedSkills: string[];

    if (exists) {
      updatedSkills = currentSkills.filter(
        (item) =>
          normalizeSkill(item) !== normalizeSkill(skill)
      );
    } else {
      updatedSkills = [...currentSkills, skill];
    }

    setExtractedSkills(updatedSkills);

    await analyzeCandidate(updatedSkills);
  };

  /*
   * ------------------------------------------------------------
   * RECRUITER ACTIONS
   * ------------------------------------------------------------
   */

  const isShortlisted = (candidate: Candidate) =>
    shortlistedNames.includes(candidate.name);

  const toggleShortlist = (candidate: Candidate) => {
    setShortlistedNames((current) =>
      current.includes(candidate.name)
        ? current.filter((name) => name !== candidate.name)
        : [...current, candidate.name]
    );
  };

  const getRecommendation = (candidate: Candidate) => {
    const gaps = candidate.missing;
    const priority = gaps[0] || "No critical gap";
    return {
      priorityGap: priority,
      downstreamDependencies: Math.max(0, gaps.length - 1),
      rationale: gaps.length
        ? `${priority} is the first structural dependency in the current transition path.`
        : "The candidate already covers the configured role requirements.",
      action: gaps.length
        ? `Build ${priority} first, then validate the next capability in the graph.`
        : "Move to technical validation and interview readiness.",
    };
  };

  const recommendationPath = (candidate: Candidate) =>
    [...candidate.current.slice(0, 1), ...candidate.missing, role].filter(Boolean);

  const exportCandidate = (candidate: Candidate) => {
    const payload = {
      product: "OmniNexus AI Talent Discovery",
      generatedAt: new Date().toISOString(),
      targetRole: role,
      candidate: {
        name: candidate.name,
        alignment: candidate.score,
        status: candidate.status,
        acquiredCapabilities: candidate.current,
        structuralGaps: candidate.missing,
        evidence: candidate.evidence,
        evidenceConfidence: candidate.evidenceScore,
        estimatedTimeToReady: candidate.timeToReady,
        shortlisted: isShortlisted(candidate),
      },
      recommendation: getRecommendation(candidate),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${candidate.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-talent-graph.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const resetRecruiterWorkspace = () => {
    setShortlistedNames([]);
    setSelectedCandidate(null);
    setRecommendationStep(0);
    setSelectedSkill(null);
    setShowSkillIntelligence(false);
    setSkillSimulation([]);
    setGraphZoom(1);
    setGraphFullscreen(false);
    setRecruiterNote("");
    try { window.localStorage.removeItem("omninexus-recruiter-shortlist"); } catch { }
  };


  /*
   * ------------------------------------------------------------
   * ADVANCED TALENT GRAPH INTELLIGENCE
   * ------------------------------------------------------------
   */

  const getSkillIntel = (skill: string) =>
    SKILL_INTELLIGENCE[skill] || DEFAULT_SKILL_INTELLIGENCE;

  const openSkillIntelligence = (skill: string) => {
    setSelectedSkill(skill);
    setShowSkillIntelligence(true);
  };

  const toggleSkillSimulation = (skill: string) => {
    setSkillSimulation((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const simulatedSkills = useMemo(
    () =>
      Array.from(
        new Set([
          ...(selectedCandidate?.current || []),
          ...skillSimulation,
        ])
      ),
    [selectedCandidate, skillSimulation]
  );

  const simulatedMissingSkills = selectedCandidate
    ? targetRequirements.filter(
      (required) =>
        !simulatedSkills.some(
          (skill) => normalizeSkill(skill) === normalizeSkill(required)
        )
    )
    : [];

  const simulatedScore = selectedCandidate
    ? Math.min(
      100,
      Math.round(
        (simulatedSkills.filter((skill) =>
          targetRequirements.some(
            (required) => normalizeSkill(required) === normalizeSkill(skill)
          )
        ).length /
          Math.max(1, targetRequirements.length)) *
        100
      )
    )
    : 0;

  const graphPath = (candidate: Candidate) =>
    Array.from(
      new Set([
        ...candidate.current.slice(0, 3),
        ...candidate.missing,
        role,
      ])
    );

  const exportTalentGraph = (candidate: Candidate) => {
    const payload = {
      product: "OmniNexus AI Talent Discovery",
      generatedAt: new Date().toISOString(),
      targetRole: role,
      candidate: {
        name: candidate.name,
        alignment: candidate.score,
        currentCapabilities: candidate.current,
        structuralGaps: candidate.missing,
        evidence: candidate.evidence,
        evidenceConfidence: candidate.evidenceScore,
        timeToReady: candidate.timeToReady,
      },
      graph: {
        path: graphPath(candidate),
        bottleneck: candidate.missing[0] || "None",
        simulatedSkills,
        simulatedAlignment: simulatedScore,
      },
      recruiterNote,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${candidate.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-omninexus-talent-graph.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const openCandidateGraph = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setRecommendationStep(0);
    setSelectedSkill(null);
    setShowSkillIntelligence(false);
    setSkillSimulation([]);
    setGraphZoom(1);
    setGraphFullscreen(false);
    setRecruiterNote("");
  };

  const closeCandidateGraph = () => {
    setSelectedCandidate(null);
    setSelectedSkill(null);
    setShowSkillIntelligence(false);
    setSkillSimulation([]);
    setGraphZoom(1);
    setGraphFullscreen(false);
  };

  /*
   * ------------------------------------------------------------
   * SCORE COLOR
   * ------------------------------------------------------------
   */


  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const scoreBackground = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  /*
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#050a11] text-slate-300 font-sans pb-28">
      <div className="max-w-[1500px] mx-auto p-5 md:p-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-8">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">

            <div>
              <div className="flex items-center gap-4 mb-4">

                <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.18)]">
                  <BrainCircuit size={26} />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    AI Talent Discovery
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Semantic graph matching • predictive gap analysis
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-wrap gap-3">

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <Network
                  size={15}
                  className="text-indigo-400"
                />

                <span className="text-xs font-bold text-slate-400">
                  840,291 Global Nodes
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span
                  className={`w-2 h-2 rounded-full ${backendOnline
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-rose-400"
                    }`}
                />

                <span className="text-xs font-bold text-slate-400">
                  {backendOnline
                    ? "FastAPI Connected"
                    : "Backend Offline"}
                </span>
              </div>

            </div>
          </div>
        </header>

        {/* =====================================================
            SEARCH / ROLE ENGINE
        ===================================================== */}

        <section className="relative overflow-hidden bg-[#0a111a] border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-2xl">

          <div className="absolute -right-24 -top-24 w-80 h-80 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10">

            <div className="flex items-center justify-between mb-4">

              <div>
                <p className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-black">
                  Semantic Role Engine
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Define the target role and calculate graph proximity.
                </p>
              </div>

              <button
                onClick={checkBackend}
                className="p-2 rounded-lg border border-slate-800 hover:border-slate-600 text-slate-500 hover:text-white transition"
                title="Refresh backend status"
              >
                <RefreshCw size={15} />
              </button>

            </div>

            <div className="flex flex-col lg:flex-row gap-3">

              <div className="flex-1 relative">

                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"
                />

                <input
                  value={roleQuery}
                  onChange={(e) =>
                    setRoleQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="w-full bg-[#050a11] border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white font-semibold focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Describe target role..."
                />

              </div>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setRoleQuery(e.target.value);
                }}
                className="lg:w-56 bg-[#050a11] border border-slate-700 rounded-xl px-4 py-4 text-white font-semibold outline-none focus:border-indigo-500"
              >
                <option>AI Engineer</option>
                <option>Data Scientist</option>
                <option>MLOps Engineer</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${showFilters
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
              >
                <Filter size={17} />
                Filters
              </button>

              <button
                onClick={handleSearch}
                disabled={analyzing}
                className="px-7 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(99,102,241,0.3)] min-w-[190px] transition"
              >
                {analyzing ? (
                  <>
                    <Radar
                      size={19}
                      className="animate-spin"
                    />
                    Scanning Graph...
                  </>
                ) : (
                  <>
                    <BrainCircuit size={19} />
                    Match Talent
                  </>
                )}
              </button>

            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2">

                {(
                  [
                    ["all", "All Candidates"],
                    ["high", "80%+ Alignment"],
                    ["medium", "50–79% Alignment"],
                    ["low", "<50% Alignment"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition ${filter === value
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                  >
                    {label}
                  </button>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            TALENT TWIN INPUT
        ===================================================== */}

        <section className="grid xl:grid-cols-[1.4fr_1fr] gap-6 mb-8">

          <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                  <FileText size={19} />
                </div>

                <div>
                  <h2 className="text-sm font-black text-white">
                    Digital Talent Twin
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Parse candidate capabilities from resume text
                  </p>
                </div>

              </div>

              <span className="text-[10px] uppercase font-bold text-slate-600">
                AI Extraction
              </span>

            </div>

            <textarea
              value={resumeText}
              onChange={(e) =>
                setResumeText(e.target.value)
              }
              className="w-full h-32 resize-none bg-[#050a11] border border-slate-800 rounded-xl p-4 text-sm text-slate-300 outline-none focus:border-indigo-500 transition"
              placeholder="Paste resume text here...

Example:
Computer Science student with experience in Python, SQL, Pandas, NumPy, Machine Learning, Data Analysis, AWS, Docker and PyTorch."
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-3">

              <button
                onClick={parseResume}
                disabled={
                  parsingResume ||
                  !resumeText.trim()
                }
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold flex items-center justify-center gap-2 transition"
              >
                {parsingResume ? (
                  <>
                    <Radar
                      size={17}
                      className="animate-spin"
                    />
                    Extracting Skills...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Sync Digital Twin
                  </>
                )}
              </button>

              <label className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-2">
                <Upload size={15} />
                Upload TXT
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const content = await file.text();
                    setResumeText(content);
                  }}
                />
              </label>

              <button
                onClick={() => {
                  setResumeText("");
                  setExtractedSkills([]);
                  setAnalysis(null);
                }}
                className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition"
              >
                Clear
              </button>

            </div>

          </div>

          {/* Skill Profile */}

          <div className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Candidate Capability Matrix
                </p>

                <h2 className="text-lg font-black text-white mt-1">
                  {currentSkills.length} Active Skills
                </h2>
              </div>

              <Code2
                size={21}
                className="text-indigo-400"
              />

            </div>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">

              {AVAILABLE_SKILLS.map((skill) => {
                const active = currentSkills.some(
                  (item) =>
                    normalizeSkill(item) ===
                    normalizeSkill(skill)
                );

                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-2 rounded-lg text-[11px] font-bold border transition ${active
                      ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-400"
                      : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600"
                      }`}
                  >
                    {active ? "✓ " : "+ "}
                    {skill}
                  </button>
                );
              })}

            </div>

          </div>

        </section>

        {/* =====================================================
            ANALYTICS STRIP
        ===================================================== */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-[#0a111a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Alignment
              </span>
              <Target size={16} className="text-emerald-400" />
            </div>

            <p
              className={`text-3xl font-black mt-3 ${scoreColor(
                readiness
              )}`}
            >
              {readiness}%
            </p>

            <div className="h-1.5 bg-slate-900 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full ${scoreBackground(
                  readiness
                )} rounded-full transition-all duration-700`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, readiness)
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-[#0a111a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Skill Gaps
              </span>
              <GitMerge
                size={16}
                className="text-rose-400"
              />
            </div>

            <p className="text-3xl font-black text-white mt-3">
              {missingSkills.length}
            </p>

            <p className="text-[10px] text-slate-600 mt-1">
              Required for {role}
            </p>
          </div>

          <div className="bg-[#0a111a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Market Value
              </span>
              <Activity
                size={16}
                className="text-amber-400"
              />
            </div>

            <p className="text-3xl font-black text-amber-400 mt-3">
              ${(marketValue / 1000).toFixed(1)}k
            </p>

            <p className="text-[10px] text-slate-600 mt-1">
              Current graph estimate
            </p>
          </div>

          <div className="bg-[#0a111a] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Bottleneck
              </span>
              <AlertTriangle
                size={16}
                className="text-indigo-400"
              />
            </div>

            <p className="text-lg font-black text-indigo-300 mt-4 truncate">
              {analysis?.bottleneck_skill ||
                missingSkills[0] ||
                "None"}
            </p>

            <p className="text-[10px] text-slate-600 mt-1">
              Highest structural gap
            </p>
          </div>

        </section>

        {/* =====================================================
            VIEW SWITCHER
        ===================================================== */}

        <div className="flex flex-wrap gap-2 mb-5">

          {[
            ["matcher", "Talent Matches", Network],
            ["skills", "Skill Intelligence", GitMerge],
            ["evidence", "Evidence Engine", Database],
          ].map(([value, label, Icon]: any) => (
            <button
              key={value}
              onClick={() =>
                setActiveView(value)
              }
              className={`px-4 py-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition ${activeView === value
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}

        </div>

        {/* =====================================================
            SKILL INTELLIGENCE VIEW
        ===================================================== */}

        {activeView === "skills" && (
          <section className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 mb-8">

            <div className="flex items-center gap-3 mb-6">
              <GitMerge
                size={20}
                className="text-indigo-400"
              />

              <div>
                <h2 className="font-black text-white">
                  Skill Gap Intelligence
                </h2>

                <p className="text-xs text-slate-500">
                  Current capabilities compared with the target role.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">

              {targetRequirements.map((skill) => {
                const acquired = currentSkills.some(
                  (item) =>
                    normalizeSkill(item) ===
                    normalizeSkill(skill)
                );

                return (
                  <div
                    key={skill}
                    className="p-4 bg-[#050a11] border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">

                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${acquired
                          ? "bg-emerald-950/50 text-emerald-400"
                          : "bg-rose-950/50 text-rose-400"
                          }`}
                      >
                        {acquired ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <AlertTriangle size={17} />
                        )}
                      </div>

                      <span className="text-sm font-bold text-slate-300">
                        {skill}
                      </span>

                    </div>

                    <span
                      className={`text-[10px] uppercase font-black ${acquired
                        ? "text-emerald-400"
                        : "text-rose-400"
                        }`}
                    >
                      {acquired
                        ? "Acquired"
                        : "Gap"}
                    </span>

                  </div>
                );
              })}

            </div>
          </section>
        )}

        {/* =====================================================
            EVIDENCE VIEW
        ===================================================== */}

        {activeView === "evidence" && (
          <section className="bg-[#0a111a] border border-slate-800 rounded-2xl p-6 mb-8">

            <div className="flex items-center gap-3 mb-6">
              <Database
                size={20}
                className="text-indigo-400"
              />

              <div>
                <h2 className="font-black text-white">
                  Evidence Engine
                </h2>

                <p className="text-xs text-slate-500">
                  Signals currently supporting the talent profile.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

              {[
                {
                  label: "Resume Signal",
                  value:
                    extractedSkills.length > 0
                      ? "Verified"
                      : "Not Synced",
                  score:
                    extractedSkills.length > 0
                      ? 92
                      : 35,
                },
                {
                  label: "Skill Graph",
                  value: "Active",
                  score: 86,
                },
                {
                  label: "Market Signal",
                  value: "Connected",
                  score: 78,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#050a11] border border-slate-800 rounded-xl p-5"
                >
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    {item.label}
                  </p>

                  <p className="text-lg font-black text-white mt-2">
                    {item.value}
                  </p>

                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${item.score}%`,
                      }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-600 mt-2">
                    Confidence {item.score}%
                  </p>
                </div>
              ))}

            </div>
          </section>
        )}

        {/* =====================================================
            TALENT MATCH RESULTS
        ===================================================== */}

        {activeView === "matcher" && (
          <section>

            <div className="flex items-center justify-between px-2 mb-4">

              <div>
                <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest">
                  Talent Matches
                </h2>

                <p className="text-[11px] text-slate-600 mt-1">
                  Target role: {role}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase mr-2">Graph Proximity</span>
                <button
                  onClick={() => {
                    const candidate = candidates.find(isShortlisted) || candidates[0];
                    if (candidate) exportCandidate(candidate);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-400 hover:text-white transition flex items-center gap-1.5"
                >
                  <Download size={12} /> Export
                </button>
                <div className="px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-[10px] font-black text-indigo-300 flex items-center gap-1.5">
                  <Users size={12} /> {shortlistedNames.length} shortlisted
                </div>
              </div>

            </div>

            <div className="space-y-4">

              {filteredCandidates.map(
                (candidate, index) => (
                  <div
                    key={`${candidate.name}-${index}`}
                    className={`relative overflow-hidden bg-[#0a111a] border border-slate-800 rounded-2xl p-5 md:p-6 transition-all duration-300 ${analyzing
                      ? "opacity-50 blur-[1px]"
                      : "hover:border-slate-600"
                      }`}
                  >

                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${candidate.score >= 80
                        ? "bg-emerald-500"
                        : candidate.score >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500"
                        }`}
                    />

                    <div className="grid xl:grid-cols-[260px_1fr_150px] gap-6">

                      {/* Candidate */}

                      <div>

                        <div className="flex items-center gap-3">

                          <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sm font-black text-slate-300">
                            {candidate.name
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <h3 className="font-black text-white">
                              {candidate.name}
                            </h3>

                            <span
                              className={`inline-block mt-1 text-[9px] uppercase font-black tracking-wider ${candidate.score >= 80
                                ? "text-emerald-400"
                                : candidate.score >=
                                  50
                                  ? "text-amber-400"
                                  : "text-rose-400"
                                }`}
                            >
                              {candidate.status}
                            </span>
                          </div>

                        </div>

                        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 size={13} />
                          {candidate.timeToReady}
                        </div>

                      </div>

                      {/* Intelligence */}

                      <div className="grid md:grid-cols-3 gap-5">

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2 flex items-center gap-1">
                            <CheckCircle2
                              size={12}
                              className="text-emerald-400"
                            />
                            Acquired
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {candidate.current.map(
                              (skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2 flex items-center gap-1">
                            <GitMerge
                              size={12}
                              className="text-rose-400"
                            />
                            Structural Gap
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {candidate.missing.length >
                              0 ? (
                              candidate.missing.map(
                                (skill) => (
                                  <span
                                    key={skill}
                                    className="px-2 py-1 rounded bg-rose-950/30 border border-rose-900/50 text-[10px] font-bold text-rose-300"
                                  >
                                    {skill}
                                  </span>
                                )
                              )
                            ) : (
                              <span className="text-xs text-emerald-400 font-bold">
                                No critical gaps
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2 flex items-center gap-1">
                            <Code2
                              size={12}
                              className="text-indigo-400"
                            />
                            Evidence
                          </p>

                          <p className="text-[10px] font-bold text-slate-400 mb-2">
                            {candidate.evidence}
                          </p>

                          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${candidate.evidenceScore}%`,
                              }}
                            />
                          </div>

                          <p className="text-[9px] text-slate-600 mt-1">
                            Confidence{" "}
                            {candidate.evidenceScore}%
                          </p>
                        </div>

                      </div>

                      {/* Score */}

                      <div className="border-t xl:border-t-0 xl:border-l border-slate-800 pt-5 xl:pt-0 xl:pl-6 flex xl:flex-col justify-between xl:items-end">

                        <div>
                          <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black">
                            Alignment
                          </p>

                          <p
                            className={`text-4xl font-black tracking-tight mt-1 ${scoreColor(
                              candidate.score
                            )}`}
                          >
                            {candidate.score}%
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 mt-3">
                          <button
                            onClick={() => openCandidateGraph(candidate)}
                            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
                          >
                            View Graph
                            <ChevronRight size={14} />
                          </button>
                          <button
                            onClick={() => toggleShortlist(candidate)}
                            className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition ${isShortlisted(candidate) ? "bg-indigo-950/60 border-indigo-700/60 text-indigo-300" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600"}`}
                          >
                            {isShortlisted(candidate) ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
                            {isShortlisted(candidate) ? "Shortlisted" : "Shortlist"}
                          </button>
                        </div>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* =====================================================
            EMPTY FILTER RESULT
        ===================================================== */}

        {filteredCandidates.length === 0 && (
          <div className="py-20 text-center bg-[#0a111a] border border-slate-800 rounded-2xl">
            <Search
              size={30}
              className="mx-auto text-slate-700"
            />

            <p className="text-sm font-bold text-slate-500 mt-4">
              No candidates match this filter.
            </p>
          </div>
        )}

      </div>

      {/* =======================================================
          ADVANCED TALENT GRAPH MODAL
      ======================================================= */}

      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6"
          onClick={closeCandidateGraph}
        >
          <div
            className={`relative w-full ${graphFullscreen ? "max-w-[1500px]" : "max-w-6xl"} max-h-[94vh] bg-[#070d16] border border-slate-700/80 rounded-2xl shadow-[0_30px_120px_rgba(0,0,0,0.65)] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 md:px-6 py-4 border-b border-slate-800 bg-[#080f19]/95">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-950/70 border border-indigo-700/50 flex items-center justify-center text-indigo-300">
                  <Network size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.22em] text-indigo-400 font-black">
                    Talent Graph / Candidate Intelligence
                  </p>
                  <h2 className="text-lg md:text-xl font-black text-white truncate">
                    {selectedCandidate.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setGraphFullscreen((value) => !value)}
                  className="hidden sm:flex w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white items-center justify-center transition"
                  title={graphFullscreen ? "Exit fullscreen" : "Expand graph"}
                >
                  {graphFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  onClick={closeCandidateGraph}
                  className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white flex items-center justify-center transition"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 max-h-[calc(94vh-72px)] overflow-y-auto">
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                <div className="bg-[#050a11] border border-slate-800 rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">Alignment</p>
                  <p className={`text-3xl font-black mt-2 ${scoreColor(selectedCandidate.score)}`}>{selectedCandidate.score}%</p>
                </div>
                <div className="bg-[#050a11] border border-slate-800 rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">Target</p>
                  <p className="text-sm font-black text-indigo-300 mt-3 truncate">{role}</p>
                </div>
                <div className="bg-[#050a11] border border-slate-800 rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">Time to Ready</p>
                  <p className="text-xs font-black text-emerald-400 mt-3">{selectedCandidate.timeToReady}</p>
                </div>
                <div className="bg-[#050a11] border border-slate-800 rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">Evidence</p>
                  <p className="text-2xl font-black text-indigo-300 mt-2">{selectedCandidate.evidenceScore}%</p>
                </div>
                <div className="bg-[#050a11] border border-slate-800 rounded-xl p-4 col-span-2 xl:col-span-1">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">What-if Alignment</p>
                  <p className={`text-2xl font-black mt-2 ${scoreColor(simulatedScore)}`}>{simulatedScore}%</p>
                  <p className="text-[9px] text-slate-600 mt-1">+{Math.max(0, simulatedScore - selectedCandidate.score)} projected</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-6 mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-400 font-black">Capability Transition Graph</p>
                  <p className="text-[9px] text-slate-600 mt-1">Current capabilities → structural gaps → target role. Click nodes for intelligence.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setGraphZoom((v) => Math.max(0.75, Number((v - 0.1).toFixed(1))))} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white flex items-center justify-center"><Minus size={13} /></button>
                  <span className="min-w-[48px] text-center text-[9px] text-slate-500 font-mono">{Math.round(graphZoom * 100)}%</span>
                  <button onClick={() => setGraphZoom((v) => Math.min(1.4, Number((v + 0.1).toFixed(1))))} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white flex items-center justify-center"><Plus size={13} /></button>
                  <button onClick={() => setGraphZoom(1)} className="px-2.5 h-8 rounded-lg bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-500 hover:text-white">Reset</button>
                </div>
              </div>

              <div className="relative h-[320px] md:h-[360px] bg-[#040910] border border-slate-800 rounded-xl overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.025)_1px,transparent_1px)] [background-size:48px_48px]" />
                <div className="relative h-full flex items-center justify-center p-4 md:p-8 transition-transform duration-300 origin-center" style={{ transform: `scale(${graphZoom})` }}>
                  <div className="w-full grid grid-cols-[0.9fr_1.5fr_0.9fr] gap-4 md:gap-8 items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-3"><CircleDot size={12} className="text-emerald-400" /><p className="text-[9px] uppercase tracking-widest text-emerald-400 font-black">Current capabilities</p></div>
                      <div className="space-y-2">
                        {selectedCandidate.current.slice(0, 5).map((skill) => (
                          <button key={skill} onClick={() => openSkillIntelligence(skill)} className={`w-full px-3 py-2.5 rounded-lg border text-center text-[10px] md:text-[11px] font-black transition ${selectedSkill === skill ? "bg-emerald-500/20 border-emerald-400 text-white" : "bg-emerald-950/40 border-emerald-800/60 text-emerald-200 hover:border-emerald-500/70"}`}>
                            ✓ {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-[-24px] right-[-24px] top-1/2 h-px bg-gradient-to-r from-emerald-500/60 via-indigo-500/70 to-purple-500/70" />
                      <div className="relative flex items-center gap-2 mb-3 justify-center"><GitMerge size={12} className="text-indigo-300" /><p className="text-[9px] uppercase tracking-widest text-indigo-300 font-black">Structural gaps</p></div>
                      <div className="relative space-y-2">
                        {selectedCandidate.missing.length ? selectedCandidate.missing.map((skill, index) => (
                          <button key={skill} onClick={() => openSkillIntelligence(skill)} className={`w-full px-3 py-2 rounded-lg border text-center text-[10px] md:text-[11px] font-black transition ${selectedSkill === skill ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_25px_rgba(99,102,241,0.25)]" : index === 0 ? "bg-blue-950/80 border-indigo-600/70 text-white" : "bg-slate-950/90 border-slate-800 text-slate-300 hover:border-indigo-700"}`}>
                            {index === 0 ? "↳ " : "• "}{skill}
                          </button>
                        )) : (
                          <div className="px-3 py-5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-center text-xs font-black text-emerald-300">No structural gaps</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3"><Target size={12} className="text-purple-300" /><p className="text-[9px] uppercase tracking-widest text-purple-300 font-black">Target</p></div>
                      <div className="px-4 py-8 rounded-xl bg-purple-950/60 border border-purple-700/60 text-center shadow-[0_0_30px_rgba(168,85,247,0.12)]">
                        <Target size={22} className="mx-auto text-purple-300 mb-2" />
                        <p className="text-sm font-black text-white">{role}</p>
                        <p className="text-[8px] uppercase tracking-widest text-purple-400 mt-1">Target role</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[8px] font-bold text-slate-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Acquired</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Gap</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Target</span>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mt-4">
                <div className="bg-[#050a11] border border-emerald-900/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3"><p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">Acquired capabilities</p><CheckCircle2 size={15} className="text-emerald-400" /></div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.current.map((skill) => <button key={skill} onClick={() => openSkillIntelligence(skill)} className="px-2.5 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-[10px] font-bold text-emerald-300 hover:border-emerald-500/50 transition">✓ {skill}</button>)}
                  </div>
                </div>
                <div className="bg-[#050a11] border border-rose-900/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3"><p className="text-[10px] uppercase tracking-widest text-rose-400 font-black">Missing capabilities</p><AlertTriangle size={15} className="text-rose-400" /></div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.missing.length ? selectedCandidate.missing.map((skill) => <button key={skill} onClick={() => openSkillIntelligence(skill)} className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 border border-rose-900/50 text-[10px] font-bold text-rose-300 hover:border-rose-500/50 transition">! {skill}</button>) : <span className="text-xs font-bold text-emerald-400">No critical gaps detected.</span>}
                  </div>
                </div>
              </div>

              {showSkillIntelligence && selectedSkill && (() => {
                const intel = getSkillIntel(selectedSkill);
                return (
                  <div className="mt-4 bg-[#0a111a] border border-indigo-900/50 rounded-xl p-5">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2"><Lightbulb size={16} className="text-indigo-400" /><p className="text-[10px] uppercase tracking-[0.18em] text-indigo-400 font-black">Capability Intelligence</p></div>
                        <h3 className="text-xl font-black text-white mt-2">{selectedSkill}</h3>
                        <p className="text-xs text-slate-500 mt-2 max-w-3xl">{intel.description}</p>
                      </div>
                      <button onClick={() => setShowSkillIntelligence(false)} className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 hover:text-white flex items-center justify-center"><X size={14} /></button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                      <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Difficulty</p><p className="text-xs font-black text-white mt-2">{intel.difficulty}</p></div>
                      <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Learning Hours</p><p className="text-xs font-black text-indigo-300 mt-2">{intel.hours}h</p></div>
                      <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Dependencies</p><p className="text-xs font-black text-white mt-2">{intel.dependencies.length}</p></div>
                      <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Role Impact</p><p className="text-xs font-black text-emerald-400 mt-2">+{intel.impact}%</p></div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-4 mt-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2">Dependencies</p>
                        <div className="flex flex-wrap gap-2">
                          {intel.dependencies.length ? intel.dependencies.map((dependency) => <button key={dependency} onClick={() => openSkillIntelligence(dependency)} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300 hover:border-indigo-700">{dependency}</button>) : <span className="text-[10px] text-slate-600">No prerequisite recorded.</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2">Evidence to request</p>
                        <div className="space-y-2">{intel.evidence.map((item) => <div key={item} className="flex items-center gap-2 text-[10px] text-slate-300"><ShieldCheck size={12} className="text-emerald-400 shrink-0" />{item}</div>)}</div>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2">Interview intelligence</p>
                        <div className="space-y-2">{intel.interviewQuestions.map((question, index) => <div key={question} className="flex gap-2 text-[10px] text-slate-300"><span className="text-indigo-400 font-black">0{index + 1}</span><span>{question}</span></div>)}</div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-indigo-900/40 bg-indigo-950/15 p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div><p className="text-xs font-black text-white">What-if skill simulation</p><p className="text-[10px] text-slate-600 mt-1">Simulate this capability without modifying the actual profile.</p></div>
                        <button onClick={() => toggleSkillSimulation(selectedSkill)} className={`px-4 py-2 rounded-lg text-[10px] font-black border transition ${skillSimulation.includes(selectedSkill) ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500"}`}>
                          {skillSimulation.includes(selectedSkill) ? "Simulated ✓" : "Simulate Capability"}
                        </button>
                      </div>
                      {skillSimulation.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{skillSimulation.map((skill) => <span key={skill} className="px-2.5 py-1 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-[9px] font-bold text-emerald-300">+ {skill}</span>)}</div>}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Projected alignment</p><p className={`text-xl font-black mt-1 ${scoreColor(simulatedScore)}`}>{simulatedScore}%</p></div>
                        <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Remaining gaps</p><p className="text-xl font-black text-white mt-1">{simulatedMissingSkills.length}</p></div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="mt-4 bg-[#0a111a] border border-indigo-900/40 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div><div className="flex items-center gap-2"><Sparkles size={16} className="text-indigo-400" /><p className="text-sm font-black text-white">Recruiter Recommendation Engine</p></div><p className="text-[10px] text-slate-600 mt-1">Graph-derived next action and transition sequence.</p></div>
                  <div className="px-3 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-800/50 text-[9px] font-black uppercase tracking-wider text-indigo-300">Priority {selectedCandidate.missing.length ? "HIGH" : "VALIDATE"}</div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 mt-4">
                  <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Priority gap</p><p className="text-sm font-black text-white mt-2">{getRecommendation(selectedCandidate).priorityGap}</p></div>
                  <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Downstream dependencies</p><p className="text-sm font-black text-indigo-300 mt-2">{getRecommendation(selectedCandidate).downstreamDependencies}</p></div>
                  <div className="bg-[#050a11] border border-slate-800 rounded-lg p-3"><p className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Recommended action</p><p className="text-[10px] font-bold text-slate-300 mt-2 leading-relaxed">{getRecommendation(selectedCandidate).action}</p></div>
                </div>

                <div className="mt-4">
                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-black mb-2">Projected transition path</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {graphPath(selectedCandidate).map((step, index, arr) => (
                      <div key={`${step}-${index}`} className="flex items-center gap-2">
                        <button onClick={() => step !== role && openSkillIntelligence(step)} className={`px-3 py-2 rounded-lg border text-[10px] font-black ${index === arr.length - 1 ? "bg-purple-950/50 border-purple-800/60 text-purple-200" : selectedCandidate.current.some((skill) => normalizeSkill(skill) === normalizeSkill(step)) ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300" : "bg-blue-950/40 border-blue-800/50 text-blue-200"}`}>{step}</button>
                        {index < arr.length - 1 && <ArrowRight size={13} className="text-slate-700" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCandidate.missing.map((skill, index) => <button key={skill} onClick={() => { setRecommendationStep(index); openSkillIntelligence(skill); }} className={`px-3 py-2 rounded-lg text-[9px] font-black border transition ${recommendationStep === index ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"}`}>{index + 1}. {skill}</button>)}
                </div>
              </div>

              <div className="mt-4 bg-[#050a11] border border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3"><MessageSquareText size={15} className="text-indigo-400" /><div><p className="text-xs font-black text-white">Recruiter Decision Notes</p><p className="text-[9px] text-slate-600 mt-0.5">Saved locally in this browser session.</p></div></div>
                <textarea value={recruiterNote} onChange={(e) => setRecruiterNote(e.target.value)} placeholder="Add private notes about evidence, interview follow-up, role fit or next action..." className="w-full min-h-[88px] resize-none rounded-xl bg-[#080e17] border border-slate-800 p-3 text-xs text-slate-300 placeholder:text-slate-700 outline-none focus:border-indigo-500/60" />
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-5 pt-4 border-t border-slate-800">
                <button onClick={() => exportTalentGraph(selectedCandidate)} className="px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-black text-slate-300 hover:text-white flex items-center gap-2 transition"><Download size={14} /> Export Intelligence</button>
                <button onClick={() => toggleShortlist(selectedCandidate)} className={`px-4 py-2.5 rounded-lg text-xs font-black flex items-center gap-2 transition ${isShortlisted(selectedCandidate) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                  {isShortlisted(selectedCandidate) ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  {isShortlisted(selectedCandidate) ? "Shortlisted" : "Shortlist Candidate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1500px] mx-auto px-5 md:px-8 pb-6 flex justify-center">
        <button onClick={resetRecruiterWorkspace} className="px-5 py-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-[10px] font-black uppercase tracking-wider text-rose-400 hover:bg-rose-950/60 transition">Reset Recruiter Workspace</button>
      </div>

      {/* =======================================================
          BOTTOM SYSTEM BAR
      ======================================================= */}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-5xl">

        <div className="bg-[#0b1422]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 flex items-center justify-between gap-2">

          <button
            onClick={() =>
              (window.location.href = "/")
            }
            className="px-5 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-white transition"
          >
            Career Simulator
          </button>

          <button
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          >
            Talent Matcher
          </button>

          <button
            onClick={() =>
              (window.location.href = "/observatory")
            }
            className="px-5 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-white transition hidden sm:block"
          >
            Observatory
          </button>

          <button
            onClick={() =>
              (window.location.href = "/database")
            }
            className="px-5 py-3 rounded-xl text-xs font-black text-slate-500 hover:text-white transition hidden sm:block"
          >
            System DB
          </button>

          <div className="hidden md:flex items-center gap-2 px-4 text-[10px] font-bold text-slate-600">
            <Server size={13} />
            {backendOnline
              ? "SYSTEM ONLINE"
              : "OFFLINE"}
          </div>

        </div>

      </div>
    </div>
  );
}