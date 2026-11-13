'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { getAuditLogsAction, type AuditLogEntry } from '@/lib/actions/audit.actions';
import type { AuditEntityType } from '@/types/domain';
import { ShieldCheck } from 'lucide-react';

const ENTITY_TYPE_LABELS: Record<AuditEntityType, string> = {
  consultorio: 'Consultorio',
  usuario: 'Usuario',
  paciente: 'Paciente',
  cita: 'Cita',
  historia_clinica: 'Historia clínica',
  odontograma: 'Odontograma',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Creación',
  update: 'Actualización',
  cancel: 'Cancelación',
  reschedule: 'Reprogramación',
  correccion: 'Corrección',
  delete_attempt: 'Intento de borrado',
  access_denied: 'Acceso denegado',
};

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(iso));
}

function metadataPreview(metadata: Record<string, unknown> | null | undefined): string {
  if (!metadata || Object.keys(metadata).length === 0) return '—';
  return JSON.stringify(metadata);
}

interface AuditClientProps {
  initialLogs: AuditLogEntry[];
  userNames: Record<string, string>;
}

export function AuditClient({ initialLogs, userNames }: AuditClientProps) {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>(initialLogs);
  const [entityType, setEntityType] = React.useState('');
  const [result, setResult] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function refresh(filters?: { entityType?: string; result?: string }) {
    setIsLoading(true);
    setError(null);
    const response = await getAuditLogsAction({
      entityType: (filters?.entityType || undefined) as AuditEntityType | undefined,
      result: (filters?.result || undefined) as 'success' | 'failure' | undefined,
    });
    setIsLoading(false);
    if (response.success) {
      setLogs(response.data);
    } else {
      setError(response.error.message);
    }
  }

  async function handleEntityTypeChange(value: string) {
    setEntityType(value);
    await refresh({ entityType: value, result });
  }

  async function handleResultChange(value: string) {
    setResult(value);
    await refresh({ entityType, result: value });
  }

  function clearFilters() {
    setEntityType('');
    setResult('');
    void refresh({ entityType: '', result: '' });
  }

  const hasFilters = entityType !== '' || result !== '';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="audit-entity">Tipo de entidad</Label>
          <Select
            id="audit-entity"
            value={entityType}
            onChange={(e) => void handleEntityTypeChange(e.target.value)}
            className="min-w-[180px]"
          >
            <option value="">Todas las entidades</option>
            {(Object.keys(ENTITY_TYPE_LABELS) as AuditEntityType[]).map((type) => (
              <option key={type} value={type}>
                {ENTITY_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-result">Resultado</Label>
          <Select
            id="audit-result"
            value={result}
            onChange={(e) => void handleResultChange(e.target.value)}
            className="min-w-[160px]"
          >
            <option value="">Todos los resultados</option>
            <option value="success">Exitoso</option>
            <option value="failure">Fallido</option>
          </Select>
        </div>
        {hasFilters && (
          <Button type="button" variant="ghost" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
        <p className="ml-auto text-xs text-slate-500" aria-live="polite">
          {logs.length} registro{logs.length === 1 ? '' : 's'} · últimos 200
        </p>
      </div>

      {error && (
        <Alert tone="danger" title="No se pudieron cargar los registros">
          {error}
        </Alert>
      )}

      {logs.length === 0 && !isLoading && !error ? (
        <EmptyState
          icon={<ShieldCheck className="w-12 h-12" aria-hidden="true" />}
          title={hasFilters ? 'Sin resultados para los filtros' : 'Aún no hay registros de auditoría'}
          description={
            hasFilters
              ? 'Ajusta los filtros para encontrar el evento que buscas.'
              : 'Cuando el equipo realice operaciones, quedarán registradas aquí de forma inmutable.'
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Fecha y hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap tabular-nums text-slate-600">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {userNames[log.user_id] ?? log.user_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.role}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {ENTITY_TYPE_LABELS[log.entity_type] ?? log.entity_type}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </TableCell>
                  <TableCell>
                    {log.result === 'success' ? (
                      <Badge variant="success">Exitoso</Badge>
                    ) : (
                      <Badge variant="danger">Fallido</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate text-xs text-slate-500" title={metadataPreview(log.metadata)}>
                    {metadataPreview(log.metadata)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
