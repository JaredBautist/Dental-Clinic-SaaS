'use client';

import * as React from 'react';
import { Menu, X, Stethoscope } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { isClinicView, selectClinicForView } from '@/lib/platform/clinic-selection';
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
  platformAccess,
  platformClinics,
}: {
  profile: ShellProfile;
  platformAccess?: boolean;
  platformClinics: { id: string; name: string }[];
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const clinicParams = searchParams.getAll('clinic');
  const activeClinic = platformAccess && isClinicView(pathname)
    ? selectClinicForView(platformClinics, profile.clinicId, clinicParams.length === 1 ? clinicParams[0] : null)
    : undefined;
  const clinicName = activeClinic?.name ?? profile.clinicName;

  const menuButton = React.useRef<HTMLButtonElement>(null);
  function closeMobile() {
    if (isMobileOpen) menuButton.current?.focus();
    setIsMobileOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape' && isMobileOpen) {
      closeMobile();
    }
  }

  return (
    <div className="workspace-shell min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100" onKeyDown={handleKeyDown}>
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>

      <SessionTimer />

      {/* Barra superior móvil (solo < lg) */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 lg:hidden">
        <button
          ref={menuButton}
          type="button"
          onClick={() => setIsMobileOpen((open) => !open)}
          aria-expanded={isMobileOpen}
          aria-controls="sidebar-nav"
          aria-label={isMobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          className="grid size-11 place-items-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{clinicName}</span>
        </div>
      </header>

      <Sidebar
        userRole={profile.role}
        platformAccess={platformAccess}
        userName={profile.userName}
        clinicName={clinicName}
        activeClinicId={activeClinic?.id}
        mobileOpen={isMobileOpen}
        onCloseMobile={closeMobile}
      />

      <main id="contenido-principal" className="min-h-screen scroll-mt-16 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
