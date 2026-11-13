'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { saveToothStateAction, type SaveToothStateInput } from '@/lib/actions/odontogram.actions';
import type { CustomToothStatus, OdontogramState, ToothSurface } from '@/types/domain';

type FdiToothCode = SaveToothStateInput['toothCode'];

const UPPER_ROW: FdiToothCode[] = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
const LOWER_ROW: FdiToothCode[] = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

const SURFACE_LABELS: Record<ToothSurface, string> = {
  oclusal: 'Oclusal',
  mesial: 'Mesial',
  distal: 'Distal',
  vestibular: 'Vestibular',
  palatino_lingual: 'Palatino/Lingual',
  completa: 'Completa',
};

const STANDARD_STATUSES: Array<{ id: string; label: string; color: string; outline: string }> = [
  { id: 'sano', label: 'Sano', color: '#ffffff', outline: '#94a3b8' },
  { id: 'caries', label: 'Caries', color: '#ef4444', outline: '#b91c1c' },
  { id: 'obturado', label: 'Obturado', color: '#3b82f6', outline: '#1d4ed8' },
  { id: 'ausente', label: 'Ausente', color: '#94a3b8', outline: '#475569' },
  { id: 'corona', label: 'Corona', color: '#a855f7', outline: '#7e22ce' },
  { id: 'endodoncia', label: 'Endodoncia', color: '#f59e0b', outline: '#b45309' },
  { id: 'implante', label: 'Implante', color: '#10b981', outline: '#047857' },
  { id: 'extraccion_indicada', label: 'Extracción indicada', color: '#f43f5e', outline: '#be123c' },
  { id: 'fractura', label: 'Fractura', color: '#eab308', outline: '#a16207' },
];

/** Franja del diente en [x1, y1, x2, y2]. Caja: 36 x 44. Corona: 12..40 (superior) / 4..32 (inferior). */
function zoneRect(surface: ToothSurface, isUpper: boolean, mesialSide: 'left' | 'right'): [number, number, number, number] {
  const midY1 = isUpper ? 21 : 13;
  const midY2 = isUpper ? 31 : 23;
  const vestY: [number, number] = isUpper ? [12, 21] : [23, 32];
  const lingY: [number, number] = isUpper ? [31, 40] : [4, 13];
  const mesialX: [number, number] = mesialSide === 'right' ? [24, 32] : [4, 12];
  const distalX: [number, number] = mesialSide === 'right' ? [4, 12] : [24, 32];

  switch (surface) {
    case 'oclusal':
      return [12, midY1, 24, midY2];
    case 'mesial':
      return [mesialX[0], midY1, mesialX[1], midY2];
    case 'distal':
      return [distalX[0], midY1, distalX[1], midY2];
    case 'vestibular':
      return [4, vestY[0], 32, vestY[1]];
    case 'palatino_lingual':
      return [4, lingY[0], 32, lingY[1]];
    case 'completa':
      return [4, isUpper ? 12 : 4, 32, isUpper ? 40 : 32];
  }
}

function rectPath([x1, y1, x2, y2]: [number, number, number, number]): string {
  return `M${x1} ${y1} H${x2} V${y2} H${x1} Z`;
}

interface OdontogramClientProps {
  patientId: string;
  initialStates: OdontogramState[];
  customStatuses: CustomToothStatus[];
}

interface SurfaceSelection {
  toothCode: FdiToothCode;
  surface: ToothSurface;
}

export function OdontogramClient({ patientId, initialStates, customStatuses }: OdontogramClientProps) {
  const [states, setStates] = React.useState<OdontogramState[]>(initialStates);
  const [selection, setSelection] = React.useState<SurfaceSelection | null>(null);
  const [statusId, setStatusId] = React.useState('sano');
  const [proposed, setProposed] = React.useState('');
  const [completed, setCompleted] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [versionConflict, setVersionConflict] = React.useState<string | null>(null);

  const allStatuses = React.useMemo(
    () => [
      ...STANDARD_STATUSES,
      ...customStatuses.map((cs) => ({
        id: cs.name,
        label: cs.name,
        color: cs.color_hex ?? '#64748b',
        outline: '#475569',
      })),
    ],
    [customStatuses]
  );

  const latestByKey = React.useMemo(() => {
    const map = new Map<string, OdontogramState>();
    for (const state of states) {
      map.set(`${state.tooth_code}_${state.surface}`, state);
    }
    return map;
  }, [states]);

  function stateFor(toothCode: string, surface: ToothSurface): OdontogramState | undefined {
    return latestByKey.get(`${toothCode}_${surface}`);
  }

  function openEditor(toothCode: FdiToothCode, surface: ToothSurface) {
    const current = stateFor(toothCode, surface);
    setSelection({ toothCode, surface });
    setStatusId(current?.status ?? 'sano');
    setProposed(current?.proposed_treatment ?? '');
    setCompleted(current?.completed_treatment ?? '');
    setSaveError(null);
    setVersionConflict(null);
  }

  function closeEditor() {
    setSelection(null);
    setVersionConflict(null);
  }

  async function handleSave() {
    if (!selection) return;
    setIsSaving(true);
    setSaveError(null);
    setVersionConflict(null);

    const current = stateFor(selection.toothCode, selection.surface);
    const result = await saveToothStateAction({
      patientId,
      toothCode: selection.toothCode,
      surface: selection.surface,
      status: statusId,
      proposedTreatment: proposed.trim() || null,
      completedTreatment: completed.trim() || null,
      expectedVersion: current?.version ?? 1,
    });
    setIsSaving(false);

    if (result.success) {
      setStates((prev) => [...prev, result.data.state]);
      closeEditor();
    } else if (result.error.code === 'CONCURRENCY_CONFLICT') {
      setVersionConflict(
        'Otro profesional modificó esta pieza mientras registrabas el cambio. Revisa el estado actual y vuelve a intentarlo.'
      );
    } else {
      setSaveError(result.error.message);
    }
  }

  const currentSelectionState = selection ? stateFor(selection.toothCode, selection.surface) : undefined;

  function renderTooth(toothCode: FdiToothCode, isUpper: boolean) {
    const mesialSide = toothCode.startsWith('1') || toothCode.startsWith('4') ? 'right' : 'left';
    const isAusente = (
      ['oclusal', 'vestibular', 'palatino_lingual', 'mesial', 'distal'] as ToothSurface[]
    ).some((surface) => stateFor(toothCode, surface)?.status === 'ausente');
    const crownTop = isUpper ? 12 : 4;
    const crownBottom = isUpper ? 40 : 32;

    return (
      <g key={toothCode}>
        {/* Superficies interactivas */}
        {(['vestibular', 'palatino_lingual', 'oclusal', 'mesial', 'distal'] as ToothSurface[]).map(
          (surface) => {
            const state = stateFor(toothCode, surface);
            const statusDef = allStatuses.find((s) => s.id === state?.status);
            const fill = statusDef?.color ?? '#f8fafc';
            const stroke = statusDef?.outline ?? '#cbd5e1';
            const rect = zoneRect(surface, isUpper, mesialSide);

            return (
              <path
                key={surface}
                d={rectPath(rect)}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.75}
                className="cursor-pointer transition-opacity hover:opacity-80"
                tabIndex={0}
                role="button"
                aria-label={`Pieza ${toothCode}, superficie ${SURFACE_LABELS[surface]}${
                  state ? `, estado ${state.status}` : ', sin estado registrado'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openEditor(toothCode, surface);
                  }
                }}
                onClick={() => openEditor(toothCode, surface)}
              >
                {state && (
                  <title>
                    {`${SURFACE_LABELS[surface]} — ${state.status}`}
                    {state.proposed_treatment ? ` · Propuesto: ${state.proposed_treatment}` : ''}
                    {state.completed_treatment ? ` · Realizado: ${state.completed_treatment}` : ''}
                  </title>
                )}
              </path>
            );
          }
        )}

        {/* Contorno de la corona + raíces */}
        <rect
          x={4}
          y={crownTop}
          width={28}
          height={crownBottom - crownTop}
          fill="none"
          stroke="#64748b"
          strokeWidth={1}
        />
        {isUpper ? (
          <path
            d="M4 12 L4 6 Q4 1 18 1 Q32 1 32 6 L32 12 M8 12 L8 3 M18 12 L18 1 M28 12 L28 3"
            fill="none"
            stroke="#64748b"
            strokeWidth={1}
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M4 32 L4 38 Q4 43 18 43 Q32 43 32 38 L32 32 M8 32 L8 41 M18 32 L18 43 M28 32 L28 41"
            fill="none"
            stroke="#64748b"
            strokeWidth={1}
            strokeLinecap="round"
          />
        )}
        {isAusente && (
          <path
            d={`M5 ${crownTop + 1} L31 ${crownBottom - 1} M31 ${crownTop + 1} L5 ${crownBottom - 1}`}
            stroke="#475569"
            strokeWidth={1.5}
            strokeLinecap="round"
            aria-hidden="true"
          />
        )}

        {/* Número FDI bajo el diente */}
        <text x={18} y={isUpper ? 50 : 47} textAnchor="middle" fontSize="6.5" fontWeight="600" fill="#475569" className="pointer-events-none select-none">
          {toothCode}
        </text>
      </g>
    );
  }

  return (
    <section aria-labelledby="odontograma-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="odontograma-heading" className="text-lg font-semibold text-slate-900">
          Odontograma digital
        </h2>
        <p className="text-xs text-slate-500">
          Nomenclatura FDI · Haz clic en una superficie para registrar su estado
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm overflow-x-auto">
        <svg
          viewBox="0 0 640 164"
          className="w-full min-w-[560px] h-auto"
          role="group"
          aria-label="Odontograma adulto, 32 piezas dentales según nomenclatura FDI"
        >
          {UPPER_ROW.map((tooth, index) => (
            <g key={tooth} transform={`translate(${index * 40 + 2}, 10)`}>
              {renderTooth(tooth, true)}
            </g>
          ))}
          {LOWER_ROW.map((tooth, index) => (
            <g key={tooth} transform={`translate(${index * 40 + 2}, 100)`}>
              {renderTooth(tooth, false)}
            </g>
          ))}
          <line x1={320} y1={4} x2={320} y2={156} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} />
        </svg>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Leyenda de estados</h3>
        <ul className="flex flex-wrap gap-2">
          {allStatuses.map((status) => (
            <li
              key={status.id}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border shrink-0"
                style={{ backgroundColor: status.color, borderColor: status.outline }}
                aria-hidden="true"
              />
              {status.label}
            </li>
          ))}
        </ul>
        {customStatuses.length === 0 && (
          <p className="mt-3 text-xs text-slate-400">
            Tu consultorio aún no tiene estados personalizados. El administrador puede crearlos desde la
            configuración clínica (máximo 20).
          </p>
        )}
      </div>

      <Modal
        isOpen={selection !== null}
        onClose={closeEditor}
        title={
          selection
            ? `Pieza ${selection.toothCode} · ${SURFACE_LABELS[selection.surface]}`
            : 'Editor de superficie'
        }
        description={
          currentSelectionState
            ? `Estado actual: ${currentSelectionState.status} (versión ${currentSelectionState.version})`
            : 'Esta superficie aún no tiene estados registrados.'
        }
      >
        <div className="space-y-4">
          {versionConflict && (
            <Alert tone="warning" title="Conflicto de concurrencia">
              {versionConflict}
            </Alert>
          )}
          {saveError && (
            <Alert tone="danger" title="No se pudo guardar">
              {saveError}
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="tooth-status">Estado clínico</Label>
            <Select id="tooth-status" value={statusId} onChange={(e) => setStatusId(e.target.value)}>
              {allStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposed-treatment">Tratamiento propuesto (opcional)</Label>
            <Textarea
              id="proposed-treatment"
              value={proposed}
              onChange={(e) => setProposed(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ej.: Resina compuesta en dos sesiones"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completed-treatment">Tratamiento realizado (opcional)</Label>
            <Textarea
              id="completed-treatment"
              value={completed}
              onChange={(e) => setCompleted(e.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Ej.: Obturación completada con anestesia local"
            />
          </div>

          <p className="text-xs text-slate-500">
            Cada registro crea una nueva versión inmutable (append-only): el historial nunca se sobrescribe.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeEditor}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} isLoading={isSaving}>
              Guardar estado
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
