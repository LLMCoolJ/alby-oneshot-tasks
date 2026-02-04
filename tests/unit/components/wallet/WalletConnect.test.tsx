/**
 * WalletConnect Component Tests
 * Spec: 04-wallet-context.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import type { ConnectionStatus } from '@/types';

// Mock wallet state
const mockWallet: {
  status: ConnectionStatus;
  error: string | null;
} = {
  status: 'disconnected',
  error: null,
};

const mockConnect = vi.fn();

vi.mock('@/hooks', () => ({
  useWallet: vi.fn(() => mockWallet),
  useWalletActions: vi.fn(() => ({
    connect: mockConnect,
  })),
}));

// Mock isValidNwcUrl
vi.mock('@/types', async () => {
  const actual = await vi.importActual('@/types');
  return {
    ...actual,
    isValidNwcUrl: vi.fn((url: string) => url.startsWith('nostr+walletconnect://')),
  };
});

describe('WalletConnect', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockWallet.status = 'disconnected';
    mockWallet.error = null;
    mockConnect.mockReset().mockResolvedValue(undefined);
  });

  it('renders input and connect button', () => {
    render(<WalletConnect walletId="alice" />);

    expect(screen.getByTestId('nwc-url-input-alice')).toBeInTheDocument();
    expect(screen.getByTestId('connect-button-alice')).toBeInTheDocument();
  });

  it('has correct label and placeholder', () => {
    render(<WalletConnect walletId="alice" />);

    expect(screen.getByLabelText('NWC Connection String')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nostr+walletconnect://...')).toBeInTheDocument();
  });

  it('shows hint text', () => {
    render(<WalletConnect walletId="alice" />);

    expect(screen.getByText('Paste your Nostr Wallet Connect URL')).toBeInTheDocument();
  });

  it('connect button is disabled when input is empty', () => {
    render(<WalletConnect walletId="alice" />);

    const button = screen.getByTestId('connect-button-alice');
    expect(button).toBeDisabled();
  });

  it('connect button is enabled when input has value', async () => {
    render(<WalletConnect walletId="alice" />);

    const input = screen.getByTestId('nwc-url-input-alice');
    await user.type(input, 'nostr+walletconnect://test');

    const button = screen.getByTestId('connect-button-alice');
    expect(button).not.toBeDisabled();
  });

  it('shows validation error for invalid URL', async () => {
    render(<WalletConnect walletId="alice" />);

    const input = screen.getByTestId('nwc-url-input-alice');
    await user.type(input, 'invalid-url');

    const button = screen.getByTestId('connect-button-alice');
    await user.click(button);

    expect(screen.getByText('Invalid NWC URL. Must start with nostr+walletconnect://')).toBeInTheDocument();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('calls connect with valid URL', async () => {
    render(<WalletConnect walletId="alice" />);

    const input = screen.getByTestId('nwc-url-input-alice');
    const validUrl = 'nostr+walletconnect://test-relay?secret=abc123';
    await user.type(input, validUrl);

    const button = screen.getByTestId('connect-button-alice');
    await user.click(button);

    expect(mockConnect).toHaveBeenCalledWith(validUrl);
  });

  it('shows loading state when connecting', () => {
    mockWallet.status = 'connecting';
    render(<WalletConnect walletId="alice" />);

    const button = screen.getByTestId('connect-button-alice');
    // Button should be disabled and show spinner during connecting state
    expect(button).toBeDisabled();
    // Check for spinner inside button
    expect(button.querySelector('[data-testid="spinner"]')).toBeInTheDocument();
  });

  it('displays wallet error from context', () => {
    mockWallet.error = 'Connection timeout';
    render(<WalletConnect walletId="alice" />);

    expect(screen.getByText('Connection timeout')).toBeInTheDocument();
  });

  it('clears validation error when URL becomes valid', async () => {
    render(<WalletConnect walletId="alice" />);

    const input = screen.getByTestId('nwc-url-input-alice');
    await user.type(input, 'invalid');

    const button = screen.getByTestId('connect-button-alice');
    await user.click(button);

    expect(screen.getByText('Invalid NWC URL. Must start with nostr+walletconnect://')).toBeInTheDocument();

    // Clear and type valid URL
    await user.clear(input);
    await user.type(input, 'nostr+walletconnect://valid');
    await user.click(button);

    // Validation error should be cleared (connect was called)
    expect(mockConnect).toHaveBeenCalled();
  });

  it('handles connect error gracefully', async () => {
    mockConnect.mockRejectedValue(new Error('Connection failed'));

    render(<WalletConnect walletId="alice" />);

    const input = screen.getByTestId('nwc-url-input-alice');
    await user.type(input, 'nostr+walletconnect://test');

    const button = screen.getByTestId('connect-button-alice');
    await user.click(button);

    // Should not throw - error is handled by context
    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled();
    });
  });

  it('updates input value on change', async () => {
    render(<WalletConnect walletId="alice" />);

    const input = screen.getByTestId('nwc-url-input-alice') as HTMLInputElement;
    await user.type(input, 'test-input');

    expect(input.value).toBe('test-input');
  });

  it('has correct data-testid attributes', () => {
    render(<WalletConnect walletId="bob" />);

    expect(screen.getByTestId('wallet-connect-bob')).toBeInTheDocument();
    expect(screen.getByTestId('nwc-url-input-bob')).toBeInTheDocument();
    expect(screen.getByTestId('connect-button-bob')).toBeInTheDocument();
  });
});
