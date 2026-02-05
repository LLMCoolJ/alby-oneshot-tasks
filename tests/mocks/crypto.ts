import { vi } from 'vitest';

// Mock Web Crypto API for Node.js environment
const mockCrypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    digest: vi.fn().mockImplementation(async (_algorithm: string, _data: ArrayBuffer) => {
      // Return deterministic hash for testing
      return new Uint8Array(32).fill(0xab).buffer;
    }),
  },
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2),
};

vi.stubGlobal('crypto', mockCrypto);
