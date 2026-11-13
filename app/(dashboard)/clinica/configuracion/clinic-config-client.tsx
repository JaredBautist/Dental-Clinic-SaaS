'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Save,
  ShieldCheck,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { updateClinicAction, type UpdateClinicInput } from '@/lib/actions/clinic.actions';
import type { Clinic } from '@/types/domain';

interface ClinicConfigClientProps {
  initialClinic: Clinic;
}

export function ClinicConfigClient({ initialClinic }: ClinicConfigClientProps) {
  const [clinic, setClinic] = React.useState<Clinic>(initialClinic);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);
  const [formData, setFormData] = React.useState({
    name: initialClinic.name,
    address: initialClinic.address || '',
    phone: initialClinic.phone || '',
    email: initialClinic.email || '',
  });

  function resetForm(source: Clinic) {
    setFormData({
      name: source.name,
      address: source.address || '',
      phone: source.phone || '',
      email: source.email || '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const trimmedPhone = formData.phone.trim();
    if (trimmedPhone && !/^[0-9]{7,15}$/.test(trimmedPhone)) {
      setFeedback({ type: 'error', message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: UpdateClinicInput = {
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        phone: trimmedPhone || null,
        email: formData.email.trim() || null,
      };

      const result = await updateClinicAction(payload);

      if (!result.success) {
        setFeedback({ type: 'error', message: result.error.message });
        return;
      }

      setClinic(result.data);
      resetForm(result.data);
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Configuración guardada correctamente.' });
    } catch {
      setFeedback({ type: 'error', message: 'No se pudo guardar los cambios. Intente de nuevo.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración del Consultorio"
        description="Gestión de datos institucionales y preferencias del consultorio"
        action={
          !isEditing && (
            <Button
              onClick={() => {
                setFeedback(null);
                setIsEditing(true);
              }}
            >
              Editar Información
            </Button>
          )
        }
      />

      {feedback && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información General
            </CardTitle>
            <CardDescription>Datos de identificación del consultorio</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="clinic-name"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Nombre del Consultorio *
                  </label>
                  <Input
                    id="clinic-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={120}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="clinic-address"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    Dirección
                  </label>
                  <Input
                    id="clinic-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    maxLength={255}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="clinic-phone"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Teléfono
                    </label>
                    <Input
                      id="clinic-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="3157894561"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="clinic-email"
                      className="block text-sm font-medium text-slate-700 mb-1"
                    >
                      Correo Electrónico
                    </label>
                    <Input
                      id="clinic-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contacto@consultorio.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => {
                      setIsEditing(false);
                      resetForm(clinic);
                      setFeedback(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                  <Building2 className="w-5 h-5 text-slate-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nombre</p>
                    <p className="text-base font-semibold text-slate-900">{clinic.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Dirección</p>
                    <p className="text-base text-slate-900">{clinic.address || 'No especificada'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Teléfono</p>
                      <p className="text-base text-slate-900">{clinic.phone || 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Correo</p>
                      <p className="text-base text-slate-900">{clinic.email || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Versión</span>
                <Badge variant="secondary">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Aislamiento RLS</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Base de Datos</span>
                <Badge variant="success">Conectada</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Almacenamiento</span>
                <Badge variant="success">Activo</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horario de Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map((day) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{day}</span>
                    <span className="font-medium text-slate-900">8:00 - 18:00</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Sábado</span>
                  <span className="font-medium text-slate-900">8:00 - 13:00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Domingo</span>
                  <Badge variant="secondary">Cerrado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Información de Registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">ID del Consultorio</span>
                  <span className="font-mono text-xs text-slate-900">{clinic.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Fecha de Registro</span>
                  <span className="text-slate-900">
                    {new Date(clinic.created_at).toLocaleDateString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Última Actualización</span>
                  <span className="text-slate-900">
                    {new Date(clinic.updated_at).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
