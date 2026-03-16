"""
Huawei LTS (Log Tank Service)
================================
Centralized structured logging for ARISE platform.
Docs: https://support.huaweicloud.com/lts/index.html

Log streams:
- arise-api-access: all HTTP requests
- arise-security: authentication, flagged content, reports
- arise-ecs-events: all ECS point awards and score changes
- arise-huawei-calls: all Huawei API calls and latencies
- arise-errors: exceptions and failed operations
"""
import json, logging, datetime
from typing import Optional
import httpx
from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.lts")

LOG_GROUP_ID  = getattr(settings, "HUAWEI_LTS_LOG_GROUP_ID", None)

LOG_STREAMS = {
    "api_access":    getattr(settings, "HUAWEI_LTS_STREAM_API", None),
    "security":      getattr(settings, "HUAWEI_LTS_STREAM_SECURITY", None),
    "ecs_events":    getattr(settings, "HUAWEI_LTS_STREAM_ECS", None),
    "huawei_calls":  getattr(settings, "HUAWEI_LTS_STREAM_HUAWEI", None),
    "errors":        getattr(settings, "HUAWEI_LTS_STREAM_ERRORS", None),
}


async def log_event(stream: str, level: str, message: str, extra: dict = None) -> bool:
    """
    Sends a structured log entry to Huawei LTS.
    Falls back to local Python logging when LTS not configured.
    🔴 Huawei LTS TransferLogs API
    """
    log_entry = {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "level": level,
        "stream": stream,
        "message": message,
        "service": "arise-api",
        "region": settings.HUAWEI_REGION,
        **(extra or {}),
    }

    # Always log locally
    getattr(logger, level.lower(), logger.info)(f"[{stream}] {message} {json.dumps(extra or {})}")

    if not _is_configured() or not LOG_GROUP_ID or not LOG_STREAMS.get(stream):
        return True

    try:
        from backend.services.huawei_iam import get_auth_headers
        stream_id = LOG_STREAMS[stream]
        url = (
            f"https://lts.{settings.HUAWEI_REGION}.myhuaweicloud.com"
            f"/v2/{settings.HUAWEI_PROJECT_ID}/groups/{LOG_GROUP_ID}/streams/{stream_id}/contents"
        )
        payload = {
            "log_time": int(datetime.datetime.utcnow().timestamp() * 1000),
            "contents": [{"log_time_ns": int(datetime.datetime.utcnow().timestamp() * 1000000000),
                          "log_content": json.dumps(log_entry)}],
        }
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(url, json=payload, headers=headers)
        return True
    except Exception as e:
        logger.debug(f"LTS log push failed (non-critical): {e}")
    return False


async def log_api_request(method: str, path: str, status: int, duration_ms: float, user_id: str = None):
    """Logs an API request to LTS api_access stream"""
    await log_event("api_access", "INFO", f"{method} {path} → {status}",
                    {"method": method, "path": path, "status": status, "duration_ms": duration_ms, "user_id": user_id})


async def log_security_event(event_type: str, user_id: str, details: str, severity: str = "WARNING"):
    """Logs a security event: auth failure, flag, report, suspicious scan"""
    await log_event("security", severity,
                    f"Security: {event_type}",
                    {"event_type": event_type, "user_id": user_id, "details": details})


async def log_ecs_event(user_id: str, event_type: str, points: int, new_score: int):
    """Logs every ECS point award for audit trail"""
    await log_event("ecs_events", "INFO",
                    f"ECS: {event_type} +{points} → {new_score}",
                    {"user_id": user_id, "event_type": event_type, "points": points, "new_score": new_score})


async def log_huawei_api_call(service: str, endpoint: str, status: int, duration_ms: float, mock: bool = False):
    """Logs every Huawei Cloud API call for cost tracking and debugging"""
    await log_event("huawei_calls", "DEBUG",
                    f"Huawei {service}: {endpoint} → {status}",
                    {"service": service, "endpoint": endpoint, "status": status, "duration_ms": duration_ms, "mock": mock})


async def log_error(error_type: str, message: str, traceback_str: str = None, user_id: str = None):
    """Logs exceptions and errors for monitoring"""
    await log_event("errors", "ERROR", f"Error: {error_type} — {message}",
                    {"error_type": error_type, "user_id": user_id, "traceback": traceback_str})


async def create_log_group(group_name: str) -> Optional[str]:
    """Creates an LTS log group. Called during deployment."""
    if not _is_configured():
        return f"mock-log-group-{group_name}"
    from backend.services.huawei_iam import get_auth_headers
    url = f"https://lts.{settings.HUAWEI_REGION}.myhuaweicloud.com/v2/{settings.HUAWEI_PROJECT_ID}/groups"
    try:
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(url, json={"log_group_name": group_name, "ttl_in_days": 30}, headers=headers)
        if r.status_code == 201:
            return r.json().get("log_group_id")
    except Exception as e:
        logger.error(f"LTS create group failed: {e}")
    return None


def _is_configured() -> bool:
    return bool(settings.HUAWEI_ACCESS_KEY) and settings.HUAWEI_ACCESS_KEY != "placeholder"