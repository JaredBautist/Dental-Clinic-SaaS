"""Esquemas de entrada — equivalentes a los Zod schemas de auth.actions.ts.

El frontend (lib/api/auth-api.ts) serializa los cuerpos en camelCase; los
modelos aceptan ambos formatos gracias a `populate_by_name` + alias.
"""
import re

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=1, max_length=256)


def _validate_totp_code(value: str) -> str:
    if not re.fullmatch(r"\d{6}", value):
        raise ValueError("El código debe tener exactamente 6 dígitos")
    return value


class VerifySetupRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    # El navegador envía {"factorId": ..., "code": ...} (mismo contrato que
    # las antiguas Server Actions).
    factor_id: str = Field(min_length=1, alias="factorId")
    code: str

    @field_validator("code")
    @classmethod
    def code_format(cls, v: str) -> str:
        return _validate_totp_code(v)


class VerifyLoginRequest(BaseModel):
    code: str

    @field_validator("code")
    @classmethod
    def code_format(cls, v: str) -> str:
        return _validate_totp_code(v)
