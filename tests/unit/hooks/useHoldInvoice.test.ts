/**
 * useHoldInvoice hook tests
 * Spec: 09-scenario-4-hold-invoice.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { HoldInvoice } from '@/types';

// Create mock functions with vi.hoisted to ensure they're available when mocks are hoisted
const { mockMakeHoldInvoice, mockSettleHoldInvoice, mockCancelHoldInvoice } = vi.hoisted(() => ({
  mockMakeHoldInvoice: vi.fn(),
  mockSettleHoldInvoice: vi.fn(),
  mockCancelHoldInvoice: vi.fn(),
}));

vi.mock('@/hooks/useNWCClient', () => ({
  useNWCClient: vi.fn().mockReturnValue({
    makeHoldInvoice: mockMakeHoldInvoice,
    settleHoldInvoice: mockSettleHoldInvoice,
    cancelHoldInvoice: mockCancelHoldInvoice,
  }),
}));

// Mock generatePreimageAndHash
vi.mock('@/lib/crypto', () => ({
  generatePreimageAndHash: vi.fn().mockResolvedValue({
    preimage: 'a'.repeat(64),
    paymentHash: 'b'.repeat(64),
  }),
}));

// Import after mocks are set up
import { useHoldInvoice } from '@/hooks/useHoldInvoice';

describe('useHoldInvoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMakeHoldInvoice.mockResolvedValue({ invoice: 'lnbc...' });
    mockSettleHoldInvoice.mockResolvedValue({});
    mockCancelHoldInvoice.mockResolvedValue({});
  });

  it('creates hold invoice with generated preimage', async () => {
    const { result } = renderHook(() => useHoldInvoice('bob'));

    let holdInvoice: HoldInvoice | undefined;
    await act(async () => {
      holdInvoice = await result.current.createHoldInvoice({
        amount: 1000000,
        description: 'Test',
      });
    });

    expect(holdInvoice).toHaveProperty('preimage');
    expect(holdInvoice).toHaveProperty('paymentHash');
    expect(holdInvoice?.state).toBe('created');
  });

  it('settles hold invoice', async () => {
    const { result } = renderHook(() => useHoldInvoice('bob'));

    await act(async () => {
      await result.current.settleHoldInvoice('preimage123');
    });

    expect(mockSettleHoldInvoice).toHaveBeenCalledWith({ preimage: 'preimage123' });
  });

  it('cancels hold invoice', async () => {
    const { result } = renderHook(() => useHoldInvoice('bob'));

    await act(async () => {
      await result.current.cancelHoldInvoice('hash123');
    });

    expect(mockCancelHoldInvoice).toHaveBeenCalledWith({ payment_hash: 'hash123' });
  });

  it('sets loading state during createHoldInvoice', async () => {
    const { result } = renderHook(() => useHoldInvoice('bob'));

    expect(result.current.loading).toBe(false);

    let promise: Promise<HoldInvoice>;
    act(() => {
      promise = result.current.createHoldInvoice({
        amount: 1000000,
        description: 'Test',
      });
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('sets error state on failure', async () => {
    mockMakeHoldInvoice.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useHoldInvoice('bob'));

    await act(async () => {
      try {
        await result.current.createHoldInvoice({
          amount: 1000000,
          description: 'Test',
        });
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe('Network error');
  });
});
