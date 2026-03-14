from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ─── App ───────────────────────────────────────────────
    APP_NAME: str = "ARISE"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # ─── Database ──────────────────────────────────────────
    DATABASE_URL: str

    # ─── CORS ──────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ─── Huawei Cloud ──────────────────────────────────────
    HUAWEI_ACCESS_KEY: str
    HUAWEI_SECRET_KEY: str
    HUAWEI_PROJECT_ID: str
    HUAWEI_REGION: str = "af-south-1"

    # Huawei OCR
    HUAWEI_OCR_ENDPOINT: str = "https://ocr.af-south-1.myhuaweicloud.com"

    # Huawei NLP
    HUAWEI_NLP_ENDPOINT: str = "https://nlp.af-south-1.myhuaweicloud.com"

    # Huawei ModelArts
    HUAWEI_MODELARTS_ENDPOINT: str = "https://modelarts.af-south-1.myhuaweicloud.com"
    HUAWEI_GRANT_MODEL_ID: Optional[str] = None
    HUAWEI_MATCHING_MODEL_ID: Optional[str] = None
    HUAWEI_SKILLS_MODEL_ID: Optional[str] = None

    # Huawei OBS (Object Storage)
    HUAWEI_OBS_ENDPOINT: str = "https://obs.af-south-1.myhuaweicloud.com"
    HUAWEI_OBS_BUCKET: str = "arise-documents"

    # Huawei GES (Graph Engine)
    HUAWEI_GES_ENDPOINT: str = "https://ges.af-south-1.myhuaweicloud.com"
    HUAWEI_GES_GRAPH_NAME: str = "arise-knowledge-graph"

    # Huawei SIS (Speech Interaction)
    HUAWEI_SIS_ENDPOINT: str = "https://sis.af-south-1.myhuaweicloud.com"

    # ─── Email ─────────────────────────────────────────────
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@arise.co.za"

    # ─── Payment (Yoco) ────────────────────────────────────
    YOCO_SECRET_KEY: Optional[str] = None
    YOCO_PUBLIC_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()