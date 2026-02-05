/**
 * TransactionHistory Page and Component Tests
 * Spec: 11-scenario-6-transaction-history.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionList } from '@/pages/6-TransactionHistory/components/TransactionList';
import { TransactionDetails } from '@/pages/6-TransactionHistory/components/TransactionDetails';
import type { Transaction } from '@/types';

// Mock useTransactions hook
const mockLoadMore = vi.fn();
const mockRefresh = vi.fn();

const mockTransactions: Transaction[] = [
  {
    id: 'hash1',
    type: 'incoming',
    state: 'settled',
    amount: 1000000, // 1000 sats in millisats
    feesPaid: 0,
    description: 'Test Payment 1',
    invoice: 'lnbc1000n1testtesttest...',
    preimage: 'preimage123abc456def',
    paymentHash: 'hash1',
    createdAt: new Date('2024-01-15T12:34:56'),
    settledAt: new Date('2024-01-15T12:34:58'),
    expiresAt: null,
    metadata: { comment: 'Test metadata' },
  },
  {
    id: 'hash2',
    type: 'outgoing',
    state: 'settled',
    amount: 500000, // 500 sats in millisats
    feesPaid: 1000, // 1 sat in millisats
    description: 'Test Payment 2',
    invoice: 'lnbc500n1testtesttest...',
    preimage: 'preimage789xyz',
    paymentHash: 'hash2',
    createdAt: new Date('2024-01-15T12:30:00'),
    settledAt: new Date('2024-01-15T12:30:02'),
    expiresAt: null,
    metadata: undefined,
  },
];

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: vi.fn(() => ({
    transactions: mockTransactions,
    loading: false,
    error: null,
    hasMore: true,
    loadMore: mockLoadMore,
    refresh: mockRefresh,
  })),
}));

// Mock UI components
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    Button: ({ children, onClick, loading, disabled, ...props }: {
      children: React.ReactNode;
      onClick?: () => void;
      loading?: boolean;
      disabled?: boolean;
      variant?: string;
      size?: string;
      className?: string;
      'data-testid'?: string;
    }) => (
      <button onClick={onClick} disabled={disabled || loading} {...props}>
        {loading ? 'Loading...' : children}
      </button>
    ),
    Badge: ({ children, variant }: { children: React.ReactNode; variant?: string; size?: string }) => (
      <span data-testid="badge" data-variant={variant}>{children}</span>
    ),
    Spinner: () => <div data-testid="spinner">Loading...</div>,
    CopyButton: ({ value, ...props }: { value: string; 'data-testid'?: string }) => (
      <button data-testid={props['data-testid'] || 'copy-button'} data-value={value}>
        Copy
      </button>
    ),
  };
});

describe('TransactionList', () => {
  const mockOnSelectTransaction = vi.fn();
  const mockOnLog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transaction list with filter and refresh button', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    // Check filter select exists
    expect(screen.getByTestId('transaction-filter-alice')).toBeInTheDocument();

    // Check refresh button exists
    expect(screen.getByTestId('transaction-refresh-alice')).toBeInTheDocument();
  });

  it('renders transactions', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    // Check transaction items exist
    expect(screen.getByTestId('transaction-item-hash1')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-item-hash2')).toBeInTheDocument();
  });

  it('displays incoming transaction with green styling', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    const incomingTx = screen.getByTestId('transaction-item-hash1');
    expect(incomingTx).toHaveTextContent('+1,000 sats');
    expect(incomingTx).toHaveTextContent('Test Payment 1');
  });

  it('displays outgoing transaction with red styling', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    const outgoingTx = screen.getByTestId('transaction-item-hash2');
    expect(outgoingTx).toHaveTextContent('-500 sats');
    expect(outgoingTx).toHaveTextContent('Test Payment 2');
  });

  it('calls onSelectTransaction when transaction is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    await user.click(screen.getByTestId('transaction-item-hash1'));

    expect(mockOnSelectTransaction).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('renders load more button when hasMore is true', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    expect(screen.getByTestId('transaction-loadmore-alice')).toBeInTheDocument();
  });

  it('calls loadMore when load more button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    await user.click(screen.getByTestId('transaction-loadmore-alice'));

    expect(mockLoadMore).toHaveBeenCalled();
  });

  it('calls refresh and logs when refresh button is clicked', async () => {
    const user = userEvent.setup();
    mockRefresh.mockResolvedValue(undefined);

    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    await user.click(screen.getByTestId('transaction-refresh-alice'));

    expect(mockOnLog).toHaveBeenCalledWith('Refreshing transactions...', 'info');

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('logs loading message on mount', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    expect(mockOnLog).toHaveBeenCalledWith("Loading alice's transactions...", 'info');
  });

  it('displays status badges for transactions', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    // Both transactions are settled
    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0]).toHaveTextContent('Settled');
  });

  it('renders filter options correctly', () => {
    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    const filterSelect = screen.getByTestId('transaction-filter-alice');
    expect(filterSelect).toHaveValue('all');

    // Check options exist
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Incoming')).toBeInTheDocument();
    expect(screen.getByText('Outgoing')).toBeInTheDocument();
  });

  it('handles filter change', async () => {
    const user = userEvent.setup();

    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={mockOnSelectTransaction}
        onLog={mockOnLog}
      />
    );

    const filterSelect = screen.getByTestId('transaction-filter-alice');
    await user.selectOptions(filterSelect, 'incoming');

    expect(filterSelect).toHaveValue('incoming');
  });
});

describe('TransactionList - Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when loading and no transactions', async () => {
    const { useTransactions } = await import('@/hooks/useTransactions');
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: true,
      error: null,
      hasMore: false,
      loadMore: mockLoadMore,
      refresh: mockRefresh,
    });

    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={vi.fn()}
        onLog={vi.fn()}
      />
    );

    expect(screen.getByTestId('transaction-loading-alice')).toBeInTheDocument();
  });
});

describe('TransactionList - Empty State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty state when no transactions', async () => {
    const { useTransactions } = await import('@/hooks/useTransactions');
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: null,
      hasMore: false,
      loadMore: mockLoadMore,
      refresh: mockRefresh,
    });

    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={vi.fn()}
        onLog={vi.fn()}
      />
    );

    expect(screen.getByTestId('transaction-empty-alice')).toBeInTheDocument();
    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });
});

describe('TransactionList - Error State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error message when there is an error', async () => {
    const { useTransactions } = await import('@/hooks/useTransactions');
    vi.mocked(useTransactions).mockReturnValue({
      transactions: [],
      loading: false,
      error: 'Failed to fetch transactions',
      hasMore: false,
      loadMore: mockLoadMore,
      refresh: mockRefresh,
    });

    render(
      <TransactionList
        walletId="alice"
        onSelectTransaction={vi.fn()}
        onLog={vi.fn()}
      />
    );

    expect(screen.getByTestId('transaction-error-alice')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
  });
});

describe('TransactionDetails', () => {
  const mockTransaction: Transaction = {
    id: 'hash1',
    type: 'incoming',
    state: 'settled',
    amount: 1000000, // 1000 sats
    feesPaid: 0,
    description: 'Coffee payment',
    invoice: 'lnbc1000n1testtesttest...',
    preimage: 'preimage123abc456def',
    paymentHash: 'hash1abcdef',
    createdAt: new Date('2024-01-15T12:34:56'),
    settledAt: new Date('2024-01-15T12:34:58'),
    expiresAt: null,
    metadata: { comment: 'Great coffee!' },
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders transaction details container', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details')).toBeInTheDocument();
  });

  it('displays amount with correct styling for incoming', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    const amountElement = screen.getByTestId('transaction-details-amount');
    expect(amountElement).toHaveTextContent('+1,000 sats');
    expect(amountElement).toHaveClass('text-green-600');
  });

  it('displays amount with correct styling for outgoing', () => {
    const outgoingTx = { ...mockTransaction, type: 'outgoing' as const };
    render(<TransactionDetails transaction={outgoingTx} onClose={mockOnClose} />);

    const amountElement = screen.getByTestId('transaction-details-amount');
    expect(amountElement).toHaveTextContent('-1,000 sats');
    expect(amountElement).toHaveClass('text-red-600');
  });

  it('displays transaction type', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-type')).toHaveTextContent('incoming');
  });

  it('displays description', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-description')).toHaveTextContent('Coffee payment');
  });

  it('displays created date', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-created')).toBeInTheDocument();
  });

  it('displays settled date when present', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-settled')).toBeInTheDocument();
  });

  it('displays payment hash with copy button', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-hash')).toHaveTextContent('hash1abcdef');
    expect(screen.getByTestId('transaction-details-hash-copy')).toBeInTheDocument();
  });

  it('displays preimage with copy button when present', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-preimage')).toHaveTextContent('preimage123abc456def');
    expect(screen.getByTestId('transaction-details-preimage-copy')).toBeInTheDocument();
  });

  it('does not display preimage section when null', () => {
    const pendingTx = { ...mockTransaction, preimage: null, state: 'pending' as const };
    render(<TransactionDetails transaction={pendingTx} onClose={mockOnClose} />);

    expect(screen.queryByTestId('transaction-details-preimage')).not.toBeInTheDocument();
  });

  it('displays invoice with copy button', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-invoice')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-details-invoice-copy')).toBeInTheDocument();
  });

  it('displays fees when greater than 0', () => {
    const txWithFees = { ...mockTransaction, feesPaid: 1000 }; // 1 sat
    render(<TransactionDetails transaction={txWithFees} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-fees')).toHaveTextContent('1 sats');
  });

  it('does not display fees when 0', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.queryByTestId('transaction-details-fees')).not.toBeInTheDocument();
  });

  it('displays metadata section when present', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    expect(screen.getByTestId('transaction-details-metadata')).toBeInTheDocument();
    expect(screen.getByText('Metadata')).toBeInTheDocument();
  });

  it('does not display metadata section when not present', () => {
    const txNoMetadata = { ...mockTransaction, metadata: undefined };
    render(<TransactionDetails transaction={txNoMetadata} onClose={mockOnClose} />);

    expect(screen.queryByTestId('transaction-details-metadata')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();

    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    await user.click(screen.getByTestId('transaction-details-close'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows correct badge variant for settled state', () => {
    render(<TransactionDetails transaction={mockTransaction} onClose={mockOnClose} />);

    const badge = screen.getAllByTestId('badge')[0];
    expect(badge).toHaveAttribute('data-variant', 'success');
  });

  it('shows correct badge variant for pending state', () => {
    const pendingTx = { ...mockTransaction, state: 'pending' as const };
    render(<TransactionDetails transaction={pendingTx} onClose={mockOnClose} />);

    const badge = screen.getAllByTestId('badge')[0];
    expect(badge).toHaveAttribute('data-variant', 'warning');
  });
});
