/**
 * useLightningAddressPayment Hook Tests
 * Spec: 07-scenario-2-lightning-address.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLightningAddressPayment } from '@/hooks/useLightningAddressPayment';
import * as useNWCClientModule from '@/hooks/useNWCClient';

// Mock variables
let mockLnurlpData: object | null = {
  min: 1,
  max: 1000000,
  description: 'Test',
  commentAllowed: 255,
  fixed: false,
};
const mockFetch = vi.fn();
const mockRequestInvoice = vi.fn();

// Mock LightningAddress class
vi.mock('@getalby/lightning-tools/lnurl', () => ({
  LightningAddress: vi.fn().mockImplementation((address: string) => ({
    address,
    fetch: mockFetch,
    get lnurlpData() {
      return mockLnurlpData;
    },
    requestInvoice: mockRequestInvoice,
  })),
}));

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

describe('useLightningAddressPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock lnurlpData to default
    mockLnurlpData = {
      min: 1,
      max: 1000000,
      description: 'Test',
      commentAllowed: 255,
      fixed: false,
    };

    mockFetch.mockReset().mockResolvedValue(undefined);
    mockRequestInvoice.mockReset().mockResolvedValue({
      paymentRequest: 'lnbc1000n1...',
    });
    mockPayInvoice.mockReset().mockResolvedValue({
      preimage: 'preimage123',
      fees_paid: 100,
    });
    mockRefreshBalance.mockReset().mockResolvedValue(undefined);

    // Reset mock to return connected client
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue({
      payInvoice: mockPayInvoice,
    } as unknown as ReturnType<typeof useNWCClientModule.useNWCClient>);
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.addressInfo).toBeNull();
    expect(result.current.result).toBeNull();
  });

  it('fetches address info correctly', async () => {
    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    await act(async () => {
      await result.current.fetchAddressInfo('test@getalby.com');
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(result.current.addressInfo).toEqual({
      min: 1,
      max: 1000000,
      description: 'Test',
      commentAllowed: 255,
      fixed: false,
    });
  });

  it('sets loading state during fetch', async () => {
    let resolvePromise: () => void;
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockFetch.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    act(() => {
      result.current.fetchAddressInfo('test@getalby.com');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolvePromise!();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.fetchAddressInfo('test@getalby.com');
      } catch (err) {
        thrownError = err as Error;
      }
    });

    expect(thrownError?.message).toBe('Network error');

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
    expect(result.current.loading).toBe(false);
  });

  it('handles missing LNURL data', async () => {
    // Set lnurlpData to null
    mockLnurlpData = null;

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.fetchAddressInfo('test@getalby.com');
      } catch (err) {
        thrownError = err as Error;
      }
    });

    expect(thrownError?.message).toBe('Failed to fetch LNURL-pay data');

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch LNURL-pay data');
    });
  });

  it('pays to address successfully', async () => {
    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    await act(async () => {
      const paymentResult = await result.current.payToAddress({
        address: 'test@getalby.com',
        amount: 1000,
      });
      expect(paymentResult.preimage).toBe('preimage123');
      expect(paymentResult.feesPaid).toBe(100);
    });

    expect(result.current.result).toEqual({
      preimage: 'preimage123',
      feesPaid: 100,
    });
  });

  it('pays with comment', async () => {
    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    await act(async () => {
      await result.current.payToAddress({
        address: 'test@getalby.com',
        amount: 1000,
        comment: 'Thanks!',
      });
    });

    expect(mockRequestInvoice).toHaveBeenCalledWith({
      satoshi: 1000,
      comment: 'Thanks!',
    });
  });

  it('refreshes balance after successful payment', async () => {
    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    await act(async () => {
      await result.current.payToAddress({
        address: 'test@getalby.com',
        amount: 1000,
      });
    });

    expect(mockRefreshBalance).toHaveBeenCalled();
  });

  it('handles payment error', async () => {
    mockPayInvoice.mockRejectedValue(new Error('Insufficient balance'));

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.payToAddress({
          address: 'test@getalby.com',
          amount: 1000,
        });
      } catch (err) {
        thrownError = err as Error;
      }
    });

    expect(thrownError?.message).toBe('Insufficient balance');

    await waitFor(() => {
      expect(result.current.error).toBe('Insufficient balance');
    });
    expect(result.current.result).toBeNull();
  });

  it('handles non-Error exceptions with generic message', async () => {
    mockPayInvoice.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    await act(async () => {
      try {
        await result.current.payToAddress({
          address: 'test@getalby.com',
          amount: 1000,
        });
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Payment failed');
    });
  });

  it('throws error when wallet not connected', async () => {
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue(null);

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    await expect(
      act(async () => {
        await result.current.payToAddress({
          address: 'test@getalby.com',
          amount: 1000,
        });
      })
    ).rejects.toThrow('Wallet not connected');
  });

  it('resets state correctly', async () => {
    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    // First fetch some data
    await act(async () => {
      await result.current.fetchAddressInfo('test@getalby.com');
    });

    expect(result.current.addressInfo).not.toBeNull();

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.addressInfo).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets loading state during payment', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockPayInvoice.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    act(() => {
      result.current.payToAddress({
        address: 'test@getalby.com',
        amount: 1000,
      });
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

  it('passes invoice to NWC client correctly', async () => {
    mockRequestInvoice.mockResolvedValue({
      paymentRequest: 'lnbc1000n1ptest...',
    });

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    await act(async () => {
      await result.current.payToAddress({
        address: 'test@getalby.com',
        amount: 1000,
      });
    });

    expect(mockPayInvoice).toHaveBeenCalledWith({ invoice: 'lnbc1000n1ptest...' });
  });

  it('does not refresh balance on payment failure', async () => {
    mockPayInvoice.mockRejectedValue(new Error('Payment failed'));

    const { result } = renderHook(() => useLightningAddressPayment('alice'));

    try {
      await act(async () => {
        await result.current.payToAddress({
          address: 'test@getalby.com',
          amount: 1000,
        });
      });
    } catch {
      // Expected to throw
    }

    expect(mockRefreshBalance).not.toHaveBeenCalled();
  });
});
