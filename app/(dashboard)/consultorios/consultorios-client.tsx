'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, ChevronRight, Plus, UserPlus, Users } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  createClinicUserAction,
  getAdminClinicDetailAction,
  updateAdminClinicAction,
  updateAdminClinicUserAction,
  type AdminClinicDetail,
} from '@/lib/actions/admin-clinics.actions';
import type { Clinic, UserProfile, UserRole } from '@/types/domain';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<UserRole, string> = {
  administrador: 'Administrador',
  odontologo: 'Odontólogo',
  recepcionista: 'Recepcionista',
};

interface ClinicFormState {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface UserFormState {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

const EMPTY_USER_FORM: UserFormState = {
  fullName: '',
  email: '',
  password: '',
  role: 'odontologo',
};

function clinicToForm(clinic: Clinic): ClinicFormState {
  return {
    name: clinic.name,
    address: clinic.address ?? '',
    phone: clinic.phone ?? '',
    email: clinic.email ?? '',
  };
}

interface ConsultoriosClientProps {
  initialClinics: Clinic[];
  initialDetail: AdminClinicDetail | null;
}

export function ConsultoriosClient({ initialClinics, initialDetail }: ConsultoriosClientProps) {
  const [clinics, setClinics] = React.useState(initialClinics);
  const [selectedId, setSelectedId] = React.useState(initialDetail?.clinic.id ?? '');
  const [detail, setDetail] = React.useState(initialDetail);
  const [clinicForm, setClinicForm] = React.useState<ClinicFormState | null>(
    initialDetail ? clinicToForm(initialDetail.clinic) : null
  );

  const [isDetailLoading, setIsDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);
  const detailRequestRef = React.useRef(0);

  const [isSavingClinic, setIsSavingClinic] = React.useState(false);
  const [clinicMessage, setClinicMessage] = React.useState<string | null>(null);
  const [clinicError, setClinicError] = React.useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState<UserFormState>(EMPTY_USER_FORM);
  const [creatingUser, setCreatingUser] = React.useState(false);
  const [userMessage, setUserMessage] = React.useState<string | null>(null);
  const [userError, setUserError] = React.useState<string | null>(null);
  const [busyUserId, setBusyUserId] = React.useState<string | null>(null);

  function applyDetail(next: AdminClinicDetail) {
    setDetail(next);
    setClinicForm(clinicToForm(next.clinic));
    setNewUser(EMPTY_USER_FORM);
    setIsCreateOpen(false);
    setUserError(null);
    setUserMessage(null);
  }

  async function selectClinic(clinicId: string) {
    if (!clinicId || clinicId === selectedId) return;

    const requestId = ++detailRequestRef.current;
    setSelectedId(clinicId);
    setDetail(null);
    setClinicForm(null);
    setClinicError(null);
    setClinicMessage(null);
    setDetailError(null);
    setIsDetailLoading(true);

    const result = await getAdminClinicDetailAction(clinicId);
    if (detailRequestRef.current !== requestId) return;

    if (result.success) {
      applyDetail(result.data);
    } else {
      setDetailError(result.error.message);
    }
    setIsDetailLoading(false);
  }

  async function handleClinicSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !clinicForm) return;

    setIsSavingClinic(true);
    setClinicError(null);
    setClinicMessage(null);

    const result = await updateAdminClinicAction({
      clinicId: selectedId,
      name: clinicForm.name,
      address: clinicForm.address || null,
      phone: clinicForm.phone || null,
      email: clinicForm.email || null,
    });

    setIsSavingClinic(false);
    if (result.success) {
      setClinicForm(clinicToForm(result.data));
      setClinics((current) =>
        current.map((clinic) => (clinic.id === result.data.id ? result.data : clinic))
      );
      setDetail((current) => (current ? { ...current, clinic: result.data } : current));
      setClinicMessage('Información del consultorio actualizada correctamente.');
    } else {
      setClinicError(result.error.message);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setCreatingUser(true);
    setUserError(null);
    setUserMessage(null);

    const result = await createClinicUserAction({
      clinicId: selectedId,
      fullName: newUser.fullName.trim(),
      email: newUser.email.trim(),
      password: newUser.password,
      role: newUser.role,
    });

    setCreatingUser(false);
    if (result.success) {
      const created = result.data;
      setDetail((current) =>
        current
          ? {
              ...current,
              users: [...current.users, created].sort((a, b) =>
                a.full_name.localeCompare(b.full_name)
              ),
            }
          : current
      );
      setUserMessage(
        `${created.full_name} ya puede ingresar con ${newUser.email.trim()} y la contraseña inicial indicada.`
      );
      setNewUser(EMPTY_USER_FORM);
      setIsCreateOpen(false);
    } else {
      setUserError(result.error.message);
    }
  }

  async function handleUserUpdate(
    user: UserProfile,
    updates: { role?: UserRole; isActive?: boolean }
  ) {
    if (!detail) return;

    setBusyUserId(user.id);
    setUserError(null);
    setUserMessage(null);

    const result = await updateAdminClinicUserAction({
      clinicId: detail.clinic.id,
      userId: user.id,
      ...updates,
    });

    setBusyUserId(null);
    if (result.success) {
      setDetail((current) =>
        current
          ? {
              ...current,
              users: current.users.map((currentUser) =>
                currentUser.id === result.data.id ? result.data : currentUser
              ),
            }
          : current
      );
      setUserMessage(`${user.full_name} fue actualizado correctamente.`);
    } else {
      setUserError(result.error.message);
    }
  }

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-3">
      <Card className="min-w-0 xl:col-span-1">
        <CardHeader>
          <CardTitle>Consultorios registrados</CardTitle>
          <CardDescription>
            {clinics.length} {clinics.length === 1 ? 'consultorio' : 'consultorios'} en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clinics.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-10 w-10" aria-hidden="true" />}
              title="Aún no hay consultorios"
              description="Registra el primero para administrar sus usuarios."
              action={
                <Button asChild>
                  <Link href="/clinica/nueva">Registrar consultorio</Link>
                </Button>
              }
            />
          ) : (
            <ul className="-mx-2 space-y-2">
              {clinics.map((clinic) => (
                <li key={clinic.id}>
                  <button
                    type="button"
                    // Usamos un control explícito para que el detalle refresque tras cada selección.
                    aria-pressed={clinic.id === selectedId}
                    onClick={() => selectClinic(clinic.id)}
                    className={cn(
                      'flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600',
                      clinic.id === selectedId
                        ? 'border-cyan-300 bg-cyan-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Building2
                        className={cn(
                          'h-5 w-5 shrink-0',
                          clinic.id === selectedId ? 'text-cyan-600' : 'text-slate-400'
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-semibold text-slate-900">
                          {clinic.name}
                        </span>
                        <span className="mt-0.5 block break-all text-xs text-slate-500">
                          {clinic.email || clinic.address || 'Sin información de contacto'}
                        </span>
                      </span>
                    </span>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 shrink-0',
                        clinic.id === selectedId ? 'text-cyan-600' : 'text-slate-300'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-6 xl:col-span-2">
        {isDetailLoading && (
          <div
            role="status"
            className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
          >
            Cargando información del consultorio…
          </div>
        )}

        {detailError && <Alert tone="danger">{detailError}</Alert>}

        {!isDetailLoading && !detailError && !detail && (
          <Alert tone="info">Selecciona un consultorio del listado para ver su información.</Alert>
        )}

        {detail && clinicForm && (
          <>
            <Card className="min-w-0">
              <CardHeader>
                <div className="min-w-0">
                  <CardTitle className="break-words">{detail.clinic.name}</CardTitle>
                  <CardDescription>Edita la información del consultorio seleccionado</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleClinicSave} className="min-w-0 space-y-4">
                  {clinicMessage && <Alert tone="success">{clinicMessage}</Alert>}
                  {clinicError && <Alert tone="danger">{clinicError}</Alert>}

                  <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="selected-clinic-name">Nombre</Label>
                      <Input
                        id="selected-clinic-name"
                        value={clinicForm.name}
                        onChange={(e) =>
                          setClinicForm((current) =>
                            current ? { ...current, name: e.target.value } : current
                          )}
                        required
                        maxLength={120}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="selected-clinic-address">Dirección</Label>
                      <Input
                        id="selected-clinic-address"
                        value={clinicForm.address}
                        onChange={(e) =>
                          setClinicForm((current) =>
                            current ? { ...current, address: e.target.value } : current
                          )}
                        maxLength={255}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selected-clinic-phone">Teléfono</Label>
                      <Input
                        id="selected-clinic-phone"
                        type="tel"
                        inputMode="numeric"
                        value={clinicForm.phone}
                        onChange={(e) =>
                          setClinicForm((current) =>
                            current
                              ? { ...current, phone: e.target.value.replace(/\D/g, '') }
                              : current
                          )}
                        maxLength={15}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selected-clinic-email">Correo electrónico</Label>
                      <Input
                        id="selected-clinic-email"
                        type="email"
                        value={clinicForm.email}
                        onChange={(e) =>
                          setClinicForm((current) =>
                            current ? { ...current, email: e.target.value } : current
                          )}
                        maxLength={254}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-200 pt-4">
                    <Button type="submit" isLoading={isSavingClinic}>
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <CardTitle>Usuarios del consultorio</CardTitle>
                  <CardDescription>
                    {detail.users.length} {detail.users.length === 1 ? 'usuario' : 'usuarios'} registrados
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant={isCreateOpen ? 'outline' : 'default'}
                  onClick={() => {
                    setIsCreateOpen((open) => !open);
                    setUserError(null);
                    setUserMessage(null);
                  }}
                >
                  {isCreateOpen ? (
                    <>
                      <Plus className="mr-2 h-4 w-4 rotate-45" aria-hidden="true" />
                      Cerrar formulario
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Nuevo usuario
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="min-w-0 space-y-4">
                {userMessage && <Alert tone="success">{userMessage}</Alert>}
                {userError && <Alert tone="danger">{userError}</Alert>}

                {isCreateOpen && (
                    <form
                      onSubmit={handleCreateUser}
                      className="min-w-0 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
                    >
                      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="clinic-user-name">Nombre completo</Label>
                          <Input
                            id="clinic-user-name"
                            value={newUser.fullName}
                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                            required
                            maxLength={200}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clinic-user-email">Correo electrónico</Label>
                          <Input
                            id="clinic-user-email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                            maxLength={254}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clinic-user-password">Contraseña inicial</Label>
                          <Input
                            id="clinic-user-password"
                            type="password"
                            autoComplete="new-password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                            minLength={8}
                            maxLength={72}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="clinic-user-role">Rol</Label>
                          <Select
                            id="clinic-user-role"
                            value={newUser.role}
                            onChange={(e) =>
                              setNewUser({ ...newUser, role: e.target.value as UserRole })
                            }
                          >
                            <option value="odontologo">Odontólogo</option>
                            <option value="recepcionista">Recepcionista</option>
                            <option value="administrador">Administrador</option>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateOpen(false);
                            setNewUser(EMPTY_USER_FORM);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" isLoading={creatingUser}>
                          Crear usuario
                        </Button>
                      </div>
                    </form>
                  )}

                {detail.users.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                    <Users className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                    <p>No hay usuarios. Crea el primero con «Nuevo usuario».</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {detail.users.map((user) => (
                      <li
                        key={user.id}
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-900">
                            {user.full_name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant={user.is_active ? 'success' : 'danger'}>
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {user.mfa_enabled ? 'MFA configurado' : 'MFA pendiente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-2">
                          <div className="space-y-1.5">
                            <Label htmlFor={`role-${user.id}`} className="text-xs">
                              Rol asignado
                            </Label>
                            <Select
                              id={`role-${user.id}`}
                              aria-label={`Rol de ${user.full_name}`}
                              value={user.role}
                              disabled={busyUserId === user.id}
                              onChange={(e) =>
                                handleUserUpdate(user, { role: e.target.value as UserRole })
                              }
                              className="w-40"
                            >
                              {(['administrador', 'odontologo', 'recepcionista'] as UserRole[]).map(
                                (role) => (
                                  <option key={role} value={role}>
                                    {ROLE_LABELS[role]}
                                  </option>
                                )
                              )}
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyUserId === user.id}
                            onClick={() => handleUserUpdate(user, { isActive: !user.is_active })}
                            className={user.is_active ? 'text-rose-700' : 'text-emerald-700'}
                          >
                            {busyUserId === user.id
                              ? 'Actualizando…'
                              : user.is_active
                                ? 'Desactivar'
                                : 'Activar'}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
