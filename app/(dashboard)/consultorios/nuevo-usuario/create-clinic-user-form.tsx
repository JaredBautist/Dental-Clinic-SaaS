'use client';

import * as React from 'react';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createClinicUserAction } from '@/lib/actions/admin-clinics.actions';
import type { Clinic, UserProfile, UserRole } from '@/types/domain';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  UserPlus,
} from 'lucide-react';

const ROLE_LABELS: Record<UserRole, string> = {
  administrador: 'Administrador',
  odontologo: 'Odontólogo',
  recepcionista: 'Recepcionista',
};

const ROLE_HINTS: Record<UserRole, string> = {
  administrador: 'Gestiona el consultorio, su personal y la configuración.',
  odontologo: 'Accede a pacientes, historia clínica y odontogramas.',
  recepcionista: 'Registra pacientes y agenda citas.',
};

interface FormState {
  clinicId: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

interface CreatedUser {
  user: UserProfile;
  clinicName: string;
  email: string;
  password: string;
}

type FieldErrors = Partial<Record<'email' | 'password', string>>;

interface CreateClinicUserFormProps {
  clinics: Clinic[];
  initialClinicId?: string;
}

function validateField(field: 'email' | 'password', value: string): string | undefined {
  if (field === 'email' && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return 'Ingresa un correo electrónico válido.';
  }

  if (field === 'password' && value && value.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  return undefined;
}

export function CreateClinicUserForm({ clinics, initialClinicId }: CreateClinicUserFormProps) {
  const defaultClinicId =
    clinics.find((clinic) => clinic.id === initialClinicId)?.id ?? clinics[0]?.id ?? '';

  const [form, setForm] = React.useState<FormState>({
    clinicId: defaultClinicId,
    fullName: '',
    email: '',
    password: '',
    role: 'odontologo',
  });
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<CreatedUser | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const successRef = React.useRef<HTMLDivElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (created) successRef.current?.focus();
  }, [created]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError(null);

    if (key === 'email' || key === 'password') {
      setFieldErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function handleBlur(field: 'email' | 'password') {
    setFieldErrors((current) => ({
      ...current,
      [field]: validateField(field, form[field]),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const emailError = validateField('email', form.email);
    const passwordError = validateField('password', form.password);
    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    if (!form.fullName.trim()) {
      setFormError('El nombre completo es obligatorio.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const result = await createClinicUserAction({
      clinicId: form.clinicId,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });

    setIsSaving(false);

    if (result.success) {
      const clinicName =
        clinics.find((clinic) => clinic.id === form.clinicId)?.name ?? 'Consultorio';

      setCreated({
        user: result.data,
        clinicName,
        email: form.email.trim(),
        password: form.password,
      });
      setForm((current) => ({
        ...current,
        fullName: '',
        email: '',
        password: '',
      }));
      setFieldErrors({});
      setShowPassword(false);
    } else {
      setFormError(result.error.message);
    }
  }

  function handleCreateAnother() {
    setCreated(null);
    nameInputRef.current?.focus();
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-cyan-600" aria-hidden="true" />
          Datos del usuario
        </CardTitle>
        <CardDescription>
          La cuenta queda activa de inmediato. Comparte la contraseña inicial por un canal seguro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {created && (
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 outline-none"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Usuario «{created.user.full_name}» creado correctamente
            </p>

            <dl className="mt-3 space-y-2 rounded-lg border border-emerald-200 bg-white p-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-slate-500">Consultorio</dt>
                <dd className="font-medium text-slate-900">{created.clinicName}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="text-slate-500">Rol</dt>
                <dd className="font-medium text-slate-900">{ROLE_LABELS[created.user.role]}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Correo
                </dt>
                <dd className="break-all font-mono text-slate-900">{created.email}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-slate-500">
                  <KeyRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  Contraseña inicial
                </dt>
                <dd className="break-all font-mono text-slate-900">{created.password}</dd>
              </div>
            </dl>

            <p className="mt-3 text-xs text-emerald-800">
              El usuario puede iniciar sesión en <span className="font-mono">/login</span> con estas
              credenciales. Si su rol requiere MFA, se le pedirá configurarlo al ingresar.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/consultorios?clinic=${created.user.clinic_id}`}>
                  Ver consultorio
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleCreateAnother}>
                Crear otro usuario
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert tone="danger" title="No se pudo crear el usuario">
              {formError}
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-user-clinic">Consultorio</Label>
              <Select
                id="new-user-clinic"
                value={form.clinicId}
                onChange={(e) => update('clinicId', e.target.value)}
                required
                aria-describedby="new-user-clinic-hint"
              >
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </Select>
              <p id="new-user-clinic-hint" className="text-xs text-slate-500">
                El usuario solo verá la información de este consultorio.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-user-name">Nombre completo</Label>
              <Input
                ref={nameInputRef}
                id="new-user-name"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder="Ej: Dra. María González"
                required
                maxLength={200}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-email">Correo electrónico</Label>
              <Input
                id="new-user-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="usuario@consultorio.com"
                required
                maxLength={254}
                autoComplete="email"
                error={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'new-user-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="new-user-email-error" className="text-xs text-rose-600" aria-live="polite">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-password">Contraseña inicial</Label>
              <div className="relative">
                <Input
                  id="new-user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  className="pr-10"
                  error={Boolean(fieldErrors.password)}
                  aria-describedby={`new-user-password-hint${
                    fieldErrors.password ? ' new-user-password-error' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p id="new-user-password-hint" className="text-xs text-slate-500">
                Mínimo 8 caracteres. Compártela por un canal seguro.
              </p>
              {fieldErrors.password && (
                <p
                  id="new-user-password-error"
                  className="text-xs text-rose-600"
                  aria-live="polite"
                >
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="new-user-role">Rol</Label>
              <Select
                id="new-user-role"
                value={form.role}
                onChange={(e) => update('role', e.target.value as UserRole)}
                aria-describedby="new-user-role-hint"
              >
                <option value="odontologo">Odontólogo</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="administrador">Administrador</option>
              </Select>
              <p id="new-user-role-hint" className="text-xs text-slate-500">
                {ROLE_HINTS[form.role]}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm((current) => ({
                  ...current,
                  fullName: '',
                  email: '',
                  password: '',
                }));
                setFieldErrors({});
                setFormError(null);
                setShowPassword(false);
                nameInputRef.current?.focus();
              }}
            >
              Limpiar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Crear usuario
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
