/**
 * useZap hook tests
 * Spec: 12-scenario-7-nostr-zap.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { PaymentResult } from '@/types';
import * as useNWCClientModule from '@/hooks/useNWCClient';

// Mock variables
const mockFetch = vi.fn();
const mockZapInvoice = vi.fn();

// Mock LightningAddress class
vi.mock('@getalby/lightning-tools/lnurl', () => ({
  LightningAddress: vi.fn().mockImplementation(() => ({
    fetch: mockFetch,
    zapInvoice: mockZapInvoice,
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

// Import after mocks are set up
import { useZap } from '@/hooks/useZap';

describe('useZap', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFetch.mockReset().mockResolvedValue(undefined);
    mockZapInvoice.mockReset().mockResolvedValue({
      paymentRequest: 'lnbc1000n1ptest...',
    });
    mockPayInvoice.mockReset().mockResolvedValue({
      preimage: 'preimage123abc456',
      fees_paid: 100,
    });
    mockRefreshBalance.mockReset().mockResolvedValue(undefined);

    // Reset mock to return connected client
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue({
      payInvoice: mockPayInvoice,
    } as unknown as ReturnType<typeof useNWCClientModule.useNWCClient>);
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useZap('alice'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.sendZap).toBe('function');
  });

  it('sends zap with correct parameters', async () => {
    const { result } = renderHook(() => useZap('alice'));

    let zapResult: PaymentResult | undefined;
    await act(async () => {
      zapResult = await result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub123...',
        amount: 21,
        relays: ['wss://relay.damus.io'],
        comment: 'Great post!',
      });
    });

    expect(zapResult?.preimage).toBe('preimage123abc456');
    expect(zapResult?.feesPaid).toBe(100);
  });

  it('calls LightningAddress.fetch before creating zap invoice', async () => {
    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      await result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub123...',
        amount: 21,
        relays: ['wss://relay.damus.io'],
      });
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(mockZapInvoice).toHaveBeenCalled();
  });

  it('creates zap invoice with Nostr metadata', async () => {
    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      await result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub1bob123',
        amount: 100,
        relays: ['wss://relay.damus.io', 'wss://nos.lol'],
        eventId: 'note1abc123',
        comment: 'Nice!',
      });
    });

    expect(mockZapInvoice).toHaveBeenCalledWith({
      satoshi: 100,
      comment: 'Nice!',
      relays: ['wss://relay.damus.io', 'wss://nos.lol'],
      p: 'npub1bob123',
      e: 'note1abc123',
    });
  });

  it('pays the generated zap invoice', async () => {
    mockZapInvoice.mockResolvedValue({
      paymentRequest: 'lnbc1000n1ptest_zap_invoice...',
    });

    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      await result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub123...',
        amount: 21,
        relays: [],
      });
    });

    expect(mockPayInvoice).toHaveBeenCalledWith({
      invoice: 'lnbc1000n1ptest_zap_invoice...',
    });
  });

  it('refreshes balance after successful zap', async () => {
    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      await result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub123...',
        amount: 21,
        relays: [],
      });
    });

    expect(mockRefreshBalance).toHaveBeenCalled();
  });

  it('sets loading state during sendZap', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockPayInvoice.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useZap('alice'));

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub123...',
        amount: 21,
        relays: [],
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

  it('sets error state on failure', async () => {
    mockPayInvoice.mockRejectedValue(new Error('Payment failed'));

    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      try {
        await result.current.sendZap({
          recipientAddress: 'bob@getalby.com',
          recipientPubkey: 'npub123...',
          amount: 21,
          relays: [],
        });
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe('Payment failed');
  });

  it('handles missing wallet gracefully', async () => {
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue(null);

    const { result } = renderHook(() => useZap('alice'));

    await expect(
      act(async () => {
        await result.current.sendZap({
          recipientAddress: 'bob@getalby.com',
          recipientPubkey: 'npub123...',
          amount: 21,
          relays: [],
        });
      })
    ).rejects.toThrow('Wallet not connected');
  });

  it('handles LightningAddress.fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch LNURL data'));

    const { result } = renderHook(() => useZap('alice'));

    let thrownError: unknown = null;
    await act(async () => {
      try {
        await result.current.sendZap({
          recipientAddress: 'invalid@address.com',
          recipientPubkey: 'npub123...',
          amount: 21,
          relays: [],
        });
      } catch (err) {
        thrownError = err;
      }
    });

    expect((thrownError as Error)?.message).toBe('Failed to fetch LNURL data');
    expect(result.current.error).toBe('Failed to fetch LNURL data');
  });

  it('handles zapInvoice error', async () => {
    mockZapInvoice.mockRejectedValue(new Error('LNURL server error'));

    const { result } = renderHook(() => useZap('alice'));

    let thrownError: unknown = null;
    await act(async () => {
      try {
        await result.current.sendZap({
          recipientAddress: 'bob@getalby.com',
          recipientPubkey: 'npub123...',
          amount: 21,
          relays: [],
        });
      } catch (err) {
        thrownError = err;
      }
    });

    expect((thrownError as Error)?.message).toBe('LNURL server error');
    expect(result.current.error).toBe('LNURL server error');
  });

  it('handles non-Error exceptions with generic message', async () => {
    mockPayInvoice.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      try {
        await result.current.sendZap({
          recipientAddress: 'bob@getalby.com',
          recipientPubkey: 'npub123...',
          amount: 21,
          relays: [],
        });
      } catch {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Zap failed');
    });
  });

  it('does not refresh balance on payment failure', async () => {
    mockPayInvoice.mockRejectedValue(new Error('Payment failed'));

    const { result } = renderHook(() => useZap('alice'));

    try {
      await act(async () => {
        await result.current.sendZap({
          recipientAddress: 'bob@getalby.com',
          recipientPubkey: 'npub123...',
          amount: 21,
          relays: [],
        });
      });
    } catch {
      // Expected to throw
    }

    expect(mockRefreshBalance).not.toHaveBeenCalled();
  });

  it('clears error state before new request', async () => {
    // First, cause an error
    mockPayInvoice.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      try {
        await result.current.sendZap({
          recipientAddress: 'bob@getalby.com',
          recipientPubkey: 'npub123...',
          amount: 21,
          relays: [],
        });
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe('First error');

    // Now make a successful request
    mockPayInvoice.mockResolvedValueOnce({
      preimage: 'success',
      fees_paid: 0,
    });

    await act(async () => {
      await result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub123...',
        amount: 21,
        relays: [],
      });
    });

    expect(result.current.error).toBeNull();
  });

  it('sends zap without optional comment', async () => {
    const { result } = renderHook(() => useZap('alice'));

    await act(async () => {
      await result.current.sendZap({
        recipientAddress: 'bob@getalby.com',
        recipientPubkey: 'npub123...',
        amount: 50,
        relays: ['wss://relay.damus.io'],
      });
    });

    expect(mockZapInvoice).toHaveBeenCalledWith({
      satoshi: 50,
      comment: undefined,
      relays: ['wss://relay.damus.io'],
      p: 'npub123...',
      e: undefined,
    });
  });
});
