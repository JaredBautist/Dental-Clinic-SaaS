export default function VerifyMfaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Verificación de Seguridad</h1>
        <p className="text-sm text-slate-600 mb-6">Ingresa el código TOTP de 6 dígitos.</p>
      </div>
    </div>
  );
}
