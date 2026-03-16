"""
huawei/apm/tracker.py
======================
Application Performance Monitoring for ARISE.

Tracks:
- API latency and error rates per endpoint
- Business metrics (registrations, ECS events, grants matched)
- Huawei service call success rates
- Safety event frequencies (flags, blocks, suspensions)

Data is displayed in:
- GovLink Dashboard (real-time national metrics)
- Backend health endpoint (/health)
- Huawei APM Console (full observability)

🔴 Huawei APM2
"""
import time, logging
from collections import defaultdict, deque
from datetime import datetime
from typing import Optional
from huawei.apm.config import APM_METRICS_URL, METRIC_GROUPS, ALERT_THRESHOLDS
from backend.config.huawei import hw_post, is_huawei_configured

logger = logging.getLogger("arise.apm.tracker")

# ─── In-Memory Metrics Store ─────────────────────────────────────────────────
# In production these would be sent to Huawei APM agent
_metrics: dict = {
    "api_requests":    0,
    "api_errors":      0,
    "latencies_ms":    deque(maxlen=1000),
    "registrations":   0,
    "ecs_events":      0,
    "safety_flags":    0,
    "ocr_calls":       0,
    "nlp_calls":       0,
    "modelarts_calls": 0,
    "ges_calls":       0,
    "grants_matched":  0,
    "sessions_booked": 0,
    "start_time":      datetime.utcnow(),
}

_endpoint_stats: dict = defaultdict(lambda: {"count": 0, "errors": 0, "total_ms": 0})


# ─── Tracking Functions ───────────────────────────────────────────────────────

def track_api_request(endpoint: str, method: str, status_code: int, duration_ms: float):
    """Records an API request. Called by FastAPI middleware."""
    _metrics["api_requests"] += 1
    _metrics["latencies_ms"].append(duration_ms)

    key = f"{method} {endpoint}"
    _endpoint_stats[key]["count"] += 1
    _endpoint_stats[key]["total_ms"] += duration_ms

    if status_code >= 400:
        _metrics["api_errors"] += 1
        _endpoint_stats[key]["errors"] += 1

    # Check alert thresholds
    _check_latency_alert(endpoint, duration_ms)


def track_business_event(event: str, count: int = 1):
    """Records a business metric event."""
    if event in _metrics:
        _metrics[event] += count
    
    # Forward to Huawei APM asynchronously in production
    if is_huawei_configured():
        pass   # TODO: batch-send to APM agent


def track_huawei_call(service: str, success: bool):
    """Tracks Huawei service call outcomes."""
    key = f"{service}_calls"
    if key in _metrics:
        _metrics[key] += 1
    if not success:
        logger.warning(f"Huawei {service} call failed")


# ─── Metric Retrieval ─────────────────────────────────────────────────────────

def get_platform_health() -> dict:
    """Returns current platform health — used by /health endpoint and GovLink."""
    n = _metrics["api_requests"]
    latencies = list(_metrics["latencies_ms"])
    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    p99_latency = sorted(latencies)[int(len(latencies) * 0.99)] if len(latencies) >= 10 else avg_latency
    error_rate = (_metrics["api_errors"] / max(n, 1)) * 100
    uptime_hours = (datetime.utcnow() - _metrics["start_time"]).total_seconds() / 3600

    return {
        "status": "healthy" if error_rate < ALERT_THRESHOLDS["error_rate_pct"] else "degraded",
        "uptime_hours": round(uptime_hours, 2),
        "api_requests_total": n,
        "error_rate_pct": round(error_rate, 2),
        "avg_latency_ms": round(avg_latency, 1),
        "p99_latency_ms": round(p99_latency, 1),
        "powered_by": "Huawei APM2",
        "region": "af-south-1",
    }


def get_business_metrics() -> dict:
    """Returns business impact metrics for GovLink dashboard."""
    return {
        "registrations":   _metrics["registrations"],
        "ecs_events":      _metrics["ecs_events"],
        "grants_matched":  _metrics["grants_matched"],
        "sessions_booked": _metrics["sessions_booked"],
        "safety_flags":    _metrics["safety_flags"],
    }


def get_huawei_service_stats() -> dict:
    """Returns Huawei cloud service call statistics."""
    return {
        "ocr":       _metrics["ocr_calls"],
        "nlp":       _metrics["nlp_calls"],
        "modelarts": _metrics["modelarts_calls"],
        "ges":       _metrics["ges_calls"],
    }


def get_slowest_endpoints(top_n: int = 5) -> list:
    """Returns the slowest API endpoints by average latency."""
    stats = [
        {"endpoint": k, "count": v["count"],
         "avg_ms": round(v["total_ms"] / max(v["count"], 1), 1),
         "error_rate": round(v["errors"] / max(v["count"], 1) * 100, 1)}
        for k, v in _endpoint_stats.items() if v["count"] > 0
    ]
    return sorted(stats, key=lambda x: x["avg_ms"], reverse=True)[:top_n]


# ─── Alert Checks ────────────────────────────────────────────────────────────

def _check_latency_alert(endpoint: str, latency_ms: float):
    if latency_ms > ALERT_THRESHOLDS["avg_latency_ms"]:
        logger.warning(f"High latency: {endpoint} took {latency_ms:.0f}ms")