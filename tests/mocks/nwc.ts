import { vi } from 'vitest';
import type { NWCClient } from '@getalby/sdk/nwc';

export const createMockNWCClient = (overrides = {}): Partial<NWCClient> => ({
  getInfo: vi.fn().mockResolvedValue({
    alias: 'Test Wallet',
    color: '#ff0000',
    pubkey: 'abc123',
    network: 'testnet',
    block_height: 12345,
    methods: ['pay_invoice', 'make_invoice', 'get_balance'],
    lud16: 'test@getalby.com',
  }),

  getBalance: vi.fn().mockResolvedValue({
    balance: 100_000_000, // 100k sats in millisats
  }),

  makeInvoice: vi.fn().mockResolvedValue({
    invoice: 'lnbc1000n1...',
    payment_hash: 'abc123',
    amount: 1_000_000,
    description: 'Test invoice',
    created_at: Math.floor(Date.now() / 1000),
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  }),

  payInvoice: vi.fn().mockResolvedValue({
    preimage: 'preimage123456789',
    fees_paid: 1000,
  }),

  listTransactions: vi.fn().mockResolvedValue({
    transactions: [],
    total_count: 0,
  }),

  subscribeNotifications: vi.fn().mockResolvedValue(() => {}),

  close: vi.fn(),

  ...overrides,
});

// Mock the NWCClient constructor while preserving other exports
vi.mock('@getalby/sdk/nwc', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    NWCClient: vi.fn().mockImplementation(() => createMockNWCClient()),
  };
});
