import { describe, expect, it } from 'vitest';
import { clinicSwitchHref, clinicViewHref, selectClinicForView } from '@/lib/platform/clinic-selection';

const north = { id: 'a', name: 'Norte' };
const south = { id: 'b', name: 'Sur' };

describe('Active clinic navigation', () => {
  it('uses the requested clinic from the authorized list', () => {
    expect(selectClinicForView([north, south], north.id, south.id)).toBe(south);
  });

  it('falls back to the account clinic for unknown and repeated parameters', () => {
    expect(selectClinicForView([south, north], north.id, 'unknown')).toBe(north);
    expect(selectClinicForView([south, north], north.id, ['b', 'a'])).toBe(north);
    expect(selectClinicForView([south, north], north.id)).toBe(north);
  });

  it('switches within supported sections and opens the clinic detail from account settings', () => {
    for (const route of ['/usuarios', '/dashboard', '/consultorios', '/plataforma']) {
      expect(clinicSwitchHref(route, south.id)).toBe(route + '?clinic=b');
    }
    for (const route of ['/auditoria', '/clinica/configuracion']) {
      expect(clinicSwitchHref(route, south.id)).toBe('/consultorios?clinic=b');
    }
  });

  it('does not add a foreign clinic to account-scoped links', () => {
    expect(clinicViewHref('/consultorios', south.id)).toBe('/consultorios?clinic=b');
    expect(clinicViewHref('/plataforma', south.id)).toBe('/plataforma?clinic=b');
    expect(clinicViewHref('/usuarios', south.id)).toBe('/usuarios?clinic=b');
    expect(clinicViewHref('/auditoria', south.id)).toBe('/auditoria');
  });
});
