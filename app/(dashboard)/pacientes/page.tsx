'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { EmptyState, SearchInput } from '@/components/ui/empty-state';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import type { Patient, DocumentType, BiologicalSex } from '@/types/domain';

// Datos mock
const mockPatients: Patient[] = [
  {
    id: '1',
    clinic_id: 'clinic-1',
    full_name: 'María González Pérez',
    document_type: 'CC',
    document_number: '1234567890',
    birth_date: '1985-03-15',
    biological_sex: 'femenino',
    phone_primary: '3123456789',
    email: 'maria.gonzalez@email.com',
    address: 'Calle 10 # 5-20, Cúcuta',
    guardian_name: null,
    guardian_phone: null,
    medical_history: 'Hipertensión controlada',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    clinic_id: 'clinic-1',
    full_name: 'Carlos Rodríguez López',
    document_type: 'CC',
    document_number: '9876543210',
    birth_date: '1978-07-22',
    biological_sex: 'masculino',
    phone_primary: '3109876543',
    email: 'carlos.rodriguez@email.com',
    address: 'Av. 5 # 12-30, Cúcuta',
    guardian_name: null,
    guardian_phone: null,
    medical_history: null,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    clinic_id: 'clinic-1',
    full_name: 'Ana Martínez Ruiz',
    document_type: 'TI',
    document_number: '1098765432',
    birth_date: '2010-11-08',
    biological_sex: 'femenino',
    phone_primary: '3156789012',
    email: null,
    address: 'Carrera 8 # 3-15, Cúcuta',
    guardian_name: 'Laura Ruiz',
    guardian_phone: '3167890123',
    medical_history: 'Alergia a la penicilina',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01T09:15:00Z',
  },
];

const documentTypeLabels: Record<DocumentType, string> = {
  CC: 'C.C.',
  TI: 'T.I.',
  CE: 'C.E.',
  PA: 'Pasaporte',
  RC: 'R.C.',
  NIT: 'NIT',
};

const sexLabels: Record<BiologicalSex, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  intersexual: 'Intersexual',
};

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.document_number.includes(searchQuery)
  );

  function handleNewPatient() {
    setEditingPatient(null);
    setIsModalOpen(true);
  }

  function handleEditPatient(patient: Patient) {
    setEditingPatient(patient);
    setIsModalOpen(true);
  }

  function calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Pacientes"
        description="Registro, consulta y administración de pacientes del consultorio"
        action={
          <Button onClick={handleNewPatient}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Paciente
          </Button>
        }
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              placeholder="Buscar por nombre o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select className="w-full sm:w-48">
              <option value="">Todos los tipos</option>
              <option value="CC">C.C.</option>
              <option value="TI">T.I.</option>
              <option value="CE">C.E.</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Listado de Pacientes
            <Badge variant="secondary" className="ml-2">
              {filteredPatients.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <EmptyState
              icon={<Search className="w-12 h-12" />}
              title="No se encontraron pacientes"
              description="Intenta con otros términos de búsqueda o registra un nuevo paciente."
              action={
                <Button onClick={handleNewPatient} variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registrar Paciente
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{patient.full_name}</p>
                        <p className="text-xs text-slate-500">{sexLabels[patient.biological_sex]}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-mono">{patient.document_number}</p>
                        <p className="text-xs text-slate-500">{documentTypeLabels[patient.document_type]}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{calculateAge(patient.birth_date)} años</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Phone className="w-3 h-3" />
                          {patient.phone_primary}
                        </div>
                        {patient.email && (
                          <div className="flex items-center gap-1 text-xs text-slate-600">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Activo</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => handleEditPatient(patient)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Patient Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPatient ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
        description={editingPatient ? 'Modifique los datos del paciente' : 'Complete los datos del nuevo paciente'}
        size="lg"
      >
        <PatientForm
          patient={editingPatient}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Formulario de Paciente
function PatientForm({ patient, onClose }: { patient: Patient | null; onClose: () => void }) {
  const [formData, setFormData] = React.useState({
    full_name: patient?.full_name || '',
    document_type: patient?.document_type || 'CC',
    document_number: patient?.document_number || '',
    birth_date: patient?.birth_date || '',
    biological_sex: patient?.biological_sex || 'masculino',
    phone_primary: patient?.phone_primary || '',
    email: patient?.email || '',
    address: patient?.address || '',
    guardian_name: patient?.guardian_name || '',
    guardian_phone: patient?.guardian_phone || '',
    medical_history: patient?.medical_history || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Integrar con Server Action
    console.log('Form data:', formData);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre Completo *
          </label>
          <Input
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Ej: María González Pérez"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo de Documento *
          </label>
          <Select
            value={formData.document_type}
            onChange={(e) => setFormData({ ...formData, document_type: e.target.value as DocumentType })}
          >
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="PA">Pasaporte</option>
            <option value="RC">Registro Civil</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Número de Documento *
          </label>
          <Input
            value={formData.document_number}
            onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
            placeholder="1234567890"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha de Nacimiento *
          </label>
          <Input
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sexo Biológico *
          </label>
          <Select
            value={formData.biological_sex}
            onChange={(e) => setFormData({ ...formData, biological_sex: e.target.value as BiologicalSex })}
          >
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="intersexual">Intersexual</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono Principal *
          </label>
          <Input
            value={formData.phone_primary}
            onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
            placeholder="3123456789"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="paciente@email.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Dirección
          </label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Calle 10 # 5-20, Cúcuta"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre del Acudiente
          </label>
          <Input
            value={formData.guardian_name}
            onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
            placeholder="Para menores de edad"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono del Acudiente
          </label>
          <Input
            value={formData.guardian_phone}
            onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
            placeholder="3123456789"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Antecedentes Médicos
          </label>
          <textarea
            className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            value={formData.medical_history}
            onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
            placeholder="Alergias, condiciones preexistentes, medicamentos..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {patient ? 'Guardar Cambios' : 'Registrar Paciente'}
        </Button>
      </div>
    </form>
  );
}
