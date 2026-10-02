"""Dental Clinic SaaS — API de autenticación y MFA.

FastAPI + supabase-py. Reemplaza las Server Actions de auth del frontend
Next.js conservando el mismo contrato de respuesta (ServerActionResult) y las
mismas reglas de seguridad (ADR-001: perfil desde public.users, AAL2 real).

Ejecutar:  uvicorn app.main:app --reload --port 8000
"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.auth.router import router as auth_router
from app.config import get_settings
from app.core.errors import DentalClinicError

logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Dental Clinic SaaS — Auth API",
    version="1.0.0",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error_payload(code: str, message: str, status_code: int) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {"code": code, "message": message, "statusCode": status_code},
        },
    )


@app.exception_handler(DentalClinicError)
async def domain_error_handler(_: Request, exc: DentalClinicError) -> JSONResponse:
    return _error_payload(exc.code, exc.message, exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    """Mismo código que el wrapper TypeScript: VALIDATION_ERROR (422)."""
    message = "Los datos enviados no son válidos"
    errors = exc.errors()
    if errors:
        first_message = str(errors[0].get("msg", ""))
        # Los mensajes personalizados llegan como "Value error, <mensaje>".
        first_message = first_message.removeprefix("Value error, ")
        if first_message:
            message = first_message
    return _error_payload("VALIDATION_ERROR", message, 422)


@app.exception_handler(Exception)
async def unhandled_error_handler(_: Request, exc: Exception) -> JSONResponse:
    # Nunca exponer detalles internos al cliente (igual que withErrorHandling).
    logger.exception("[Unhandled API Error]: %s", exc)
    return _error_payload(
        "INTERNAL_SERVER_ERROR",
        "Ocurrió un error inesperado al procesar la solicitud en el servidor.",
        500,
    )


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


app.include_router(auth_router)
