/**
 * QRCode Component
 * Spec: 03-shared-components.md
 *
 * QR code display with optional label and copy functionality
 */

import { QRCodeSVG } from 'qrcode.react';
import { CopyButton } from './CopyButton';

export interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
}

export function QRCode({
  value,
  size = 200,
  className = '',
  showValue = false,
  label,
}: QRCodeProps) {
  // Truncate value for display (show first 20 and last 10 chars)
  const truncatedValue =
    value.length > 35
      ? `${value.slice(0, 20)}...${value.slice(-10)}`
      : value;

  return (
    <div
      className={`
        bg-white
        p-4
        rounded-lg
        inline-flex flex-col items-center
        ${className}
      `.trim()}
      data-testid="qrcode"
    >
      {label && (
        <p
          className="text-sm font-medium text-slate-700 mb-2"
          data-testid="qrcode-label"
        >
          {label}
        </p>
      )}

      <div className="p-2 bg-white">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          includeMargin={false}
          data-testid="qrcode-svg"
        />
      </div>

      {showValue && (
        <p
          className="mt-2 text-xs font-mono text-slate-500 max-w-full truncate"
          title={value}
          data-testid="qrcode-value"
        >
          {truncatedValue}
        </p>
      )}

      <div className="mt-2">
        <CopyButton
          value={value}
          label="Copy"
        />
      </div>
    </div>
  );
}
