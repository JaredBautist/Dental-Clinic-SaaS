export default function SetupMfaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Configurar MFA (2FA)</h1>
        <p className="text-sm text-slate-600 mb-6">Escanea el código QR con tu aplicación de autenticación.</p>
      </div>
    </div>
  );
}
