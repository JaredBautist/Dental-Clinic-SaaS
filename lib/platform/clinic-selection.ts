/** Resolve a navigation choice only against the clinics returned by the server. */
export function selectClinicForView<T extends { id: string }>(
  clinics: readonly T[],
  accountClinicId: string,
  requestedClinicId?: string | string[] | null,
): T | undefined {
  return clinics.find(({ id }) => id === requestedClinicId)
    ?? clinics.find(({ id }) => id === accountClinicId)
    ?? clinics[0];
}

const clinicViews = new Set(['/dashboard', '/consultorios', '/plataforma']);

export function isClinicView(pathname: string): boolean {
  return clinicViews.has(pathname);
}

export function clinicViewHref(pathname: string, clinicId?: string): string {
  return clinicId && isClinicView(pathname)
    ? `${pathname}?clinic=${encodeURIComponent(clinicId)}`
    : pathname;
}
