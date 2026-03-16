"""huawei/apm/config.py — Application Performance Monitoring configuration."""
from backend.config.settings import settings
from backend.config.huawei import ENDPOINTS

APM_BASE = ENDPOINTS["apm"]
PROJECT_ID = settings.HUAWEI_PROJECT_ID

APM_COLLECTOR_URL = f"{APM_BASE}/v2/{PROJECT_ID}/apm2/openapi/perftest/task"
APM_METRICS_URL   = f"{APM_BASE}/v2/{PROJECT_ID}/apm2/metric-data"

# ─── Metric Categories ────────────────────────────────────────────────────────
METRIC_GROUPS = {
    "api":          ["request_count", "error_rate", "avg_latency_ms", "p99_latency_ms"],
    "business":     ["registrations", "applications", "sessions_booked", "grants_matched"],
    "safety":       ["flags_submitted", "posts_blocked", "users_suspended"],
    "ecs":          ["scores_updated", "avg_score", "events_recorded"],
    "huawei":       ["ocr_calls", "nlp_calls", "modelarts_calls", "ges_calls"],
}

ALERT_THRESHOLDS = {
    "error_rate_pct": 5.0,        # Alert if >5% errors
    "avg_latency_ms": 2000,       # Alert if avg >2s
    "safety_flags_per_hour": 10,  # Alert if >10 safety reports/hour
}