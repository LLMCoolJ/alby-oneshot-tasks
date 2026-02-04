/**
 * ScenarioPage Component Tests
 * Spec: 05-layout.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScenarioPage } from '@/components/layout/ScenarioPage';
import type { LogEntry } from '@/types';

// Mock child components
vi.mock('@/components/wallet/WalletCard', () => ({
  WalletCard: ({
    walletId,
    title,
    children,
  }: {
    walletId: string;
    title: string;
    children?: React.ReactNode;
  }) => (
    <div data-testid={`mock-wallet-card-${walletId}`} data-title={title}>
      <span>{title}</span>
      {children}
    </div>
  ),
}));

vi.mock('@/components/transaction/TransactionLog', () => ({
  TransactionLog: ({ entries }: { entries: LogEntry[] }) => (
    <div data-testid="mock-transaction-log" data-entries={entries.length}>
      Transaction Log ({entries.length} entries)
    </div>
  ),
}));

describe('ScenarioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header Rendering', () => {
    it('renders the title', () => {
      render(
        <ScenarioPage
          title="Simple Payment"
          description="Test description"
          logs={[]}
        />
      );
      expect(screen.getByTestId('scenario-title')).toHaveTextContent(
        'Simple Payment'
      );
    });

    it('renders the description', () => {
      render(
        <ScenarioPage
          title="Simple Payment"
          description="Send sats from Alice to Bob"
          logs={[]}
        />
      );
      expect(screen.getByTestId('scenario-description')).toHaveTextContent(
        'Send sats from Alice to Bob'
      );
    });

    it('title has correct styling', () => {
      render(
        <ScenarioPage title="Test Title" description="Test" logs={[]} />
      );
      const title = screen.getByTestId('scenario-title');
      expect(title.tagName).toBe('H1');
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-slate-900');
    });

    it('description has correct styling', () => {
      render(
        <ScenarioPage title="Test" description="Test Description" logs={[]} />
      );
      const description = screen.getByTestId('scenario-description');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-slate-600');
    });
  });

  describe('Wallet Cards', () => {
    it("renders Alice's wallet card", () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      expect(screen.getByTestId('mock-wallet-card-alice')).toBeInTheDocument();
    });

    it("renders Bob's wallet card", () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      expect(screen.getByTestId('mock-wallet-card-bob')).toBeInTheDocument();
    });

    it("passes correct title to Alice's wallet card", () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      const aliceCard = screen.getByTestId('mock-wallet-card-alice');
      expect(aliceCard).toHaveAttribute('data-title', "Alice's Wallet");
    });

    it("passes correct title to Bob's wallet card", () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      const bobCard = screen.getByTestId('mock-wallet-card-bob');
      expect(bobCard).toHaveAttribute('data-title', "Bob's Wallet");
    });

    it("renders aliceContent inside Alice's wallet card", () => {
      render(
        <ScenarioPage
          title="Test"
          description="Test"
          logs={[]}
          aliceContent={<button data-testid="alice-button">Send</button>}
        />
      );
      const aliceCard = screen.getByTestId('mock-wallet-card-alice');
      expect(aliceCard).toContainElement(screen.getByTestId('alice-button'));
    });

    it("renders bobContent inside Bob's wallet card", () => {
      render(
        <ScenarioPage
          title="Test"
          description="Test"
          logs={[]}
          bobContent={<button data-testid="bob-button">Receive</button>}
        />
      );
      const bobCard = screen.getByTestId('mock-wallet-card-bob');
      expect(bobCard).toContainElement(screen.getByTestId('bob-button'));
    });

    it('renders both wallet contents correctly', () => {
      render(
        <ScenarioPage
          title="Test"
          description="Test"
          logs={[]}
          aliceContent={<span>Alice Content</span>}
          bobContent={<span>Bob Content</span>}
        />
      );
      expect(screen.getByText('Alice Content')).toBeInTheDocument();
      expect(screen.getByText('Bob Content')).toBeInTheDocument();
    });
  });

  describe('Transaction Log', () => {
    it('renders transaction log component', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      expect(screen.getByTestId('mock-transaction-log')).toBeInTheDocument();
    });

    it('passes empty logs array to transaction log', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      const transactionLog = screen.getByTestId('mock-transaction-log');
      expect(transactionLog).toHaveAttribute('data-entries', '0');
    });

    it('passes logs to transaction log component', () => {
      const logs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          message: 'Payment sent',
          type: 'success',
        },
        {
          id: '2',
          timestamp: new Date(),
          message: 'Invoice created',
          type: 'info',
        },
      ];

      render(
        <ScenarioPage title="Test" description="Test" logs={logs} />
      );
      const transactionLog = screen.getByTestId('mock-transaction-log');
      expect(transactionLog).toHaveAttribute('data-entries', '2');
    });
  });

  describe('Additional Children', () => {
    it('renders children between wallet cards and transaction log', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]}>
          <div data-testid="additional-content">Extra Content</div>
        </ScenarioPage>
      );
      expect(screen.getByTestId('additional-content')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ScenarioPage>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('works without children', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      // Should render without errors
      expect(screen.getByTestId('scenario-page')).toBeInTheDocument();
    });
  });

  describe('Page Structure', () => {
    it('has scenario-page data-testid on root element', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      expect(screen.getByTestId('scenario-page')).toBeInTheDocument();
    });

    it('has proper spacing class on root element', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      const root = screen.getByTestId('scenario-page');
      expect(root).toHaveClass('space-y-6');
    });

    it('renders elements in correct order: header, cards, children, log', () => {
      render(
        <ScenarioPage title="Test Title" description="Test Desc" logs={[]}>
          <div data-testid="custom-child">Custom Content</div>
        </ScenarioPage>
      );

      const container = screen.getByTestId('scenario-page');
      const children = Array.from(container.children);

      // First child should be header section
      expect(children[0]).toContainElement(screen.getByText('Test Title'));
      // Second child should be wallet cards grid
      expect(children[1]).toContainElement(
        screen.getByTestId('mock-wallet-card-alice')
      );
      // Third child should be custom content
      expect(children[2]).toBe(screen.getByTestId('custom-child'));
      // Fourth child should be transaction log
      expect(children[3]).toBe(screen.getByTestId('mock-transaction-log'));
    });
  });

  describe('Grid Layout', () => {
    it('wallet cards are in a grid container', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      const aliceCard = screen.getByTestId('mock-wallet-card-alice');
      const gridContainer = aliceCard.parentElement;
      expect(gridContainer).toHaveClass('grid', 'gap-6');
    });

    it('grid has responsive columns', () => {
      render(
        <ScenarioPage title="Test" description="Test" logs={[]} />
      );
      const aliceCard = screen.getByTestId('mock-wallet-card-alice');
      const gridContainer = aliceCard.parentElement;
      expect(gridContainer).toHaveClass('lg:grid-cols-2');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(
        <ScenarioPage title="" description="Test" logs={[]} />
      );
      expect(screen.getByTestId('scenario-title')).toHaveTextContent('');
    });

    it('handles empty description', () => {
      render(
        <ScenarioPage title="Test" description="" logs={[]} />
      );
      expect(screen.getByTestId('scenario-description')).toHaveTextContent('');
    });

    it('handles long title', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <ScenarioPage title={longTitle} description="Test" logs={[]} />
      );
      expect(screen.getByTestId('scenario-title')).toHaveTextContent(longTitle);
    });

    it('handles special characters in title', () => {
      render(
        <ScenarioPage
          title="<Script>alert('xss')</Script>"
          description="Test"
          logs={[]}
        />
      );
      // React auto-escapes, so this should be safe
      expect(screen.getByTestId('scenario-title')).toHaveTextContent(
        "<Script>alert('xss')</Script>"
      );
    });

    it('handles undefined aliceContent', () => {
      render(
        <ScenarioPage
          title="Test"
          description="Test"
          logs={[]}
          aliceContent={undefined}
        />
      );
      expect(screen.getByTestId('mock-wallet-card-alice')).toBeInTheDocument();
    });

    it('handles undefined bobContent', () => {
      render(
        <ScenarioPage
          title="Test"
          description="Test"
          logs={[]}
          bobContent={undefined}
        />
      );
      expect(screen.getByTestId('mock-wallet-card-bob')).toBeInTheDocument();
    });
  });
});
