'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import { Modal } from '@/components/ui/modal';
import { EmptyState, SearchInput } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, UserPlus, Edit2, FileText, Phone, Mail, Users } from 'lucide-react';
import {
  createPatientAction,
  updatePatientAction,
  searchPatientsAction,
  type PatientInput,
} from '@/lib/actions/patients.actions';
import type { Patient, DocumentType, BiologicalSex } from '@/types/domain';

const DOCUMENT_TYPE_OPTIONS: Array<{ value: DocumentType; label: string }> = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'RC', label: 'Registro Civil' },
];

const SEX_OPTIONS: Array<{ value: BiologicalSex; label: string }> = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'intersexual', label: 'Intersexual' },
];

function documentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

interface PatientsClientProps {
  initialPatients: Patient[];
  canViewClinical: boolean;
  canManagePatients: boolean;
}

interface FormState {
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  biologicalSex: BiologicalSex;
  phonePrimary: string;
  email: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  medicalHistory: string;
}

function patientToForm(patient: Patient): FormState {
  return {
    fullName: patient.full_name,
    documentType: patient.document_type,
    documentNumber: patient.document_number,
    birthDate: patient.birth_date,
    biologicalSex: patient.biological_sex,
    phonePrimary: patient.phone_primary,
    email: patient.email ?? '',
    address: patient.address ?? '',
    guardianName: patient.guardian_name ?? '',
    guardianPhone: patient.guardian_phone ?? '',
    medicalHistory: patient.medical_history ?? '',
  };
}

const EMPTY_FORM: FormState = {
  fullName: '',
  documentType: 'CC',
  documentNumber: '',
  birthDate: '',
  biologicalSex: 'masculino',
  phonePrimary: '',
  email: '',
  address: '',
  guardianName: '',
  guardianPhone: '',
  medicalHistory: '',
};

export function PatientsClient({ initialPatients, canViewClinical, canManagePatients }: PatientsClientProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Patient[] | null>(null);
  const [lastSearchedQuery, setLastSearchedQuery] = React.useState('');
  const [extraPatients, setExtraPatients] = React.useState<Patient[]>([]);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = React.useState(false);

  const query = searchQuery.trim();
  const isSearchActive = query.length >= 2;
  const isSearching = isSearchActive && query !== lastSearchedQuery;

  React.useEffect(() => {
    if (!isSearchActive) return;

    const timer = setTimeout(async () => {
      const result = await searchPatientsAction(query);
      if (result.success) {
        setSearchResults(result.data);
        setLastSearchedQuery(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isSearchActive]);

  const patients = isSearchActive ? (searchResults ?? []) : [...extraPatients, ...initialPatients];

  function openNewPatient() {
    setEditingPatient(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditPatient(patient: Patient) {
    setEditingPatient(patient);
    setForm(patientToForm(patient));
    setFormError(null);
    setIsModalOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setFormError(null);

    const input: PatientInput = {
      fullName: form.fullName.trim(),
      documentType: form.documentType,
      documentNumber: form.documentNumber.trim(),
      birthDate: form.birthDate,
      biologicalSex: form.biologicalSex,
      phonePrimary: form.phonePrimary.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      guardianName: form.guardianName.trim() || null,
      guardianPhone: form.guardianPhone.trim() || null,
      medicalHistory: form.medicalHistory.trim() || null,
    };

    const result = editingPatient
      ? await updatePatientAction({ ...input, patientId: editingPatient.id })
      : await createPatientAction(input);

    setIsSaving(false);

    if (result.success) {
      const saved = result.data;
      setExtraPatients((prev) => {
        if (editingPatient) {
          return prev.map((p) => (p.id === saved.id ? saved : p));
        }
        return [...prev, saved];
      });
      setNotice(editingPatient ? 'Paciente actualizado correctamente.' : 'Paciente registrado correctamente.');
      setIsModalOpen(false);
    } else {
      setFormError(result.error.message);
    }
  }

  const showNotice = notice !== null;

  return (
    <div className="space-y-6">
      {showNotice && (
        <Alert tone="success">
          {notice}
        </Alert>
      )}

      <PageHeader
        title="Listado de pacientes"
        description="Busca, edita y administra los pacientes del consultorio"
        action={
          canManagePatients ? (
            <Button onClick={openNewPatient}>
              <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
              Nuevo paciente
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              La recepcionista se encarga de registrar los pacientes
            </span>
          )
        }
      />

      <SearchInput
        placeholder="Buscar por nombre o documento…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
        aria-label="Buscar pacientes"
      />

      {patients.length === 0 && !isSearching ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12">
          <EmptyState
            icon={<Search className="w-12 h-12" aria-hidden="true" />}
            title={
              searchQuery.trim() ? 'No se encontraron pacientes' : 'Aún no hay pacientes registrados'
            }
            description={
              searchQuery.trim()
                ? 'Intenta con otros términos de búsqueda.'
                : 'Registra el primer paciente del consultorio para empezar.'
            }
            action={
              searchQuery.trim() || !canManagePatients ? undefined : (
                <Button variant="outline" onClick={openNewPatient}>
                  <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                  Registrar paciente
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Paciente</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{patient.full_name}</p>
                    {patient.medical_history && (
                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                        {patient.medical_history}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-mono text-slate-700">{patient.document_number}</p>
                    <p className="text-xs text-slate-500">{documentTypeLabel(patient.document_type)}</p>
                  </TableCell>
                  <TableCell className="tabular-nums text-slate-700">
                    {calculateAge(patient.birth_date)} años
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1">
                        <Phone className="w-3 h-3" aria-hidden="true" />
                        {patient.phone_primary}
                      </p>
                      {patient.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" aria-hidden="true" />
                          {patient.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canViewClinical && (
                        <Link
                          href={`/pacientes/${patient.id}/historia`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                          aria-label={`Ver historia clínica de ${patient.full_name}`}
                          title="Historia clínica"
                        >
                          <FileText className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      )}
                      {canManagePatients && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${patient.full_name}`}
                          title="Editar"
                          onClick={() => openEditPatient(patient)}
                        >
                          <Edit2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500">
            <Badge variant="secondary">{patients.length} registros</Badge>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? 'Editar paciente' : 'Registrar nuevo paciente'}
        description={editingPatient ? 'Modifica los datos del paciente' : 'Completa los datos del nuevo paciente'}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          className="min-w-0 space-y-4"
        >
          {formError && (
            <Alert tone="danger" title="No se pudo guardar">
              {formError}
            </Alert>
          )}

          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patient-name">Nombre completo</Label>
              <Input
                id="patient-name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Ej: María González Pérez"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-doc-type">Tipo de documento</Label>
              <Select
                id="patient-doc-type"
                value={form.documentType}
                onChange={(e) => setForm({ ...form, documentType: e.target.value as DocumentType })}
              >
                {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-doc-number">Número de documento</Label>
              <Input
                id="patient-doc-number"
                value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                placeholder="1234567890"
                required
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-birth-date">Fecha de nacimiento</Label>
              <Input
                id="patient-birth-date"
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                required
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-sex">Sexo biológico</Label>
              <Select
                id="patient-sex"
                value={form.biologicalSex}
                onChange={(e) => setForm({ ...form, biologicalSex: e.target.value as BiologicalSex })}
              >
                {SEX_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-phone">Teléfono principal</Label>
              <Input
                id="patient-phone"
                type="tel"
                inputMode="numeric"
                value={form.phonePrimary}
                onChange={(e) => setForm({ ...form, phonePrimary: e.target.value })}
                placeholder="3123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-email">Correo electrónico</Label>
              <Input
                id="patient-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="paciente@email.com"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patient-address">Dirección</Label>
              <Input
                id="patient-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Calle 10 # 5-20, Cúcuta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-guardian">Nombre del acudiente</Label>
              <Input
                id="patient-guardian"
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                placeholder="Para menores de edad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-guardian-phone">Teléfono del acudiente</Label>
              <Input
                id="patient-guardian-phone"
                type="tel"
                inputMode="numeric"
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patient-history">Antecedentes médicos</Label>
              <Textarea
                id="patient-history"
                value={form.medicalHistory}
                onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
                placeholder="Alergias, condiciones preexistentes, medicamentos…"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingPatient ? 'Guardar cambios' : 'Registrar paciente'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
