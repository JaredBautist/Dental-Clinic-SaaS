import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import type { Clinic } from '@/types/domain';

const mocks = vi.hoisted(() => ({
  profile: vi.fn(),
  clinics: vi.fn(),
  detail: vi.fn(),
}));

vi.mock('@/lib/auth/shell-profile', () => ({ getShellProfile: mocks.profile }));
vi.mock('@/lib/actions/admin-clinics.actions', () => ({
  getAdminClinicDetailAction: mocks.detail,
  listAdminClinicsAction: mocks.clinics,
}));

import DashboardPage from '@/app/(dashboard)/dashboard/page';

const north: Clinic = { id: '11111111-1111-4111-8111-111111111111', name: 'Norte', created_at: '', updated_at: '' };
const south: Clinic = { id: '22222222-2222-4222-8222-222222222222', name: 'Sur', created_at: '', updated_at: '' };

function dashboard(clinic?: string) {
  return DashboardPage({ searchParams: Promise.resolve({ clinic }) }).then(renderToStaticMarkup);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.profile.mockResolvedValue({ role: 'administrador', clinicId: north.id });
  mocks.detail.mockImplementation((id: string) => ({
    success: true,
    data: {
      clinic: id === south.id ? south : north,
      users: [{ id, full_name: id === south.id ? 'Personal Sur' : 'Personal Norte', role: 'odontologo', is_active: true }],
    },
  }));
});

it('renders the chosen clinic and scoped management links for a platform operator', async () => {
  mocks.clinics.mockResolvedValue({ success: true, data: [north, south] });
  const html = await dashboard(south.id);
  expect(mocks.detail).toHaveBeenCalledExactlyOnceWith(south.id);
  expect(html).toContain('Consultorio que estás consultando');
  expect(html).toContain('Personal Sur');
  expect(html).not.toContain('Personal Norte');
  expect(html).toContain(`/consultorios?clinic=${south.id}`);
  expect(html).not.toContain('href="/usuarios"');
});

it('ignores a foreign clinic URL for a local administrator', async () => {
  mocks.clinics.mockResolvedValue({ success: true, data: [north] });
  const html = await dashboard(south.id);
  expect(mocks.detail).toHaveBeenCalledExactlyOnceWith(north.id);
  expect(html).toContain('Personal Norte');
  expect(html).not.toContain('Consultorio que estás consultando');
});

it('defaults to the account clinic when the selection is missing or outside the authorized list', async () => {
  mocks.clinics.mockResolvedValue({ success: true, data: [south, north] });
  await dashboard('foreign');
  expect(mocks.detail).toHaveBeenCalledExactlyOnceWith(north.id);
});
