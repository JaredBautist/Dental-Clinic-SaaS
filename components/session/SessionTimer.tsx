'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Clock, AlertTriangle, LogOut } from 'lucide-react';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
const WARNING_THRESHOLD_MS = 2 * 60 * 1000; // Mostrar advertencia a los 28 minutos (2 min restantes)
const CHECK_INTERVAL_MS = 10 * 1000; // Verificar cada 10 segundos

/**
 * Componente SessionTimer: detecta inactividad del usuario durante 30 minutos
 * y cierra la sesión automáticamente por seguridad clínica (Req 3.4, 3.5).
 * El timestamp de última actividad se almacena estrictamente en memoria/estado React (no en localStorage).
 */
export function SessionTimer() {
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState<number>(() => Date.now());
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.push('/login?reason=inactivity');
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    if (isLoggingOutRef.current) return;
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Escuchar eventos de actividad del usuario
  useEffect(() => {
    const events = ['click', 'keydown', 'mousemove', 'touchstart', 'scroll'];

    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [resetTimer]);

  // Intervalo de comprobación del tiempo transcurrido
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const timeLeft = INACTIVITY_TIMEOUT_MS - elapsed;

      if (timeLeft <= 0) {
        handleLogout();
      } else if (timeLeft <= WARNING_THRESHOLD_MS) {
        setShowWarning(true);
        setRemainingSeconds(Math.ceil(timeLeft / 1000));
      } else {
        setShowWarning(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [lastActivity, handleLogout]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/95 border border-amber-500/40 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Cierre por inactividad
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Su sesión expirará en <span className="font-mono font-bold text-amber-400">{remainingSeconds}s</span> por falta de actividad.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={resetTimer}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              Continuar trabajando
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600/30 hover:text-rose-300 text-slate-400 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
