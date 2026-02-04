/**
 * useInvoice Hook Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInvoice } from '@/hooks/useInvoice';
import * as useNWCClientModule from '@/hooks/useNWCClient';

// Mock NWC client
const mockMakeInvoice = vi.fn();

vi.mock('@/hooks/useNWCClient', () => ({
  useNWCClient: vi.fn(() => ({
    makeInvoice: mockMakeInvoice,
  })),
}));

describe('useInvoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMakeInvoice.mockReset();
    // Reset mock to return connected client
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue({
      makeInvoice: mockMakeInvoice,
    } as unknown as ReturnType<typeof useNWCClientModule.useNWCClient>);
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useInvoice('alice'));

    expect(result.current.invoice).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('creates invoice successfully', async () => {
    const mockInvoice = {
      invoice: 'lnbc100n1p...',
      payment_hash: 'abc123',
      amount: 1000,
    };
    mockMakeInvoice.mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoice('alice'));

    await act(async () => {
      await result.current.createInvoice({
        amount: 1000,
        description: 'Test invoice',
      });
    });

    expect(result.current.invoice).toEqual(mockInvoice);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading state during invoice creation', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockMakeInvoice.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useInvoice('alice'));

    act(() => {
      result.current.createInvoice({
        amount: 1000,
        description: 'Test invoice',
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolvePromise!({ invoice: 'lnbc...' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles invoice creation error and sets error state', async () => {
    mockMakeInvoice.mockImplementation(() => {
      return Promise.reject(new Error('Invoice creation failed'));
    });

    const { result } = renderHook(() => useInvoice('alice'));

    // Call createInvoice and expect it to throw
    await act(async () => {
      try {
        await result.current.createInvoice({
          amount: 1000,
          description: 'Test invoice',
        });
      } catch {
        // Error is expected
      }
    });

    // Now check state after the error
    expect(result.current.invoice).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Invoice creation failed');
  });

  it('handles non-Error exceptions and sets default error message', async () => {
    mockMakeInvoice.mockImplementation(() => {
      return Promise.reject('Unknown error');
    });

    const { result } = renderHook(() => useInvoice('alice'));

    await act(async () => {
      try {
        await result.current.createInvoice({
          amount: 1000,
          description: 'Test invoice',
        });
      } catch {
        // Error is expected
      }
    });

    expect(result.current.error).toBe('Failed to create invoice');
  });

  it('passes expiry option when provided', async () => {
    mockMakeInvoice.mockResolvedValue({ invoice: 'lnbc...' });

    const { result } = renderHook(() => useInvoice('alice'));

    await act(async () => {
      await result.current.createInvoice({
        amount: 1000,
        description: 'Test invoice',
        expiry: 3600,
      });
    });

    expect(mockMakeInvoice).toHaveBeenCalledWith({
      amount: 1000,
      description: 'Test invoice',
      expiry: 3600,
    });
  });

  it('resets state correctly', async () => {
    const mockInvoice = { invoice: 'lnbc...' };
    mockMakeInvoice.mockResolvedValue(mockInvoice);

    const { result } = renderHook(() => useInvoice('alice'));

    await act(async () => {
      await result.current.createInvoice({
        amount: 1000,
        description: 'Test invoice',
      });
    });

    expect(result.current.invoice).toEqual(mockInvoice);

    act(() => {
      result.current.reset();
    });

    expect(result.current.invoice).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('throws error when wallet not connected', async () => {
    // Override mock to return null (disconnected)
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue(null);

    const { result } = renderHook(() => useInvoice('alice'));

    await expect(
      act(async () => {
        await result.current.createInvoice({
          amount: 1000,
          description: 'Test invoice',
        });
      })
    ).rejects.toThrow('Wallet not connected');
  });
});
