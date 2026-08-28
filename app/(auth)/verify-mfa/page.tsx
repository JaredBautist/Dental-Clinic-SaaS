'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyMfaLoginAction, cancelMfaAction } from '@/lib/actions/auth.actions';
import { KeyRound, AlertCircle, Loader2, LogOut, Shield } from 'lucide-react';

export default function VerifyMfaPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg('Por favor ingrese el código de 6 dígitos.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await verifyMfaLoginAction({ code });
      if (res.success && res.data) {
        router.push(res.data.redirectTo);
      } else {
        setErrorMsg(res.error?.message || 'Código de verificación incorrecto.');
        setIsVerifying(false);
      }
    } catch {
      setErrorMsg('Error al verificar el código TOTP.');
      setIsVerifying(false);
    }
  }

  async function handleCancel() {
    await cancelMfaAction();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-4 border border-cyan-400/30">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Verificación en Dos Pasos
        </h1>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
          Abra su aplicación autenticadora e ingrese el código temporal de 6 dígitos generado para su cuenta.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/60 sm:px-10">
          <form className="space-y-6" onSubmit={handleVerify}>
            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="code"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 text-center"
              >
                Código de Seguridad TOTP
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
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCode(val);
                  }}
                  placeholder="000000"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                    Verificando...
                  </>
                ) : (
                  'Verificar e Ingresar'
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full flex justify-center items-center py-2 px-4 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Cancelar y volver a login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
