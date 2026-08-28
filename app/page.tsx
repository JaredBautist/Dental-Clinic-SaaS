import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 mb-2">
          <span className="text-4xl">🦷</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 to-white">
          Dental Clinic SaaS
        </h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
          Plataforma de gestión integral para consultorios odontológicos privados con aislamiento multiempresa garantizado.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold transition shadow-lg shadow-teal-500/20"
          >
            Acceder al Sistema
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 transition"
          >
            Panel de Control
          </Link>
        </div>
      </div>
    </div>
  );
}
