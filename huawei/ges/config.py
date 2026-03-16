"""huawei/ges/config.py — Graph Engine Service configuration."""
from backend.config.settings import settings
from backend.config.huawei import ENDPOINTS

GES_BASE = ENDPOINTS["ges"]
PROJECT_ID = settings.HUAWEI_PROJECT_ID
GRAPH_NAME = settings.HUAWEI_GES_GRAPH_NAME or "arise-knowledge-graph"

GREMLIN_URL = f"{GES_BASE}/v1.0/{PROJECT_ID}/graphs/{GRAPH_NAME}/action?action_id=gremlin-query"
CYPHER_URL  = f"{GES_BASE}/v1.0/{PROJECT_ID}/graphs/{GRAPH_NAME}/action?action_id=cypher-query"

# ─── Graph Schema ─────────────────────────────────────────────────────────────
VERTEX_LABELS = ["User", "Mentor", "Investor", "Business", "Skill", "Sector", "Location", "Grant"]
EDGE_LABELS   = [
    "has_skill", "expert_in", "seeks_mentorship_in",
    "operates_in", "located_in", "mentors", "invested_in",
    "invests_in_sector", "completed_course", "related_to",
]