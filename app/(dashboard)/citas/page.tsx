'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Calendar,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Filter,
} from 'lucide-react';
import type { Appointment, AppointmentStatus } from '@/types/domain';

// Datos mock
const mockAppointments: Appointment[] = [
  {
    id: '1',
    clinic_id: 'clinic-1',
    patient_id: '1',
    dentist_id: 'dentist-1',
    scheduled_at: '2024-03-15T09:00:00Z',
    duration_min: 30,
    ends_at: '2024-03-15T09:30:00Z',
    status: 'confirmada',
    reason: 'Limpieza dental',
    created_by: 'user-1',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z',
  },
  {
    id: '2',
    clinic_id: 'clinic-1',
    patient_id: '2',
    dentist_id: 'dentist-1',
    scheduled_at: '2024-03-15T10:30:00Z',
    duration_min: 60,
    ends_at: '2024-03-15T11:30:00Z',
    status: 'en_curso',
    reason: 'Endodoncia',
    created_by: 'user-1',
    created_at: '2024-03-12T14:00:00Z',
    updated_at: '2024-03-15T10:30:00Z',
  },
  {
    id: '3',
    clinic_id: 'clinic-1',
    patient_id: '3',
    dentist_id: 'dentist-2',
    scheduled_at: '2024-03-15T11:00:00Z',
    duration_min: 45,
    ends_at: '2024-03-15T11:45:00Z',
    status: 'programada',
    reason: 'Revisión general',
    created_by: 'user-1',
    created_at: '2024-03-14T09:00:00Z',
    updated_at: '2024-03-14T09:00:00Z',
  },
];

const statusColors: Record<AppointmentStatus, string> = {
  programada: 'bg-slate-100 text-slate-700 border-slate-200',
  confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  en_curso: 'bg-amber-50 text-amber-700 border-amber-200',
  completada: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelada: 'bg-rose-50 text-rose-700 border-rose-200',
  reprogramada: 'bg-violet-50 text-violet-700 border-violet-200',
};

const statusLabels: Record<AppointmentStatus, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_curso: 'En Curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  reprogramada: 'Reprogramada',
};

const dentists = [
  { id: 'dentist-1', name: 'Dr. Juan Pérez' },
  { id: 'dentist-2', name: 'Dra. María López' },
];

export default function AppointmentsPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDentist, setSelectedDentist] = React.useState<string>('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [view, setView] = React.useState<'day' | 'week' | 'list'>('day');

  const filteredAppointments = mockAppointments.filter((apt) => {
    if (selectedDentist !== 'all' && apt.dentist_id !== selectedDentist) return false;
    return true;
  });

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function navigateDate(direction: 'prev' | 'next') {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  }

  // Generar horas del día para la vista de agenda
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 - 18:00

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda y Citas"
        description="Calendario de citas y control anti-solapamiento"
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <CalendarPlus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        }
      />

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-center min-w-[200px]">
                  <p className="text-sm font-medium text-slate-900 capitalize">
                    {formatDate(currentDate)}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Hoy
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <Select
                  value={selectedDentist}
                  onChange={(e) => setSelectedDentist(e.target.value)}
                  className="w-48"
                >
                  <option value="all">Todos los odontólogos</option>
                  {dentists.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </div>

              <div className="flex rounded-lg border border-slate-200 p-1">
                {(['day', 'week', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      view === v
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Lista'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {view === 'day' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agenda del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hours.map((hour) => {
                const hourAppointments = filteredAppointments.filter((apt) => {
                  const aptHour = new Date(apt.scheduled_at).getHours();
                  return aptHour === hour;
                });

                return (
                  <div key={hour} className="flex gap-4 group">
                    <div className="w-16 text-right text-sm text-slate-500 py-3 font-mono">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 min-h-[60px] border-l-2 border-slate-100 pl-4 py-1 group-hover:border-slate-200 transition-colors">
                      {hourAppointments.length === 0 ? (
                        <div className="h-full flex items-center text-xs text-slate-300">
                          Disponible
                        </div>
                      ) : (
                        hourAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className={`p-3 rounded-lg border mb-2 ${statusColors[apt.status]}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  Paciente #{apt.patient_id}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {statusLabels[apt.status]}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-xs opacity-80">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(apt.scheduled_at)} - {formatTime(apt.ends_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Stethoscope className="w-3 h-3" />
                                {dentists.find((d) => d.id === apt.dentist_id)?.name}
                              </span>
                            </div>
                            <p className="mt-1 text-xs">{apt.reason}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Listado de Citas</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-12 h-12" />}
                title="No hay citas programadas"
                description="No se encontraron citas para los filtros seleccionados."
                action={
                  <Button onClick={() => setIsModalOpen(true)} variant="outline">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Agendar Cita
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-bold text-slate-900">
                          {new Date(apt.scheduled_at).getDate()}
                        </p>
                        <p className="text-xs text-slate-500 uppercase">
                          {new Date(apt.scheduled_at).toLocaleDateString('es-CO', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Paciente #{apt.patient_id}</p>
                        <p className="text-sm text-slate-500">{apt.reason}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(apt.scheduled_at)} ({apt.duration_min} min)
                          </span>
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            {dentists.find((d) => d.id === apt.dentist_id)?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[apt.status]}>
                        {statusLabels[apt.status]}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Gestionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Nueva Cita"
        description="Complete los datos para programar una cita"
        size="lg"
      >
        <AppointmentForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

function AppointmentForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = React.useState({
    patient_id: '',
    dentist_id: '',
    date: '',
    time: '',
    duration: '30',
    reason: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Appointment data:', formData);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Paciente *
          </label>
          <Select
            value={formData.patient_id}
            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
            required
          >
            <option value="">Seleccionar paciente...</option>
            <option value="1">María González Pérez</option>
            <option value="2">Carlos Rodríguez López</option>
            <option value="3">Ana Martínez Ruiz</option>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Odontólogo *
          </label>
          <Select
            value={formData.dentist_id}
            onChange={(e) => setFormData({ ...formData, dentist_id: e.target.value })}
            required
          >
            <option value="">Seleccionar odontólogo...</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha *
          </label>
          <input
            type="date"
            className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Hora *
          </label>
          <input
            type="time"
            className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Duración (minutos) *
          </label>
          <Select
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          >
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
            <option value="90">90 minutos</option>
            <option value="120">120 minutos</option>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Motivo de la Cita *
          </label>
          <textarea
            className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Describa el motivo de la consulta..."
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          Agendar Cita
        </Button>
      </div>
    </form>
  );
}
