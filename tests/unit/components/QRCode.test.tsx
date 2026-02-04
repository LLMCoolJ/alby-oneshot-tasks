/**
 * QRCode Component Tests
 * Spec: 03-shared-components.md
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QRCode } from '@/components/ui/QRCode';

// Mock qrcode.react
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value, size, ...props }: { value: string; size: number }) => (
    <svg
      data-testid="qrcode-svg"
      data-value={value}
      data-size={size}
      {...props}
    />
  ),
}));

describe('QRCode', () => {
  const testValue = 'lnbc1000n1pjtest...long-invoice-string-here';

  it('renders QR code with correct value', () => {
    render(<QRCode value={testValue} />);
    const svg = screen.getByTestId('qrcode-svg');
    expect(svg).toHaveAttribute('data-value', testValue);
  });

  it('applies custom size', () => {
    render(<QRCode value={testValue} size={300} />);
    const svg = screen.getByTestId('qrcode-svg');
    expect(svg).toHaveAttribute('data-size', '300');
  });

  it('uses default size of 200', () => {
    render(<QRCode value={testValue} />);
    const svg = screen.getByTestId('qrcode-svg');
    expect(svg).toHaveAttribute('data-size', '200');
  });

  it('shows value when showValue is true', () => {
    render(<QRCode value={testValue} showValue />);
    expect(screen.getByTestId('qrcode-value')).toBeInTheDocument();
  });

  it('does not show value by default', () => {
    render(<QRCode value={testValue} />);
    expect(screen.queryByTestId('qrcode-value')).not.toBeInTheDocument();
  });

  it('truncates long values for display', () => {
    const longValue = 'lnbc1000n1pjtestlongvaluethatexceeds35characters123456789';
    render(<QRCode value={longValue} showValue />);

    const displayValue = screen.getByTestId('qrcode-value');
    // Should show first 20 chars + ... + last 10 chars
    expect(displayValue.textContent).toContain('...');
    expect(displayValue.textContent?.startsWith('lnbc1000n1pjtestlong')).toBe(true);
  });

  it('shows full value when under 35 chars', () => {
    const shortValue = 'short-invoice-value';
    render(<QRCode value={shortValue} showValue />);

    const displayValue = screen.getByTestId('qrcode-value');
    expect(displayValue.textContent).toBe(shortValue);
  });

  it('shows label when provided', () => {
    render(<QRCode value={testValue} label="Scan to Pay" />);
    expect(screen.getByTestId('qrcode-label')).toHaveTextContent('Scan to Pay');
  });

  it('does not show label when not provided', () => {
    render(<QRCode value={testValue} />);
    expect(screen.queryByTestId('qrcode-label')).not.toBeInTheDocument();
  });

  it('includes copy functionality', () => {
    render(<QRCode value={testValue} />);
    expect(screen.getByTestId('copy-button')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<QRCode value={testValue} className="mt-4" />);
    const container = screen.getByTestId('qrcode');
    expect(container).toHaveClass('mt-4');
  });

  it('has proper container styling', () => {
    render(<QRCode value={testValue} />);
    const container = screen.getByTestId('qrcode');
    expect(container).toHaveClass('bg-white');
    expect(container).toHaveClass('p-4');
    expect(container).toHaveClass('rounded-lg');
  });

  it('displays value with title attribute for full text', () => {
    const longValue = 'lnbc1000n1pjtestlongvaluethatexceeds35characters123456789';
    render(<QRCode value={longValue} showValue />);

    const displayValue = screen.getByTestId('qrcode-value');
    expect(displayValue).toHaveAttribute('title', longValue);
  });
});
