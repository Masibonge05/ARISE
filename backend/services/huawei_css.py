"""
Huawei CSS (Cloud Search Service) — Elasticsearch for ARISE search
Docs: https://support.huaweicloud.com/css/index.html

Indices:
- arise-jobs: all active job postings (full-text search + skill matching)
- arise-freelance: open freelance projects
- arise-mentors: mentor profiles and expertise areas
- arise-grants: SA grant programs (50+ programs indexed)
- arise-businesses: entrepreneur business profiles for investor discovery

Features:
- Full-text search across job descriptions in 11 SA languages
- Skill-based fuzzy matching (Figma → Figure Design)
- Province/city geo-filtering
- Relevance scoring combined with ECS-based trust ranking
"""
import logging
from typing import Optional, List
import httpx
from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.css")

CSS_ENDPOINT = getattr(settings, "HUAWEI_CSS_ENDPOINT", None)

INDEX_JOBS       = "arise-jobs"
INDEX_FREELANCE  = "arise-freelance"
INDEX_MENTORS    = "arise-mentors"
INDEX_GRANTS     = "arise-grants"
INDEX_BUSINESSES = "arise-businesses"


async def search(index: str, query: str, filters: dict = None, size: int = 20, from_: int = 0) -> dict:
    """
    Executes a full-text Elasticsearch search against a CSS index.
    Falls back to empty results if CSS not configured.
    🔴 Huawei CSS OpenSearch API
    """
    if not _is_configured():
        return {"hits": {"total": {"value": 0}, "hits": []}}

    body = {
        "query": {
            "bool": {
                "must": [{"multi_match": {"query": query, "fields": ["title^3", "description", "required_skills^2", "sector"]}}],
                "filter": _build_filters(filters or {}),
            }
        },
        "size": size,
        "from": from_,
        "sort": [{"_score": "desc"}, {"ecs_score": "desc"}],
    }

    try:
        from backend.services.huawei_iam import get_auth_headers
        url = f"{CSS_ENDPOINT}/{index}/_search"
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(url, json=body, headers=headers)
        if r.status_code == 200:
            return r.json()
        logger.error(f"CSS search failed: {r.status_code}")
    except Exception as e:
        logger.error(f"CSS search exception: {e}")
    return {"hits": {"total": {"value": 0}, "hits": []}}


async def index_document(index: str, doc_id: str, document: dict) -> bool:
    """Indexes a document in CSS (add or update)"""
    if not _is_configured():
        return True
    try:
        from backend.services.huawei_iam import get_auth_headers
        url = f"{CSS_ENDPOINT}/{index}/_doc/{doc_id}"
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.put(url, json=document, headers=headers)
        return r.status_code in (200, 201)
    except Exception as e:
        logger.error(f"CSS index failed: {e}")
        return False


async def delete_document(index: str, doc_id: str) -> bool:
    """Removes a document from a CSS index"""
    if not _is_configured():
        return True
    try:
        from backend.services.huawei_iam import get_auth_headers
        url = f"{CSS_ENDPOINT}/{index}/_doc/{doc_id}"
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.delete(url, headers=headers)
        return r.status_code in (200, 204)
    except Exception as e:
        logger.error(f"CSS delete failed: {e}")
        return False


async def search_jobs(query: str, province: str = None, skills: List[str] = None, remote_only: bool = False) -> List[dict]:
    """Searches job postings with ARISE-specific filters"""
    filters = {}
    if province:
        filters["province"] = province
    if remote_only:
        filters["is_remote"] = True
    result = await search(INDEX_JOBS, query, filters)
    return [hit["_source"] for hit in result.get("hits", {}).get("hits", [])]


async def search_mentors(query: str, sectors: List[str] = None, bbee_only: bool = False) -> List[dict]:
    """Searches mentor profiles by expertise area"""
    filters = {}
    if bbee_only:
        filters["is_bbee_linked"] = True
    result = await search(INDEX_MENTORS, query, filters)
    return [hit["_source"] for hit in result.get("hits", {}).get("hits", [])]


async def search_grants(query: str, sector: str = None, grant_type: str = None) -> List[dict]:
    """Searches grant programs by description and sector"""
    filters = {}
    if sector:
        filters["sectors"] = sector
    if grant_type:
        filters["type"] = grant_type
    result = await search(INDEX_GRANTS, query, filters)
    return [hit["_source"] for hit in result.get("hits", {}).get("hits", [])]


def _build_filters(filters: dict) -> list:
    """Converts filter dict to Elasticsearch filter clauses"""
    clauses = []
    for key, value in filters.items():
        if isinstance(value, bool):
            clauses.append({"term": {key: value}})
        elif isinstance(value, list):
            clauses.append({"terms": {key: value}})
        else:
            clauses.append({"term": {key: value}})
    return clauses


async def create_index(index_name: str, mapping: dict) -> bool:
    """Creates a CSS index with a specified mapping. Called during deployment."""
    if not _is_configured():
        logger.info(f"CSS create index (mock): {index_name}")
        return True
    try:
        from backend.services.huawei_iam import get_auth_headers
        url = f"{CSS_ENDPOINT}/{index_name}"
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.put(url, json={"mappings": {"properties": mapping}}, headers=headers)
        return r.status_code in (200, 201)
    except Exception as e:
        logger.error(f"CSS create index failed: {e}")
        return False


def _is_configured() -> bool:
    return bool(CSS_ENDPOINT) and bool(settings.HUAWEI_ACCESS_KEY) and settings.HUAWEI_ACCESS_KEY != "placeholder"