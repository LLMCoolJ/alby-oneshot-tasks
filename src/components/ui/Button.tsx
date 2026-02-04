/**
 * Button Component
 * Spec: 03-shared-components.md
 *
 * Primary action button with variants, sizes, and loading state
 */

import type { ButtonVariant, Size } from '@/types';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-bitcoin text-white hover:bg-bitcoin-dark focus:ring-bitcoin',
  secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
};

const sizeClasses: Record<Size, string> = {
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

const spinnerSizes: Record<Size, Size> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium
        rounded-lg
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      data-testid="button"
      {...props}
    >
      {loading ? (
        <Spinner size={spinnerSizes[size]} className={variant === 'primary' || variant === 'danger' ? 'border-white border-t-transparent' : ''} />
      ) : icon ? (
        <span className="flex-shrink-0" data-testid="button-icon">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
