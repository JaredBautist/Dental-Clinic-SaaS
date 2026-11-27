'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { updateAdminClinicUserAction } from '@/lib/actions/admin-clinics.actions';
import { getPlatformUserEmailAction, updatePlatformCredentialsAction } from '@/lib/platform/user-credentials.actions';
import type { UserProfile, UserRole } from '@/types/domain';

interface Props {
  user: UserProfile;
  clinicName: string;
  onClose: () => void;
  onProfileSaved: (profile: UserProfile) => void;
}

export function PlatformUserEditor({ user, clinicName, onClose, onProfileSaved }: Props) {
  const [name, setName] = useState(user.full_name);
  const [role, setRole] = useState(user.role);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [readError, setReadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { clinic_id: clinicId, id: userId } = user;

  useEffect(() => {
    let active = true;
    getPlatformUserEmailAction({ clinicId, userId }).then(result => {
      if (!active) return;
      if (result.success) {
        setEmail(result.data);
        setSavedEmail(result.data);
      } else setReadError(result.error.message);
    }).catch(() => { if (active) setReadError('No se pudo cargar el correo.'); });
    return () => { active = false; };
  }, [clinicId, userId, attempt]);

  async function save(event: FormEvent, section: 'profile' | 'credentials') {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (section === 'profile') {
        const result = await updateAdminClinicUserAction({
          clinicId, userId,
          ...(name.trim() !== user.full_name && { fullName: name.trim() }),
          ...(role !== user.role && { role }),
        });
        if (!result.success) return setError(result.error.message);
        onProfileSaved(result.data);
        setName(result.data.full_name);
        setMessage('Perfil guardado.');
      } else {
        const newEmail = email.trim();
        const result = await updatePlatformCredentialsAction({
          clinicId, userId,
          ...(newEmail !== savedEmail && { email: newEmail }),
          ...(password && { password }),
        });
        if (!result.success) return setError(result.error.message);
        setSavedEmail(newEmail);
        setPassword('');
        setMessage('Credenciales guardadas.');
      }
    } catch {
      setError('Se perdió la conexión. Vuelve a abrir el editor para comprobar los cambios.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen onClose={() => { if (!busy) onClose(); }} title="Editar usuario" description={clinicName}>
      <form onSubmit={event => save(event, 'profile')}>
        <fieldset disabled={busy} className="space-y-2">
          <legend className="mb-2 font-semibold">Perfil del usuario</legend>
          <Label htmlFor="edit-name">Nombre completo</Label>
          <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} maxLength={200} required />
          <Label htmlFor="edit-role">Rol</Label>
          <Select id="edit-role" value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="administrador">Administrador</option>
            <option value="odontologo">Odontólogo</option>
            <option value="recepcionista">Recepcionista</option>
          </Select>
          <Button type="submit" variant="outline" disabled={!name.trim() || (name.trim() === user.full_name && role === user.role)}>Guardar perfil</Button>
        </fieldset>
      </form>
      <form className="mt-5 border-t pt-4" onSubmit={event => save(event, 'credentials')}>
        <fieldset disabled={busy || savedEmail === null} className="space-y-2">
          <legend className="mb-2 font-semibold">Credenciales de acceso</legend>
          <Label htmlFor="edit-email">Correo electrónico</Label>
          <Input id="edit-email" type="email" autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
          <Label htmlFor="edit-password">Nueva contraseña (opcional)</Label>
          <Input id="edit-password" type="password" autoComplete="new-password" aria-describedby="password-help" value={password} onChange={e => setPassword(e.target.value)} minLength={8} maxLength={72} />
          <p id="password-help" className="text-sm text-slate-600">Déjala vacía para conservar la actual.</p>
          <Button type="submit" disabled={email.trim() === savedEmail && !password}>Guardar credenciales</Button>
        </fieldset>
      </form>
      {savedEmail === null && (readError ? <div className="mt-2"><p role="alert">{readError}</p><Button variant="outline" onClick={() => { setReadError(''); setAttempt(value => value + 1); }}>Reintentar</Button></div> : <p role="status">Cargando correo…</p>)}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <p role="status" className="mt-2 text-sm text-slate-700">{message}</p>
    </Modal>
  );
}
