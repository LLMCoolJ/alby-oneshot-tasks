import { vi } from 'vitest';

// Mock LNURL subpath
vi.mock('@getalby/lightning-tools/lnurl', () => ({
  LightningAddress: vi.fn().mockImplementation((address: string) => ({
    address,
    fetch: vi.fn().mockResolvedValue(undefined),
    lnurlpData: {
      min: 1,
      max: 1_000_000,
      description: 'Test address',
      commentAllowed: 255,
      fixed: false,
    },
    requestInvoice: vi.fn().mockResolvedValue({
      paymentRequest: 'lnbc1000n1...',
      paymentHash: 'hash123',
    }),
    zapInvoice: vi.fn().mockResolvedValue({
      paymentRequest: 'lnbc1000n1zap...',
    }),
  })),
  generateZapEvent: vi.fn().mockResolvedValue({
    id: 'event123',
    kind: 9734,
    content: '',
    tags: [],
    created_at: Date.now() / 1000,
  }),
}));

// Mock bolt11 subpath
vi.mock('@getalby/lightning-tools/bolt11', () => ({
  Invoice: vi.fn().mockImplementation(({ pr }) => ({
    paymentRequest: pr,
    paymentHash: 'hash123',
    satoshi: 1000,
    description: 'Test invoice',
    validatePreimage: vi.fn().mockReturnValue(true),
    isPaid: vi.fn().mockResolvedValue(false),
    hasExpired: vi.fn().mockReturnValue(false),
  })),
  decodeInvoice: vi.fn().mockImplementation((_invoice: string) => ({
    paymentHash: 'hash123',
    satoshi: 1000,
    timestamp: Date.now() / 1000,
    expiry: 3600,
    description: 'Test invoice',
  })),
  fromHexString: vi.fn().mockImplementation((hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }),
}));

// Mock fiat subpath
vi.mock('@getalby/lightning-tools/fiat', () => ({
  getFiatValue: vi.fn().mockResolvedValue(42.00),
  getSatoshiValue: vi.fn().mockResolvedValue(1000),
  getFormattedFiatValue: vi.fn().mockResolvedValue('$42.00'),
  getFiatBtcRate: vi.fn().mockResolvedValue(42000),
  getFiatCurrencies: vi.fn().mockResolvedValue([
    { code: 'USD', name: 'US Dollar', symbol: '$', priority: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', priority: 2 },
  ]),
}));
