'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ChevronDown, KeyRound, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { updateAdminClinicUserAction } from '@/lib/actions/admin-clinics.actions';
import { getPlatformUserEmailAction, updatePlatformCredentialsAction } from '@/lib/platform/user-credentials.actions';
import type { UserProfile, UserRole } from '@/types/domain';

const saveButtonStyle = 'w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-100 disabled:shadow-none sm:w-auto';

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
    <Modal isOpen size="xl" onClose={() => { if (!busy) onClose(); }} title="Editar usuario" description={`Consultorio · ${clinicName}`}>
      <form onSubmit={event => save(event, 'profile')}>
        <fieldset disabled={busy} className="min-w-0">
          <legend className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <UserRound className="size-5 text-blue-700" aria-hidden="true" />
            Perfil del usuario
          </legend>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nombre completo</Label>
              <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} maxLength={200} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role">Rol</Label>
              <div className="relative">
                <Select id="edit-role" className="pr-8" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                  <option value="administrador">Administrador</option>
                  <option value="odontologo">Odontólogo</option>
                  <option value="recepcionista">Recepcionista</option>
                </Select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-slate-500" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" className={saveButtonStyle} disabled={!name.trim() || (name.trim() === user.full_name && role === user.role)}>Guardar perfil</Button>
          </div>
        </fieldset>
      </form>
      <form className="mt-5 border-t border-slate-200 pt-5" onSubmit={event => save(event, 'credentials')}>
        <fieldset disabled={busy || savedEmail === null} className="min-w-0">
          <legend className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <KeyRound className="size-5 text-blue-700" aria-hidden="true" />
            Credenciales de acceso
          </legend>
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Correo electrónico</Label>
            <Input id="edit-email" type="email" autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="edit-password">Nueva contraseña <span className="font-normal text-slate-600">(opcional)</span></Label>
            <Input id="edit-password" type="password" autoComplete="new-password" aria-describedby="password-help" value={password} onChange={e => setPassword(e.target.value)} minLength={8} maxLength={72} />
            <p id="password-help" className="text-sm text-slate-600">Déjala vacía para conservar la actual.</p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" className={saveButtonStyle} disabled={email.trim() === savedEmail && !password}>Guardar credenciales</Button>
          </div>
        </fieldset>
      </form>
      {savedEmail === null && (readError ? <div className="mt-2"><p role="alert">{readError}</p><Button variant="outline" onClick={() => { setReadError(''); setAttempt(value => value + 1); }}>Reintentar</Button></div> : <p role="status">Cargando correo…</p>)}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <p role="status" className="text-sm text-slate-700 not-empty:mt-3">{message}</p>
    </Modal>
  );
}
