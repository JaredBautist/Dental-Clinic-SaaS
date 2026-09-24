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
  Settings,
  BarChart3,
  LogOut,
  Stethoscope,
  ShieldCheck,
} from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth.actions';
import { useRouter } from 'next/navigation';

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
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: 'Pacientes',
    href: '/pacientes',
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: 'Citas',
    href: '/citas',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['administrador'],
  },
  {
    title: 'Reportes',
    href: '/reportes/pacientes-atendidos',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['administrador', 'odontologo'],
  },
  {
    title: 'Configuración',
    href: '/clinica/configuracion',
    icon: <Settings className="w-5 h-5" />,
    roles: ['administrador'],
  },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
  clinicName?: string;
}

export function Sidebar({ userRole = 'administrador', userName = 'Usuario', clinicName = 'Consultorio' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  async function handleLogout() {
    const result = await logoutAction();
    if (result.success) {
      router.replace('/login');
      router.refresh();
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Dental Clinic</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">SaaS Platform</p>
        </div>
      </div>

      {/* Clinic Info */}
      <div className="px-6 py-4 border-b border-slate-800">
        <p className="text-xs text-slate-400">Consultorio</p>
        <p className="text-sm font-medium text-slate-200 truncate">{clinicName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-300">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {userRole}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
