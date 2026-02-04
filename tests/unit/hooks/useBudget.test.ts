/**
 * useBudget Hook Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBudget } from '@/hooks/useBudget';
import type { ConnectionStatus } from '@/types';
import * as useNWCClientModule from '@/hooks/useNWCClient';
import * as useWalletModule from '@/hooks/useWallet';

// Mock NWC client
const mockGetBudget = vi.fn();

// Mock wallet state
const mockWallet: {
  status: ConnectionStatus;
  balance: number | null;
  error: string | null;
} = {
  status: 'connected',
  balance: 100000000,
  error: null,
};

vi.mock('@/hooks/useNWCClient', () => ({
  useNWCClient: vi.fn(() => ({
    getBudget: mockGetBudget,
  })),
}));

vi.mock('@/hooks/useWallet', () => ({
  useWallet: vi.fn(() => mockWallet),
}));

describe('useBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBudget.mockReset();
    // Reset mock wallet state
    mockWallet.status = 'connected';
    mockWallet.balance = 100000000;
    mockWallet.error = null;
    // Reset mocks
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue({
      getBudget: mockGetBudget,
    } as unknown as ReturnType<typeof useNWCClientModule.useNWCClient>);
    vi.mocked(useWalletModule.useWallet).mockReturnValue(mockWallet as unknown as ReturnType<typeof useWalletModule.useWallet>);
  });

  it('returns initial state before fetching', () => {
    mockGetBudget.mockResolvedValue({});

    const { result } = renderHook(() => useBudget('alice'));

    // Initially null before budget is fetched
    expect(result.current.usedBudget).toBeNull();
    expect(result.current.totalBudget).toBeNull();
    expect(result.current.remainingBudget).toBeNull();
    expect(result.current.available).toBe(false);
  });

  it('fetches budget when wallet is connected', async () => {
    const mockBudgetResponse = {
      used_budget: 50000000,
      total_budget: 100000000,
      renews_at: Math.floor(Date.now() / 1000) + 3600,
      renewal_period: 'daily' as const,
    };
    mockGetBudget.mockResolvedValue(mockBudgetResponse);

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.usedBudget).toBe(50000000);
    });

    expect(result.current.totalBudget).toBe(100000000);
    expect(result.current.remainingBudget).toBe(50000000);
    expect(result.current.renewalPeriod).toBe('daily');
    expect(result.current.available).toBe(true);
    expect(result.current.renewsAt).toBeInstanceOf(Date);
  });

  it('handles budget with no renewal date', async () => {
    const mockBudgetResponse = {
      used_budget: 25000000,
      total_budget: 100000000,
      renewal_period: 'never' as const,
    };
    mockGetBudget.mockResolvedValue(mockBudgetResponse);

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.usedBudget).toBe(25000000);
    });

    expect(result.current.renewsAt).toBeNull();
    expect(result.current.renewalPeriod).toBe('never');
  });

  it('handles empty budget response (unlimited)', async () => {
    mockGetBudget.mockResolvedValue({});

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.usedBudget).toBeNull();
    expect(result.current.totalBudget).toBeNull();
    expect(result.current.remainingBudget).toBeNull();
    expect(result.current.available).toBe(false);
  });

  it('handles getBudget error gracefully', async () => {
    mockGetBudget.mockRejectedValue(new Error('Budget not supported'));

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.error).toBe('Budget not supported');
    });

    expect(result.current.available).toBe(false);
    expect(result.current.usedBudget).toBeNull();
  });

  it('handles non-Error exceptions', async () => {
    mockGetBudget.mockRejectedValue('Unknown error');

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch budget');
    });
  });

  it('does not fetch budget when disconnected', () => {
    mockWallet.status = 'disconnected';
    vi.mocked(useWalletModule.useWallet).mockReturnValue(mockWallet as unknown as ReturnType<typeof useWalletModule.useWallet>);

    renderHook(() => useBudget('alice'));

    // Should not call getBudget when disconnected
    expect(mockGetBudget).not.toHaveBeenCalled();
  });

  it('refresh function fetches budget again', async () => {
    const mockBudgetResponse = {
      used_budget: 50000000,
      total_budget: 100000000,
      renewal_period: 'daily' as const,
    };
    mockGetBudget.mockResolvedValue(mockBudgetResponse);

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.usedBudget).toBe(50000000);
    });

    expect(mockGetBudget).toHaveBeenCalledTimes(1);

    // Update mock to return different values
    mockGetBudget.mockResolvedValue({
      used_budget: 75000000,
      total_budget: 100000000,
      renewal_period: 'daily' as const,
    });

    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.usedBudget).toBe(75000000);
    });

    expect(mockGetBudget).toHaveBeenCalledTimes(2);
  });

  it('sets loading state during fetch', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGetBudget.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolvePromise!({ used_budget: 0, total_budget: 100000000 });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('calculates remaining budget correctly', async () => {
    mockGetBudget.mockResolvedValue({
      used_budget: 30000000, // 30k sats in millisats
      total_budget: 100000000, // 100k sats in millisats
      renewal_period: 'monthly' as const,
    });

    const { result } = renderHook(() => useBudget('alice'));

    await waitFor(() => {
      expect(result.current.remainingBudget).toBe(70000000);
    });
  });

  it('does not call refresh when client is null', async () => {
    // Override mock to return null (disconnected)
    vi.mocked(useNWCClientModule.useNWCClient).mockReturnValue(null);

    const { result } = renderHook(() => useBudget('alice'));

    await act(async () => {
      await result.current.refresh();
    });

    // Should not throw, just return early
    expect(result.current.loading).toBe(false);
  });
});
