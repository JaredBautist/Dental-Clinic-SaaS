'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClinicAction } from '@/lib/actions/clinic.actions';
import { CheckCircle2, Eye, EyeOff, Building2, KeyRound, Mail, ArrowRight } from 'lucide-react';

interface FormState {
  name: string;
  address: string;
  phone: string;
  email: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  address: '',
  phone: '',
  email: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

interface CreatedClinic {
  name: string;
  adminEmail: string;
  adminPassword: string;
}

export function CreateClinicForm() {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<CreatedClinic | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFormError(null);
    setCreated(null);

    const result = await createClinicAction({
      name: form.name.trim(),
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim(),
      adminPassword: form.adminPassword,
    });

    setIsSaving(false);

    if (result.success) {
      setCreated({ name: result.data.name, adminEmail: result.data.adminEmail, adminPassword: form.adminPassword });
      setForm(EMPTY_FORM);
      setShowPassword(false);
      // Refresca el RSC cache para que el caso nuevo aparezca al abrir Consultorios.
      router.refresh();
    } else {
      setFormError(result.error.message);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-600" aria-hidden="true" />
          Datos del consultorio
        </CardTitle>
        <CardDescription>
          La recepcionista de cada consultorio se encarga de registrar pacientes y agendar citas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {created && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              Consultorio «{created.name}» registrado correctamente
            </p>
            <div className="mt-3 space-y-2 rounded-lg border border-emerald-200 bg-white p-3 text-sm">
              <p className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
                Correo del administrador: <span className="font-mono">{created.adminEmail}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <KeyRound className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
                Contraseña temporal: <span className="font-mono">{created.adminPassword}</span>
              </p>
              <p className="text-xs text-slate-500">
                Comparte estas credenciales con el administrador del nuevo consultorio para que
                inicie sesión en /login.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-3">
                <Link href="/consultorios">
                  Ver todos los consultorios
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert tone="danger" title="No se pudo registrar el consultorio">
              {formError}
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clinic-name">Nombre del consultorio</Label>
              <Input
                id="clinic-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Ej: Clínica Dental San José"
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clinic-address">Dirección</Label>
              <Input
                id="clinic-address"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Calle 10 # 5-20, Cúcuta"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-phone">Teléfono</Label>
              <Input
                id="clinic-phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="3123456789"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic-email">Correo de contacto</Label>
              <Input
                id="clinic-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="contacto@consultorio.com"
                maxLength={254}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-900">Administrador inicial</h3>
            <p className="mt-1 text-xs text-slate-500">
              Se creará una cuenta con rol «Administrador» para este consultorio.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clinic-admin-name">Nombre completo</Label>
              <Input
                id="clinic-admin-name"
                value={form.adminName}
                onChange={(e) => update('adminName', e.target.value)}
                placeholder="Ej: Dra. María González"
                required
                maxLength={200}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clinic-admin-email">Correo electrónico</Label>
              <Input
                id="clinic-admin-email"
                type="email"
                value={form.adminEmail}
                onChange={(e) => update('adminEmail', e.target.value)}
                placeholder="admin@consultorio.com"
                required
                maxLength={254}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clinic-admin-password">Contraseña inicial</Label>
              <div className="relative">
                <Input
                  id="clinic-admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.adminPassword}
                  onChange={(e) => update('adminPassword', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFormError(null);
              }}
            >
              Limpiar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Registrar consultorio
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
