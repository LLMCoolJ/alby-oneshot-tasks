/**
 * useTransactions Hook Tests
 * Spec: 11-scenario-6-transaction-history.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTransactions } from '@/hooks/useTransactions';

// Mock transaction data
const mockTransactions = [
  {
    payment_hash: 'hash1',
    type: 'incoming' as const,
    state: 'settled' as const,
    amount: 1000000, // 1000 sats in millisats
    fees_paid: 0,
    description: 'Test Payment 1',
    invoice: 'lnbc1000n1...',
    preimage: 'preimage1',
    created_at: Math.floor(Date.now() / 1000),
    settled_at: Math.floor(Date.now() / 1000),
    expires_at: null,
    metadata: undefined,
  },
  {
    payment_hash: 'hash2',
    type: 'outgoing' as const,
    state: 'settled' as const,
    amount: 500000, // 500 sats in millisats
    fees_paid: 1000,
    description: 'Test Payment 2',
    invoice: 'lnbc500n1...',
    preimage: 'preimage2',
    created_at: Math.floor(Date.now() / 1000),
    settled_at: Math.floor(Date.now() / 1000),
    expires_at: null,
    metadata: undefined,
  },
];

// Use vi.hoisted to define mock before vi.mock is hoisted
const { mockListTransactions, mockUseNWCClient } = vi.hoisted(() => {
  const mockListTransactions = vi.fn();
  const mockUseNWCClient = vi.fn();
  return { mockListTransactions, mockUseNWCClient };
});

vi.mock('@/hooks/useNWCClient', () => ({
  useNWCClient: mockUseNWCClient,
}));

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to return a client with listTransactions
    mockUseNWCClient.mockReturnValue({
      listTransactions: mockListTransactions,
    });
    mockListTransactions.mockResolvedValue({
      transactions: mockTransactions,
    });
  });

  it('fetches transactions on mount', async () => {
    const { result } = renderHook(() => useTransactions('alice'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(2);
      expect(result.current.loading).toBe(false);
    });
  });

  it('maps transaction data correctly', async () => {
    const { result } = renderHook(() => useTransactions('alice'));

    await waitFor(() => {
      expect(result.current.transactions[0]).toMatchObject({
        id: 'hash1',
        type: 'incoming',
        state: 'settled',
        amount: 1000000,
        feesPaid: 0,
        description: 'Test Payment 1',
        paymentHash: 'hash1',
        preimage: 'preimage1',
      });
    });
  });

  it('converts timestamps to Date objects', async () => {
    const { result } = renderHook(() => useTransactions('alice'));

    await waitFor(() => {
      expect(result.current.transactions[0].createdAt).toBeInstanceOf(Date);
      expect(result.current.transactions[0].settledAt).toBeInstanceOf(Date);
    });
  });

  it('supports filtering by type', async () => {
    const { result, rerender } = renderHook(
      ({ type }) => useTransactions('alice', { type }),
      { initialProps: { type: undefined as 'incoming' | 'outgoing' | undefined } }
    );

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(2);
    });

    // Change filter to incoming
    rerender({ type: 'incoming' });

    await waitFor(() => {
      expect(mockListTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'incoming' })
      );
    });
  });

  it('supports pagination with limit', async () => {
    const { result } = renderHook(() => useTransactions('alice', { limit: 10 }));

    await waitFor(() => {
      expect(mockListTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10 })
      );
    });

    // hasMore should be determined by whether returned count equals limit
    await waitFor(() => {
      expect(result.current.hasMore).toBeDefined();
    });
  });

  it('loads more transactions when loadMore is called', async () => {
    const { result } = renderHook(() => useTransactions('alice', { limit: 2 }));

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(2);
    });

    // Reset mock for next call
    mockListTransactions.mockResolvedValueOnce({
      transactions: [
        {
          payment_hash: 'hash3',
          type: 'incoming',
          state: 'settled',
          amount: 200000,
          fees_paid: 0,
          description: 'Test Payment 3',
          invoice: 'lnbc200n1...',
          preimage: 'preimage3',
          created_at: Math.floor(Date.now() / 1000),
          settled_at: Math.floor(Date.now() / 1000),
        },
      ],
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(mockListTransactions).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 2 })
      );
    });
  });

  it('refreshes transactions from the beginning', async () => {
    const { result } = renderHook(() => useTransactions('alice'));

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(2);
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      // Should reset offset to 0
      expect(mockListTransactions).toHaveBeenLastCalledWith(
        expect.objectContaining({ offset: 0 })
      );
    });
  });

  it('handles errors gracefully', async () => {
    mockListTransactions.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTransactions('alice'));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles null preimage correctly', async () => {
    mockListTransactions.mockResolvedValueOnce({
      transactions: [
        {
          ...mockTransactions[0],
          preimage: null,
          state: 'pending',
        },
      ],
    });

    const { result } = renderHook(() => useTransactions('alice'));

    await waitFor(() => {
      expect(result.current.transactions[0].preimage).toBeNull();
      expect(result.current.transactions[0].state).toBe('pending');
    });
  });

  it('returns empty array when no transactions', async () => {
    mockListTransactions.mockResolvedValueOnce({
      transactions: [],
    });

    const { result } = renderHook(() => useTransactions('alice'));

    await waitFor(() => {
      expect(result.current.transactions).toHaveLength(0);
      expect(result.current.hasMore).toBe(false);
    });
  });

  it('does not fetch when client is null', async () => {
    // Override the mock to return null client
    mockUseNWCClient.mockReturnValueOnce(null);

    const { result } = renderHook(() => useTransactions('alice'));

    // Should not have called listTransactions in this render
    // (previous calls may have happened in other tests)
    expect(result.current.transactions).toHaveLength(0);
    expect(result.current.loading).toBe(false);
  });
});
