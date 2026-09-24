'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { enrollMfaAction, verifyMfaSetupAction, cancelMfaAction } from '@/lib/actions/auth.actions';
import { ShieldCheck, KeyRound, AlertCircle, Loader2, LogOut, CheckCircle2, RefreshCcw } from 'lucide-react';

export default function SetupMfaPage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function loadMfaData() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await enrollMfaAction();
      if (res.success && res.data) {
        setFactorId(res.data.factorId);
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
      } else {
        setErrorMsg(res.error?.message || 'No se pudo iniciar el proceso de configuración MFA.');
      }
    } catch {
      setErrorMsg('Error al conectar con el servidor de autenticación.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMfaData();
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || code.length !== 6) {
      setErrorMsg('Por favor ingrese el código de 6 dígitos de su aplicación autenticadora.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await verifyMfaSetupAction({ factorId, code });
      if (res.success && res.data) {
        router.replace(res.data.redirectTo);
        router.refresh();
      } else {
        if (res.error?.code === 'MFA_VERIFICATION_FAILED') {
          router.replace('/login?reason=mfa_failed');
          return;
        }
        setErrorMsg(res.error?.message || 'Código inválido. Intente de nuevo.');
        setIsVerifying(false);
      }
    } catch {
      setErrorMsg('Error al verificar el código TOTP.');
      setIsVerifying(false);
    }
  }

  async function handleCancel() {
    const result = await cancelMfaAction();
    if (!result.success) {
      setErrorMsg(result.error.message);
      return;
    }
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-4 border border-cyan-400/30">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Configuración Obligatoria de MFA
        </h1>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
          Por normatividad de seguridad clínica, los roles de administrador y odontólogo requieren autenticación en dos factores (TOTP).
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm text-slate-400">Generando llave de seguridad TOTP...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleVerify}>
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex flex-col gap-3 text-rose-300 text-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span className="leading-snug">{errorMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={loadMfaData}
                    className="self-start flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Reintentar generación de QR
                  </button>
                </div>
              )}

              {/* Código QR o Secreto */}
              <div className="text-center space-y-3">
                <p className="text-xs font-semibold text-slate-300">
                  1. Escanee el código QR con Google Authenticator o Microsoft Authenticator:
                </p>
                {qrCode ? (
                  <div className="inline-block p-3 bg-white rounded-xl shadow-md border border-slate-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="Código QR para MFA"
                      className="w-44 h-44 mx-auto"
                      onError={() => setErrorMsg('No se pudo cargar el código QR. Use la clave manual.')}
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <p className="text-xs text-rose-300">
                      No se pudo generar el código QR.
                    </p>
                  </div>
                )}
                {secret && (
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
                    <p className="text-[11px] text-slate-400">O ingrese la clave manualmente:</p>
                    <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider select-all mt-0.5">
                      {secret}
                    </p>
                  </div>
                )}
              </div>

              {/* Entrada del código de 6 dígitos */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 text-center"
                >
                  2. Ingrese el código de 6 dígitos generado
                </label>
                <div className="relative rounded-xl shadow-sm max-w-xs mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-center text-lg font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isVerifying || code.length !== 6}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/25 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Activando MFA...
                    </>
                  ) : (
                    'Confirmar y Activar MFA'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full flex justify-center items-center py-2 px-4 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Cancelar y cerrar sesión
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-center text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Estándar RFC 6238 TOTP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
