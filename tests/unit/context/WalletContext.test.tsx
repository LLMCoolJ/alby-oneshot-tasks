/**
 * WalletContext Tests
 * Spec: 04-wallet-context.md
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WalletProvider } from '@/context/WalletContext';
import { useWallet, useWalletActions, useNWCClient } from '@/hooks';
import type { WalletId } from '@/types';
import { NWCClient } from '@getalby/sdk/nwc';

// Create default mock client implementation
const createMockClient = (overrides = {}) => ({
  getInfo: vi.fn().mockResolvedValue({
    alias: 'Test Wallet',
    color: '#ff0000',
    pubkey: 'abc123',
    network: 'testnet',
    block_height: 12345,
    methods: ['pay_invoice', 'make_invoice'],
  }),
  getBalance: vi.fn().mockResolvedValue({ balance: 100000000 }), // 100k sats in millisats
  close: vi.fn(),
  ...overrides,
});

// Mock NWCClient
vi.mock('@getalby/sdk/nwc', () => ({
  NWCClient: vi.fn(),
}));

const mockNWCClient = vi.mocked(NWCClient);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WalletProvider>{children}</WalletProvider>
);

// Combined hook for testing
function useWalletHooks(walletId: WalletId) {
  const wallet = useWallet(walletId);
  const actions = useWalletActions(walletId);
  const client = useNWCClient(walletId);
  return { wallet, actions, client };
}

describe('WalletContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default implementation
    mockNWCClient.mockImplementation(() => createMockClient() as unknown as NWCClient);
  });

  describe('useWallet', () => {
    it('returns disconnected state initially', () => {
      const { result } = renderHook(() => useWallet('alice'), { wrapper });
      expect(result.current.status).toBe('disconnected');
      expect(result.current.balance).toBeNull();
    });

    it('returns correct wallet id', () => {
      const { result } = renderHook(
        () => ({
          alice: useWallet('alice'),
          bob: useWallet('bob'),
        }),
        { wrapper }
      );

      expect(result.current.alice.id).toBe('alice');
      expect(result.current.bob.id).toBe('bob');
    });

    it('returns default context when used outside provider', () => {
      // This test checks that the hook works with default context value
      const { result } = renderHook(() => useWallet('alice'));
      expect(result.current.status).toBe('disconnected');
    });
  });

  describe('useWalletActions', () => {
    it('connect updates wallet state', async () => {
      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      expect(result.current.wallet.status).toBe('disconnected');

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test');
      });

      await waitFor(() => {
        expect(result.current.wallet.status).toBe('connected');
      });

      expect(result.current.wallet.balance).toBe(100000000);
      expect(result.current.wallet.info?.alias).toBe('Test Wallet');
    });

    it('disconnect clears wallet state', async () => {
      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      // First connect
      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test');
      });

      await waitFor(() => {
        expect(result.current.wallet.status).toBe('connected');
      });

      // Then disconnect
      act(() => {
        result.current.actions.disconnect();
      });

      expect(result.current.wallet.status).toBe('disconnected');
      expect(result.current.wallet.balance).toBeNull();
      expect(result.current.wallet.info).toBeNull();
    });

    it('can connect both wallets independently', async () => {
      const { result } = renderHook(
        () => ({
          alice: useWalletHooks('alice'),
          bob: useWalletHooks('bob'),
        }),
        { wrapper }
      );

      // Initially both disconnected
      expect(result.current.alice.wallet.status).toBe('disconnected');
      expect(result.current.bob.wallet.status).toBe('disconnected');

      // Connect Alice
      await act(async () => {
        await result.current.alice.actions.connect('nostr+walletconnect://alice');
      });

      await waitFor(() => {
        expect(result.current.alice.wallet.status).toBe('connected');
      });
      expect(result.current.bob.wallet.status).toBe('disconnected');

      // Connect Bob
      await act(async () => {
        await result.current.bob.actions.connect('nostr+walletconnect://bob');
      });

      await waitFor(() => {
        expect(result.current.bob.wallet.status).toBe('connected');
      });
      expect(result.current.alice.wallet.status).toBe('connected');
    });
  });

  describe('useNWCClient', () => {
    it('returns null when disconnected', () => {
      const { result } = renderHook(() => useNWCClient('alice'), { wrapper });
      expect(result.current).toBeNull();
    });

    it('returns client when connected', async () => {
      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      expect(result.current.client).toBeNull();

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test');
      });

      await waitFor(() => {
        expect(result.current.client).not.toBeNull();
      });
    });
  });

  describe('Error handling', () => {
    it('handles connection error', async () => {
      // Setup mock to fail
      mockNWCClient.mockImplementation(() => createMockClient({
        getInfo: vi.fn().mockRejectedValue(new Error('Connection refused')),
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.connect('nostr+walletconnect://test');
        } catch {
          // Expected
        }
      });

      expect(result.current.wallet.status).toBe('error');
      expect(result.current.wallet.error).toBe('Connection refused');
    });

    it('handles non-Error exception during connection', async () => {
      mockNWCClient.mockImplementation(() => createMockClient({
        getInfo: vi.fn().mockRejectedValue('Unknown error'),
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.connect('nostr+walletconnect://test');
        } catch {
          // Expected
        }
      });

      expect(result.current.wallet.status).toBe('error');
      expect(result.current.wallet.error).toBe('Connection failed');
    });

    it('sets connecting status during connection', async () => {
      let resolveGetInfo: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolveGetInfo = resolve;
      });

      mockNWCClient.mockImplementation(() => createMockClient({
        getInfo: vi.fn().mockReturnValue(pendingPromise),
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      act(() => {
        result.current.actions.connect('nostr+walletconnect://test');
      });

      await waitFor(() => {
        expect(result.current.wallet.status).toBe('connecting');
      });

      await act(async () => {
        resolveGetInfo!({
          alias: 'Test',
          pubkey: 'abc',
          methods: [],
        });
      });

      await waitFor(() => {
        expect(result.current.wallet.status).toBe('connected');
      });
    });

    it('clears client on connection error', async () => {
      mockNWCClient.mockImplementation(() => createMockClient({
        getInfo: vi.fn().mockRejectedValue(new Error('Failed')),
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.connect('nostr+walletconnect://test');
        } catch {
          // Expected
        }
      });

      expect(result.current.client).toBeNull();
    });
  });

  describe('Balance management', () => {
    it('refreshBalance updates balance', async () => {
      const mockGetBalance = vi.fn()
        .mockResolvedValueOnce({ balance: 100000000 })
        .mockResolvedValueOnce({ balance: 200000000 });

      mockNWCClient.mockImplementationOnce(() => createMockClient({
        getBalance: mockGetBalance,
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test');
      });

      expect(result.current.wallet.balance).toBe(100000000);

      await act(async () => {
        await result.current.actions.refreshBalance();
      });

      expect(result.current.wallet.balance).toBe(200000000);
    });

    it('refreshBalance does nothing when disconnected', async () => {
      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      // Should not throw
      await act(async () => {
        await result.current.actions.refreshBalance();
      });

      expect(result.current.wallet.balance).toBeNull();
    });

    it('refreshBalance handles errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockGetBalance = vi.fn()
        .mockResolvedValueOnce({ balance: 100000000 })
        .mockRejectedValueOnce(new Error('Network error'));

      mockNWCClient.mockImplementationOnce(() => createMockClient({
        getBalance: mockGetBalance,
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test');
      });

      // Balance refresh error should not throw
      await act(async () => {
        await result.current.actions.refreshBalance();
      });

      // Balance should remain unchanged
      expect(result.current.wallet.balance).toBe(100000000);
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });

  describe('Client lifecycle', () => {
    it('closes existing client when reconnecting', async () => {
      const mockClose = vi.fn();
      mockNWCClient.mockImplementation(() => createMockClient({
        close: mockClose,
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test1');
      });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test2');
      });

      expect(mockClose).toHaveBeenCalled();
    });

    it('closes client on disconnect', async () => {
      const mockClose = vi.fn();
      mockNWCClient.mockImplementationOnce(() => createMockClient({
        close: mockClose,
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test');
      });

      act(() => {
        result.current.actions.disconnect();
      });

      expect(mockClose).toHaveBeenCalled();
    });

    it('stores nwcUrl on successful connection', async () => {
      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://my-wallet');
      });

      expect(result.current.wallet.nwcUrl).toBe('nostr+walletconnect://my-wallet');
    });

    it('clears nwcUrl on disconnect', async () => {
      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://my-wallet');
      });

      expect(result.current.wallet.nwcUrl).toBe('nostr+walletconnect://my-wallet');

      act(() => {
        result.current.actions.disconnect();
      });

      expect(result.current.wallet.nwcUrl).toBeNull();
    });
  });

  describe('Wallet info', () => {
    it('stores wallet info on connection', async () => {
      mockNWCClient.mockImplementationOnce(() => createMockClient({
        getInfo: vi.fn().mockResolvedValue({
          alias: 'My Lightning Node',
          color: '#ff9900',
          pubkey: 'pubkey123',
          network: 'mainnet',
          block_height: 800000,
          methods: ['pay_invoice', 'make_invoice', 'get_balance'],
          lud16: 'user@example.com',
        }),
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test');
      });

      expect(result.current.wallet.info).toEqual({
        alias: 'My Lightning Node',
        color: '#ff9900',
        pubkey: 'pubkey123',
        network: 'mainnet',
        blockHeight: 800000,
        methods: ['pay_invoice', 'make_invoice', 'get_balance'],
        lud16: 'user@example.com',
      });
    });

    it('clears error on successful connection', async () => {
      // First connection fails
      mockNWCClient.mockImplementation(() => createMockClient({
        getInfo: vi.fn().mockRejectedValue(new Error('First attempt failed')),
      }) as unknown as NWCClient);

      const { result } = renderHook(() => useWalletHooks('alice'), { wrapper });

      await act(async () => {
        try {
          await result.current.actions.connect('nostr+walletconnect://test');
        } catch {
          // Expected
        }
      });

      expect(result.current.wallet.error).toBe('First attempt failed');

      // Second connection succeeds - reset to default implementation
      mockNWCClient.mockImplementation(() => createMockClient() as unknown as NWCClient);

      await act(async () => {
        await result.current.actions.connect('nostr+walletconnect://test2');
      });

      expect(result.current.wallet.error).toBeNull();
    });
  });
});
