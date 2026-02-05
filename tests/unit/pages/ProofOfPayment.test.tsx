/**
 * Proof of Payment Page and Component Tests
 * Spec: 10-scenario-5-proof-of-payment.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvoiceCreator } from '@/pages/5-ProofOfPayment/components/InvoiceCreator';
import { PayAndProve } from '@/pages/5-ProofOfPayment/components/PayAndProve';
import { PreimageVerifier } from '@/pages/5-ProofOfPayment/components/PreimageVerifier';
import type { Nip47Transaction } from '@getalby/sdk/nwc';

// Mock hooks - using vi.hoisted for proper hoisting
const { mockCreateInvoice, mockPayInvoice, mockValidatePreimage } = vi.hoisted(
  () => ({
    mockCreateInvoice: vi.fn(),
    mockPayInvoice: vi.fn(),
    mockValidatePreimage: vi.fn(),
  })
);

vi.mock('@/hooks/useInvoice', () => ({
  useInvoice: vi.fn(() => ({
    createInvoice: mockCreateInvoice,
    loading: false,
    error: null,
    invoice: null,
  })),
}));

vi.mock('@/hooks', () => ({
  useWallet: vi.fn(() => ({
    status: 'connected',
    balance: 100000000,
    info: { alias: 'Test Wallet', lud16: 'bob@testnet.getalby.com' },
    error: null,
  })),
  usePayment: vi.fn(() => ({
    payInvoice: mockPayInvoice,
    loading: false,
    error: null,
  })),
  useInvoice: vi.fn(() => ({
    createInvoice: mockCreateInvoice,
    loading: false,
    error: null,
    invoice: null,
  })),
  useTransactionLog: vi.fn(() => ({
    entries: [],
    addLog: vi.fn(),
    clearLogs: vi.fn(),
  })),
}));

// Mock the Invoice class from lightning-tools bolt11 subpath
vi.mock('@getalby/lightning-tools/bolt11', () => ({
  Invoice: vi.fn().mockImplementation(() => ({
    paymentHash: 'abc123def456789012345678901234567890123456789012345678901234',
    validatePreimage: mockValidatePreimage,
  })),
}));

// Mock UI components that might have complex dependencies
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    QRCode: ({ value }: { value: string }) => (
      <div data-testid="qr-code" data-value={value}>
        QR Code
      </div>
    ),
    CopyButton: ({ value }: { value: string }) => (
      <button data-testid="copy-button" data-value={value} aria-label="Copy">
        Copy
      </button>
    ),
  };
});

const mockInvoice: Nip47Transaction = {
  type: 'incoming',
  invoice: 'lnbc1000n1test...',
  description: 'Proof of Payment Demo',
  description_hash: '',
  preimage: '',
  payment_hash: 'abc123def456789012345678901234567890123456789012345678901234',
  amount: 1000000, // 1000 sats in millisats
  fees_paid: 0,
  created_at: Date.now(),
  expires_at: Date.now() + 3600000,
  settled_at: 0,
  state: 'settled',
};

const mockPreimage =
  'def456abc123789012345678901234567890123456789012345678901234abcd';

describe('InvoiceCreator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateInvoice.mockReset().mockResolvedValue(mockInvoice);
  });

  it('renders form with amount input', () => {
    render(<InvoiceCreator onInvoiceCreated={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('invoice-creator')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('create-invoice-button')).toBeInTheDocument();
  });

  it('has default amount value of 1000', () => {
    render(<InvoiceCreator onInvoiceCreated={() => {}} onLog={() => {}} />);

    const amountInput = screen.getByTestId('invoice-amount-input');
    expect(amountInput).toHaveValue(1000);
  });

  it('creates invoice when button is clicked', async () => {
    const user = userEvent.setup();
    const onInvoiceCreated = vi.fn();
    const onLog = vi.fn();

    render(
      <InvoiceCreator onInvoiceCreated={onInvoiceCreated} onLog={onLog} />
    );

    await user.click(screen.getByTestId('create-invoice-button'));

    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalledWith({
        amount: 1000000, // 1000 sats * 1000
        description: 'Proof of Payment Demo',
      });
    });

    expect(onLog).toHaveBeenCalledWith('Creating invoice...', 'info');
    expect(onInvoiceCreated).toHaveBeenCalledWith(mockInvoice);
  });

  it('handles creation failure', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockCreateInvoice.mockRejectedValueOnce(new Error('Creation failed'));

    render(<InvoiceCreator onInvoiceCreated={() => {}} onLog={onLog} />);

    await user.click(screen.getByTestId('create-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Failed: Creation failed', 'error');
    });
  });

  it('validates amount before creating invoice', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(<InvoiceCreator onInvoiceCreated={() => {}} onLog={onLog} />);

    // Clear the amount and set invalid value
    const amountInput = screen.getByTestId('invoice-amount-input');
    await user.clear(amountInput);
    await user.type(amountInput, '0');

    await user.click(screen.getByTestId('create-invoice-button'));

    expect(onLog).toHaveBeenCalledWith('Invalid amount', 'error');
    expect(mockCreateInvoice).not.toHaveBeenCalled();
  });

  it('uses custom amount when provided', async () => {
    const user = userEvent.setup();
    const onInvoiceCreated = vi.fn();
    const onLog = vi.fn();

    render(
      <InvoiceCreator onInvoiceCreated={onInvoiceCreated} onLog={onLog} />
    );

    const amountInput = screen.getByTestId('invoice-amount-input');
    await user.clear(amountInput);
    await user.type(amountInput, '5000');

    await user.click(screen.getByTestId('create-invoice-button'));

    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalledWith({
        amount: 5000000, // 5000 sats * 1000
        description: 'Proof of Payment Demo',
      });
    });
  });
});

describe('PayAndProve', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayInvoice.mockReset().mockResolvedValue({ preimage: mockPreimage });
  });

  it('renders component with correct test id', () => {
    render(
      <PayAndProve
        invoice={mockInvoice}
        onPreimageReceived={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('pay-and-prove')).toBeInTheDocument();
  });

  it('displays invoice summary with amount and payment hash', () => {
    render(
      <PayAndProve
        invoice={mockInvoice}
        onPreimageReceived={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('invoice-summary')).toBeInTheDocument();
    expect(screen.getByTestId('invoice-amount')).toHaveTextContent('1,000 sats');
    expect(screen.getByTestId('payment-hash')).toBeInTheDocument();
  });

  it('shows pay button when not yet paid', () => {
    render(
      <PayAndProve
        invoice={mockInvoice}
        onPreimageReceived={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('pay-invoice-button')).toBeInTheDocument();
    expect(screen.getByTestId('pay-invoice-button')).toHaveTextContent(
      'Pay Invoice'
    );
  });

  it('pays invoice and receives preimage when button is clicked', async () => {
    const user = userEvent.setup();
    const onPreimageReceived = vi.fn();
    const onLog = vi.fn();

    render(
      <PayAndProve
        invoice={mockInvoice}
        onPreimageReceived={onPreimageReceived}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('pay-invoice-button'));

    await waitFor(() => {
      expect(mockPayInvoice).toHaveBeenCalledWith(mockInvoice.invoice);
    });

    expect(onLog).toHaveBeenCalledWith('Paying invoice...', 'info');
    expect(onPreimageReceived).toHaveBeenCalledWith(mockPreimage);
  });

  it('displays preimage after successful payment', async () => {
    const user = userEvent.setup();

    render(
      <PayAndProve
        invoice={mockInvoice}
        onPreimageReceived={() => {}}
        onLog={() => {}}
      />
    );

    await user.click(screen.getByTestId('pay-invoice-button'));

    await waitFor(() => {
      expect(screen.getByTestId('payment-complete')).toBeInTheDocument();
    });

    expect(screen.getByTestId('payment-complete-badge')).toHaveTextContent(
      'Payment Complete'
    );
    expect(screen.getByTestId('preimage-value')).toHaveTextContent(
      mockPreimage
    );
  });

  it('hides pay button after successful payment', async () => {
    const user = userEvent.setup();

    render(
      <PayAndProve
        invoice={mockInvoice}
        onPreimageReceived={() => {}}
        onLog={() => {}}
      />
    );

    await user.click(screen.getByTestId('pay-invoice-button'));

    await waitFor(() => {
      expect(screen.getByTestId('payment-complete')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('pay-invoice-button')).not.toBeInTheDocument();
  });

  it('handles payment failure', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockPayInvoice.mockRejectedValueOnce(new Error('Payment failed'));

    render(
      <PayAndProve
        invoice={mockInvoice}
        onPreimageReceived={() => {}}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('pay-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith(
        'Payment failed: Payment failed',
        'error'
      );
    });
  });
});

describe('PreimageVerifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidatePreimage.mockReset().mockReturnValue(true);
  });

  it('renders component with correct test id', () => {
    render(
      <PreimageVerifier invoice={null} preimage={null} onLog={() => {}} />
    );

    expect(screen.getByTestId('preimage-verifier')).toBeInTheDocument();
  });

  it('displays section heading', () => {
    render(
      <PreimageVerifier invoice={null} preimage={null} onLog={() => {}} />
    );

    expect(screen.getByText('Preimage Verification')).toBeInTheDocument();
  });

  it('shows verified state when preimage matches', async () => {
    const onLog = vi.fn();

    render(
      <PreimageVerifier
        invoice={mockInvoice}
        preimage={mockPreimage}
        onLog={onLog}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('verification-result')).toBeInTheDocument();
    });

    expect(screen.getByTestId('verified-badge')).toHaveTextContent('Verified');
    expect(screen.getByText('Payment Proven!')).toBeInTheDocument();
    expect(onLog).toHaveBeenCalledWith(
      'Verification successful! Preimage matches payment hash.',
      'success'
    );
  });

  it('shows invalid state when preimage does not match', async () => {
    mockValidatePreimage.mockReturnValue(false);
    const onLog = vi.fn();

    render(
      <PreimageVerifier
        invoice={mockInvoice}
        preimage="invalid_preimage"
        onLog={onLog}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('verification-result')).toBeInTheDocument();
    });

    expect(screen.getByTestId('invalid-badge')).toHaveTextContent('Invalid');
    expect(screen.getByText('Preimage does not match')).toBeInTheDocument();
    expect(onLog).toHaveBeenCalledWith(
      'Verification failed! Preimage does not match.',
      'error'
    );
  });

  it('displays payment hash in verification result', async () => {
    render(
      <PreimageVerifier
        invoice={mockInvoice}
        preimage={mockPreimage}
        onLog={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('payment-hash-display')).toBeInTheDocument();
    });
  });

  it('allows manual verification', async () => {
    const user = userEvent.setup();

    render(
      <PreimageVerifier invoice={null} preimage={null} onLog={() => {}} />
    );

    // Open manual verification section
    await user.click(screen.getByText(/verify manually/i));

    expect(screen.getByTestId('manual-invoice-input')).toBeInTheDocument();
    expect(screen.getByTestId('manual-preimage-input')).toBeInTheDocument();
    expect(screen.getByTestId('manual-verify-button')).toBeInTheDocument();
  });

  it('validates manual input before verification', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(
      <PreimageVerifier invoice={null} preimage={null} onLog={onLog} />
    );

    // Open manual verification section
    await user.click(screen.getByText(/verify manually/i));

    // Try to verify without entering data
    await user.click(screen.getByTestId('manual-verify-button'));

    expect(onLog).toHaveBeenCalledWith(
      'Please enter both invoice and preimage',
      'error'
    );
  });

  it('performs manual verification when inputs are filled', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(
      <PreimageVerifier invoice={null} preimage={null} onLog={onLog} />
    );

    // Open manual verification section
    await user.click(screen.getByText(/verify manually/i));

    // Fill in inputs
    await user.type(
      screen.getByTestId('manual-invoice-input'),
      'lnbc1000n1test...'
    );
    await user.type(screen.getByTestId('manual-preimage-input'), mockPreimage);

    // Verify
    await user.click(screen.getByTestId('manual-verify-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Verifying preimage...', 'info');
    });
  });

  it('displays educational content', () => {
    render(
      <PreimageVerifier invoice={null} preimage={null} onLog={() => {}} />
    );

    expect(screen.getByTestId('educational-content')).toBeInTheDocument();
    expect(screen.getByText('Why This Matters')).toBeInTheDocument();
    expect(
      screen.getByText(/preimage is revealed only when payment succeeds/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/cryptographically impossible to guess/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/anyone can verify the proof/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/atomic swaps, escrow/i)).toBeInTheDocument();
  });
});
