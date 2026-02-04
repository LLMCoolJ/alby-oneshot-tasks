/**
 * usePayment Hook Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePayment } from '@/hooks/usePayment';
import * as useNWCClientModule from '@/hooks/useNWCClient';

// Mock NWC client
const mockPayInvoice = vi.fn();
const mockRefreshBalance = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useNWCClient', () => ({
  useNWCClient: vi.fn(() => ({
    payInvoice: mockPayInvoice,
  })),
}));

vi.mock('@/hooks/useWalletActions', () => ({
  useWalletActions: vi.fn(() => ({
    refreshBalance: mockRefreshBalance,
  })),
}));

describe('usePayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayInvoice.mockReset();
    mockRefreshBalance.mockReset().mockResolvedValue(undefined);
    // Reset mock to return connected client
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue({
      payInvoice: mockPayInvoice,
    } as unknown as ReturnType<typeof useNWCClientModule.useNWCClient>);
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => usePayment('alice'));

    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('pays invoice successfully', async () => {
    const mockResponse = {
      preimage: 'preimage123',
      fees_paid: 100,
    };
    mockPayInvoice.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePayment('alice'));

    await act(async () => {
      await result.current.payInvoice('lnbc100n1p...');
    });

    expect(result.current.result).toEqual({
      preimage: 'preimage123',
      feesPaid: 100,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading state during payment', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockPayInvoice.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => usePayment('alice'));

    act(() => {
      result.current.payInvoice('lnbc100n1p...');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolvePromise!({ preimage: 'test', fees_paid: 0 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('refreshes balance after successful payment', async () => {
    mockPayInvoice.mockResolvedValue({
      preimage: 'preimage123',
      fees_paid: 100,
    });

    const { result } = renderHook(() => usePayment('alice'));

    await act(async () => {
      await result.current.payInvoice('lnbc100n1p...');
    });

    expect(mockRefreshBalance).toHaveBeenCalled();
  });

  it('handles payment error and sets error state', async () => {
    mockPayInvoice.mockImplementation(() => {
      return Promise.reject(new Error('Insufficient balance'));
    });

    const { result } = renderHook(() => usePayment('alice'));

    await act(async () => {
      try {
        await result.current.payInvoice('lnbc100n1p...');
      } catch {
        // Error is expected
      }
    });

    expect(result.current.error).toBe('Insufficient balance');
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles non-Error exceptions and sets default error message', async () => {
    mockPayInvoice.mockImplementation(() => {
      return Promise.reject('Unknown error');
    });

    const { result } = renderHook(() => usePayment('alice'));

    await act(async () => {
      try {
        await result.current.payInvoice('lnbc100n1p...');
      } catch {
        // Error is expected
      }
    });

    expect(result.current.error).toBe('Payment failed');
  });

  it('does not refresh balance on payment failure', async () => {
    mockPayInvoice.mockRejectedValue(new Error('Payment failed'));

    const { result } = renderHook(() => usePayment('alice'));

    try {
      await act(async () => {
        await result.current.payInvoice('lnbc100n1p...');
      });
    } catch {
      // Expected to throw
    }

    expect(mockRefreshBalance).not.toHaveBeenCalled();
  });

  it('resets state correctly', async () => {
    mockPayInvoice.mockResolvedValue({
      preimage: 'preimage123',
      fees_paid: 100,
    });

    const { result } = renderHook(() => usePayment('alice'));

    await act(async () => {
      await result.current.payInvoice('lnbc100n1p...');
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('throws error when wallet not connected', async () => {
    // Override mock to return null (disconnected)
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue(null);

    const { result } = renderHook(() => usePayment('alice'));

    await expect(
      act(async () => {
        await result.current.payInvoice('lnbc100n1p...');
      })
    ).rejects.toThrow('Wallet not connected');
  });

  it('passes invoice to client correctly', async () => {
    mockPayInvoice.mockResolvedValue({ preimage: 'test', fees_paid: 0 });

    const { result } = renderHook(() => usePayment('alice'));
    const testInvoice = 'lnbc1u1p0abc123...';

    await act(async () => {
      await result.current.payInvoice(testInvoice);
    });

    expect(mockPayInvoice).toHaveBeenCalledWith({ invoice: testInvoice });
  });
});
