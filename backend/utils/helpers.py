import re
from datetime import datetime
from typing import Optional

def extract_age_from_id(id_number: str) -> Optional[int]:
    """Extracts age from SA ID number (first 6 digits = YYMMDD)"""
    try:
        yy = int(id_number[:2])
        current_year = datetime.now().year % 100
        year = 2000 + yy if yy <= current_year else 1900 + yy
        month = int(id_number[2:4])
        day = int(id_number[4:6])
        dob = datetime(year, month, day)
        today = datetime.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except Exception:
        return None

def extract_gender_from_id(id_number: str) -> Optional[str]:
    """Extracts gender from SA ID (digits 7-10: 0000-4999=female, 5000-9999=male)"""
    try:
        gender_digit = int(id_number[6:10])
        return "female" if gender_digit < 5000 else "male"
    except Exception:
        return None

def sanitize_phone(phone: str) -> str:
    """Normalises SA phone number to +27 format"""
    digits = re.sub(r'\D', '', phone)
    if digits.startswith('0') and len(digits) == 10:
        return '+27' + digits[1:]
    if digits.startswith('27') and len(digits) == 11:
        return '+' + digits
    return phone

def paginate(query, page: int, limit: int):
    """Helper for SQLAlchemy pagination"""
    return query.offset((page - 1) * limit).limit(limit)