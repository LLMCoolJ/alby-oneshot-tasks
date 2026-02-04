/**
 * CopyButton Component
 * Spec: 03-shared-components.md
 *
 * Copy to clipboard button with visual feedback
 */

import { useState, useCallback } from 'react';

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  onCopied?: () => void;
}

const ClipboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function CopyButton({
  value,
  label,
  className = '',
  onCopied,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      onCopied?.();

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [value, onCopied]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1.5
        px-2 py-1
        text-sm text-slate-600
        hover:text-slate-900 hover:bg-slate-100
        rounded
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-bitcoin focus:ring-offset-2
        ${className}
      `.trim()}
      title={copied ? 'Copied!' : 'Copy'}
      aria-label={copied ? 'Copied!' : label || 'Copy to clipboard'}
      data-testid="copy-button"
    >
      {copied ? (
        <>
          <CheckIcon />
          <span className="text-green-600" data-testid="copy-button-copied">Copied!</span>
        </>
      ) : (
        <>
          <ClipboardIcon />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
