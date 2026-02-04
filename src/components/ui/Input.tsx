/**
 * Input Component
 * Spec: 03-shared-components.md
 *
 * Text input with label, error handling, and addon support
 */

import { forwardRef } from 'react';
import type { Size } from '@/types';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: Size;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const sizeClasses: Record<Size, string> = {
  sm: 'py-1.5 px-3 text-sm',
  md: 'py-2 px-3 text-base',
  lg: 'py-3 px-4 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      leftAddon,
      rightAddon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1"
            data-testid="input-label"
          >
            {label}
          </label>
        )}

        <div className="relative flex">
          {leftAddon && (
            <div
              className="flex items-center px-3 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg text-slate-500"
              data-testid="input-left-addon"
            >
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full
              border
              rounded-lg
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-bitcoin focus:border-transparent
              disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
              ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300'}
              ${leftAddon ? 'rounded-l-none' : ''}
              ${rightAddon ? 'rounded-r-none' : ''}
              ${sizeClasses[size]}
              ${className}
            `.trim()}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            data-testid="input"
            {...props}
          />

          {rightAddon && (
            <div
              className="flex items-center px-3 bg-slate-50 border border-l-0 border-slate-300 rounded-r-lg text-slate-500"
              data-testid="input-right-addon"
            >
              {rightAddon}
            </div>
          )}
        </div>

        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
            data-testid="input-error"
          >
            {error}
          </p>
        )}

        {!hasError && hint && (
          <p
            id={`${inputId}-hint`}
            className="mt-1 text-sm text-slate-500"
            data-testid="input-hint"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
