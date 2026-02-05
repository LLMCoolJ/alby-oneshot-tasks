/**
 * Crypto utilities tests
 * Spec: 09-scenario-4-hold-invoice.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  toHexString,
  fromHexString,
  generatePreimageAndHash,
  verifyPreimage,
} from '@/lib/crypto';

// Mock the Invoice class from lightning-tools/bolt11 subpath
vi.mock('@getalby/lightning-tools/bolt11', () => ({
  fromHexString: vi.fn().mockImplementation((hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }),
  Invoice: vi.fn().mockImplementation((_opts: { pr: string }) => ({
    paymentHash: 'mock_payment_hash',
    // Mock validatePreimage to return true for specific preimage
    validatePreimage: vi.fn().mockImplementation((preimage: string) => {
      return preimage === 'valid_preimage_hex';
    }),
  })),
}));

describe('crypto utilities', () => {
  describe('toHexString', () => {
    it('converts bytes to hex', () => {
      const bytes = new Uint8Array([0, 15, 255]);
      expect(toHexString(bytes)).toBe('000fff');
    });

    it('handles empty array', () => {
      expect(toHexString(new Uint8Array([]))).toBe('');
    });

    it('handles all zeros', () => {
      const bytes = new Uint8Array([0, 0, 0]);
      expect(toHexString(bytes)).toBe('000000');
    });

    it('handles all ones (255)', () => {
      const bytes = new Uint8Array([255, 255, 255]);
      expect(toHexString(bytes)).toBe('ffffff');
    });
  });

  describe('fromHexString (re-exported from SDK)', () => {
    it('converts hex to bytes', () => {
      const bytes = fromHexString('000fff');
      expect(bytes).toEqual(new Uint8Array([0, 15, 255]));
    });
  });

  describe('generatePreimageAndHash', () => {
    beforeEach(() => {
      // Reset the mock to get different random values
      vi.clearAllMocks();
    });

    it('generates 32-byte preimage (64 hex chars)', async () => {
      const { preimage } = await generatePreimageAndHash();
      expect(preimage).toHaveLength(64);
      expect(preimage).toMatch(/^[0-9a-f]{64}$/);
    });

    it('generates 32-byte payment hash (64 hex chars)', async () => {
      const { paymentHash } = await generatePreimageAndHash();
      expect(paymentHash).toHaveLength(64);
      expect(paymentHash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('generates different preimage each time', async () => {
      // The mock uses Math.random() for getRandomValues, so preimages should differ
      const result1 = await generatePreimageAndHash();
      const result2 = await generatePreimageAndHash();
      expect(result1.preimage).not.toBe(result2.preimage);
    });

    it('preimage and hash have correct format', async () => {
      const { preimage, paymentHash } = await generatePreimageAndHash();
      // Both should be valid hex strings of 64 characters
      expect(preimage).toMatch(/^[0-9a-f]{64}$/);
      expect(paymentHash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('verifyPreimage', () => {
    it('delegates to SDK Invoice.validatePreimage()', () => {
      const result = verifyPreimage('lnbc...', 'valid_preimage_hex');
      expect(result).toBe(true);
    });

    it('returns false for invalid preimage', () => {
      const result = verifyPreimage('lnbc...', 'invalid_preimage');
      expect(result).toBe(false);
    });
  });
});
