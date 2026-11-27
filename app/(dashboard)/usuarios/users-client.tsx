'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlatformUserEditor } from '@/components/users/platform-user-editor';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  UserCog,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  UserX,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  createUserAction,
  updateUserAction,
  listUsersAction,
} from '@/lib/actions/users.actions';
import { updateAdminClinicUserAction } from '@/lib/actions/admin-clinics.actions';
import type { UserProfile, UserRole } from '@/types/domain';

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  administrador: {
    label: 'Administrador',
    icon: <ShieldCheck className="w-4 h-4" />,
    color: 'bg-violet-100 text-violet-800',
  },
  odontologo: {
    label: 'Odontólogo',
    icon: <Shield className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800',
  },
  recepcionista: {
    label: 'Recepcionista',
    icon: <ShieldAlert className="w-4 h-4" />,
    color: 'bg-slate-100 text-slate-800',
  },
};

interface UsersClientProps {
  clinicId: string;
  platformAccess: boolean;
  clinicName: string;
  initialUsers: UserProfile[];
  currentUserId: string;
}

export function UsersClient({ initialUsers, currentUserId, platformAccess, clinicName, clinicId }: UsersClientProps) {
  const [users, setUsers] = React.useState<UserProfile[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = React.useState<string | null>(null);

  const activeUsers = users.filter((u) => u.is_active);
  const inactiveUsers = users.filter((u) => !u.is_active);

  async function refreshUsers() {
    setIsRefreshing(true);
    try {
      const result = await listUsersAction(clinicId);
      if (result.success) {
        setUsers(result.data);
      } else setActionError(result.error.message);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleNewUser() {
    setEditingUser(null);
    setActionError(null);
    setIsModalOpen(true);
  }

  function handleEditUser(user: UserProfile) {
    setEditingUser(user);
    setActionError(null);
    setIsModalOpen(true);
  }

  async function handleToggleActive(user: UserProfile) {
    setActionError(null);
    setPendingToggleId(user.id);
    try {
      const result = await updateAdminClinicUserAction({ clinicId, userId: user.id, isActive: !user.is_active });
      if (!result.success) {
        setActionError(result.error.message);
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? result.data : u))
      );
    } catch {
      setActionError('No se pudo actualizar el estado del usuario.');
    } finally {
      setPendingToggleId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        description={`Equipo de ${clinicName}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshUsers} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
            <Button onClick={handleNewUser}>
              <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
              Invitar Usuario
            </Button>
          </div>
        }
      />

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 animate-in fade-in duration-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === 'administrador' && u.is_active).length}
                </p>
                <p className="text-xs text-slate-500">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === 'odontologo' && u.is_active).length}
                </p>
                <p className="text-xs text-slate-500">Odontólogos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === 'recepcionista' && u.is_active).length}
                </p>
                <p className="text-xs text-slate-500">Recepcionistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" aria-hidden="true" />
            Usuarios Activos
            <Badge variant="secondary" className="ml-2">
              {activeUsers.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeUsers.length === 0 ? (
            <EmptyState
              icon={<UserCog className="w-12 h-12" />}
              title="No hay usuarios activos"
              description="Invita a miembros del equipo para comenzar."
              action={
                <Button onClick={handleNewUser} variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
                  Invitar Usuario
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.full_name}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-xs text-slate-400">(tú)</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleConfig[user.role].color}>
                        <span className="flex items-center gap-1">
                          {roleConfig[user.role].icon}
                          {roleConfig[user.role].label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.mfa_enabled ? (
                        <Badge variant="success">Habilitado</Badge>
                      ) : (
                        <Badge variant="warning">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Activo</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar a ${user.full_name}`}
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={
                            user.id === currentUserId
                              ? 'No puedes desactivarte a ti mismo'
                              : 'Desactivar'
                          }
                          disabled={user.id === currentUserId || pendingToggleId === user.id}
                          onClick={() => handleToggleActive(user)}
                        >
                          {pendingToggleId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <UserX className="w-4 h-4" aria-hidden="true" />
                          )}
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

      {inactiveUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-500">
              <UserCog className="w-5 h-5" aria-hidden="true" />
              Usuarios Inactivos
              <Badge variant="secondary" className="ml-2">
                {inactiveUsers.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveUsers.map((user) => (
                  <TableRow key={user.id} className="opacity-60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-400">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-600">{user.full_name}</p>
                          <p className="text-xs text-slate-400">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleConfig[user.role].label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="danger">Inactivo</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {platformAccess && <Button variant="ghost" size="icon" aria-label={`Editar a ${user.full_name}`} onClick={() => handleEditUser(user)}><Edit2 className="size-4" aria-hidden="true" /></Button>}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingToggleId === user.id}
                        onClick={() => handleToggleActive(user)}
                      >
                        {pendingToggleId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                          'Reactivar'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {platformAccess && editingUser && isModalOpen ? (
        <PlatformUserEditor key={editingUser.id} user={editingUser} clinicName={clinicName}
          onClose={() => setIsModalOpen(false)}
          onProfileSaved={updated => {
            setEditingUser(updated);
            setUsers(current => current.map(user => user.id === updated.id ? updated : user));
          }}
        />
      ) : <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Invitar Nuevo Usuario'}
        description={
          editingUser
            ? 'Modifique los datos del usuario'
            : 'Complete los datos para enviar una invitación'
        }
        size="md"
      >
        <UserForm
          clinicId={clinicId}
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            refreshUsers();
          }}
          onError={setActionError}
        />
      </Modal>}
    </div>
  );
}

function UserForm({
  clinicId,
  user,
  onClose,
  onSaved,
  onError,
}: {
  clinicId: string;
  user: UserProfile | null;
  onClose: () => void;
  onSaved: () => void;
  onError: (message: string | null) => void;
}) {
  const [fullName, setFullName] = React.useState(user?.full_name || '');
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<UserRole>(user?.role || 'recepcionista');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    onError(null);
    setIsSubmitting(true);

    try {
      if (user) {
        const result = await updateUserAction({
          userId: user.id,
          fullName: fullName.trim(),
          role,
        });
        if (!result.success) {
          setFormError(result.error.message);
          return;
        }
      } else {
        if (!email.trim()) {
          setFormError('El correo electrónico es obligatorio.');
          return;
        }
        const result = await createUserAction({
          clinicId,
          fullName: fullName.trim(),
          email: email.trim(),
          role,
        });
        if (!result.success) {
          setFormError(result.error.message);
          return;
        }
      }
      onSaved();
    } catch {
      setFormError('Ocurrió un error inesperado. Intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{formError}</span>
        </div>
      )}

      <div>
        <label htmlFor="user-fullname" className="block text-sm font-medium text-slate-700 mb-1">
          Nombre Completo *
        </label>
        <Input
          id="user-fullname"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ej: Dr. Juan Pérez"
          maxLength={200}
          required
        />
      </div>

      {!user && (
        <div>
          <label htmlFor="user-email" className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico *
          </label>
          <Input
            id="user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@consultorio.com"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Se enviará una invitación a este correo con las credenciales de acceso.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="user-role" className="block text-sm font-medium text-slate-700 mb-1">
          Rol *
        </label>
        <Select
          id="user-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="administrador">Administrador</option>
          <option value="odontologo">Odontólogo</option>
          <option value="recepcionista">Recepcionista</option>
        </Select>
        <div className="mt-2 space-y-1">
          {role === 'administrador' && (
            <p className="text-xs text-violet-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" aria-hidden="true" />
              Acceso total al sistema, incluyendo configuración y usuarios.
            </p>
          )}
          {role === 'odontologo' && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Shield className="w-3 h-3" aria-hidden="true" />
              Acceso a pacientes, citas, historia clínica y odontograma.
            </p>
          )}
          {role === 'recepcionista' && (
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" aria-hidden="true" />
              Acceso solo a pacientes y citas. Sin acceso a historia clínica.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              Guardando...
            </>
          ) : user ? (
            'Guardar Cambios'
          ) : (
            'Enviar Invitación'
          )}
        </Button>
      </div>
    </form>
  );
}
