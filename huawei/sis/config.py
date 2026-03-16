"""huawei/sis/config.py — Speech Interaction Service configuration."""
from backend.config.settings import settings
from backend.config.huawei import ENDPOINTS

SIS_BASE = ENDPOINTS["sis"]
PROJECT_ID = settings.HUAWEI_PROJECT_ID

ENDPOINTS_SIS = {
    "asr_short":  f"{SIS_BASE}/v1/{PROJECT_ID}/asr/short-audio",
    "asr_stream": f"{SIS_BASE}/v1/{PROJECT_ID}/asr/streaming",
    "tts":        f"{SIS_BASE}/v1/{PROJECT_ID}/tts/short-audio",
}

SA_ASR_CONFIGS = {
    "English":  {"property": "english_8k_common", "audio_format": "wav"},
    "isiZulu":  {"property": "afrikaans_8k_general", "audio_format": "wav"},
    "Afrikaans": {"property": "afrikaans_8k_general", "audio_format": "wav"},
}

MAX_AUDIO_DURATION_SECONDS = 60
SUPPORTED_FORMATS = ["wav", "mp3", "pcm", "flac"]
PROFICIENCY_PASS_THRESHOLD = 60   # Minimum fluency score to pass language assessment