"""
Huawei DCS (Distributed Cache Service) — Redis-compatible caching for ARISE.

Cache strategy:
- Job feed results per user:          5 min TTL
- Grant eligibility results:         30 min TTL
- ECS scores:                         1 min TTL (near real-time)
- GovLink dashboard metrics:         60 sec TTL
- Mentor discovery results:          10 min TTL
- Huawei IAM tokens:                 23 hr TTL
- User profiles:                     15 min TTL

Falls back to in-process dict cache when DCS not configured.

Docs: https://support.huaweicloud.com/dcs/index.html
"""
import json
import logging
from typing import Optional, Any
from datetime import datetime, timedelta
from backend.config.settings import settings

logger = logging.getLogger("arise.huawei.dcs")

# ─── In-process fallback cache ────────────────────────────────────────────────
_local_cache: dict = {}   # key → {"value": ..., "expires_at": datetime}


def _is_configured() -> bool:
    return bool(getattr(settings, "HUAWEI_DCS_REDIS_URL", None))


async def get_cached(key: str) -> Optional[Any]:
    """
    Retrieves a value from DCS Redis cache.
    Falls back to in-process dict in dev mode.
    Returns None if key missing or expired.
    """
    if _is_configured():
        return await _dcs_get(key)
    # Local fallback
    entry = _local_cache.get(key)
    if not entry:
        return None
    if datetime.utcnow() > entry["expires_at"]:
        del _local_cache[key]
        return None
    return entry["value"]


async def set_cached(key: str, value: Any, ttl_seconds: int = 300) -> bool:
    """
    Stores a value in DCS Redis cache with TTL.
    Falls back to in-process dict in dev mode.
    Returns True on success.
    """
    if _is_configured():
        return await _dcs_set(key, value, ttl_seconds)
    # Local fallback
    _local_cache[key] = {
        "value": value,
        "expires_at": datetime.utcnow() + timedelta(seconds=ttl_seconds),
    }
    return True


async def delete_cached(key: str) -> bool:
    """Deletes a key from cache."""
    if _is_configured():
        return await _dcs_delete(key)
    _local_cache.pop(key, None)
    return True


async def invalidate_prefix(prefix: str) -> int:
    """Deletes all keys starting with prefix. Returns count deleted."""
    if _is_configured():
        return await _dcs_invalidate_prefix(prefix)
    keys_to_delete = [k for k in _local_cache if k.startswith(prefix)]
    for k in keys_to_delete:
        del _local_cache[k]
    return len(keys_to_delete)


# ─── Cache Key Builders ───────────────────────────────────────────────────────

def job_feed_key(user_id: str) -> str:
    return f"jobs:feed:{user_id}"

def grant_eligibility_key(user_id: str) -> str:
    return f"grants:eligibility:{user_id}"

def ecs_score_key(user_id: str) -> str:
    return f"ecs:score:{user_id}"

def govlink_metrics_key() -> str:
    return "govlink:metrics:national"

def mentor_feed_key(user_id: str) -> str:
    return f"mentors:feed:{user_id}"

def user_profile_key(user_id: str) -> str:
    return f"users:profile:{user_id}"

def iam_token_key() -> str:
    return "huawei:iam:token"


# ─── DCS Redis Operations ─────────────────────────────────────────────────────

async def _dcs_get(key: str) -> Optional[Any]:
    """Connects to Huawei DCS Redis and retrieves a value."""
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.HUAWEI_DCS_REDIS_URL)
        raw = await r.get(key)
        await r.aclose()
        if raw:
            return json.loads(raw)
        return None
    except ImportError:
        logger.warning("redis package not installed — using local cache fallback")
        return _local_cache.get(key, {}).get("value")
    except Exception as e:
        logger.error(f"DCS GET {key} failed: {e}")
        return None


async def _dcs_set(key: str, value: Any, ttl: int) -> bool:
    """Connects to Huawei DCS Redis and sets a value with TTL."""
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.HUAWEI_DCS_REDIS_URL)
        await r.setex(key, ttl, json.dumps(value, default=str))
        await r.aclose()
        return True
    except ImportError:
        _local_cache[key] = {"value": value,
                              "expires_at": datetime.utcnow() + timedelta(seconds=ttl)}
        return True
    except Exception as e:
        logger.error(f"DCS SET {key} failed: {e}")
        return False


async def _dcs_delete(key: str) -> bool:
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.HUAWEI_DCS_REDIS_URL)
        await r.delete(key)
        await r.aclose()
        return True
    except Exception as e:
        logger.error(f"DCS DELETE {key} failed: {e}")
        return False


async def _dcs_invalidate_prefix(prefix: str) -> int:
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.HUAWEI_DCS_REDIS_URL)
        keys = await r.keys(f"{prefix}*")
        if keys:
            await r.delete(*keys)
        await r.aclose()
        return len(keys)
    except Exception as e:
        logger.error(f"DCS prefix invalidation {prefix} failed: {e}")
        return 0