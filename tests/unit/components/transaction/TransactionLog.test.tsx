/**
 * TransactionLog Component Tests
 * Spec: 05-layout.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { TransactionLog } from '@/components/transaction/TransactionLog';
import type { LogEntry } from '@/types';

// Mock Badge component
vi.mock('@/components/ui', () => ({
  Badge: ({
    variant,
    size,
    children,
  }: {
    variant: string;
    size: string;
    children: React.ReactNode;
  }) => (
    <span
      data-testid="mock-badge"
      data-variant={variant}
      data-size={size}
    >
      {children}
    </span>
  ),
}));

describe('TransactionLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('shows empty state when no entries', () => {
      render(<TransactionLog entries={[]} />);
      expect(screen.getByTestId('transaction-log-empty')).toBeInTheDocument();
    });

    it('displays correct empty state message', () => {
      render(<TransactionLog entries={[]} />);
      expect(
        screen.getByText(/no events yet\. start a transaction to see activity/i)
      ).toBeInTheDocument();
    });

    it('still shows Transaction Log title when empty', () => {
      render(<TransactionLog entries={[]} />);
      expect(screen.getByText('Transaction Log')).toBeInTheDocument();
    });

    it('has card styling when empty', () => {
      render(<TransactionLog entries={[]} />);
      const container = screen.getByTestId('transaction-log');
      expect(container).toHaveClass('card');
    });
  });

  describe('Rendering Log Entries', () => {
    it('renders log entries', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Payment sent successfully',
          type: 'success',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(screen.getByText('Payment sent successfully')).toBeInTheDocument();
    });

    it('renders multiple log entries', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Payment sent successfully',
          type: 'success',
        },
        {
          id: '2',
          timestamp: new Date(),
          message: 'Creating invoice...',
          type: 'info',
        },
        {
          id: '3',
          timestamp: new Date(),
          message: 'Connection error',
          type: 'error',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(screen.getByText('Payment sent successfully')).toBeInTheDocument();
      expect(screen.getByText('Creating invoice...')).toBeInTheDocument();
      expect(screen.getByText('Connection error')).toBeInTheDocument();
    });

    it('does not show empty state when entries exist', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(
        screen.queryByTestId('transaction-log-empty')
      ).not.toBeInTheDocument();
    });

    it('renders entries container', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(screen.getByTestId('transaction-log-entries')).toBeInTheDocument();
    });
  });

  describe('Log Entry Content', () => {
    it('displays timestamp', () => {
      const timestamp = new Date('2024-01-15T10:30:00');
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp,
          message: 'Test message',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      // Check that time string is rendered
      expect(
        screen.getByText(timestamp.toLocaleTimeString())
      ).toBeInTheDocument();
    });

    it('displays message', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Custom log message here',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(screen.getByText('Custom log message here')).toBeInTheDocument();
    });

    it('displays type badge', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'success',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveTextContent('success');
    });

    it('has data-testid with entry id', () => {
      const entries: LogEntry[] = [
        {
          id: 'entry-123',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(screen.getByTestId('log-entry-entry-123')).toBeInTheDocument();
    });
  });

  describe('Badge Variants', () => {
    it('applies info variant for info type', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Info message',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-variant', 'info');
    });

    it('applies success variant for success type', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Success message',
          type: 'success',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-variant', 'success');
    });

    it('applies error variant for error type', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Error message',
          type: 'error',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-variant', 'error');
    });

    it('applies warning variant for warning type', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Warning message',
          type: 'warning',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-variant', 'warning');
    });

    it('badge has sm size', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const badge = screen.getByTestId('mock-badge');
      expect(badge).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('Max Height', () => {
    it('applies default maxHeight of 300px', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const entriesContainer = screen.getByTestId('transaction-log-entries');
      expect(entriesContainer).toHaveStyle({ maxHeight: '300px' });
    });

    it('applies custom maxHeight', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} maxHeight="500px" />);
      const entriesContainer = screen.getByTestId('transaction-log-entries');
      expect(entriesContainer).toHaveStyle({ maxHeight: '500px' });
    });

    it('entries container has overflow-y-auto', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const entriesContainer = screen.getByTestId('transaction-log-entries');
      expect(entriesContainer).toHaveClass('overflow-y-auto');
    });
  });

  describe('Styling', () => {
    it('container has card class', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const container = screen.getByTestId('transaction-log');
      expect(container).toHaveClass('card');
    });

    it('title has correct styling', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const title = screen.getByText('Transaction Log');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-slate-900');
    });

    it('log entry has hover effect class', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const logEntry = screen.getByTestId('log-entry-1');
      expect(logEntry).toHaveClass('hover:bg-slate-50');
    });

    it('entries container has spacing', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Test',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const entriesContainer = screen.getByTestId('transaction-log-entries');
      expect(entriesContainer).toHaveClass('space-y-2');
    });
  });

  describe('Multiple Entries Order', () => {
    it('renders entries in the order provided', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'First entry',
          type: 'info',
        },
        {
          id: '2',
          timestamp: new Date(),
          message: 'Second entry',
          type: 'success',
        },
        {
          id: '3',
          timestamp: new Date(),
          message: 'Third entry',
          type: 'warning',
        },
      ];

      render(<TransactionLog entries={entries} />);
      const entriesContainer = screen.getByTestId('transaction-log-entries');
      const renderedEntries = within(entriesContainer).getAllByTestId(/^log-entry-/);

      expect(renderedEntries[0]).toHaveAttribute('data-testid', 'log-entry-1');
      expect(renderedEntries[1]).toHaveAttribute('data-testid', 'log-entry-2');
      expect(renderedEntries[2]).toHaveAttribute('data-testid', 'log-entry-3');
    });

    it('handles entries with different types', () => {
      const entries: LogEntry[] = [
        { id: '1', timestamp: new Date(), message: 'Info', type: 'info' },
        { id: '2', timestamp: new Date(), message: 'Success', type: 'success' },
        { id: '3', timestamp: new Date(), message: 'Error', type: 'error' },
        { id: '4', timestamp: new Date(), message: 'Warning', type: 'warning' },
      ];

      render(<TransactionLog entries={entries} />);
      const badges = screen.getAllByTestId('mock-badge');
      expect(badges).toHaveLength(4);
    });
  });

  describe('Edge Cases', () => {
    it('handles entry with very long message', () => {
      const longMessage = 'A'.repeat(500);
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: longMessage,
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('handles entry with special characters in message', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: '<script>alert("xss")</script>',
          type: 'info',
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(
        screen.getByText('<script>alert("xss")</script>')
      ).toBeInTheDocument();
    });

    it('handles entries with details object', () => {
      const entries: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Payment with details',
          type: 'success',
          details: { amount: 1000, preimage: 'abc123' },
        },
      ];

      render(<TransactionLog entries={entries} />);
      expect(screen.getByText('Payment with details')).toBeInTheDocument();
    });

    it('handles large number of entries', () => {
      const entries: LogEntry[] = Array.from({ length: 100 }, (_, i) => ({
        id: `entry-${i}`,
        timestamp: new Date(),
        message: `Log entry ${i}`,
        type: 'info' as const,
      }));

      render(<TransactionLog entries={entries} />);
      expect(screen.getByTestId('transaction-log-entries')).toBeInTheDocument();
      expect(screen.getByText('Log entry 0')).toBeInTheDocument();
      expect(screen.getByText('Log entry 99')).toBeInTheDocument();
    });
  });
});
