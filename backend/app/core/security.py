"""Utilidades de seguridad — port de hashLoginIdentifier + lectura del claim AAL."""
import hashlib

import jwt


def hash_login_identifier(identifier: str) -> str:
    """Convierte un email normalizado en un identificador irreversible para el rate limit."""
    return hashlib.sha256(identifier.strip().lower().encode("utf-8")).hexdigest()


def decode_aal_claim(access_token: str) -> str | None:
    """Lee el claim `aal` del JWT emitido por Supabase GoTrue.

    No verifica la firma: el token ya fue emitido por GoTrue durante la
    verificación MFA; aquí solo se inspecciona su contenido. Equivalente a
    `getAuthenticatorAssuranceLevel()` sin una llamada de red adicional.
    """
    try:
        claims = jwt.decode(access_token, options={"verify_signature": False})
    except jwt.PyJWTError:
        return None
    aal = claims.get("aal")
    return aal if aal in ("aal1", "aal2") else None
