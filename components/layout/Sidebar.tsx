'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  Building2,
  Settings,
  BarChart3,
  LogOut,
  Stethoscope,
  ShieldCheck,
  ScrollText,
} from 'lucide-react';
import { logoutAction } from '@/lib/api/auth-api';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" />,
  },
  {
    title: 'Pacientes',
    href: '/pacientes',
    icon: <Users className="w-5 h-5" aria-hidden="true" />,
    roles: ['odontologo', 'recepcionista'],
  },
  {
    title: 'Citas',
    href: '/citas',
    icon: <Calendar className="w-5 h-5" aria-hidden="true" />,
    roles: ['odontologo', 'recepcionista'],
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: <UserCog className="w-5 h-5" aria-hidden="true" />,
    roles: ['administrador'],
  },
  {
    title: 'Consultorios',
    href: '/consultorios',
    icon: <Building2 className="w-5 h-5" aria-hidden="true" />,
    roles: ['administrador'],
  },
  {
    title: 'Reportes',
    href: '/reportes/pacientes-atendidos',
    icon: <BarChart3 className="w-5 h-5" aria-hidden="true" />,
    roles: ['odontologo'],
  },
  {
    title: 'Auditoría',
    href: '/auditoria',
    icon: <ScrollText className="w-5 h-5" aria-hidden="true" />,
    roles: ['administrador'],
  },
  {
    title: 'Configuración',
    href: '/clinica/configuracion',
    icon: <Settings className="w-5 h-5" aria-hidden="true" />,
    roles: ['administrador'],
  },
];

const ROLE_LABELS: Record<string, string> = {
  administrador: 'Administrador',
  odontologo: 'Odontólogo',
  recepcionista: 'Recepcionista',
};

interface SidebarProps {
  userRole?: string;
  userName?: string;
  clinicName?: string;
  /** Estado del panel en móvil; en escritorio siempre visible. */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  userRole = 'administrador',
  userName = 'Usuario',
  clinicName = 'Consultorio',
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const roleLabel = ROLE_LABELS[userRole] ?? userRole;

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutAction();
    } catch (err) {
      console.warn('[Sidebar] Error during logout:', err);
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <>
      {/* Fondo oscuro detrás del panel en móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          aria-hidden="true"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="sidebar-nav"
        aria-label="Navegación principal"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col shadow-xl transition-transform duration-200 ease-out lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight">Dental Clinic</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">SaaS Platform</p>
          </div>
        </div>

        {/* Clinic Info */}
        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-xs text-slate-400">Consultorio</p>
          <p className="text-sm font-medium text-slate-200 truncate">{clinicName}</p>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Secciones"
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        >
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2',
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                        : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800'
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-300 shrink-0"
              aria-hidden="true"
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 shrink-0" aria-hidden="true" />
                {roleLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Cerrar Sesión"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
          >
            {isLoggingOut ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin"
                  aria-hidden="true"
                />
                <span>Cerrando sesión...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Cerrar Sesión</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
