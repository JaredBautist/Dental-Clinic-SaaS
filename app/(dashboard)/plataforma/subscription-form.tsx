'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { updateSubscription } from '@/lib/platform/subscriptions.actions';

export type Subscription = {
  id: string;
  subscription_plan: string | null;
  subscription_status: 'pending' | 'active' | 'paused' | 'cancelled';
  subscription_starts_on: string | null;
  subscription_ends_on: string | null;
};

export function SubscriptionForm({ clinic }: { clinic: Subscription }) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFeedback(null);
    setPending(true);
    try {
      const result = await updateSubscription({
        clinicId: clinic.id, plan: String(form.get('plan')),
        status: String(form.get('status')) as Subscription['subscription_status'],
        startsOn: String(form.get('startsOn')), endsOn: String(form.get('endsOn')),
      });
      setFeedback(result.success
        ? { message: 'Suscripción actualizada.', error: false }
        : { message: result.error.message, error: true });
    } catch {
      setFeedback({ message: 'No se pudo guardar. Vuelve a intentarlo.', error: true });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-4" aria-busy={pending}>
      <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          <span>Plan</span><Input name="plan" required maxLength={80} defaultValue={clinic.subscription_plan ?? ''} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Estado</span>
          <Select name="status" defaultValue={clinic.subscription_status}>
            <option value="pending">Pendiente</option><option value="active">Activa</option>
            <option value="paused">Pausada</option><option value="cancelled">Cancelada</option>
          </Select>
        </label>
        <div className="space-y-2">
          <Label htmlFor="subscription-start">Inicio</Label>
          <Input id="subscription-start" type="date" name="startsOn" required defaultValue={clinic.subscription_starts_on ?? ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subscription-end">Vencimiento</Label>
          <Input id="subscription-end" type="date" name="endsOn" required defaultValue={clinic.subscription_ends_on ?? ''} />
        </div>
      </fieldset>
      <Button type="submit" isLoading={pending}>Guardar suscripción</Button>
      {feedback?.error && <Alert tone="danger" title="No se pudo guardar">{feedback.message}</Alert>}
      {feedback && !feedback.error && <p role="status">{feedback.message}</p>}
    </form>
  );
}
