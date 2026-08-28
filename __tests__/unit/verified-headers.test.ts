import { describe, expect, it } from 'vitest';
import {
  buildVerifiedRequestHeaders,
  stripUntrustedAuthHeaders,
} from '@/lib/auth/verified-headers';

describe('buildVerifiedRequestHeaders', () => {
  it('sobrescribe claims enviados por el cliente con el perfil verificado', () => {
    const incoming = new Headers({
      'x-clinic-id': 'tenant-atacante',
      'x-user-id': 'usuario-atacante',
      'x-user-role': 'administrador',
      'user-agent': 'test-agent',
    });

    const result = buildVerifiedRequestHeaders(incoming, {
      clinicId: '11111111-1111-4111-8111-111111111111',
      userId: '22222222-2222-4222-8222-222222222222',
      role: 'recepcionista',
    });

    expect(result.get('x-clinic-id')).toBe('11111111-1111-4111-8111-111111111111');
    expect(result.get('x-user-id')).toBe('22222222-2222-4222-8222-222222222222');
    expect(result.get('x-user-role')).toBe('recepcionista');
    expect(result.get('user-agent')).toBe('test-agent');
  });

  it('elimina claims no verificados cuando no existe una sesión válida', () => {
    const result = stripUntrustedAuthHeaders(
      new Headers({
        'x-clinic-id': 'tenant-atacante',
        'x-user-id': 'usuario-atacante',
        'x-user-role': 'administrador',
        accept: 'text/html',
      })
    );

    expect(result.has('x-clinic-id')).toBe(false);
    expect(result.has('x-user-id')).toBe(false);
    expect(result.has('x-user-role')).toBe(false);
    expect(result.get('accept')).toBe('text/html');
  });
});
