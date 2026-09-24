// Supabase Edge Function: auto-transition-appointments
// Transición automática de citas a estado 'en_curso' cuando scheduled_at <= now()
// Requisito: 5.8

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Configuración incompleta de variables de entorno de Supabase' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const nowIso = new Date().toISOString();

    // Actualizar citas que ya deben haber iniciado
    const { data: updatedAppointments, error } = await supabaseAdmin
      .from('appointments')
      .update({ status: 'en_curso' })
      .in('status', ['programada', 'confirmada'])
      .lte('scheduled_at', nowIso)
      .select('id, clinic_id, dentist_id, scheduled_at, status');

    if (error) {
      console.error('[AutoTransition Error]:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const count = updatedAppointments ? updatedAppointments.length : 0;
    console.log(`[AutoTransition Success]: ${count} citas actualizadas a 'en_curso' a las ${nowIso}`);

    return new Response(
      JSON.stringify({
        success: true,
        transitionedCount: count,
        timestamp: nowIso,
        transitioned: updatedAppointments,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('[AutoTransition Fatal]:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Error inesperado' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
