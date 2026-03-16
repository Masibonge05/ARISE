"""
Huawei APM (Application Performance Monitoring)
================================================
Full implementation: request tracing, business metrics, CES alarms, GovLink feed.

Services: Huawei APM, CES (Cloud Eye)
Docs: https://support.huaweicloud.com/apm/index.html
"""

import time
import asyncio
import logging
import datetime
from typing import Optional
from collections import defaultdict, deque
import httpx
from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.apm")


class MetricsStore:
    def __init__(self):
        self.api_calls_total = 0
        self.api_errors_total = 0
        self.response_times = deque(maxlen=1000)
        self.endpoint_counts = defaultdict(int)
        self.endpoint_errors = defaultdict(int)
        self.status_code_counts = defaultdict(int)
        self.active_sessions = 0
        self.business_events = defaultdict(int)
        self._current_hour_registrations = 0
        self._hour_bucket = datetime.datetime.utcnow().hour
        self.hourly_registrations = deque(maxlen=24)

    def record_request(self, endpoint, method, status, duration_ms):
        self.api_calls_total += 1
        self.response_times.append(duration_ms)
        self.endpoint_counts[f"{method}:{endpoint}"] += 1
        self.status_code_counts[str(status)] += 1
        if status >= 400:
            self.api_errors_total += 1
            self.endpoint_errors[f"{method}:{endpoint}"] += 1
        current_hour = datetime.datetime.utcnow().hour
        if current_hour != self._hour_bucket:
            self.hourly_registrations.append(self._current_hour_registrations)
            self._current_hour_registrations = 0
            self._hour_bucket = current_hour

    def record_business_event(self, event_type):
        self.business_events[event_type] += 1
        if event_type == "user_registered":
            self._current_hour_registrations += 1

    @property
    def avg_response_ms(self):
        return sum(self.response_times) / len(self.response_times) if self.response_times else 0.0

    @property
    def p95_response_ms(self):
        if not self.response_times:
            return 0.0
        s = sorted(self.response_times)
        return s[min(int(len(s) * 0.95), len(s) - 1)]

    @property
    def error_rate_pct(self):
        if self.api_calls_total == 0:
            return 0.0
        return round((self.api_errors_total / self.api_calls_total) * 100, 2)


_metrics = MetricsStore()


def track_request(endpoint: str, method: str, status_code: int, duration_ms: float):
    """Records API request — called by main.py middleware on every request"""
    _metrics.record_request(endpoint, method, status_code, duration_ms)


def track_business_event(event_type: str, user_id: str = None, metadata: dict = None):
    """
    Records a platform business event for DSBD analytics.

    event_type options:
    - user_registered / session_completed / grant_applied
    - freelance_project_completed / ecs_score_updated / investor_interest
    - job_application_submitted / identity_verified / business_registered
    """
    _metrics.record_business_event(event_type)
    logger.debug(f"Business event: {event_type} user={user_id}")


async def push_metric_to_ces(metric_name: str, value: float, unit: str = "Count"):
    """
    Pushes a custom metric to Huawei CES (Cloud Eye) for alerting and dashboards.
    Docs: https://support.huaweicloud.com/api-ces/ces_03_0033.html
    """
    if not _is_configured():
        return

    from backend.services.huawei_iam import get_auth_headers
    url = f"https://ces.{settings.HUAWEI_REGION}.myhuaweicloud.com/V1.0/{settings.HUAWEI_PROJECT_ID}/metric-data"
    payload = [{
        "namespace": "CUSTOM.ARISE",
        "metric_name": metric_name,
        "dimensions": [{"name": "service", "value": "arise-api"}],
        "ttl": 172800,
        "collect_time": int(time.time() * 1000),
        "value": value,
        "unit": unit,
        "type": "float",
    }]
    try:
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(url, json=payload, headers=headers)
    except Exception as e:
        logger.debug(f"CES push failed (non-critical): {e}")


async def create_ces_alarm(
    alarm_name: str,
    metric_name: str,
    threshold: float,
    comparison: str = ">=",
    period: int = 300,
    notify_topic_urn: Optional[str] = None,
) -> Optional[str]:
    """
    Creates a Cloud Eye alarm.
    e.g. Alert when error_rate >= 5% or avg_response_ms >= 2000ms

    Docs: https://support.huaweicloud.com/api-ces/ces_03_0027.html
    """
    if not _is_configured():
        logger.info(f"CES alarm (mock): {alarm_name} — {metric_name} {comparison} {threshold}")
        return f"mock-alarm-{alarm_name}"

    from backend.services.huawei_iam import get_auth_headers
    url = f"https://ces.{settings.HUAWEI_REGION}.myhuaweicloud.com/V1.0/{settings.HUAWEI_PROJECT_ID}/alarms"

    payload = {
        "alarm_name": alarm_name,
        "alarm_description": f"ARISE auto-alarm for {alarm_name}",
        "metric": {
            "namespace": "CUSTOM.ARISE",
            "metric_name": metric_name,
            "dimensions": [{"name": "service", "value": "arise-api"}],
        },
        "condition": {
            "period": period,
            "filter": "average",
            "comparison_operator": comparison,
            "value": threshold,
            "unit": "",
            "count": 1,
        },
        "alarm_actions": [{"type": "notification", "notificationList": [notify_topic_urn]}] if notify_topic_urn else [],
        "alarm_enabled": True,
        "alarm_action_enabled": bool(notify_topic_urn),
        "alarm_level": 2,
    }

    try:
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload, headers=headers)
        if response.status_code == 201:
            alarm_id = response.json().get("alarm_id")
            logger.info(f"CES alarm created: {alarm_id}")
            return alarm_id
        logger.error(f"CES alarm failed: {response.status_code} {response.text[:200]}")
    except Exception as e:
        logger.error(f"CES alarm exception: {e}")
    return None


async def list_ces_alarms() -> list:
    """Lists all Cloud Eye alarms for the ARISE project"""
    if not _is_configured():
        return []
    from backend.services.huawei_iam import get_auth_headers
    url = f"https://ces.{settings.HUAWEI_REGION}.myhuaweicloud.com/V1.0/{settings.HUAWEI_PROJECT_ID}/alarms"
    try:
        headers = await get_auth_headers()
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url, headers=headers)
        if response.status_code == 200:
            return response.json().get("metric_alarms", [])
    except Exception as e:
        logger.error(f"List alarms failed: {e}")
    return []


async def setup_default_alarms():
    """
    Sets up default production alarms for ARISE.
    Called once on startup when Huawei credentials are configured.
    """
    alarms = [
        ("arise-high-error-rate",      "error_rate",     5.0,    ">=", 300),
        ("arise-slow-response",        "avg_response_ms", 2000.0, ">=", 300),
        ("arise-low-registration",     "registrations",  0.0,    "<=", 3600),
    ]
    for name, metric, threshold, op, period in alarms:
        await create_ces_alarm(name, metric, threshold, op, period)


def get_platform_health() -> dict:
    """Returns live platform health for GovLink dashboard"""
    return {
        "status": "healthy" if _metrics.error_rate_pct < 5.0 else "degraded",
        "api_calls_total": _metrics.api_calls_total,
        "error_rate_pct": _metrics.error_rate_pct,
        "avg_response_ms": round(_metrics.avg_response_ms, 1),
        "p95_response_ms": round(_metrics.p95_response_ms, 1),
        "active_sessions": _metrics.active_sessions,
        "business_events": dict(_metrics.business_events),
        "top_endpoints": sorted(_metrics.endpoint_counts.items(), key=lambda x: x[1], reverse=True)[:10],
        "status_codes": dict(_metrics.status_code_counts),
        "powered_by": "Huawei APM + CES",
        "region": settings.HUAWEI_REGION,
        "last_updated": datetime.datetime.utcnow().isoformat(),
    }


def get_dashboard_metrics() -> dict:
    return {
        **get_platform_health(),
        "hourly_registrations": list(_metrics.hourly_registrations),
        "registrations_this_hour": _metrics._current_hour_registrations,
    }


def _is_configured() -> bool:
    return bool(settings.HUAWEI_ACCESS_KEY) and settings.HUAWEI_ACCESS_KEY != "placeholder"