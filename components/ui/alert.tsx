import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONE_STYLES: Record<AlertTone, { wrapper: string; icon: React.ReactNode }> = {
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-900',
    icon: <Info className="w-5 h-5 text-sky-600" aria-hidden="true" />,
  },
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" aria-hidden="true" />,
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />,
  },
  danger: {
    wrapper: 'border-rose-200 bg-rose-50 text-rose-900',
    icon: <XCircle className="w-5 h-5 text-rose-600" aria-hidden="true" />,
  },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm', styles.wrapper, className)}
    >
      <div className="shrink-0 mt-0.5">{styles.icon}</div>
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-1')}>{children}</div>
      </div>
    </div>
  );
}
