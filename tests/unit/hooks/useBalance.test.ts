/**
 * useBalance Hook Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBalance } from '@/hooks/useBalance';
import type { ConnectionStatus } from '@/types';

// Mock useWallet hook
const mockWallet: {
  status: ConnectionStatus;
  balance: number | null;
  error: string | null;
} = {
  status: 'connected',
  balance: 100000000, // 100k sats in millisats
  error: null,
};

vi.mock('@/hooks/useWallet', () => ({
  useWallet: vi.fn(() => mockWallet),
}));

// Mock useWalletActions hook
const mockRefreshBalance = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useWalletActions', () => ({
  useWalletActions: vi.fn(() => ({
    refreshBalance: mockRefreshBalance,
  })),
}));

describe('useBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock wallet state
    mockWallet.status = 'connected';
    mockWallet.balance = 100000000;
    mockWallet.error = null;
  });

  it('converts millisats to sats correctly', () => {
    const { result } = renderHook(() => useBalance('alice'));
    expect(result.current.millisats).toBe(100000000);
    expect(result.current.sats).toBe(100000);
  });

  it('returns null sats when balance is null', () => {
    mockWallet.balance = null;

    const { result } = renderHook(() => useBalance('alice'));
    expect(result.current.sats).toBeNull();
  });

  it('returns loading true when connecting', () => {
    mockWallet.status = 'connecting';

    const { result } = renderHook(() => useBalance('alice'));
    expect(result.current.loading).toBe(true);
  });

  it('returns loading false when connected', () => {
    const { result } = renderHook(() => useBalance('alice'));
    expect(result.current.loading).toBe(false);
  });

  it('provides refresh function', () => {
    const { result } = renderHook(() => useBalance('alice'));
    expect(result.current.refresh).toBe(mockRefreshBalance);
  });

  it('returns error from wallet state', () => {
    mockWallet.error = 'Connection failed';

    const { result } = renderHook(() => useBalance('alice'));
    expect(result.current.error).toBe('Connection failed');
  });

  it('floors sats value correctly', () => {
    // 100500 millisats = 100.5 sats, should floor to 100
    mockWallet.balance = 100500;

    const { result } = renderHook(() => useBalance('alice'));
    expect(result.current.sats).toBe(100);
  });
});
