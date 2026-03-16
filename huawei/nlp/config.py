"""huawei/nlp/config.py — NLP service configuration."""
from backend.config.settings import settings
from backend.config.huawei import ENDPOINTS

NLP_BASE = ENDPOINTS["nlp"]
PROJECT_ID = settings.HUAWEI_PROJECT_ID

ENDPOINTS_NLP = {
    "text_classification": f"{NLP_BASE}/v1/{PROJECT_ID}/nlp/text-classification",
    "sentiment":           f"{NLP_BASE}/v1/{PROJECT_ID}/nlp/sentiment",
    "ner":                 f"{NLP_BASE}/v1/{PROJECT_ID}/nlp/named-entity-recognition",
    "translation":         f"{NLP_BASE}/v1/{PROJECT_ID}/nlp/translation",
    "text_generation":     f"{NLP_BASE}/v1/{PROJECT_ID}/nlp/text-generation",
    "summarization":       f"{NLP_BASE}/v1/{PROJECT_ID}/nlp/text-summarization",
}

SA_LANGUAGE_CODES = {
    "English": "en", "isiZulu": "zu", "Afrikaans": "af",
    "Sesotho": "st", "Xhosa": "xh", "Sepedi": "nso",
    "Setswana": "tn", "Tshivenda": "ve", "Xitsonga": "ts",
}

MAX_TEXT_LENGTH = 2000