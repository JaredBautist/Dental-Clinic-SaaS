const timeZone = 'America/Bogota';
const calendar = new Intl.DateTimeFormat('sv-SE', { timeZone });
const display = new Intl.DateTimeFormat('es-CO', { timeZone, dateStyle: 'medium' });

export function reportCalendarDate(iso: string | Date): string {
  return calendar.format(new Date(iso));
}

export function reportDateIso(date: string, endOfDay = false): string {
  return new Date(`${date}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}-05:00`).toISOString();
}

export function formatReportDate(iso: string): string {
  return display.format(new Date(iso));
}

export function currentReportMonth() {
  const today = reportCalendarDate(new Date());
  return { start: reportDateIso(`${today.slice(0, 7)}-01`), end: reportDateIso(today, true) };
}
