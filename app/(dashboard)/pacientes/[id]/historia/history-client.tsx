'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { saveClinicalEntryAction, getClinicalHistoryAction } from '@/lib/actions/clinical.actions';
import { OdontogramClient } from './odontogram-client';
import type { ClinicalEntry, ClinicalEntryType, ClinicalRecord, CustomToothStatus, OdontogramState, Patient } from '@/types/domain';
import { reportCalendarDate } from '@/lib/report-dates';
import { ClinicalDocuments, type EntryAttachment } from '@/components/patients/clinical-documents';
import type { DocumentReceipt } from '@/lib/clinical-documents/service';
import { cn } from '@/lib/utils';

const ENTRY_TYPE_LABELS: Record<ClinicalEntryType, string> = {
  motivo_consulta: 'Motivo de consulta',
  diagnostico: 'Diagnóstico',
  plan_tratamiento: 'Plan de tratamiento',
  procedimiento: 'Procedimiento',
  evolucion: 'Evolución',
  correccion: 'Corrección',
};

const ENTRY_TYPE_VARIANTS: Record<ClinicalEntryType, 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline'> = {
  motivo_consulta: 'secondary',
  diagnostico: 'default',
  plan_tratamiento: 'outline',
  procedimiento: 'success',
  evolucion: 'default',
  correccion: 'warning',
};

const ENTRY_FORM_TYPES: ClinicalEntryType[] = [
  'motivo_consulta',
  'diagnostico',
  'plan_tratamiento',
  'procedimiento',
  'evolucion',
  'correccion',
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(iso));
}

function patientAge(birthDate: string): string {
  const today = reportCalendarDate(new Date());
  const years = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4)) - Number(today.slice(5) < birthDate.slice(5));
  return `${years} años`;
}

interface HistoryClientProps {
  patient: Patient;
  documents?: DocumentReceipt[];
  legacyAttachments: EntryAttachment[];
  documentsUnavailable: boolean;
  record: ClinicalRecord | null;
  initialEntries: ClinicalEntry[];
  dentistNames: Record<string, string>;
  odontogramStates: OdontogramState[];
  customStatuses: CustomToothStatus[];
}

export function HistoryClient({
  patient,
  documents,
  legacyAttachments,
  documentsUnavailable,
  record,
  initialEntries,
  dentistNames,
  odontogramStates,
  customStatuses,
}: HistoryClientProps) {
  const [activeTab, setActiveTab] = React.useState<'historia' | 'odontograma' | 'documentos'>('historia');
  const [entries, setEntries] = React.useState<ClinicalEntry[]>(initialEntries);
  const [version, setVersion] = React.useState<number>(record?.version ?? 1);
  const [isEntryModalOpen, setIsEntryModalOpen] = React.useState(false);
  const [entryType, setEntryType] = React.useState<ClinicalEntryType>('motivo_consulta');
  const [content, setContent] = React.useState('');
  const [correctsEntryId, setCorrectsEntryId] = React.useState<string>('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [reloadNotice, setReloadNotice] = React.useState<string | null>(null);

  const correctableEntries = entries.filter((e) => e.entry_type !== 'correccion');

  function openEntryModal() {
    setEntryType('motivo_consulta');
    setContent('');
    setCorrectsEntryId('');
    setSaveError(null);
    setIsEntryModalOpen(true);
  }

  function closeEntryModal() {
    setIsEntryModalOpen(false);
    setSaveError(null);
    setReloadNotice(null);
  }

  async function refreshHistory() {
    const result = await getClinicalHistoryAction(patient.id);
    if (result.success) {
      setEntries(result.data.entries);
      setVersion(result.data.record?.version ?? version);
      setReloadNotice('Historia actualizada con los cambios más recientes.');
    } else {
      setSaveError('No se pudo recargar la historia clínica. Intenta de nuevo.');
    }
  }

  async function handleSaveEntry() {
    setIsSaving(true);
    setSaveError(null);

    const result = await saveClinicalEntryAction({
      patientId: patient.id,
      entryType,
      content: content.trim(),
      expectedVersion: version,
      correctsEntryId: entryType === 'correccion' ? correctsEntryId : null,
    });
    setIsSaving(false);

    if (result.success) {
      setEntries((prev) => [...prev, result.data.entry]);
      setVersion(result.data.newVersion);
      closeEntryModal();
    } else if (result.error.code === 'CONCURRENCY_CONFLICT') {
      setSaveError(
        'Otro profesional modificó la historia clínica mientras registrabas tu entrada. Recarga para ver el estado más reciente.'
      );
      setReloadNotice('toma-turno');
    } else {
      setSaveError(result.error.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen del paciente */}
      <section aria-labelledby="paciente-resumen-heading" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
        <h2 id="paciente-resumen-heading" className="sr-only">
          Resumen del paciente
        </h2>
        <p className="text-xl font-semibold">{patient.full_name}</p>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Documento', `${patient.document_type} ${patient.document_number}`],
            ['Nacimiento', `${patient.birth_date} · ${patientAge(patient.birth_date)}`],
            ['Teléfono', patient.phone_primary],
            ['Correo', patient.email],
            ['Dirección', patient.address],
            ['Acudiente', [patient.guardian_name, patient.guardian_phone].filter(Boolean).join(' · ')],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="font-medium text-slate-600 dark:text-slate-300">{label}</dt>
              <dd className="mt-1 break-words">{value || 'Sin registrar'}</dd>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="font-medium text-slate-600 dark:text-slate-300">Antecedentes médicos</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words">{patient.medical_history || 'Sin antecedentes registrados'}</dd>
          </div>
        </dl>
      </section>

      <nav aria-label="Secciones de la historia clínica" className="flex w-fit flex-wrap gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1">
        {([
          ['historia', 'Entradas clínicas'],
          ['odontograma', 'Odontograma'],
          ...(documents ? [['documentos', 'Documentos'] as const] : []),
        ] as const).map(([key, label]) => (
          <button key={key} type="button" aria-pressed={activeTab === key}
            onClick={() => setActiveTab(key)} className={cn(
              'min-h-11 rounded-lg px-3 text-sm font-medium',
              activeTab === key ? 'bg-slate-900 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}>{label}</button>
        ))}
      </nav>

      {activeTab === 'documentos' && documents && (
        documentsUnavailable
          ? <Alert tone="danger" title="No se pudieron cargar los documentos">Actualiza la página para volver a intentarlo.</Alert>
          : <ClinicalDocuments patientId={patient.id} documents={documents} legacyAttachments={legacyAttachments}
              authors={dentistNames} entryAuthors={Object.fromEntries(entries.map((entry) => [entry.id, entry.dentist_id]))} />
      )}

      {activeTab === 'historia' && (
        <section
          id="panel-historia"
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Entradas clínicas</h2>
            <Button type="button" onClick={openEntryModal}>
              Nueva entrada clínica
            </Button>
          </div>

          {reloadNotice === 'toma-turno' && (
            <Alert tone="warning" title="Posible conflicto de concurrencia">
              <p>{saveError ?? 'La historia fue modificada por otro profesional.'}</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={refreshHistory}>
                Recargar historial
              </Button>
            </Alert>
          )}
          {reloadNotice === 'toma-turno' ? null : reloadNotice && (
            <Alert tone="success" title="Actualizado">
              {reloadNotice}
            </Alert>
          )}

          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-10 text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Aún no hay entradas clínicas</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Registra la primera entrada para iniciar la historia clínica del paciente.
              </p>
              <Button type="button" variant="outline" className="mt-4" onClick={openEntryModal}>
                Nueva entrada clínica
              </Button>
            </div>
          ) : (
            <ol className="relative space-y-4 border-l border-slate-200 dark:border-slate-700 pl-6">
              {entries.map((entry) => (
                <li key={entry.id} className="relative">
                  <span
                    className="absolute -left-[31px] top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-cyan-600"
                    aria-hidden="true"
                  />
                  <article className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={ENTRY_TYPE_VARIANTS[entry.entry_type]}>
                        {ENTRY_TYPE_LABELS[entry.entry_type]}
                      </Badge>
                      {entry.corrects_entry_id && (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                          Corrige una entrada anterior
                        </span>
                      )}
                      <time dateTime={entry.created_at} className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(entry.created_at)}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-100">{entry.content}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Registrado por:{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {dentistNames[entry.dentist_id] ?? 'Profesional'}
                      </span>
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {activeTab === 'odontograma' && (
        <section
          id="panel-odontograma"
        >
          <OdontogramClient
            patientId={patient.id}
            initialStates={odontogramStates}
            customStatuses={customStatuses}
          />
        </section>
      )}

      {/* Modal nueva entrada */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={closeEntryModal}
        title="Nueva entrada clínica"
        description="La entrada quedará registrada de forma inmutable y auditable (append-only)."
      >
        <div className="space-y-4">
          {saveError && (
            <Alert tone="danger" title="No se pudo guardar">
              {saveError}
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="entry-type">Tipo de entrada</Label>
            <Select
              id="entry-type"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as ClinicalEntryType)}
            >
              {ENTRY_FORM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ENTRY_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>

          {entryType === 'correccion' && (
            <div className="space-y-2">
              <Label htmlFor="corrects-entry">Entrada a corregir</Label>
              <Select
                id="corrects-entry"
                value={correctsEntryId}
                onChange={(e) => setCorrectsEntryId(e.target.value)}
              >
                <option value="">Selecciona una entrada…</option>
                {correctableEntries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {formatDate(entry.created_at)} — {ENTRY_TYPE_LABELS[entry.entry_type]}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="entry-content">Contenido</Label>
            <Textarea
              id="entry-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={5000}
              rows={5}
              placeholder="Describe el hallazgo, diagnóstico o procedimiento realizado…"
            />
            <p className="text-xs text-slate-400">{content.length}/5000</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeEntryModal}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveEntry}
              isLoading={isSaving}
              disabled={entryType === 'correccion' && !correctsEntryId}
            >
              Registrar entrada
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
