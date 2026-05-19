import type { ReactNode } from 'react';

type BadgeVariant = 'cyan' | 'blue' | 'green' | 'yellow' | 'red' | 'slate';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

/* Semantic color pairs — 4.5:1 contrast ratio (WCAG AA) */
const variants: Record<BadgeVariant, string> = {
  cyan:   'bg-cyan-50   text-cyan-700   border border-cyan-200',
  blue:   'bg-blue-50   text-blue-700   border border-blue-200',
  green:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  yellow: 'bg-amber-50  text-amber-700  border border-amber-200',
  red:    'bg-red-50    text-red-700    border border-red-200',
  slate:  'bg-slate-100 text-slate-600  border border-slate-200',
};

export const Badge = ({ variant = 'slate', children }: BadgeProps) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
    {children}
  </span>
);
