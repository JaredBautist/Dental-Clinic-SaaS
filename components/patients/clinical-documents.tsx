'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatReportDate } from '@/lib/report-dates';
import { reportSections, type ReportSection, type PatientReportPreview } from '@/lib/clinical-documents/sections';
import type { DocumentReceipt } from '@/lib/clinical-documents/service';

export interface EntryAttachment {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
  entry_id: string;
}

export function ClinicalDocuments({ patientId, documents, legacyAttachments, authors, entryAuthors }: {
  patientId: string;
  documents: DocumentReceipt[];
  legacyAttachments: EntryAttachment[];
  authors: Record<string, string>;
  entryAuthors: Record<string, string>;
}) {
  const router = useRouter();
  const requestId = useRef<string | null>(null);
  const [sections, setSections] = useState<ReportSection[]>(['notes']);
  const [preview, setPreview] = useState<PatientReportPreview | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<DocumentReceipt | null>(null);

  async function submit(isPreview: boolean) {
    requestId.current ??= crypto.randomUUID();
    setPending(true);
    setError('');
    setSaved(null);
    try {
      const response = await fetch('/api/clinical-documents/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, sections, requestId: requestId.current, preview: isPreview }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'No se pudo preparar el informe.');
      if (isPreview) {
        setPreview(result);
      } else {
        setSaved(result);
        setPreview(null);
        requestId.current = null;
        router.refresh();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo preparar el informe.');
    } finally {
      setPending(false);
    }
  }

  function previewReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(true);
  }

  const receipts = saved && !documents.some((item) => item.id === saved.id) ? [saved, ...documents] : documents;
  const files = [
    ...receipts.map((item) => ({ ...item, label: item.kind === 'external_pdf' ? 'Historia externa' : 'Informe generado', type: 'PDF' })),
    ...legacyAttachments.map((item) => ({ ...item, label: 'Adjunto clínico', type: item.file_type, author_id: entryAuthors[item.entry_id] })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="space-y-6">
      <section aria-labelledby="patient-documents">
        <h2 id="patient-documents" className="mb-3 text-lg font-semibold">Documentos guardados</h2>
        {files.length ? (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 px-4">
            {files.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="break-all font-medium">{item.file_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.label} · {formatReportDate(item.created_at)}{authors[item.author_id] ? ` · ${authors[item.author_id]}` : ''}</p>
                </div>
                <Button asChild variant="outline">
                  <a href={`/api/clinical-documents/${item.id}/download`} aria-label={`Descargar ${item.file_name}`}>Descargar {item.type}</a>
                </Button>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-600 dark:text-slate-300">Aún no hay documentos guardados.</p>}
      </section>
      <form className="space-y-4" onSubmit={previewReport} aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-1">
          <legend className="mb-2 text-lg font-semibold">Generar informe del paciente</legend>
          {(Object.entries(reportSections) as [ReportSection, string][]).map(([key, label]) => (
            <label key={key} className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" checked={sections.includes(key)} onChange={(event) => {
                setSections(event.target.checked ? [...sections, key] : sections.filter((value) => value !== key));
                setPreview(null);
                setError('');
                requestId.current = null;
              }} />
              {label}
            </label>
          ))}
        </fieldset>
        <Button type="submit" variant="outline" disabled={pending}>Previsualizar informe</Button>
      </form>
      {pending && <p role="status">Procesando informe…</p>}
      {error && <Alert tone="danger" title="No se pudo completar el informe">{error}</Alert>}
      {saved && <p role="status">El informe se guardó en los documentos del paciente.</p>}
      {preview && (
        <section aria-labelledby="report-preview" className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 id="report-preview" tabIndex={-1} ref={(element) => element?.focus()} className="text-lg font-semibold">{preview.title}</h2>
          {preview.sections.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="font-medium">{group.title}</h3>
              {group.lines.map((line, index) => <p key={index} className="whitespace-pre-wrap break-words text-sm">{line}</p>)}
            </div>
          ))}
          <Button type="button" onClick={() => void submit(false)} isLoading={pending}>Guardar informe en PDF</Button>
        </section>
      )}
    </div>
  );
}
