import Link from 'next/link';
import {
  Shield,
  Stethoscope,
  Users,
  FileText,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Pacientes y citas',
    description: 'Agenda, búsqueda rápida y gestión completa del consultorio.',
  },
  {
    icon: FileText,
    title: 'Historia clínica',
    description: 'Registros inmutables con control de versiones y adjuntos.',
  },
  {
    icon: BarChart3,
    title: 'Reportes',
    description: 'Métricas operativas para tomar mejores decisiones.',
  },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-bold tracking-tight">Dental Clinic SaaS</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl px-4 py-2 transition-all"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 lg:pt-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              Plataforma multi-tenant con MFA
            </div>
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              Gestiona tu consultorio dental en un solo lugar
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-xl">
              Pacientes, citas, historia clínica y reportes con control de acceso por rol
              y seguridad de nivel empresarial.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-500 hover:to-blue-500 transition-all"
              >
                Iniciar sesión
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-800/80 bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-sm font-semibold text-white">{feature.title}</h2>
                  <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-xs text-slate-500">
          <span>Dental Clinic SaaS</span>
          <span>Cúcuta, Colombia</span>
        </div>
      </footer>
    </div>
  );
}
