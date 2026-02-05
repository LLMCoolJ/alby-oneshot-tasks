/**
 * useNotifications Hook Tests
 * Spec: 08-scenario-3-notifications.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '@/hooks/useNotifications';
import * as useNWCClientModule from '@/hooks/useNWCClient';
import * as useWalletActionsModule from '@/hooks/useWalletActions';

const mockUnsubscribe = vi.fn();
const mockSubscribeNotifications = vi.fn().mockResolvedValue(mockUnsubscribe);
const mockRefreshBalance = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useNWCClient', () => ({
  useNWCClient: vi.fn(() => ({
    subscribeNotifications: mockSubscribeNotifications,
  })),
}));

vi.mock('@/hooks/useWalletActions', () => ({
  useWalletActions: vi.fn(() => ({
    refreshBalance: mockRefreshBalance,
  })),
}));

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscribeNotifications.mockReset().mockResolvedValue(mockUnsubscribe);
    mockUnsubscribe.mockReset();
    mockRefreshBalance.mockReset().mockResolvedValue(undefined);

    // Reset mock to return connected client
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue({
      subscribeNotifications: mockSubscribeNotifications,
    } as unknown as ReturnType<typeof useNWCClientModule.useNWCClient>);

    vi.mocked(useWalletActionsModule.useWalletActions).mockReturnValue({
      refreshBalance: mockRefreshBalance,
    } as unknown as ReturnType<typeof useWalletActionsModule.useWalletActions>);
  });

  it('starts unsubscribed', () => {
    const { result } = renderHook(() => useNotifications('bob'));
    expect(result.current.isSubscribed).toBe(false);
  });

  it('has no error initially', () => {
    const { result } = renderHook(() => useNotifications('bob'));
    expect(result.current.error).toBeNull();
  });

  it('subscribes successfully', async () => {
    const onNotification = vi.fn();
    const { result } = renderHook(() =>
      useNotifications('bob', { onNotification })
    );

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.isSubscribed).toBe(true);
    expect(mockSubscribeNotifications).toHaveBeenCalled();
  });

  it('passes notification types to subscribeNotifications', async () => {
    const onNotification = vi.fn();
    const { result } = renderHook(() =>
      useNotifications('bob', {
        onNotification,
        notificationTypes: ['payment_received'],
      })
    );

    await act(async () => {
      await result.current.subscribe();
    });

    expect(mockSubscribeNotifications).toHaveBeenCalledWith(
      expect.any(Function),
      ['payment_received']
    );
  });

  it('unsubscribes successfully', async () => {
    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.isSubscribed).toBe(true);

    act(() => {
      result.current.unsubscribe();
    });

    expect(result.current.isSubscribed).toBe(false);
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('cleans up on unmount', async () => {
    const { result, unmount } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.isSubscribed).toBe(true);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('does not call unsubscribe on unmount if not subscribed', () => {
    const { unmount } = renderHook(() => useNotifications('bob'));

    unmount();

    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });

  it('sets error when wallet not connected', async () => {
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue(null);

    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.error).toBe('Wallet not connected');
    expect(result.current.isSubscribed).toBe(false);
  });

  it('sets error when subscription fails', async () => {
    mockSubscribeNotifications.mockRejectedValue(new Error('Connection failed'));

    const { result } = renderHook(() => useNotifications('bob'));

    let thrownError: unknown = null;
    await act(async () => {
      try {
        await result.current.subscribe();
      } catch (err) {
        thrownError = err;
      }
    });

    expect((thrownError as Error)?.message).toBe('Connection failed');
    expect(result.current.error).toBe('Connection failed');
    expect(result.current.isSubscribed).toBe(false);
  });

  it('handles non-Error exceptions with generic message', async () => {
    mockSubscribeNotifications.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      try {
        await result.current.subscribe();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to subscribe');
  });

  it('clears error on successful subscription', async () => {
    // First, simulate an error
    mockSubscribeNotifications.mockRejectedValueOnce(new Error('Connection failed'));

    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      try {
        await result.current.subscribe();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Connection failed');

    // Now, allow successful subscription
    mockSubscribeNotifications.mockResolvedValueOnce(mockUnsubscribe);

    await act(async () => {
      await result.current.subscribe();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isSubscribed).toBe(true);
  });

  it('calls onNotification callback when notification received', async () => {
    const onNotification = vi.fn();
    let capturedCallback: ((notification: unknown) => void) | null = null;

    mockSubscribeNotifications.mockImplementation((callback) => {
      capturedCallback = callback;
      return Promise.resolve(mockUnsubscribe);
    });

    const { result } = renderHook(() =>
      useNotifications('bob', { onNotification })
    );

    await act(async () => {
      await result.current.subscribe();
    });

    expect(capturedCallback).not.toBeNull();

    // Simulate receiving a notification
    const mockNotification = {
      notification_type: 'payment_received',
      notification: {
        payment_hash: 'hash123',
        type: 'incoming',
        state: 'settled',
        amount: 100000,
        fees_paid: 0,
        description: 'Test payment',
        invoice: 'lnbc...',
        preimage: 'preimage123',
        created_at: Math.floor(Date.now() / 1000),
        settled_at: Math.floor(Date.now() / 1000),
        expires_at: null,
        metadata: {},
      },
    };

    act(() => {
      capturedCallback!(mockNotification);
    });

    expect(onNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'payment_received',
        transaction: expect.objectContaining({
          id: 'hash123',
          type: 'incoming',
          amount: 100000,
        }),
        timestamp: expect.any(Date),
      })
    );
  });

  it('refreshes balance on payment_received notification', async () => {
    let capturedCallback: ((notification: unknown) => void) | null = null;

    mockSubscribeNotifications.mockImplementation((callback) => {
      capturedCallback = callback;
      return Promise.resolve(mockUnsubscribe);
    });

    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      await result.current.subscribe();
    });

    const mockNotification = {
      notification_type: 'payment_received',
      notification: {
        payment_hash: 'hash123',
        type: 'incoming',
        state: 'settled',
        amount: 100000,
        fees_paid: 0,
        description: 'Test payment',
        invoice: 'lnbc...',
        preimage: 'preimage123',
        created_at: Math.floor(Date.now() / 1000),
        settled_at: Math.floor(Date.now() / 1000),
        expires_at: null,
        metadata: {},
      },
    };

    act(() => {
      capturedCallback!(mockNotification);
    });

    expect(mockRefreshBalance).toHaveBeenCalled();
  });

  it('refreshes balance on payment_sent notification', async () => {
    let capturedCallback: ((notification: unknown) => void) | null = null;

    mockSubscribeNotifications.mockImplementation((callback) => {
      capturedCallback = callback;
      return Promise.resolve(mockUnsubscribe);
    });

    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      await result.current.subscribe();
    });

    const mockNotification = {
      notification_type: 'payment_sent',
      notification: {
        payment_hash: 'hash123',
        type: 'outgoing',
        state: 'settled',
        amount: 100000,
        fees_paid: 100,
        description: 'Test payment',
        invoice: 'lnbc...',
        preimage: 'preimage123',
        created_at: Math.floor(Date.now() / 1000),
        settled_at: Math.floor(Date.now() / 1000),
        expires_at: null,
        metadata: {},
      },
    };

    act(() => {
      capturedCallback!(mockNotification);
    });

    expect(mockRefreshBalance).toHaveBeenCalled();
  });

  it('does not refresh balance for other notification types', async () => {
    let capturedCallback: ((notification: unknown) => void) | null = null;

    mockSubscribeNotifications.mockImplementation((callback) => {
      capturedCallback = callback;
      return Promise.resolve(mockUnsubscribe);
    });

    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      await result.current.subscribe();
    });

    const mockNotification = {
      notification_type: 'hold_invoice_accepted',
      notification: {
        payment_hash: 'hash123',
        type: 'incoming',
        state: 'accepted',
        amount: 100000,
        fees_paid: 0,
        description: 'Test payment',
        invoice: 'lnbc...',
        preimage: null,
        created_at: Math.floor(Date.now() / 1000),
        settled_at: null,
        expires_at: null,
        metadata: {},
      },
    };

    act(() => {
      capturedCallback!(mockNotification);
    });

    expect(mockRefreshBalance).not.toHaveBeenCalled();
  });

  it('converts notification transaction dates correctly', async () => {
    const onNotification = vi.fn();
    let capturedCallback: ((notification: unknown) => void) | null = null;

    mockSubscribeNotifications.mockImplementation((callback) => {
      capturedCallback = callback;
      return Promise.resolve(mockUnsubscribe);
    });

    const { result } = renderHook(() =>
      useNotifications('bob', { onNotification })
    );

    await act(async () => {
      await result.current.subscribe();
    });

    const createdTimestamp = 1704067200; // 2024-01-01 00:00:00 UTC
    const settledTimestamp = 1704067260; // 2024-01-01 00:01:00 UTC

    const mockNotification = {
      notification_type: 'payment_received',
      notification: {
        payment_hash: 'hash123',
        type: 'incoming',
        state: 'settled',
        amount: 100000,
        fees_paid: 0,
        description: 'Test payment',
        invoice: 'lnbc...',
        preimage: 'preimage123',
        created_at: createdTimestamp,
        settled_at: settledTimestamp,
        expires_at: null,
        metadata: {},
      },
    };

    act(() => {
      capturedCallback!(mockNotification);
    });

    const call = onNotification.mock.calls[0][0];
    expect(call.transaction.createdAt).toEqual(new Date(createdTimestamp * 1000));
    expect(call.transaction.settledAt).toEqual(new Date(settledTimestamp * 1000));
    expect(call.transaction.expiresAt).toBeNull();
  });

  it('handles missing preimage in notification', async () => {
    const onNotification = vi.fn();
    let capturedCallback: ((notification: unknown) => void) | null = null;

    mockSubscribeNotifications.mockImplementation((callback) => {
      capturedCallback = callback;
      return Promise.resolve(mockUnsubscribe);
    });

    const { result } = renderHook(() =>
      useNotifications('bob', { onNotification })
    );

    await act(async () => {
      await result.current.subscribe();
    });

    const mockNotification = {
      notification_type: 'payment_received',
      notification: {
        payment_hash: 'hash123',
        type: 'incoming',
        state: 'pending',
        amount: 100000,
        fees_paid: 0,
        description: 'Test payment',
        invoice: 'lnbc...',
        preimage: undefined, // No preimage yet
        created_at: Math.floor(Date.now() / 1000),
        settled_at: null,
        expires_at: null,
        metadata: {},
      },
    };

    act(() => {
      capturedCallback!(mockNotification);
    });

    const call = onNotification.mock.calls[0][0];
    expect(call.transaction.preimage).toBeNull();
  });

  it('can unsubscribe multiple times safely', async () => {
    const { result } = renderHook(() => useNotifications('bob'));

    await act(async () => {
      await result.current.subscribe();
    });

    act(() => {
      result.current.unsubscribe();
    });

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);

    // Second unsubscribe should not call mockUnsubscribe again
    act(() => {
      result.current.unsubscribe();
    });

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(result.current.isSubscribed).toBe(false);
  });

  it('uses correct walletId for NWCClient', () => {
    renderHook(() => useNotifications('alice'));

    expect(useNWCClientModule.useNWCClient).toHaveBeenCalledWith('alice');
  });

  it('uses correct walletId for WalletActions', () => {
    renderHook(() => useNotifications('alice'));

    expect(useWalletActionsModule.useWalletActions).toHaveBeenCalledWith('alice');
  });
});
