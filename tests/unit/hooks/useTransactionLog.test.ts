/**
 * useTransactionLog Hook Tests
 * Spec: 05-layout.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionLog } from '@/hooks/useTransactionLog';

// Mock crypto.randomUUID
const mockUUID = vi.fn();
vi.stubGlobal('crypto', {
  ...crypto,
  randomUUID: mockUUID,
});

describe('useTransactionLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUUID.mockReturnValue('mock-uuid-123');
  });

  describe('Initial State', () => {
    it('starts with empty entries array', () => {
      const { result } = renderHook(() => useTransactionLog());
      expect(result.current.entries).toEqual([]);
    });

    it('returns addLog function', () => {
      const { result } = renderHook(() => useTransactionLog());
      expect(typeof result.current.addLog).toBe('function');
    });

    it('returns clearLogs function', () => {
      const { result } = renderHook(() => useTransactionLog());
      expect(typeof result.current.clearLogs).toBe('function');
    });
  });

  describe('addLog', () => {
    it('adds a log entry with message', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Test message');
      });

      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].message).toBe('Test message');
    });

    it('defaults to info type', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Test message');
      });

      expect(result.current.entries[0].type).toBe('info');
    });

    it('accepts custom type', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Success message', 'success');
      });

      expect(result.current.entries[0].type).toBe('success');
    });

    it('accepts error type', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Error message', 'error');
      });

      expect(result.current.entries[0].type).toBe('error');
    });

    it('accepts warning type', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Warning message', 'warning');
      });

      expect(result.current.entries[0].type).toBe('warning');
    });

    it('generates unique id using crypto.randomUUID', () => {
      mockUUID.mockReturnValue('unique-uuid-abc');
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Test message');
      });

      expect(result.current.entries[0].id).toBe('unique-uuid-abc');
      expect(mockUUID).toHaveBeenCalled();
    });

    it('sets timestamp to current date', () => {
      const { result } = renderHook(() => useTransactionLog());
      const beforeAdd = new Date();

      act(() => {
        result.current.addLog('Test message');
      });

      const afterAdd = new Date();
      const entryTimestamp = result.current.entries[0].timestamp;

      expect(entryTimestamp.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime());
      expect(entryTimestamp.getTime()).toBeLessThanOrEqual(afterAdd.getTime());
    });

    it('accepts optional details object', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Payment sent', 'success', {
          amount: 1000,
          preimage: 'abc123',
        });
      });

      expect(result.current.entries[0].details).toEqual({
        amount: 1000,
        preimage: 'abc123',
      });
    });

    it('adds new entries at the beginning (newest first)', () => {
      mockUUID
        .mockReturnValueOnce('uuid-1')
        .mockReturnValueOnce('uuid-2')
        .mockReturnValueOnce('uuid-3');

      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('First message');
      });

      act(() => {
        result.current.addLog('Second message');
      });

      act(() => {
        result.current.addLog('Third message');
      });

      expect(result.current.entries[0].message).toBe('Third message');
      expect(result.current.entries[1].message).toBe('Second message');
      expect(result.current.entries[2].message).toBe('First message');
    });

    it('preserves existing entries when adding new ones', () => {
      mockUUID.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2');

      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('First message');
      });

      act(() => {
        result.current.addLog('Second message');
      });

      expect(result.current.entries).toHaveLength(2);
    });
  });

  describe('clearLogs', () => {
    it('clears all log entries', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Message 1');
        result.current.addLog('Message 2');
        result.current.addLog('Message 3');
      });

      expect(result.current.entries).toHaveLength(3);

      act(() => {
        result.current.clearLogs();
      });

      expect(result.current.entries).toEqual([]);
    });

    it('can add logs after clearing', () => {
      mockUUID.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-new');

      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Old message');
      });

      act(() => {
        result.current.clearLogs();
      });

      act(() => {
        result.current.addLog('New message');
      });

      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].message).toBe('New message');
    });

    it('does nothing if entries already empty', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.clearLogs();
      });

      expect(result.current.entries).toEqual([]);
    });
  });

  describe('Function Stability', () => {
    it('addLog function reference is stable', () => {
      const { result, rerender } = renderHook(() => useTransactionLog());
      const firstAddLog = result.current.addLog;

      rerender();

      expect(result.current.addLog).toBe(firstAddLog);
    });

    it('clearLogs function reference is stable', () => {
      const { result, rerender } = renderHook(() => useTransactionLog());
      const firstClearLogs = result.current.clearLogs;

      rerender();

      expect(result.current.clearLogs).toBe(firstClearLogs);
    });
  });

  describe('LogEntry Structure', () => {
    it('creates entries with correct structure', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Test message', 'info', { key: 'value' });
      });

      const entry = result.current.entries[0];

      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('message');
      expect(entry).toHaveProperty('type');
      expect(entry).toHaveProperty('details');
    });

    it('timestamp is a Date object', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Test message');
      });

      expect(result.current.entries[0].timestamp).toBeInstanceOf(Date);
    });

    it('details is undefined when not provided', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Test message');
      });

      expect(result.current.entries[0].details).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('');
      });

      expect(result.current.entries[0].message).toBe('');
    });

    it('handles very long message', () => {
      const longMessage = 'A'.repeat(10000);
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog(longMessage);
      });

      expect(result.current.entries[0].message).toBe(longMessage);
    });

    it('handles special characters in message', () => {
      const specialMessage = '<script>alert("xss")</script>';
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog(specialMessage);
      });

      expect(result.current.entries[0].message).toBe(specialMessage);
    });

    it('handles complex details object', () => {
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Message', 'info', {
          nested: { deep: { value: 123 } },
          array: [1, 2, 3],
          boolean: true,
          null: null,
        });
      });

      expect(result.current.entries[0].details).toEqual({
        nested: { deep: { value: 123 } },
        array: [1, 2, 3],
        boolean: true,
        null: null,
      });
    });

    it('handles many log entries', () => {
      mockUUID.mockImplementation(() => `uuid-${Math.random()}`);
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.addLog(`Message ${i}`);
        }
      });

      expect(result.current.entries).toHaveLength(1000);
      expect(result.current.entries[0].message).toBe('Message 999');
      expect(result.current.entries[999].message).toBe('Message 0');
    });

    it('handles rapid add and clear operations', () => {
      mockUUID.mockImplementation(() => `uuid-${Math.random()}`);
      const { result } = renderHook(() => useTransactionLog());

      act(() => {
        result.current.addLog('Message 1');
        result.current.addLog('Message 2');
        result.current.clearLogs();
        result.current.addLog('Message 3');
      });

      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].message).toBe('Message 3');
    });
  });
});
