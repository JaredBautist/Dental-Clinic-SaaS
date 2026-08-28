/**
 * Jerarquía de Errores de Dominio para Dental Clinic SaaS
 */

export class DentalClinicError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = 'DENTAL_CLINIC_ERROR', statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TenantIsolationError extends DentalClinicError {
  constructor(message = 'Acceso denegado: Violación de aislamiento multiempresa') {
    super(message, 'TENANT_ISOLATION_ERROR', 403);
  }
}

export class RoleAuthorizationError extends DentalClinicError {
  constructor(message = 'Acceso denegado: Rol no autorizado para esta operación') {
    super(message, 'ROLE_AUTHORIZATION_ERROR', 403);
  }
}

export class UniqueDocumentError extends DentalClinicError {
  public readonly existingPatientName?: string;
  public readonly existingPatientId?: string;

  constructor(
    message = 'El número de documento ya está registrado para otro paciente en este consultorio',
    existingPatientName?: string,
    existingPatientId?: string
  ) {
    super(message, 'UNIQUE_DOCUMENT_ERROR', 409);
    this.existingPatientName = existingPatientName;
    this.existingPatientId = existingPatientId;
  }
}

export class AppointmentConflictError extends DentalClinicError {
  public readonly suggestedSlots?: Array<{ start: string; end: string }>;

  constructor(
    message = 'Conflicto de horario: El odontólogo ya tiene una cita asignada en ese intervalo',
    suggestedSlots: Array<{ start: string; end: string }> = []
  ) {
    super(message, 'APPOINTMENT_CONFLICT_ERROR', 409);
    this.suggestedSlots = suggestedSlots;
  }
}

export class ConcurrencyConflictError extends DentalClinicError {
  public readonly entityId?: string;
  public readonly currentVersion?: number;

  constructor(
    message = 'Conflicto de concurrencia: El registro ha sido modificado por otro usuario. Por favor recargue y revise antes de reintentar.',
    entityId?: string,
    currentVersion?: number
  ) {
    super(message, 'CONCURRENCY_CONFLICT_ERROR', 409);
    this.entityId = entityId;
    this.currentVersion = currentVersion;
  }
}

export class ImmutableRecordError extends DentalClinicError {
  constructor(
    message = 'Operación no permitida: Los registros clínicos y de auditoría son inmutables'
  ) {
    super(message, 'IMMUTABLE_RECORD_ERROR', 400);
  }
}

export class ValidationError extends DentalClinicError {
  public readonly validationErrors?: Record<string, string[]>;

  constructor(
    message = 'Los datos proporcionados son inválidos o incompletos',
    validationErrors?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 422);
    this.validationErrors = validationErrors;
  }
}

export class ReportRangeLimitError extends DentalClinicError {
  constructor(
    message = 'El rango de fechas no puede exceder el límite de 12 meses (365 días)'
  ) {
    super(message, 'REPORT_RANGE_LIMIT_ERROR', 400);
  }
}
