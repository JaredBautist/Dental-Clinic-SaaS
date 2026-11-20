import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  requireRole: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/auth/require-user', () => ({ requireRole: mocks.requireRole }));

import { getDashboardStatsAction } from '@/lib/actions/dashboard.actions';

afterEach(() => vi.useRealTimers());

it('counts only the signed-in dentist’s Bogotá appointments, including visits in progress', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-21T02:00:00Z'));
  mocks.requireRole.mockResolvedValue({ role: 'odontologo', clinicId: 'clinic-a', userId: 'dentist-a' });
  const appointments = [
    { id: 'in-progress', clinic_id: 'clinic-a', dentist_id: 'dentist-a', scheduled_at: '2026-11-21T01:00:00.000Z', status: 'en_curso' },
    { id: 'completed', clinic_id: 'clinic-a', dentist_id: 'dentist-a', scheduled_at: '2026-11-20T15:00:00.000Z', status: 'completada' },
    { id: 'another-dentist', clinic_id: 'clinic-a', dentist_id: 'dentist-b', scheduled_at: '2026-11-20T16:00:00.000Z', status: 'programada' },
    { id: 'another-clinic', clinic_id: 'clinic-b', dentist_id: 'dentist-a', scheduled_at: '2026-11-20T17:00:00.000Z', status: 'programada' },
    { id: 'next-day', clinic_id: 'clinic-a', dentist_id: 'dentist-a', scheduled_at: '2026-11-21T05:00:00.000Z', status: 'programada' },
  ];
  let rows = appointments;
  type Column = 'clinic_id' | 'dentist_id' | 'scheduled_at';
  const query = {
    select: () => query,
    eq(column: Column, value: string) { rows = rows.filter((row) => row[column] === value); return query; },
    gte(_: string, value: string) { rows = rows.filter((row) => Date.parse(row.scheduled_at) >= Date.parse(value)); return query; },
    lte(_: string, value: string) { rows = rows.filter((row) => Date.parse(row.scheduled_at) <= Date.parse(value)); return query; },
    order: async () => ({ data: rows, error: null }),
  };
  mocks.createClient.mockResolvedValue({
    from: (table: string) => table === 'appointments' ? query : { select: () => ({ eq: async () => ({ count: 2 }) }) },
  });

  const result = await getDashboardStatsAction({ dentistId: 'dentist-b' });
  expect(result.success).toBe(true);
  expect(result.data).toMatchObject({ todayAppointments: 2, pendingConfirmations: 0, pendingVisits: 1, completedToday: 1 });
  expect(result.data?.todayList.map((appointment) => appointment.id)).toEqual(['in-progress', 'completed']);
});
