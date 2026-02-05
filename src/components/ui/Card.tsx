/**
 * Card Component
 * Spec: 03-shared-components.md
 *
 * Container component with optional header, footer, and configurable padding
 */

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  'data-testid'?: string;
}

const paddingClasses: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  title,
  subtitle,
  children,
  className = '',
  headerAction,
  footer,
  padding = 'md',
  'data-testid': dataTestId,
}: CardProps) {
  const hasHeader = title || subtitle || headerAction;

  return (
    <div
      className={`
        bg-white
        border border-slate-200
        shadow-sm
        rounded-xl
        ${className}
      `.trim()}
      data-testid={dataTestId ?? 'card'}
    >
      {hasHeader && (
        <div
          className="flex items-start justify-between px-4 pt-4 pb-2"
          data-testid="card-header"
        >
          <div>
            {title && (
              <h3
                className="text-lg font-semibold text-slate-900"
                data-testid="card-title"
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className="text-sm text-slate-500 mt-0.5"
                data-testid="card-subtitle"
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div data-testid="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className={paddingClasses[padding]} data-testid="card-content">
        {children}
      </div>

      {footer && (
        <div
          className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl"
          data-testid="card-footer"
        >
          {footer}
        </div>
      )}
    </div>
  );
}
