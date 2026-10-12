from werkzeug.security import generate_password_hash, check_password_hash

SHIFT = 3

def encrypt_userid(text):
    # Shift each character within printable ASCII (34-126), then reverse
    return "".join(chr((ord(c) - 34 + SHIFT) % 93 + 34) for c in text)[::-1]

def decrypt_userid(text):
    return "".join(chr((ord(c) - 34 - SHIFT) % 93 + 34) for c in text[::-1])

def hash_password(password):
    return generate_password_hash(password)

def check_password(stored_hash, password):
    return check_password_hash(stored_hash, password)