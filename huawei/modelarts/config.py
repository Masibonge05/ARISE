"""
huawei/modelarts/config.py
===========================
ModelArts service configuration for ARISE.

Huawei ModelArts is used for:
- Grant eligibility prediction model
- Job/project matching ranking model  
- Skills assessment scoring model

Documentation: https://support.huaweicloud.com/modelarts/index.html
"""
from backend.config.settings import settings
from backend.config.huawei import ENDPOINTS, is_huawei_configured

# ─── ModelArts Endpoints ─────────────────────────────────────────────────────
MODELARTS_BASE = ENDPOINTS["modelarts"]
PROJECT_ID = settings.HUAWEI_PROJECT_ID

# Inference endpoint pattern:
# POST /v1/{project_id}/models/{model_id}/predict
INFERENCE_URL = f"{MODELARTS_BASE}/v1/{PROJECT_ID}/models/{{model_id}}/predict"

# Training job endpoint (for retraining on new hire data):
TRAINING_URL = f"{MODELARTS_BASE}/v1/{PROJECT_ID}/training-jobs"

# ─── Deployed Model IDs ───────────────────────────────────────────────────────
# These are set after deploying models in ModelArts console
MODEL_IDS = {
    "grant_eligibility": settings.HUAWEI_GRANT_MODEL_ID or "",
    "job_matching":      settings.HUAWEI_MATCHING_MODEL_ID or "",
    "skill_assessment":  settings.HUAWEI_SKILLS_MODEL_ID or "",
}

# ─── Model Feature Schemas ────────────────────────────────────────────────────
# Documents the expected input features for each model

GRANT_MODEL_FEATURES = [
    "age", "gender", "province", "business_stage", "sector",
    "ecs_score", "is_identity_verified", "cipc_registered",
    "grant_type", "grant_min_age", "grant_max_age",
    "grant_gender", "grant_requires_cipc",
]

JOB_MATCHING_FEATURES = [
    "user_skills",              # list of skill names
    "required_skills",          # list
    "user_province", "job_province",
    "user_experience_years", "required_experience_years",
    "user_salary_min", "user_salary_max",
    "job_salary_min", "job_salary_max",
    "user_work_style", "job_work_style",
    "ecs_score",
]

SKILLS_ASSESSMENT_FEATURES = [
    "skill",                    # skill name
    "answers",                  # list of answer indices (0-3)
    "answer_count",
]

def get_inference_url(model_key: str) -> str:
    """Returns inference URL for a given model key."""
    model_id = MODEL_IDS.get(model_key)
    if not model_id:
        return ""
    return INFERENCE_URL.format(model_id=model_id)

def is_model_deployed(model_key: str) -> bool:
    return bool(MODEL_IDS.get(model_key)) and is_huawei_configured()