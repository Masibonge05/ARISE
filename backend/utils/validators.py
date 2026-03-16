import re
from typing import Optional

def is_valid_sa_id(id_number: str) -> bool:
    """Validates a South African ID number (basic check)"""
    if not id_number or len(id_number) != 13:
        return False
    if not id_number.isdigit():
        return False
    # Luhn algorithm check
    total = 0
    for i, digit in enumerate(id_number[:-1]):
        n = int(digit)
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    check = (10 - (total % 10)) % 10
    return check == int(id_number[-1])

def is_valid_cipc_number(cipc: str) -> bool:
    """Validates CIPC registration number format: YYYY/NNNNNN/NN"""
    pattern = r'^\d{4}/\d{6}/\d{2}$'
    return bool(re.match(pattern, cipc))

def is_valid_sa_phone(phone: str) -> bool:
    """Validates SA phone number"""
    cleaned = re.sub(r'\D', '', phone)
    return len(cleaned) in (10, 11) and (cleaned.startswith('0') or cleaned.startswith('27'))

def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    return True, "OK"