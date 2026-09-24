import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/require-user';

const signedUrlRequestSchema = z.object({
  storagePath: z.string().trim().min(1, 'La ruta de almacenamiento es obligatoria'),
});

const SIGNED_URL_EXPIRATION_SECONDS = 900; // Exactamente 15 minutos (Requisitos 6.8, 8.6)

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireRole(['administrador', 'odontologo'], 'historia_clinica');

    const body = await req.json();
    const { storagePath } = signedUrlRequestSchema.parse(body);

    // Verificación de aislamiento multiempresa: La ruta DEBE comenzar con el clinic_id del usuario
    const expectedPrefix = `${authUser.clinicId}/`;
    if (!storagePath.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: 'Acceso denegado: El archivo no pertenece a su consultorio.' },
        { status: 403 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from('clinical-files')
      .createSignedUrl(storagePath, SIGNED_URL_EXPIRATION_SECONDS);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message || 'No se pudo generar la URL firmada.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      expiresIn: SIGNED_URL_EXPIRATION_SECONDS,
    });
  } catch (error: any) {
    if (error?.name === 'RoleAuthorizationError' || error?.statusCode === 403) {
      return NextResponse.json({ error: error.message || 'Acceso denegado' }, { status: 403 });
    }
    if (error?.statusCode === 401) {
      return NextResponse.json({ error: error.message || 'No autenticado' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Parámetros inválidos', details: error.issues }, { status: 422 });
    }
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud de URL firmada.' },
      { status: 500 }
    );
  }
}
