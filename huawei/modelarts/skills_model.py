"""
huawei/modelarts/skills_model.py
==================================
Skills proficiency assessment using Huawei ModelArts.

Model: Multi-class classifier trained on skill assessment responses.
Maps question answer patterns → proficiency level (beginner/intermediate/advanced/expert).
"""
import logging
from typing import Optional, List
from huawei.modelarts.config import get_inference_url, is_model_deployed
from backend.config.huawei import hw_post

logger = logging.getLogger("arise.modelarts.skills")

PROFICIENCY_BANDS = {
    (0,  39): ("beginner",     False),
    (40, 59): ("intermediate", False),
    (60, 74): ("intermediate", True),
    (75, 89): ("advanced",     True),
    (90, 100):("expert",       True),
}


def score_to_level(score: float) -> tuple:
    """Maps a 0-100 score to (level, passed) tuple."""
    for (lo, hi), (level, passed) in PROFICIENCY_BANDS.items():
        if lo <= score <= hi:
            return level, passed
    return "beginner", False


async def assess_skill(skill_name: str, answers: List[int]) -> dict:
    """
    Scores a skill assessment using ModelArts.
    Falls back to weighted average if model unavailable.
    
    answers: list of 0-3 index values (one per question)
    Returns: {"score": 78, "level": "advanced", "passed": True, "model": "..."}
    """
    if is_model_deployed("skill_assessment"):
        url = get_inference_url("skill_assessment")
        result = await hw_post(url, {"data": {"req_data": [
            {"skill": skill_name, "answers": answers, "answer_count": len(answers)}
        ]}})
        if result:
            pred = result.get("resp_data", [{}])[0]
            score = min(100, max(0, pred.get("proficiency_score", 0)))
            level, passed = score_to_level(score)
            return {"score": score, "level": level, "passed": passed, "model": "huawei_modelarts_skills"}

    # Rules-based fallback
    if not answers:
        return {"score": 0, "level": "beginner", "passed": False, "model": "rules"}
    
    # Higher answer indices = more experienced choices
    avg = sum(answers) / len(answers)
    score = int((avg / 3.0) * 100)
    level, passed = score_to_level(score)
    return {"score": score, "level": level, "passed": passed, "model": "rules_fallback"}


async def recommend_next_skills(current_skills: List[str], career_goal: str) -> List[str]:
    """
    Recommends skills to learn next based on current profile and goal.
    Uses the skills model's knowledge graph component.
    """
    # TODO: implement via ModelArts skills graph endpoint
    # For now return a static recommendations map
    skill_paths = {
        "ui_ux_designer": ["Figma", "Adobe XD", "User Research", "CSS", "Prototyping"],
        "frontend_developer": ["React", "TypeScript", "CSS", "Git", "Node.js"],
        "entrepreneur": ["Financial Planning", "Marketing", "Pitching", "Legal Structure"],
        "freelancer": ["Client Communication", "Project Management", "Invoicing", "Portfolio"],
    }
    goal_key = career_goal.lower().replace(" ", "_")
    path = skill_paths.get(goal_key, [])
    return [s for s in path if s not in current_skills][:5]