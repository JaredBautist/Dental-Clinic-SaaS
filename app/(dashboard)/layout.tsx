export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="font-semibold text-lg text-teal-700">🦷 Dental Clinic SaaS</div>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 bg-white border-r border-slate-200 p-4">
          <nav className="space-y-1">
            <a href="/dashboard" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
              Dashboard
            </a>
            <a href="/pacientes" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
              Pacientes
            </a>
            <a href="/citas" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
              Citas
            </a>
            <a href="/usuarios" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
              Usuarios
            </a>
            <a href="/clinica/configuracion" className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
              Configuración
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
