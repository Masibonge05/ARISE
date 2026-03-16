"""
huawei/modelarts/grant_model.py
================================
Grant eligibility prediction using Huawei ModelArts.

Model: Gradient Boosted Decision Tree trained on historical NYDA/SEDA
approval data. Features: applicant demographics, business profile, ECS.

Input: applicant features dict
Output: eligibility_score (0-100), factor_breakdown, disqualifiers
"""
import logging
from typing import Optional
from huawei.modelarts.config import get_inference_url, is_model_deployed
from backend.config.huawei import hw_post

logger = logging.getLogger("arise.modelarts.grant")

async def predict_grant_eligibility(features: dict) -> Optional[dict]:
    """
    Calls the deployed grant eligibility model.
    Returns prediction dict or None if model unavailable.
    
    Prediction output:
    {
        "score": 87,
        "factors": {"age": {"score": 20}, "gender": {"score": 20}, ...},
        "disqualifiers": [],
        "confidence": 0.91
    }
    """
    if not is_model_deployed("grant_eligibility"):
        logger.debug("Grant model not deployed — using rules engine fallback")
        return None

    url = get_inference_url("grant_eligibility")
    payload = {"data": {"req_data": [features]}}
    
    result = await hw_post(url, payload)
    if result:
        predictions = result.get("resp_data", [{}])
        if predictions:
            pred = predictions[0]
            return {
                "score": min(100, max(0, pred.get("score", 0))),
                "factors": pred.get("factors", {}),
                "disqualifiers": pred.get("disqualifiers", []),
                "confidence": pred.get("confidence", 0.0),
                "model": "huawei_modelarts_grant",
            }
    return None


async def batch_predict_eligibility(applicant: dict, grants: list) -> list:
    """
    Batch-predicts eligibility for multiple grants at once.
    More efficient than calling predict_grant_eligibility per grant.
    """
    if not is_model_deployed("grant_eligibility"):
        return []

    url = get_inference_url("grant_eligibility")
    batch_features = [
        {**applicant, **{"grant_id": g["id"], "grant_type": g.get("type"),
                          "grant_min_age": g.get("min_age"), "grant_max_age": g.get("max_age"),
                          "grant_gender": g.get("gender", "all"),
                          "grant_sectors": g.get("sectors", ["all"]),
                          "grant_requires_cipc": g.get("requires_cipc", False)}}
        for g in grants
    ]
    
    payload = {"data": {"req_data": batch_features}}
    result = await hw_post(url, payload, timeout=30)
    
    if result:
        return result.get("resp_data", [])
    return []