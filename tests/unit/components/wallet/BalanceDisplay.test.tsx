/**
 * BalanceDisplay Component Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceDisplay } from '@/components/wallet/BalanceDisplay';
import * as hooksModule from '@/hooks';

// Mock useFiatRate
const mockFiatResult = {
  fiatValue: null as number | null,
  formattedFiat: null as string | null,
  loading: false,
  error: null as string | null,
};

vi.mock('@/hooks', () => ({
  useFiatRate: vi.fn(() => mockFiatResult),
}));

describe('BalanceDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockFiatResult.fiatValue = null;
    mockFiatResult.formattedFiat = null;
    mockFiatResult.loading = false;
    mockFiatResult.error = null;
  });

  it('shows loading state', () => {
    render(<BalanceDisplay sats={1000} loading={true} />);

    expect(screen.getByTestId('balance-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading balance...')).toBeInTheDocument();
  });

  it('shows empty state when sats is null', () => {
    render(<BalanceDisplay sats={null} />);

    expect(screen.getByTestId('balance-empty')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('displays formatted sats value', () => {
    render(<BalanceDisplay sats={100000} />);

    expect(screen.getByTestId('balance-sats')).toHaveTextContent('100,000');
    expect(screen.getByText('sats')).toBeInTheDocument();
  });

  it('formats large sats values with commas', () => {
    render(<BalanceDisplay sats={1234567} />);

    expect(screen.getByTestId('balance-sats')).toHaveTextContent('1,234,567');
  });

  it('displays fiat value when available and showFiat is true', () => {
    mockFiatResult.formattedFiat = '$42.00';
    render(<BalanceDisplay sats={1000} showFiat={true} />);

    expect(screen.getByTestId('balance-fiat')).toHaveTextContent('$42.00');
  });

  it('hides fiat value when showFiat is false', () => {
    mockFiatResult.formattedFiat = '$42.00';
    render(<BalanceDisplay sats={1000} showFiat={false} />);

    expect(screen.queryByTestId('balance-fiat')).not.toBeInTheDocument();
  });

  it('shows fiat by default', () => {
    mockFiatResult.formattedFiat = '$100.00';
    render(<BalanceDisplay sats={2500} />);

    expect(screen.getByTestId('balance-fiat')).toBeInTheDocument();
  });

  it('does not show fiat when formattedFiat is null', () => {
    mockFiatResult.formattedFiat = null;
    render(<BalanceDisplay sats={1000} showFiat={true} />);

    expect(screen.queryByTestId('balance-fiat')).not.toBeInTheDocument();
  });

  it('passes correct satoshi value to useFiatRate', () => {
    render(<BalanceDisplay sats={5000} />);

    expect(hooksModule.useFiatRate).toHaveBeenCalledWith(5000, 'USD');
  });

  it('passes null sats as 0 to useFiatRate', () => {
    render(<BalanceDisplay sats={null} />);

    expect(hooksModule.useFiatRate).toHaveBeenCalledWith(0, 'USD');
  });

  it('uses custom currency', () => {
    render(<BalanceDisplay sats={1000} currency="EUR" />);

    expect(hooksModule.useFiatRate).toHaveBeenCalledWith(1000, 'EUR');
  });

  it('displays zero correctly', () => {
    render(<BalanceDisplay sats={0} />);

    expect(screen.getByTestId('balance-sats')).toHaveTextContent('0');
  });

  it('has correct test id when displaying balance', () => {
    render(<BalanceDisplay sats={1000} />);

    expect(screen.getByTestId('balance-display')).toBeInTheDocument();
  });

  it('does not show loading spinner when not loading', () => {
    render(<BalanceDisplay sats={1000} loading={false} />);

    expect(screen.queryByTestId('balance-loading')).not.toBeInTheDocument();
  });

  it('loading takes precedence over sats value', () => {
    render(<BalanceDisplay sats={1000} loading={true} />);

    expect(screen.getByTestId('balance-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('balance-sats')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for sats display', () => {
    render(<BalanceDisplay sats={1000} />);

    const satsDisplay = screen.getByTestId('balance-sats');
    expect(satsDisplay).toHaveClass('text-2xl', 'font-bold');
  });

  it('applies correct CSS classes for fiat display', () => {
    mockFiatResult.formattedFiat = '$10.00';
    render(<BalanceDisplay sats={250} />);

    const fiatDisplay = screen.getByTestId('balance-fiat');
    expect(fiatDisplay).toHaveClass('text-sm', 'text-slate-500');
  });
});
