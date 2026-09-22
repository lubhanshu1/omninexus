from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import networkx as nx
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import uuid

# --- DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./omninexus.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="Talent Node")
    status = Column(String, default="Active")
    last_active = Column(String, default="Just now")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- APP INITIALIZATION ---
app = FastAPI(title="OmniNexus Intelligence API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class LoginRequest(BaseModel):
    email: str
    password: str

class GraphRequest(BaseModel):
    current_skills: list[str]
    target_role: str

class ResumeRequest(BaseModel):
    resume_text: str

# --- GRAPH ENGINE ---
G = nx.DiGraph()
nodes = {
    "Python": {"val": 5000}, "SQL": {"val": 4000}, "Git": {"val": 2000},
    "Data Analysis": {"val": 6000}, "Machine Learning": {"val": 12000}, 
    "Deep Learning": {"val": 15000}, "PyTorch": {"val": 18000}, 
    "LLMs": {"val": 25000}, "RAG": {"val": 22000}, "AI Agents": {"val": 28000},
    "Cloud Computing": {"val": 10000}, "AWS": {"val": 12000}, 
    "Docker": {"val": 11000}, "Kubernetes": {"val": 15000}, 
    "MLOps": {"val": 20000}, "CI/CD": {"val": 9000},
    "AI Engineer": {"val": 0}, "Data Scientist": {"val": 0}, "MLOps Engineer": {"val": 0}
}
G.add_nodes_from([(n, attr) for n, attr in nodes.items()])
edges = [
    ("Python", "Data Analysis"), ("SQL", "Data Analysis"), ("Data Analysis", "Machine Learning"),
    ("Python", "Machine Learning"), ("Machine Learning", "Deep Learning"), 
    ("Deep Learning", "PyTorch"), ("PyTorch", "MLOps"), ("MLOps", "AI Engineer"),
    ("PyTorch", "LLMs"), ("LLMs", "RAG"), ("RAG", "AI Agents"), ("AI Agents", "AI Engineer"),
    ("Machine Learning", "Data Scientist"), ("Python", "Cloud Computing"), 
    ("Cloud Computing", "AWS"), ("AWS", "Docker"), ("Docker", "Kubernetes"), 
    ("Kubernetes", "MLOps"), ("CI/CD", "MLOps")
]
G.add_edges_from(edges)

# --- API ENDPOINTS ---
@app.post("/api/v1/auth/signup")
def signup(request: LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(DBUser).filter(DBUser.email == request.email).first()
    if existing:
        return {"status": "error", "message": "Email already registered"}
    
    # Generate a fake bcrypt hash for demo purposes
    fake_hash = f"$2b$12${uuid.uuid4().hex[:20]}..."
    new_user = DBUser(
        uuid=f"usr_{uuid.uuid4().hex[:6]}",
        email=request.email,
        password_hash=fake_hash
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "token": new_user.uuid}

@app.post("/api/v1/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email == request.email).first()
    if not user:
        return {"status": "error", "message": "User not found"}
    return {"status": "success", "token": user.uuid}

@app.get("/api/v1/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    return {"status": "success", "data": users}

@app.post("/api/v1/parse-resume")
def parse_resume(request: ResumeRequest):
    text = request.resume_text.lower()
    extracted = [s for s in nodes.keys() if s.lower() in text]
    return {"status": "success", "extracted_skills": extracted if extracted else ["Python"]}

@app.post("/api/v1/analyze")
def analyze_path(request: GraphRequest):
    target = request.target_role
    current = request.current_skills
    all_paths = []
    for skill in current:
        try:
            paths = list(nx.all_simple_paths(G, source=skill, target=target))
            all_paths.extend(paths)
        except nx.NetworkXNoPath:
            continue
    if not all_paths:
        return {"status": "error"}
    
    shortest_path = min(all_paths, key=len)
    flow_nodes, flow_edges, x_pos = [], [], 50
    
    for idx, node in enumerate(shortest_path):
        is_current = node in current
        is_target = node == target
        bg = "#10b981" if is_current else "#6366f1" if is_target else "#3b82f6"
        status = "CURRENT" if is_current else "TARGET" if is_target else "GAP"
            
        flow_nodes.append({
            "id": node,
            "position": {"x": x_pos + (idx * 260), "y": 250 + (idx % 2 * 80 - 40)},
            "data": {"label": f"{status}: {node}"},
            "style": {
                "background": bg, "color": "white", "borderRadius": "8px", 
                "padding": "12px", "fontWeight": "bold", "border": "2px solid white" if is_target else "none",
                "boxShadow": f"0 0 20px {bg}60" if (is_target or is_current) else "none"
            }
        })
        if idx > 0:
            flow_edges.append({
                "id": f"e{shortest_path[idx-1]}-{node}",
                "source": shortest_path[idx-1], "target": node,
                "animated": not is_target, "style": {"stroke": "#94a3b8", "strokeWidth": 2}
            })

    acquired = [s for s in shortest_path if s in current]
    market_value = 60000 + sum([nodes[s]["val"] for s in current if s in nodes])
    
    return {
        "status": "success", 
        "readiness_score": int((len(acquired) / len(shortest_path)) * 100), 
        "bottleneck_skill": shortest_path[1] if len(shortest_path)>1 else "None", 
        "market_value": market_value,
        "flow_nodes": flow_nodes, "flow_edges": flow_edges
    }
