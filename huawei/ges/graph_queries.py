"""
huawei/ges/graph_queries.py
============================
Knowledge graph queries for ARISE mentor and investor matching.

The ARISE knowledge graph models relationships between:
- Entrepreneurs ↔ Sectors ↔ Mentors (for MentorNet matching)
- Businesses ↔ Sectors ↔ Investors (for Investor Connect)
- Skills ↔ Skills (for related skills and learning paths)
- Users ↔ Courses → Skills (for verified skill tracking)

🔴 Huawei GES (Graph Engine Service) Gremlin API
"""
import logging
from typing import List, Optional, Dict
from huawei.ges.config import GREMLIN_URL
from backend.config.huawei import hw_post, is_huawei_configured

logger = logging.getLogger("arise.ges.queries")

# ─── Node Management ─────────────────────────────────────────────────────────

async def upsert_user_node(user_id: str, props: dict) -> bool:
    """Creates or updates a User node in the graph."""
    query = (
        f"g.V().has('User','user_id','{user_id}')"
        f".fold().coalesce(unfold(),"
        f"addV('User').property('user_id','{user_id}'))"
        f".property('sector','{props.get('sector','')}')"
        f".property('province','{props.get('province','')}')"
        f".property('persona','{props.get('persona','')}')"
        f".property('ecs_score',{props.get('ecs_score',0)})"
    )
    return await _gremlin(query) is not None


async def upsert_mentor_node(mentor_id: str, props: dict) -> bool:
    """Creates or updates a Mentor node with expertise area edges."""
    query = (
        f"g.V().has('Mentor','mentor_id','{mentor_id}')"
        f".fold().coalesce(unfold(),"
        f"addV('Mentor').property('mentor_id','{mentor_id}'))"
        f".property('industry','{props.get('industry','')}')"
        f".property('average_rating',{props.get('average_rating',0.0)})"
        f".property('is_available',{str(props.get('is_available',True)).lower()})"
    )
    return await _gremlin(query) is not None


async def upsert_skill_edges(user_id: str, skills: List[str]) -> bool:
    """Creates has_skill edges from a user to skill nodes."""
    if not skills:
        return True
    queries = []
    for skill in skills[:20]:   # cap to avoid huge queries
        safe = skill.replace("'", "\\'")
        queries.append(
            f"g.V().has('User','user_id','{user_id}')"
            f".as('u')"
            f".V().has('Skill','name','{safe}')"
            f".fold().coalesce(unfold(),"
            f"addV('Skill').property('name','{safe}'))"
            f".as('s')"
            f".coalesce(__.inE('has_skill').where(outV().as('u')),"
            f"addE('has_skill').from('u').to('s'))"
        )
    # Execute all as a single batch transaction
    batch_query = "; ".join(queries)
    return await _gremlin(batch_query) is not None


# ─── Mentor Matching ──────────────────────────────────────────────────────────

async def find_mentors_for_entrepreneur(
    user_id: str,
    sector: Optional[str] = None,
    challenge_areas: Optional[List[str]] = None,
    limit: int = 10,
) -> List[Dict]:
    """
    Traverses the graph to find best-matched mentors for an entrepreneur.
    Traversal: User → Sector → ← Mentor (expert_in) filtered by availability.
    """
    sector_filter = f".has('sector','{sector}')" if sector else ""
    query = (
        f"g.V().has('User','user_id','{user_id}')"
        f".out('operates_in'){sector_filter}"
        f".in('expert_in')"
        f".hasLabel('Mentor')"
        f".has('is_available',true)"
        f".order().by('average_rating',decr)"
        f".limit({limit})"
        f".valueMap(true)"
    )
    result = await _gremlin(query)
    if result and result.get("data", {}).get("rows"):
        return _parse_mentor_rows(result["data"]["rows"])
    return []


async def get_mentor_impact(mentor_id: str) -> dict:
    """Gets the mentor's social proof from the graph — sectors helped, ECS improvements."""
    query = (
        f"g.V().has('Mentor','mentor_id','{mentor_id}')"
        f".in('mentored_by')"
        f".group().by('sector').by(values('ecs_improvement').mean())"
    )
    result = await _gremlin(query)
    return {"impact_by_sector": result.get("data", {}) if result else {},
            "source": "huawei_ges"}


# ─── Investor Matching ────────────────────────────────────────────────────────

async def find_investors_for_business(
    business_id: str,
    sector: Optional[str] = None,
    limit: int = 20,
) -> List[Dict]:
    """Finds verified investors whose mandate matches a business."""
    query = (
        f"g.V().has('Business','business_id','{business_id}')"
        f".out('operates_in')"
        f".in('invests_in_sector')"
        f".hasLabel('Investor')"
        f".has('verification_status','verified')"
        f".has('terms_agreed',true)"
        f".limit({limit})"
        f".valueMap(true)"
    )
    result = await _gremlin(query)
    if result and result.get("data", {}).get("rows"):
        return [{"investor_id": r.get("investor_id", [None])[0]} for r in result["data"]["rows"]]
    return []


# ─── Skill Graph ──────────────────────────────────────────────────────────────

async def get_related_skills(skill_name: str, limit: int = 5) -> List[str]:
    """Returns skills that frequently co-occur with the given skill."""
    safe = skill_name.replace("'", "\\'")
    query = (
        f"g.V().has('Skill','name','{safe}')"
        f".out('related_to')"
        f".order().by('co_occurrence',decr)"
        f".limit({limit})"
        f".values('name')"
    )
    result = await _gremlin(query)
    if result and result.get("data", {}).get("rows"):
        return result["data"]["rows"]

    # Hardcoded fallback
    fallback = {
        "figma": ["Adobe XD", "Prototyping", "UI Design", "CSS", "Wireframing"],
        "react": ["JavaScript", "TypeScript", "Node.js", "Redux", "Next.js"],
        "python": ["FastAPI", "Django", "SQL", "Machine Learning", "Docker"],
    }
    return fallback.get(skill_name.lower(), [])


async def get_career_path_skills(current_skills: List[str], goal: str) -> List[str]:
    """Returns ordered list of skills to learn next for a career goal."""
    query = (
        f"g.V().has('CareerGoal','name','{goal}')"
        f".out('requires_skill')"
        f".not(__.has('name',within({current_skills[:10]})))"
        f".order().by('importance',decr)"
        f".limit(5).values('name')"
    )
    result = await _gremlin(query)
    if result and result.get("data", {}).get("rows"):
        return result["data"]["rows"]
    return []


# ─── Internal Helpers ─────────────────────────────────────────────────────────

async def _gremlin(query: str) -> Optional[dict]:
    """Executes a Gremlin query against Huawei GES."""
    if not is_huawei_configured():
        return None
    return await hw_post(GREMLIN_URL, {"command": query})


def _parse_mentor_rows(rows: list) -> List[dict]:
    result = []
    for row in rows:
        if isinstance(row, dict):
            result.append({
                "mentor_id": row.get("mentor_id", [None])[0],
                "match_score": min(100, int(row.get("match_score", [70])[0])),
            })
    return result