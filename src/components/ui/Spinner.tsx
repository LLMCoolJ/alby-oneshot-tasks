/**
 * Spinner Component
 * Spec: 03-shared-components.md
 *
 * Animated loading indicator with accessible markup
 */

import type { Size } from '@/types';

export interface SpinnerProps {
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        inline-block
        rounded-full
        border-bitcoin
        border-t-transparent
        animate-spin
        motion-reduce:animate-none
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      data-testid="spinner"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
