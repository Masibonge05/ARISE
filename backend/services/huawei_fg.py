"""
Huawei FunctionGraph (Serverless)
====================================
Serverless functions for ARISE background processing tasks.
Docs: https://support.huaweicloud.com/fg/index.html

Functions deployed:
1. arise-ecs-recalculate: triggered after every profile update
2. arise-safety-scan: triggered when a job is submitted
3. arise-grant-matcher: nightly batch re-scores all eligible users
4. arise-notification-sender: sends queued push notifications
5. arise-report-processor: processes safety reports within 24h
6. arise-data-sync: syncs user graph nodes to Huawei GES
"""
import logging
from typing import Optional
import httpx
from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.fg")

FG_BASE_URL = f"https://functiongraph.{settings.HUAWEI_REGION}.myhuaweicloud.com"


async def invoke_function(
    function_urn: str,
    payload: dict,
    async_invoke: bool = False,
) -> Optional[dict]:
    """
    Invokes a deployed FunctionGraph function.
    async_invoke=True for fire-and-forget background tasks.
    🔴 Huawei FunctionGraph InvokeFunction API
    """
    if not _is_configured():
        logger.info(f"FG invoke (mock): {function_urn} payload={list(payload.keys())}")
        return {"status": "mock_ok", "function_urn": function_urn}

    from backend.services.huawei_iam import get_auth_headers
    endpoint = "invoke_execution" if async_invoke else "invocations"
    url = f"{FG_BASE_URL}/v2/{settings.HUAWEI_PROJECT_ID}/fgs/functions/{function_urn}/{endpoint}"

    try:
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(url, json=payload, headers=headers)
        if r.status_code in (200, 202):
            return r.json() if not async_invoke else {"status": "accepted"}
        logger.error(f"FG invoke failed: {r.status_code} — {r.text[:200]}")
    except Exception as e:
        logger.error(f"FG invoke exception: {e}")
    return None


async def trigger_ecs_recalculation(user_id: str) -> bool:
    """Triggers async ECS score recalculation after a profile change"""
    result = await invoke_function(
        getattr(settings, "HUAWEI_FG_URN_ECS", f"urn:fss:{settings.HUAWEI_REGION}:{settings.HUAWEI_PROJECT_ID}:function:arise:arise-ecs-recalculate:latest"),
        {"user_id": user_id, "trigger": "profile_update"},
        async_invoke=True,
    )
    return result is not None


async def trigger_safety_scan(job_id: str, title: str, description: str) -> Optional[dict]:
    """Triggers synchronous safety scan before job publication"""
    return await invoke_function(
        getattr(settings, "HUAWEI_FG_URN_SAFETY", f"urn:fss:{settings.HUAWEI_REGION}:{settings.HUAWEI_PROJECT_ID}:function:arise:arise-safety-scan:latest"),
        {"job_id": job_id, "title": title, "description": description},
        async_invoke=False,
    )


async def trigger_grant_matching(user_id: str) -> bool:
    """Triggers async grant eligibility re-scoring for a user"""
    result = await invoke_function(
        getattr(settings, "HUAWEI_FG_URN_GRANTS", f"urn:fss:{settings.HUAWEI_REGION}:{settings.HUAWEI_PROJECT_ID}:function:arise:arise-grant-matcher:latest"),
        {"user_id": user_id, "trigger": "profile_update"},
        async_invoke=True,
    )
    return result is not None


async def trigger_ges_sync(user_id: str, properties: dict) -> bool:
    """Syncs user profile changes to Huawei GES knowledge graph"""
    result = await invoke_function(
        getattr(settings, "HUAWEI_FG_URN_GES_SYNC", f"urn:fss:{settings.HUAWEI_REGION}:{settings.HUAWEI_PROJECT_ID}:function:arise:arise-data-sync:latest"),
        {"user_id": user_id, "properties": properties, "operation": "upsert_user"},
        async_invoke=True,
    )
    return result is not None


async def list_functions() -> list:
    """Lists all deployed ARISE FunctionGraph functions"""
    if not _is_configured():
        return [{"name": f"arise-{n}", "status": "mock"} for n in ["ecs-recalculate", "safety-scan", "grant-matcher", "notification-sender"]]
    from backend.services.huawei_iam import get_auth_headers
    url = f"{FG_BASE_URL}/v2/{settings.HUAWEI_PROJECT_ID}/fgs/functions?package=arise"
    try:
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, headers=headers)
        if r.status_code == 200:
            return r.json().get("functions", [])
    except Exception as e:
        logger.error(f"FG list failed: {e}")
    return []


def _is_configured() -> bool:
    return bool(settings.HUAWEI_ACCESS_KEY) and settings.HUAWEI_ACCESS_KEY != "placeholder"