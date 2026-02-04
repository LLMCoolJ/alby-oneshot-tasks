/**
 * useFiatRate Hook Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFiatRate } from '@/hooks/useFiatRate';

// Mock fiat functions
const mockGetFiatValue = vi.fn();
const mockGetFormattedFiatValue = vi.fn();

vi.mock('@getalby/lightning-tools/fiat', () => ({
  getFiatValue: (...args: unknown[]) => mockGetFiatValue(...args),
  getFormattedFiatValue: (...args: unknown[]) => mockGetFormattedFiatValue(...args),
}));

describe('useFiatRate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFiatValue.mockReset();
    mockGetFormattedFiatValue.mockReset();
  });

  it('returns initial loading state', () => {
    mockGetFiatValue.mockResolvedValue(42);
    mockGetFormattedFiatValue.mockResolvedValue('$42.00');

    const { result } = renderHook(() => useFiatRate(1000));

    expect(result.current.loading).toBe(true);
  });

  it('fetches fiat value successfully', async () => {
    mockGetFiatValue.mockResolvedValue(42.5);
    mockGetFormattedFiatValue.mockResolvedValue('$42.50');

    const { result } = renderHook(() => useFiatRate(1000));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.fiatValue).toBe(42.5);
    expect(result.current.formattedFiat).toBe('$42.50');
    expect(result.current.error).toBeNull();
  });

  it('handles zero satoshi value', async () => {
    const { result } = renderHook(() => useFiatRate(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.fiatValue).toBe(0);
    expect(result.current.formattedFiat).toBe('$0.00');
    expect(mockGetFiatValue).not.toHaveBeenCalled();
  });

  it('handles negative satoshi value', async () => {
    const { result } = renderHook(() => useFiatRate(-100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.fiatValue).toBe(0);
    expect(result.current.formattedFiat).toBe('$0.00');
    expect(mockGetFiatValue).not.toHaveBeenCalled();
  });

  it('passes correct parameters to fiat functions', async () => {
    mockGetFiatValue.mockResolvedValue(100);
    mockGetFormattedFiatValue.mockResolvedValue('100.00 EUR');

    const { result } = renderHook(() => useFiatRate(5000, 'EUR'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetFiatValue).toHaveBeenCalledWith({
      satoshi: 5000,
      currency: 'EUR',
    });
    expect(mockGetFormattedFiatValue).toHaveBeenCalledWith({
      satoshi: 5000,
      currency: 'EUR',
      locale: 'en-US',
    });
  });

  it('uses USD as default currency', async () => {
    mockGetFiatValue.mockResolvedValue(50);
    mockGetFormattedFiatValue.mockResolvedValue('$50.00');

    const { result } = renderHook(() => useFiatRate(2000));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetFiatValue).toHaveBeenCalledWith({
      satoshi: 2000,
      currency: 'USD',
    });
  });

  it('handles fiat fetch error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetFiatValue.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFiatRate(1000));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch fiat rate');
    expect(result.current.fiatValue).toBeNull();
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('refetches when satoshi value changes', async () => {
    mockGetFiatValue.mockResolvedValue(10);
    mockGetFormattedFiatValue.mockResolvedValue('$10.00');

    const { result, rerender } = renderHook(
      ({ satoshi }) => useFiatRate(satoshi),
      { initialProps: { satoshi: 500 } }
    );

    await waitFor(() => {
      expect(result.current.fiatValue).toBe(10);
    });

    mockGetFiatValue.mockResolvedValue(20);
    mockGetFormattedFiatValue.mockResolvedValue('$20.00');

    rerender({ satoshi: 1000 });

    await waitFor(() => {
      expect(result.current.fiatValue).toBe(20);
    });

    expect(mockGetFiatValue).toHaveBeenCalledTimes(2);
  });

  it('refetches when currency changes', async () => {
    mockGetFiatValue.mockResolvedValue(100);
    mockGetFormattedFiatValue.mockResolvedValue('$100.00');

    const { result, rerender } = renderHook(
      ({ currency }) => useFiatRate(5000, currency),
      { initialProps: { currency: 'USD' } }
    );

    await waitFor(() => {
      expect(result.current.formattedFiat).toBe('$100.00');
    });

    mockGetFiatValue.mockResolvedValue(85);
    mockGetFormattedFiatValue.mockResolvedValue('85.00 EUR');

    rerender({ currency: 'EUR' });

    await waitFor(() => {
      expect(result.current.formattedFiat).toBe('85.00 EUR');
    });

    expect(mockGetFormattedFiatValue).toHaveBeenCalledTimes(2);
  });

  it('returns correct types', async () => {
    mockGetFiatValue.mockResolvedValue(42);
    mockGetFormattedFiatValue.mockResolvedValue('$42.00');

    const { result } = renderHook(() => useFiatRate(1000));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.fiatValue).toBe('number');
    expect(typeof result.current.formattedFiat).toBe('string');
    expect(typeof result.current.loading).toBe('boolean');
    expect(result.current.error).toBeNull();
  });
});
