/**
 * Badge Component
 * Spec: 03-shared-components.md
 *
 * Status indicator with color variants
 */

import type { BadgeVariant, Size } from '@/types';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: Size;
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-slate-100 text-slate-800',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  'data-testid': testId = 'badge',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        font-medium
        rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      data-testid={testId}
    >
      {children}
    </span>
  );
}
