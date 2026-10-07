from app.services.skill_intelligence import analyze_skills, normalize_skills


def test_normalize_skills():
    assert normalize_skills(["py", "SQL Server", "ML", "python"]) == [
        "Python", "SQL", "Machine Learning"
    ]


def test_skill_analysis_has_source_note():
    result = analyze_skills(["Python", "ML"], "Data Scientist")
    assert result["status"] == "success"
    assert result["market_signals"][0]["known_market_signal"] is True
    assert "hackathon Analytics Jobs sample" in result["source_note"]


def test_role_gap_is_interpretable():
    result = analyze_skills(["Python"], "Data Scientist")
    assert "SQL" in [gap["skill"] for gap in result["skill_gaps"]]
