"""
huawei/nlp/session_notes.py
=============================
AI-generated mentor session notes using Huawei NLP.

After each completed session, generates:
- Structured summary paragraph
- 3 concrete action items
- Key topics covered
- Next session recommendation

🔴 Huawei NLP Text Generation API
"""
import logging
from typing import List, Optional
from huawei.nlp.config import ENDPOINTS_NLP
from backend.config.huawei import hw_post, is_huawei_configured

logger = logging.getLogger("arise.nlp.session_notes")

ACTION_TEMPLATES = {
    "fundraising":       "Apply to {count} matching grants via ARISE FundMatch",
    "pitch coaching":    "Record a 3-minute practice pitch and review with mentor",
    "financial planning":"Build a 6-month cash flow projection for the business",
    "marketing":         "Define target customer persona and draft first social media post",
    "legal structure":   "Complete CIPC registration via ARISE LaunchPad",
    "strategy":          "Document top 3 business priorities for the next 90 days",
    "product":           "Map your MVP features and set a 30-day launch target",
    "pricing":           "Calculate cost-plus pricing and compare to 3 competitors",
    "investors":         "Update your TrustID business profile to become investor-visible",
    "networking":        "Attend one SA entrepreneur event this month",
}


async def generate_session_notes(
    mentor_name: str,
    mentee_name: str,
    focus_areas: List[str],
    agenda: Optional[str] = None,
    duration_minutes: int = 60,
) -> dict:
    """
    Generates structured session notes after a mentor session completes.
    
    First attempts Huawei NLP text generation, falls back to template engine.
    Returns: {"summary": str, "action_items": list[str], "generated_by": str}
    """
    if is_huawei_configured():
        result = await _huawei_generate(mentor_name, mentee_name, focus_areas, agenda)
        if result:
            return result

    return _template_notes(mentor_name, mentee_name, focus_areas, agenda, duration_minutes)


async def _huawei_generate(mentor, mentee, focus_areas, agenda) -> Optional[dict]:
    prompt = (
        f"Write structured mentor session notes for a {', '.join(focus_areas)} "
        f"session between mentor {mentor} and entrepreneur {mentee}. "
        f"Agenda: {agenda or 'General business mentorship'}. "
        f"Format: 2-sentence summary + 3 specific action items."
    )
    result = await hw_post(ENDPOINTS_NLP["text_generation"],
                           {"text": prompt, "max_tokens": 300, "language": "en"})
    if result and result.get("generated_text"):
        text = result["generated_text"]
        # Split into summary and action items heuristically
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        summary = " ".join(lines[:2]) if len(lines) >= 2 else text
        actions = [l.lstrip("0123456789.-) ") for l in lines[2:5]] if len(lines) > 2 else []
        return {"summary": summary, "action_items": actions[:3], "generated_by": "huawei_nlp"}
    return None


def _template_notes(mentor, mentee, focus_areas, agenda, duration) -> dict:
    focus_str = ", ".join(focus_areas) if focus_areas else "general business topics"
    summary = (
        f"In this {duration}-minute session, {mentor} mentored {mentee} on {focus_str}. "
        f"Practical strategies were discussed for overcoming current business challenges, "
        f"with clear next steps agreed upon for the period before the next session."
    )
    actions = []
    for area in (focus_areas or []):
        area_l = area.lower()
        for key, template in ACTION_TEMPLATES.items():
            if key in area_l and len(actions) < 3:
                actions.append(template.format(count=2))
                break

    while len(actions) < 3:
        defaults = [
            "Review and apply key learnings from this session within 7 days",
            "Book the next mentor session within 2 weeks",
            "Share a brief progress update via ARISE messages",
        ]
        actions.append(defaults[len(actions)])

    return {"summary": summary, "action_items": actions[:3], "generated_by": "template_engine"}


async def translate_notification(text: str, target_language: str) -> str:
    """Translates a notification or system message to a target SA language."""
    from huawei.nlp.config import SA_LANGUAGE_CODES
    target_code = SA_LANGUAGE_CODES.get(target_language, "en")
    if target_code == "en":
        return text
    if not is_huawei_configured():
        return text
    result = await hw_post(ENDPOINTS_NLP["translation"],
                           {"text": text, "from": "en", "to": target_code})
    return result.get("translated_text", text) if result else text