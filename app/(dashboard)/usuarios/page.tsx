'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Trash2,
  Mail,
  Phone,
} from 'lucide-react';
import type { UserProfile, UserRole } from '@/types/domain';

// Datos mock
const mockUsers: UserProfile[] = [
  {
    id: '1',
    clinic_id: 'clinic-1',
    role: 'administrador',
    full_name: 'Dr. Juan Pérez',
    is_active: true,
    mfa_enabled: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    clinic_id: 'clinic-1',
    role: 'odontologo',
    full_name: 'Dra. María López',
    is_active: true,
    mfa_enabled: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    clinic_id: 'clinic-1',
    role: 'recepcionista',
    full_name: 'Ana García',
    is_active: true,
    mfa_enabled: false,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '4',
    clinic_id: 'clinic-1',
    role: 'odontologo',
    full_name: 'Dr. Carlos Ruiz',
    is_active: false,
    mfa_enabled: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
];

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

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserProfile[]>(mockUsers);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);

  const activeUsers = users.filter((u) => u.is_active);
  const inactiveUsers = users.filter((u) => !u.is_active);

  function handleNewUser() {
    setEditingUser(null);
    setIsModalOpen(true);
  }

  function handleEditUser(user: UserProfile) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  function handleToggleActive(userId: string) {
    setUsers(users.map((u) =>
      u.id === userId ? { ...u, is_active: !u.is_active } : u
    ));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administración del equipo del consultorio y asignación de roles"
        action={
          <Button onClick={handleNewUser}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar Usuario
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === 'administrador').length}
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
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === 'odontologo').length}
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
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === 'recepcionista').length}
                </p>
                <p className="text-xs text-slate-500">Recepcionistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
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
                  <UserPlus className="w-4 h-4 mr-2" />
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
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.full_name}</p>
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
                          title="Editar"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Desactivar"
                          onClick={() => handleToggleActive(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Inactive Users */}
      {inactiveUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-500">
              <UserCog className="w-5 h-5" />
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
                          {user.full_name.charAt(0)}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(user.id)}
                      >
                        Reactivar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* User Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Invitar Nuevo Usuario'}
        description={editingUser ? 'Modifique los datos del usuario' : 'Complete los datos para enviar una invitación'}
        size="md"
      >
        <UserForm
          user={editingUser}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function UserForm({ user, onClose }: { user: UserProfile | null; onClose: () => void }) {
  const [formData, setFormData] = React.useState({
    full_name: user?.full_name || '',
    email: '',
    role: user?.role || 'recepcionista',
    phone: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('User data:', formData);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre Completo *
        </label>
        <Input
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          placeholder="Ej: Dr. Juan Pérez"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Correo Electrónico *
        </label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="usuario@consultorio.com"
          required
        />
        <p className="mt-1 text-xs text-slate-500">
          Se enviará una invitación a este correo con las credenciales de acceso.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Rol *
        </label>
        <Select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
        >
          <option value="administrador">Administrador</option>
          <option value="odontologo">Odontólogo</option>
          <option value="recepcionista">Recepcionista</option>
        </Select>
        <div className="mt-2 space-y-1">
          {formData.role === 'administrador' && (
            <p className="text-xs text-violet-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Acceso total al sistema, incluyendo configuración y usuarios.
            </p>
          )}
          {formData.role === 'odontologo' && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Acceso a pacientes, citas, historia clínica y odontograma.
            </p>
          )}
          {formData.role === 'recepcionista' && (
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Acceso solo a pacientes y citas. Sin acceso a historia clínica.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Teléfono
        </label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="3123456789"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {user ? 'Guardar Cambios' : 'Enviar Invitación'}
        </Button>
      </div>
    </form>
  );
}
