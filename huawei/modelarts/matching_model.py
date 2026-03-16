"""
huawei/modelarts/matching_model.py
====================================
Job and project matching using Huawei ModelArts.

Model: Neural collaborative filtering + gradient boosting ensemble.
Trained on successful ARISE hire and project completion patterns.

Improves over time as more matches happen on the platform.
"""
import logging
from typing import Optional, List
from huawei.modelarts.config import get_inference_url, is_model_deployed
from backend.config.huawei import hw_post

logger = logging.getLogger("arise.modelarts.matching")


async def predict_job_match(user_features: dict, job_features: dict) -> Optional[dict]:
    """
    Predicts job-user match score using the deployed matching model.
    
    Returns:
        {"match_score": 87, "breakdown": {...}, "confidence": 0.84}
        or None if model unavailable.
    """
    if not is_model_deployed("job_matching"):
        return None

    url = get_inference_url("job_matching")
    features = {**user_features, **{f"job_{k}": v for k, v in job_features.items()}}
    result = await hw_post(url, {"data": {"req_data": [features]}})
    
    if result:
        pred = result.get("resp_data", [{}])[0]
        return {
            "match_score": min(100, max(0, pred.get("match_score", 0))),
            "breakdown": pred.get("breakdown", {}),
            "confidence": pred.get("confidence", 0.0),
            "model": "huawei_modelarts_matching",
        }
    return None


async def rank_jobs_batch(user_features: dict, jobs: List[dict]) -> List[dict]:
    """
    Batch-ranks a list of jobs for a user in a single API call.
    Returns list of {"job_id": str, "match_score": int} sorted descending.
    """
    if not is_model_deployed("job_matching") or not jobs:
        return []

    url = get_inference_url("job_matching")
    batch = [
        {**user_features, "job_id": j["id"], **{f"job_{k}": v for k, v in j.items() if k != "id"}}
        for j in jobs
    ]
    result = await hw_post(url, {"data": {"req_data": batch}}, timeout=30)
    
    if result:
        preds = result.get("resp_data", [])
        ranked = [
            {"job_id": p.get("job_id"), "match_score": min(100, max(0, p.get("match_score", 0)))}
            for p in preds
        ]
        return sorted(ranked, key=lambda x: x["match_score"], reverse=True)
    return []


async def predict_freelance_match(user_features: dict, project_features: dict) -> Optional[dict]:
    """Predicts freelance project-user match (reuses matching model)."""
    return await predict_job_match(user_features, project_features)