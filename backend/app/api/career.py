from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.career import GraphRequest, ResumeRequest
from app.services.career_engine import analyze_career_path
from app.services.resume_service import extract_skills_from_resume
from app.services.skill_graph import build_skill_graph, get_skill_gaps

router = APIRouter(prefix="/api/v1", tags=["career"])


@router.get("/admin/users", summary="List registered users")
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).all()
    return {"status": "success", "data": [
        {
            "uuid": user.uuid,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "last_active": user.last_active,
            "password_hash": user.password_hash,
        } for user in users
    ]}


@router.post("/parse-resume", summary="Extract skills from resume text")
def parse_resume(request: ResumeRequest):
    extracted_skills = extract_skills_from_resume(request.resume_text)
    return {"status": "success", "extracted_skills": extracted_skills}


@router.post("/analyze", summary="Analyze a user's skill graph against a target role")
def analyze_path(request: GraphRequest):
    result = analyze_career_path(request.current_skills, request.target_role)
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["message"])

    graph = build_skill_graph()
    shortest_path = result["shortest_path"]
    flow_nodes, flow_edges = [], []
    x_pos = 50

    for idx, node in enumerate(shortest_path):
        is_current = node in request.current_skills
        is_target = node == request.target_role
        bg = "#10b981" if is_current else "#6366f1" if is_target else "#3b82f6"
        status = "CURRENT" if is_current else "TARGET" if is_target else "GAP"
        flow_nodes.append({
            "id": node,
            "position": {"x": x_pos + (idx * 260), "y": 250 + (idx % 2 * 80 - 40)},
            "data": {"label": f"{status}: {node}"},
            "style": {
                "background": bg,
                "color": "white",
                "borderRadius": "8px",
                "padding": "12px",
                "fontWeight": "bold",
                "border": "2px solid white" if is_target else "none",
                "boxShadow": f"0 0 20px {bg}60" if (is_target or is_current) else "none",
            },
        })
        if idx > 0:
            flow_edges.append({
                "id": f"e{shortest_path[idx - 1]}-{node}",
                "source": shortest_path[idx - 1],
                "target": node,
                "animated": not is_target,
                "style": {"stroke": "#94a3b8", "strokeWidth": 2},
            })

    return {
        "status": "success",
        "readiness_score": result["readiness_score"],
        "bottleneck_skill": result["bottleneck_skill"],
        "market_value": result["market_value"],
        "flow_nodes": flow_nodes,
        "flow_edges": flow_edges,
    }
