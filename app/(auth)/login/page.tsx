'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth.actions';
import { Shield, Lock, Mail, AlertCircle, WifiOff, CheckCircle2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isServerHealthy, setIsServerHealthy] = useState<boolean | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);

  // Verificar disponibilidad del servidor al cargar la página (Req 10.3)
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setIsServerHealthy(true);
        } else {
          setIsServerHealthy(false);
        }
      } catch {
        setIsServerHealthy(false);
      } finally {
        setIsCheckingHealth(false);
      }
    }
    checkHealth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor complete todos los campos requeridos.');
      return;
    }

    // Comprobar conectividad antes de enviar credenciales (Req 10.3)
    try {
      const healthRes = await fetch('/api/health');
      if (!healthRes.ok) {
        setErrorMsg('El servidor no se encuentra disponible. Por favor verifique su conexión a internet.');
        return;
      }
    } catch {
      setErrorMsg('Sin conexión al servidor. No se pueden procesar sus credenciales en este momento.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginAction({ email, password });

      if (!res.success) {
        setErrorMsg(res.error.message);
        setIsLoading(false);
        return;
      }

      router.push(res.data.redirectTo);
    } catch (err: unknown) {
      setErrorMsg('Ocurrió un error al intentar iniciar sesión. Por favor intente nuevamente.');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Indicador de conectividad */}
      {!isCheckingHealth && isServerHealthy === false && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-slate-950 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur">
          <WifiOff className="w-4 h-4" />
          Servidor no disponible o sin conexión. Verifique su red.
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-4 border border-cyan-400/30">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Dental Clinic SaaS
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Plataforma de Gestión Odontológica Multitenant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-sm animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Correo Electrónico
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@consultorio.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/25 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando credenciales...
                  </>
                ) : (
                  'Ingresar al Consultorio'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Aislamiento RLS activo
              </span>
              <span className="text-slate-500">MFA TOTP v1.0</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Protegido con cifrado TLS y políticas estrictas de control de acceso.
        </p>
      </div>
    </div>
  );
}
