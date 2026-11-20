'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { DentalClinicError } from '@/errors/domain';
import { requirePlatformAccess } from '@/lib/platform/access';
import { withErrorHandling } from '@/lib/server-action-wrapper';
import { createClient } from '@/lib/supabase/server';

const subscriptionSchema = z.object({
  clinicId: z.uuid(),
  plan: z.string().trim().min(1).max(80),
  status: z.enum(['pending', 'active', 'paused', 'cancelled']),
  startsOn: z.iso.date(),
  endsOn: z.iso.date(),
}).refine((input) => input.endsOn >= input.startsOn, {
  path: ['endsOn'], message: 'La fecha de fin debe ser igual o posterior al inicio.',
});

export async function updateSubscription(rawInput: z.input<typeof subscriptionSchema>) {
  return withErrorHandling(async () => {
    await requirePlatformAccess();
    const input = subscriptionSchema.parse(rawInput);
    const supabase = await createClient();
    const { error, data } = await supabase.rpc('set_clinic_subscription', {
      target_clinic: input.clinicId, plan_name: input.plan, plan_status: input.status,
      starts_on: input.startsOn, ends_on: input.endsOn,
    });
    if (error || !data) {
      throw new DentalClinicError('No se pudo actualizar la suscripción.', 'SUBSCRIPTION_UPDATE_FAILED', error ? 500 : 404);
    }
    revalidatePath('/plataforma');
    return { clinicId: input.clinicId };
  });
}
