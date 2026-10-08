from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.career import GraphRequest, ResumeRequest
from app.services.career_engine import analyze_career_path
from app.services.resume_service import extract_skills_from_resume
from app.services.skill_intelligence import analyze_skills

router = APIRouter(prefix="/api/v1", tags=["career"])


@router.post("/parse-resume", summary="Extract skills from resume text")
def parse_resume(request: ResumeRequest, current_user: User = Depends(get_current_user)):
    extracted_skills = extract_skills_from_resume(request.resume_text)
    return {"status": "success", "extracted_skills": extracted_skills}


@router.post("/parse-resume-file", summary="Extract text from a resume file")
async def parse_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    allowed_types = {
        "text/plain": "text",
        "text/markdown": "text",
        "text/csv": "text",
        "application/json": "text",
        "application/pdf": "pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    }
    filename = (file.filename or "").lower()
    extension = filename.rsplit(".", 1)[-1] if "." in filename else ""
    extension_types = {
        "txt": "text",
        "md": "text",
        "csv": "text",
        "json": "text",
        "pdf": "pdf",
        "docx": "docx",
    }
    kind = extension_types.get(extension) or allowed_types.get(file.content_type or "")
    if kind is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported resume format. Use TXT, MD, CSV, JSON, PDF or DOCX.",
        )

    payload = await file.read()
    if len(payload) > 5_000_000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Resume file must be 5 MB or smaller.",
        )
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume file is empty.",
        )

    try:
        if kind == "text":
            text_content = payload.decode("utf-8-sig")
        elif kind == "pdf":
            from pypdf import PdfReader
            reader = PdfReader(BytesIO(payload))
            text_content = "\n".join(page.extract_text() or "" for page in reader.pages)
        else:
            from docx import Document
            document = Document(BytesIO(payload))
            text_content = "\n".join(paragraph.text for paragraph in document.paragraphs)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract readable text from this resume file.",
        ) from exc

    text_content = text_content.strip()
    if not text_content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No readable text was found in the resume file.",
        )
    if len(text_content) > 20_000:
        text_content = text_content[:20_000]

    return {"status": "success", "filename": file.filename, "resume_text": text_content}


@router.post("/analyze", summary="Analyze a user's skill graph against a target role")
def analyze_path(request: GraphRequest, current_user: User = Depends(get_current_user)):
    result = analyze_career_path(request.current_skills, request.target_role)
    if result.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result["message"])

    shortest_path = result["shortest_path"]
    current_skill_set = set(result.get("current_skills", []))
    flow_nodes, flow_edges = [], []
    x_pos = 50

    for idx, node in enumerate(shortest_path):
        is_current = node in current_skill_set
        is_target = node == shortest_path[-1]
        bg = "#10b981" if is_current else "#6366f1" if is_target else "#3b82f6"
        node_status = "CURRENT" if is_current else "TARGET" if is_target else "GAP"
        flow_nodes.append({
            "id": node,
            "position": {"x": x_pos + (idx * 260), "y": 250 + (idx % 2 * 80 - 40)},
            "data": {"label": f"{node_status}: {node}"},
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

    normalized_skills = result.get("current_skills", [])
    required_skills = [node for node in shortest_path if node != shortest_path[-1]]
    missing_skills = result.get("missing_skills", [])
    acquired_skills = [skill for skill in required_skills if skill not in set(missing_skills)]
    graph_coverage = (
        round((len(acquired_skills) / len(required_skills)) * 100)
        if required_skills
        else 100
    )

    market = analyze_skills(normalized_skills, request.target_role)

    return {
        "status": "success",
        "readiness_score": result["readiness_score"],
        "bottleneck_skill": result["bottleneck_skill"],
        "market_value": result["market_value"],
        "explainability": {
            "target_role": request.target_role.strip(),
            "path_length": len(shortest_path),
            "required_skills": required_skills,
            "acquired_skills": acquired_skills,
            "missing_skills": missing_skills,
            "graph_coverage_percent": graph_coverage,
            "method": "deterministic shortest-path skill graph analysis",
        },
        "flow_nodes": flow_nodes,
        "flow_edges": flow_edges,
        "normalized_skills": market.get("normalized_skills", []),
        "market_opportunity_score": market.get("overall_opportunity_score", 0),
        "market_signals": market.get("market_signals", []),
        "market_skill_gaps": market.get("skill_gaps", []),
        "market_source_note": market.get("source_note", ""),
    }
