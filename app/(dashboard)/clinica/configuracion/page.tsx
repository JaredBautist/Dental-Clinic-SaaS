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
} from 'lucide-react';
import type { Clinic } from '@/types/domain';

// Datos mock
const mockClinic: Clinic = {
  id: 'clinic-1',
  name: 'Consultorio Dental Sonrisas',
  address: 'Av. 5 # 12-30, Cúcuta, Norte de Santander',
  phone: '3157894561',
  email: 'contacto@sonrisas.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export default function ClinicConfigPage() {
  const [clinic, setClinic] = React.useState<Clinic>(mockClinic);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: clinic.name,
    address: clinic.address || '',
    phone: clinic.phone || '',
    email: clinic.email || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClinic({ ...clinic, ...formData });
    setIsEditing(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración del Consultorio"
        description="Gestión de datos institucionales y preferencias del consultorio"
        action={
          !isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Editar Información
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinic Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Información General
            </CardTitle>
            <CardDescription>
              Datos de identificación del consultorio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Consultorio *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: clinic.name,
                        address: clinic.address || '',
                        phone: clinic.phone || '',
                        email: clinic.email || '',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                  <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Nombre</p>
                    <p className="text-base font-semibold text-slate-900">{clinic.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Dirección</p>
                    <p className="text-base text-slate-900">{clinic.address || 'No especificada'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Teléfono</p>
                      <p className="text-base text-slate-900">{clinic.phone || 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
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

        {/* System Info */}
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
                <span className="text-sm text-slate-600">Entorno</span>
                <Badge variant="success">Producción</Badge>
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
