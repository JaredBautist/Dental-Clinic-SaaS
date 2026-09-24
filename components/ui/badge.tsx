import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          variant === 'default' && 'bg-slate-900 text-slate-50',
          variant === 'secondary' && 'bg-slate-100 text-slate-900',
          variant === 'success' && 'bg-emerald-100 text-emerald-800',
          variant === 'warning' && 'bg-amber-100 text-amber-800',
          variant === 'danger' && 'bg-rose-100 text-rose-800',
          variant === 'outline' && 'border border-slate-200 text-slate-900',
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
