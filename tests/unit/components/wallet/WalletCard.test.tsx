/**
 * WalletCard Component Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletCard } from '@/components/wallet/WalletCard';
import type { ConnectionStatus, WalletState } from '@/types';

// Mock wallet state
const mockWallet: WalletState = {
  id: 'alice',
  status: 'disconnected' as ConnectionStatus,
  nwcUrl: null,
  balance: null,
  info: null,
  error: null,
};

// Mock balance return
const mockBalance = {
  millisats: null as number | null,
  sats: null as number | null,
  loading: false,
  error: null as string | null,
  refresh: vi.fn(),
};

vi.mock('@/hooks', () => ({
  useWallet: vi.fn(() => mockWallet),
  useBalance: vi.fn(() => mockBalance),
}));

// Mock child components
vi.mock('@/components/wallet/WalletConnect', () => ({
  WalletConnect: ({ walletId }: { walletId: string }) => (
    <div data-testid={`mock-wallet-connect-${walletId}`}>WalletConnect</div>
  ),
}));

vi.mock('@/components/wallet/BalanceDisplay', () => ({
  BalanceDisplay: ({ sats, loading }: { sats: number | null; loading: boolean }) => (
    <div data-testid="mock-balance-display">
      Balance: {loading ? 'Loading...' : sats ?? 'N/A'}
    </div>
  ),
}));

describe('WalletCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockWallet.id = 'alice';
    mockWallet.status = 'disconnected';
    mockWallet.nwcUrl = null;
    mockWallet.balance = null;
    mockWallet.info = null;
    mockWallet.error = null;
    mockBalance.millisats = null;
    mockBalance.sats = null;
    mockBalance.loading = false;
    mockBalance.error = null;
  });

  it('renders with default Alice title', () => {
    render(<WalletCard walletId="alice" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders with default Bob title', () => {
    mockWallet.id = 'bob';
    render(<WalletCard walletId="bob" />);

    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<WalletCard walletId="alice" title="My Wallet" />);

    expect(screen.getByText('My Wallet')).toBeInTheDocument();
  });

  it('shows disconnected badge when disconnected', () => {
    render(<WalletCard walletId="alice" />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows connecting badge when connecting', () => {
    mockWallet.status = 'connecting';
    render(<WalletCard walletId="alice" />);

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows connected badge when connected', () => {
    mockWallet.status = 'connected';
    mockBalance.sats = 100000;
    render(<WalletCard walletId="alice" />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows error badge when in error state', () => {
    mockWallet.status = 'error';
    mockWallet.error = 'Connection failed';
    render(<WalletCard walletId="alice" />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows WalletConnect when disconnected', () => {
    render(<WalletCard walletId="alice" />);

    expect(screen.getByTestId('mock-wallet-connect-alice')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-balance-display')).not.toBeInTheDocument();
  });

  it('shows BalanceDisplay when connected', () => {
    mockWallet.status = 'connected';
    mockBalance.sats = 100000;
    render(<WalletCard walletId="alice" />);

    expect(screen.getByTestId('mock-balance-display')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-wallet-connect-alice')).not.toBeInTheDocument();
  });

  it('renders children when connected', () => {
    mockWallet.status = 'connected';
    mockBalance.sats = 100000;
    render(
      <WalletCard walletId="alice">
        <button>Send Payment</button>
      </WalletCard>
    );

    expect(screen.getByRole('button', { name: 'Send Payment' })).toBeInTheDocument();
  });

  it('does not render children when disconnected', () => {
    render(
      <WalletCard walletId="alice">
        <button>Send Payment</button>
      </WalletCard>
    );

    expect(screen.queryByRole('button', { name: 'Send Payment' })).not.toBeInTheDocument();
  });

  it('shows wallet alias as subtitle when connected', () => {
    mockWallet.status = 'connected';
    mockWallet.info = {
      alias: 'My Lightning Node',
      color: '#ff0000',
      pubkey: 'abc123',
      network: 'testnet',
      blockHeight: 12345,
      methods: ['pay_invoice'],
    };
    mockBalance.sats = 100000;
    render(<WalletCard walletId="alice" />);

    expect(screen.getByText('My Lightning Node')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<WalletCard walletId="alice" className="custom-class" />);

    const card = screen.getByTestId('wallet-card-alice');
    expect(card).toHaveClass('custom-class');
  });

  it('has correct data-testid attribute for alice', () => {
    render(<WalletCard walletId="alice" />);

    expect(screen.getByTestId('wallet-card-alice')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders correctly for bob wallet', () => {
    mockWallet.id = 'bob';
    render(<WalletCard walletId="bob" />);

    expect(screen.getByTestId('wallet-card-bob')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});
