export const reportSections = {
  background: 'Antecedentes médicos',
  notes: 'Entradas clínicas',
  odontogram: 'Resumen del odontograma',
  appointments: 'Citas atendidas por mí',
} as const;

export type ReportSection = keyof typeof reportSections;

export interface PatientReportPreview {
  title: string;
  sections: { title: string; lines: string[] }[];
}
