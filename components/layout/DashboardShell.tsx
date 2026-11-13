'use client';

import * as React from 'react';
import { Menu, X, Stethoscope } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SessionTimer } from '@/components/session/SessionTimer';
import type { ShellProfile } from '@/lib/auth/shell-profile';

/**
 * Shell del dashboard: barra móvil con menú hamburguesa, panel lateral
 * responsivo, enlace de salto al contenido y superficie de página.
 */
export function DashboardShell({
  profile,
  children,
}: {
  profile: ShellProfile;
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  function closeMobile() {
    setIsMobileOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape' && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50" onKeyDown={handleKeyDown}>
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>

      <SessionTimer />

      {/* Barra superior móvil (solo < lg) */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-expanded={isMobileOpen}
          aria-controls="sidebar-nav"
          aria-label={isMobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-slate-900 truncate">{profile.clinicName}</span>
        </div>
      </header>

      <Sidebar
        userRole={profile.role}
        userName={profile.userName}
        clinicName={profile.clinicName}
        mobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      <main id="contenido-principal" className="min-h-screen lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
