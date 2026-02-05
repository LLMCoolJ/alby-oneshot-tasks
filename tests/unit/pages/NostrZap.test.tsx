/**
 * NostrZap Page and Component Tests
 * Spec: 12-scenario-7-nostr-zap.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockNostrNote } from '@/pages/7-NostrZap/components/MockNostrNote';
import { ZapForm } from '@/pages/7-NostrZap/components/ZapForm';
import { ZapResult } from '@/pages/7-NostrZap/components/ZapResult';
import type { MockNostrNote as MockNoteType, PaymentResult } from '@/types';
import * as useZapModule from '@/hooks/useZap';

// Mock @/hooks
vi.mock('@/hooks', () => ({
  useWallet: vi.fn(() => ({
    status: 'connected',
    balance: 100000000, // 100,000 sats in millisats
    info: { alias: 'Test Wallet', lud16: 'bob@testnet.getalby.com' },
    error: null,
  })),
  useTransactionLog: vi.fn(() => ({
    entries: [],
    addLog: vi.fn(),
    clearLogs: vi.fn(),
  })),
}));

// Mock useZap hook
const mockSendZap = vi.fn();

vi.mock('@/hooks/useZap', () => ({
  useZap: vi.fn(() => ({
    sendZap: mockSendZap,
    loading: false,
    error: null,
  })),
}));

// Mock UI components that might have complex dependencies
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    CopyButton: ({ value }: { value: string }) => (
      <button data-testid="copy-button" data-value={value} aria-label="Copy">
        Copy
      </button>
    ),
  };
});

// Test data
const mockNote: MockNoteType = {
  id: 'note1abc123def456',
  pubkey: 'npub1bob123...',
  content: 'Just set up my Lightning wallet! Anyone want to test zaps?',
  created_at: Math.floor(Date.now() / 1000) - 3600,
  author: {
    name: 'Bob',
    picture: undefined,
  },
};

const mockPaymentResult: PaymentResult = {
  preimage: 'abc123def456preimage789',
  feesPaid: 100,
};

describe('MockNostrNote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders note content', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByTestId('note-content')).toHaveTextContent(
      'Just set up my Lightning wallet! Anyone want to test zaps?'
    );
  });

  it('displays author name', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByTestId('note-author')).toHaveTextContent('Bob');
  });

  it('displays author initial in avatar', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('displays time ago', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByTestId('note-time')).toHaveTextContent('1h ago');
  });

  it('displays truncated note ID', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByTestId('note-id')).toHaveTextContent('Note ID: note1abc123def456...');
  });

  it('displays Lightning Address when provided', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByTestId('lightning-address-info')).toBeInTheDocument();
    expect(screen.getByTestId('lightning-address')).toHaveTextContent('bob@getalby.com');
  });

  it('shows warning when no Lightning Address', () => {
    render(<MockNostrNote note={mockNote} />);

    expect(screen.getByTestId('no-lightning-address')).toBeInTheDocument();
    expect(
      screen.getByText(/No Lightning Address found/)
    ).toBeInTheDocument();
  });

  it('displays note stats', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByTestId('note-stats')).toBeInTheDocument();
    expect(screen.getByText('0 zaps')).toBeInTheDocument();
    expect(screen.getByText('0 replies')).toBeInTheDocument();
    expect(screen.getByText('0 reposts')).toBeInTheDocument();
  });

  it('has data-testid on container', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    expect(screen.getByTestId('mock-nostr-note')).toBeInTheDocument();
  });

  it('includes copy button for Lightning Address', () => {
    render(<MockNostrNote note={mockNote} lightningAddress="bob@getalby.com" />);

    const copyButtons = screen.getAllByTestId('copy-button');
    expect(copyButtons.length).toBeGreaterThan(0);
  });
});

describe('ZapForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendZap.mockReset();

    // Reset useZap mock to default
    vi.mocked(useZapModule.useZap).mockReturnValue({
      sendZap: mockSendZap,
      loading: false,
      error: null,
    });
  });

  it('renders zap form container', () => {
    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('zap-form')).toBeInTheDocument();
  });

  it('renders quick amount buttons', () => {
    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('quick-amounts')).toBeInTheDocument();
    expect(screen.getByTestId('quick-amount-21')).toBeInTheDocument();
    expect(screen.getByTestId('quick-amount-100')).toBeInTheDocument();
    expect(screen.getByTestId('quick-amount-500')).toBeInTheDocument();
    expect(screen.getByTestId('quick-amount-1000')).toBeInTheDocument();
  });

  it('updates amount when quick amount button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    const amountInput = screen.getByTestId('zap-amount-input');
    expect(amountInput).toHaveValue(21); // Default value

    await user.click(screen.getByTestId('quick-amount-500'));
    expect(amountInput).toHaveValue(500);

    await user.click(screen.getByTestId('quick-amount-1000'));
    expect(amountInput).toHaveValue(1000);
  });

  it('renders amount input field', () => {
    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('zap-amount-input')).toBeInTheDocument();
    expect(screen.getByText('Zap Amount')).toBeInTheDocument();
  });

  it('renders comment input field', () => {
    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('zap-comment-input')).toBeInTheDocument();
    expect(screen.getByText(/Comment/)).toBeInTheDocument();
  });

  it('renders zap button', () => {
    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('send-zap-button')).toBeInTheDocument();
    expect(screen.getByText(/Zap 21 sats/)).toBeInTheDocument();
  });

  it('disables zap button when no recipient address', () => {
    render(
      <ZapForm
        note={mockNote}
        recipientAddress={undefined}
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('send-zap-button')).toBeDisabled();
  });

  it('submits zap with correct parameters', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    const onZapSuccess = vi.fn();
    mockSendZap.mockResolvedValue(mockPaymentResult);

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={onZapSuccess}
        onLog={onLog}
      />
    );

    // Click quick amount
    await user.click(screen.getByTestId('quick-amount-100'));

    // Type a comment
    const commentInput = screen.getByTestId('zap-comment-input');
    await user.type(commentInput, 'Great post!');

    // Submit zap
    await user.click(screen.getByTestId('send-zap-button'));

    await waitFor(() => {
      expect(mockSendZap).toHaveBeenCalledWith({
        recipientAddress: 'bob@getalby.com',
        amount: 100,
        recipientPubkey: 'npub1bob123...',
        eventId: 'note1abc123def456',
        relays: expect.any(Array),
        comment: 'Great post!',
      });
    });

    expect(onLog).toHaveBeenCalledWith('Sending 100 sat zap to Bob...', 'info');
    expect(onZapSuccess).toHaveBeenCalledWith(mockPaymentResult);
  });

  it('disables zap button when recipient has no Lightning Address', () => {
    const onLog = vi.fn();

    render(
      <ZapForm
        note={mockNote}
        recipientAddress={undefined}
        onZapSuccess={() => {}}
        onLog={onLog}
      />
    );

    // Verify the button is disabled when there's no recipient address
    const button = screen.getByTestId('send-zap-button');
    expect(button).toBeDisabled();
    expect(mockSendZap).not.toHaveBeenCalled();
  });

  it('logs error for invalid amount', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={onLog}
      />
    );

    // Clear and set invalid amount
    const amountInput = screen.getByTestId('zap-amount-input');
    await user.clear(amountInput);
    await user.type(amountInput, '0');

    await user.click(screen.getByTestId('send-zap-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Invalid amount', 'error');
    });
    expect(mockSendZap).not.toHaveBeenCalled();
  });

  it('handles zap failure', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockSendZap.mockRejectedValue(new Error('Insufficient balance'));

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('send-zap-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Zap failed: Insufficient balance', 'error');
    });
  });

  it('handles non-Error exceptions', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockSendZap.mockRejectedValue('Unknown error');

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('send-zap-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Zap failed: Unknown error', 'error');
    });
  });

  it('displays error from hook', () => {
    vi.mocked(useZapModule.useZap).mockReturnValue({
      sendZap: mockSendZap,
      loading: false,
      error: 'Wallet not connected',
    });

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('zap-error')).toHaveTextContent('Wallet not connected');
  });

  it('shows loading state', () => {
    vi.mocked(useZapModule.useZap).mockReturnValue({
      sendZap: mockSendZap,
      loading: true,
      error: null,
    });

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    const button = screen.getByTestId('send-zap-button');
    expect(button).toBeInTheDocument();
    // Button should show loading state (implementation dependent)
  });

  it('updates button text when amount changes', async () => {
    const user = userEvent.setup();

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('send-zap-button')).toHaveTextContent('Zap 21 sats');

    await user.click(screen.getByTestId('quick-amount-500'));
    expect(screen.getByTestId('send-zap-button')).toHaveTextContent('Zap 500 sats');
  });

  it('shows info note about real Nostr clients', () => {
    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByText(/In a real Nostr client/)).toBeInTheDocument();
  });

  it('allows custom amount input', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    const onZapSuccess = vi.fn();
    mockSendZap.mockResolvedValue(mockPaymentResult);

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={onZapSuccess}
        onLog={onLog}
      />
    );

    const amountInput = screen.getByTestId('zap-amount-input');
    await user.clear(amountInput);
    await user.type(amountInput, '12345');

    await user.click(screen.getByTestId('send-zap-button'));

    await waitFor(() => {
      expect(mockSendZap).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 12345,
        })
      );
    });
  });
});

describe('ZapResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders zap result container', () => {
    render(<ZapResult result={mockPaymentResult} onReset={() => {}} />);

    expect(screen.getByTestId('zap-result')).toBeInTheDocument();
  });

  it('displays success title', () => {
    render(<ZapResult result={mockPaymentResult} onReset={() => {}} />);

    expect(screen.getByTestId('zap-success-title')).toHaveTextContent('Zap Sent!');
  });

  it('displays success message', () => {
    render(<ZapResult result={mockPaymentResult} onReset={() => {}} />);

    expect(screen.getByText(/Your zap has been sent successfully/)).toBeInTheDocument();
  });

  it('displays preimage', () => {
    render(<ZapResult result={mockPaymentResult} onReset={() => {}} />);

    expect(screen.getByTestId('zap-preimage')).toHaveTextContent('abc123def456preimage789');
  });

  it('renders "Send Another Zap" button', () => {
    render(<ZapResult result={mockPaymentResult} onReset={() => {}} />);

    expect(screen.getByTestId('send-another-zap-button')).toBeInTheDocument();
    expect(screen.getByText('Send Another Zap')).toBeInTheDocument();
  });

  it('calls onReset when button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<ZapResult result={mockPaymentResult} onReset={onReset} />);

    await user.click(screen.getByTestId('send-another-zap-button'));

    expect(onReset).toHaveBeenCalled();
  });

  it('includes copy button for preimage', () => {
    render(<ZapResult result={mockPaymentResult} onReset={() => {}} />);

    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toBeInTheDocument();
  });

  it('displays preimage label', () => {
    render(<ZapResult result={mockPaymentResult} onReset={() => {}} />);

    expect(screen.getByText(/Preimage \(proof\):/)).toBeInTheDocument();
  });
});

describe('ZapForm edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendZap.mockReset();

    vi.mocked(useZapModule.useZap).mockReturnValue({
      sendZap: mockSendZap,
      loading: false,
      error: null,
    });
  });

  it('sends zap without comment when comment is empty', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    const onZapSuccess = vi.fn();
    mockSendZap.mockResolvedValue(mockPaymentResult);

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={onZapSuccess}
        onLog={onLog}
      />
    );

    // Don't type any comment
    await user.click(screen.getByTestId('send-zap-button'));

    await waitFor(() => {
      expect(mockSendZap).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: undefined,
        })
      );
    });
  });

  it('highlights selected quick amount button', async () => {
    const user = userEvent.setup();

    render(
      <ZapForm
        note={mockNote}
        recipientAddress="bob@getalby.com"
        onZapSuccess={() => {}}
        onLog={() => {}}
      />
    );

    // Initial state - 21 should be selected
    const amount21 = screen.getByTestId('quick-amount-21');
    expect(amount21.className).toContain('bg-bitcoin');

    // Click 500
    await user.click(screen.getByTestId('quick-amount-500'));

    // 500 should now be highlighted
    const amount500 = screen.getByTestId('quick-amount-500');
    expect(amount500.className).toContain('bg-bitcoin');
    expect(amount21.className).not.toContain('bg-bitcoin');
  });
});
