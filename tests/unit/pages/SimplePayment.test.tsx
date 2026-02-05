/**
 * SimplePayment Page and Component Tests
 * Spec: 06-scenario-1-simple-payment.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateInvoiceForm } from '@/pages/1-SimplePayment/components/CreateInvoiceForm';
import { PayInvoiceForm } from '@/pages/1-SimplePayment/components/PayInvoiceForm';
import { InvoiceDisplay } from '@/pages/1-SimplePayment/components/InvoiceDisplay';
import { PaymentResultDisplay } from '@/pages/1-SimplePayment/components/PaymentResultDisplay';
import type { Nip47Transaction } from '@getalby/sdk/nwc';
import * as hooks from '@/hooks';

// Mock @/hooks
const mockCreateInvoice = vi.fn();
const mockPayInvoice = vi.fn();

vi.mock('@/hooks', () => ({
  useInvoice: vi.fn(() => ({
    createInvoice: mockCreateInvoice,
    loading: false,
    error: null,
    invoice: null,
    reset: vi.fn(),
  })),
  usePayment: vi.fn(() => ({
    payInvoice: mockPayInvoice,
    loading: false,
    error: null,
    result: null,
    reset: vi.fn(),
  })),
  useWallet: vi.fn(() => ({
    status: 'connected',
    balance: 100000000, // 100,000 sats in millisats
    info: { alias: 'Test Wallet' },
    error: null,
  })),
  useTransactionLog: vi.fn(() => ({
    entries: [],
    addLog: vi.fn(),
    clearLogs: vi.fn(),
  })),
}));

// Mock @getalby/lightning-tools
vi.mock('@getalby/lightning-tools', () => ({
  decodeInvoice: vi.fn((invoice: string) => {
    // Return decoded info for valid-looking invoices
    if (invoice.startsWith('lnbc')) {
      return {
        satoshi: 1000,
        description: 'Test Payment',
      };
    }
    throw new Error('Invalid invoice');
  }),
}));

// Mock UI components that might have complex dependencies
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    QRCode: ({ value, label }: { value: string; size?: number; label?: string }) => (
      <div data-testid="qr-code" data-value={value}>
        {label && <span>{label}</span>}
      </div>
    ),
    CopyButton: ({ value }: { value: string }) => (
      <button data-testid="copy-button" data-value={value} aria-label="Copy">
        Copy
      </button>
    ),
  };
});

describe('CreateInvoiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateInvoice.mockReset();
    // Reset useInvoice mock to default
    vi.mocked(hooks.useInvoice).mockReturnValue({
      createInvoice: mockCreateInvoice,
      loading: false,
      error: null,
      invoice: null,
      reset: vi.fn(),
    });
  });

  it('renders amount and description inputs', () => {
    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('description-input')).toBeInTheDocument();
  });

  it('renders with default amount of 1000 sats', () => {
    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={() => {}} />);

    const amountInput = screen.getByTestId('amount-input');
    expect(amountInput).toHaveValue(1000);
  });

  it('renders create invoice button', () => {
    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('create-invoice-button')).toBeInTheDocument();
    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
  });

  it('calls onInvoiceCreated when form is submitted successfully', async () => {
    const user = userEvent.setup();
    const onInvoiceCreated = vi.fn();
    const onLog = vi.fn();

    const mockInvoice = {
      invoice: 'lnbc1000n1test...',
      amount: 1000000, // 1000 sats in millisats
      description: 'Test Payment',
      payment_hash: 'abc123',
      type: 'incoming',
      state: 'pending',
      settled_at: 0,
      created_at: Date.now(),
      description_hash: '',
      preimage: '',
      fees_paid: 0,
      expires_at: Date.now() + 3600000,
    } as Nip47Transaction;
    mockCreateInvoice.mockResolvedValue(mockInvoice);

    render(<CreateInvoiceForm onInvoiceCreated={onInvoiceCreated} onLog={onLog} />);

    await user.clear(screen.getByTestId('amount-input'));
    await user.type(screen.getByTestId('amount-input'), '1000');
    await user.type(screen.getByTestId('description-input'), 'Test Payment');
    await user.click(screen.getByTestId('create-invoice-button'));

    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalledWith({
        amount: 1000000, // 1000 sats * 1000 millisats/sat
        description: 'Test Payment',
      });
    });

    await waitFor(() => {
      expect(onInvoiceCreated).toHaveBeenCalledWith(mockInvoice);
    });
  });

  it('uses default description when none provided', async () => {
    const user = userEvent.setup();
    const onInvoiceCreated = vi.fn();

    mockCreateInvoice.mockResolvedValue({
      invoice: 'lnbc1000n1test...',
      amount: 1000000,
      description: 'Lightning Demo Payment',
      payment_hash: 'abc123',
    });

    render(<CreateInvoiceForm onInvoiceCreated={onInvoiceCreated} onLog={() => {}} />);

    await user.click(screen.getByTestId('create-invoice-button'));

    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalledWith({
        amount: 1000000,
        description: 'Lightning Demo Payment',
      });
    });
  });

  it('validates minimum amount and calls onLog with error', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={onLog} />);

    // Clear the input - the value will be empty string which parseInt will return NaN for
    const amountInput = screen.getByTestId('amount-input') as HTMLInputElement;
    await user.clear(amountInput);

    // Submit the form directly since HTML5 validation might interfere with buttons
    const form = screen.getByTestId('create-invoice-form');

    // Fire submit event - but note that browser validation may prevent this
    // We need to test the component logic, so let's verify by checking that
    // empty input triggers the validation path (since parseInt('') = NaN)
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Invalid amount', 'error');
    });
    expect(mockCreateInvoice).not.toHaveBeenCalled();
  });

  it('logs "Creating invoice..." when submitting', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    mockCreateInvoice.mockResolvedValue({
      invoice: 'lnbc1000n1test...',
      amount: 1000000,
      payment_hash: 'abc123',
    });

    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={onLog} />);

    await user.click(screen.getByTestId('create-invoice-button'));

    expect(onLog).toHaveBeenCalledWith('Creating invoice...', 'info');
  });

  it('handles invoice creation error and logs failure message', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    mockCreateInvoice.mockRejectedValue(new Error('Network error'));

    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={onLog} />);

    await user.click(screen.getByTestId('create-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Failed to create invoice: Network error', 'error');
    });
  });

  it('handles non-Error exceptions with generic message', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    mockCreateInvoice.mockRejectedValue('Unknown error');

    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={onLog} />);

    await user.click(screen.getByTestId('create-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Failed to create invoice: Unknown error', 'error');
    });
  });

  it('displays error from hook', () => {
    vi.mocked(hooks.useInvoice).mockReturnValue({
      createInvoice: mockCreateInvoice,
      loading: false,
      error: 'Wallet not connected',
      invoice: null,
      reset: vi.fn(),
    });

    render(<CreateInvoiceForm onInvoiceCreated={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('Wallet not connected');
  });
});

describe('InvoiceDisplay', () => {
  const mockInvoice: Partial<Nip47Transaction> = {
    invoice: 'lnbc1000n1ptest...',
    amount: 1000000, // 1000 sats in millisats
    description: 'Test Payment',
    payment_hash: 'abc123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays invoice amount in sats', () => {
    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={() => {}} />);

    expect(screen.getByTestId('invoice-amount')).toHaveTextContent('1,000 sats');
  });

  it('displays invoice description when provided', () => {
    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={() => {}} />);

    expect(screen.getByTestId('invoice-description')).toHaveTextContent('Test Payment');
  });

  it('does not display description when not provided', () => {
    const { description: _, ...invoiceNoDesc } = mockInvoice;
    render(<InvoiceDisplay invoice={invoiceNoDesc as Nip47Transaction} onReset={() => {}} />);

    expect(screen.queryByTestId('invoice-description')).not.toBeInTheDocument();
  });

  it('renders QR code with invoice value', () => {
    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={() => {}} />);

    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveAttribute('data-value', mockInvoice.invoice);
  });

  it('renders QR code label "Scan to pay"', () => {
    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={() => {}} />);

    expect(screen.getByText('Scan to pay')).toBeInTheDocument();
  });

  it('displays invoice string in readonly input', () => {
    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={() => {}} />);

    const invoiceInput = screen.getByTestId('invoice-string');
    expect(invoiceInput).toHaveValue(mockInvoice.invoice);
    expect(invoiceInput).toHaveAttribute('readonly');
  });

  it('includes copy button for invoice', () => {
    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={() => {}} />);

    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveAttribute('data-value', mockInvoice.invoice);
  });

  it('renders reset button', () => {
    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={() => {}} />);

    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(<InvoiceDisplay invoice={mockInvoice as Nip47Transaction} onReset={onReset} />);

    await user.click(screen.getByTestId('reset-button'));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('correctly converts millisats to sats (floor division)', () => {
    const invoiceOddAmount = { ...mockInvoice, amount: 1500500 }; // 1500.5 sats -> 1500 sats
    render(<InvoiceDisplay invoice={invoiceOddAmount as Nip47Transaction} onReset={() => {}} />);

    expect(screen.getByTestId('invoice-amount')).toHaveTextContent('1,500 sats');
  });

  it('formats large amounts with locale string', () => {
    const largInvoice = { ...mockInvoice, amount: 1000000000 }; // 1,000,000 sats
    render(<InvoiceDisplay invoice={largInvoice as Nip47Transaction} onReset={() => {}} />);

    expect(screen.getByTestId('invoice-amount')).toHaveTextContent('1,000,000 sats');
  });
});

describe('PayInvoiceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayInvoice.mockReset();

    // Reset usePayment mock to default
    vi.mocked(hooks.usePayment).mockReturnValue({
      payInvoice: mockPayInvoice,
      loading: false,
      error: null,
      result: null,
      reset: vi.fn(),
    });
  });

  it('renders invoice input field', () => {
    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('invoice-input')).toBeInTheDocument();
    expect(screen.getByText('BOLT-11 Invoice')).toBeInTheDocument();
  });

  it('renders pay invoice button', () => {
    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('pay-invoice-button')).toBeInTheDocument();
    expect(screen.getByText('Pay Invoice')).toBeInTheDocument();
  });

  it('disables pay button when invoice is empty', () => {
    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('pay-invoice-button')).toBeDisabled();
  });

  it('enables pay button when invoice is entered', async () => {
    const user = userEvent.setup();

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    await user.type(screen.getByTestId('invoice-input'), 'lnbc1000n1test...');

    expect(screen.getByTestId('pay-invoice-button')).not.toBeDisabled();
  });

  it('decodes and displays invoice info when valid invoice is pasted', async () => {
    const user = userEvent.setup();

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    await user.type(screen.getByTestId('invoice-input'), 'lnbc1000n1test...');

    await waitFor(() => {
      expect(screen.getByTestId('decoded-info')).toBeInTheDocument();
      expect(screen.getByTestId('decoded-amount')).toHaveTextContent('1,000 sats');
      expect(screen.getByTestId('decoded-description')).toHaveTextContent('Test Payment');
    });
  });

  it('does not show decoded info for invalid invoice', async () => {
    const user = userEvent.setup();

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    await user.type(screen.getByTestId('invoice-input'), 'invalid-invoice');

    await waitFor(() => {
      expect(screen.queryByTestId('decoded-info')).not.toBeInTheDocument();
    });
  });

  it('disables input when disabled prop is true', () => {
    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} disabled />);

    expect(screen.getByTestId('invoice-input')).toBeDisabled();
  });

  it('disables button when disabled prop is true', () => {
    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} disabled />);

    expect(screen.getByTestId('pay-invoice-button')).toBeDisabled();
  });

  it('logs "Paying invoice..." when submitting', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    mockPayInvoice.mockResolvedValue({
      preimage: 'test123',
      feesPaid: 0,
    });

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={onLog} />);

    await user.type(screen.getByTestId('invoice-input'), 'lnbc1000n1test...');
    await user.click(screen.getByTestId('pay-invoice-button'));

    expect(onLog).toHaveBeenCalledWith('Paying invoice...', 'info');
  });

  it('calls payInvoice and onPaymentSuccess on successful payment', async () => {
    const user = userEvent.setup();
    const onPaymentSuccess = vi.fn();

    const paymentResult = {
      preimage: 'preimage123abc',
      feesPaid: 1000,
    };
    mockPayInvoice.mockResolvedValue(paymentResult);

    render(<PayInvoiceForm onPaymentSuccess={onPaymentSuccess} onLog={() => {}} />);

    await user.type(screen.getByTestId('invoice-input'), 'lnbc1000n1test...');
    await user.click(screen.getByTestId('pay-invoice-button'));

    await waitFor(() => {
      expect(mockPayInvoice).toHaveBeenCalledWith('lnbc1000n1test...');
    });

    await waitFor(() => {
      expect(onPaymentSuccess).toHaveBeenCalledWith(paymentResult);
    });
  });

  it('handles payment error and logs failure message', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    mockPayInvoice.mockRejectedValue(new Error('Insufficient balance'));

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={onLog} />);

    await user.type(screen.getByTestId('invoice-input'), 'lnbc1000n1test...');
    await user.click(screen.getByTestId('pay-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Payment failed: Insufficient balance', 'error');
    });
  });

  it('handles non-Error exceptions with generic message', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    mockPayInvoice.mockRejectedValue('Unknown error');

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={onLog} />);

    await user.type(screen.getByTestId('invoice-input'), 'lnbc1000n1test...');
    await user.click(screen.getByTestId('pay-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Payment failed: Unknown error', 'error');
    });
  });

  it('displays error from hook', () => {
    vi.mocked(hooks.usePayment).mockReturnValue({
      payInvoice: mockPayInvoice,
      loading: false,
      error: 'Payment timed out',
      result: null,
      reset: vi.fn(),
    });

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('Payment timed out');
  });

  it('clears decoded info when invoice input is cleared', async () => {
    const user = userEvent.setup();

    render(<PayInvoiceForm onPaymentSuccess={() => {}} onLog={() => {}} />);

    await user.type(screen.getByTestId('invoice-input'), 'lnbc1000n1test...');

    await waitFor(() => {
      expect(screen.getByTestId('decoded-info')).toBeInTheDocument();
    });

    await user.clear(screen.getByTestId('invoice-input'));

    await waitFor(() => {
      expect(screen.queryByTestId('decoded-info')).not.toBeInTheDocument();
    });
  });
});

describe('PaymentResultDisplay', () => {
  it('displays success message', () => {
    const result = { preimage: 'abc123def456', feesPaid: 0 };
    render(<PaymentResultDisplay result={result} />);

    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
  });

  it('displays preimage', () => {
    const result = { preimage: 'abc123def456789xyz', feesPaid: 0 };
    render(<PaymentResultDisplay result={result} />);

    expect(screen.getByTestId('preimage')).toHaveTextContent('abc123def456789xyz');
  });

  it('displays fees in sats (0 sats)', () => {
    const result = { preimage: 'abc123', feesPaid: 0 };
    render(<PaymentResultDisplay result={result} />);

    expect(screen.getByTestId('fees-paid')).toHaveTextContent('0 sats');
  });

  it('displays fees in sats (positive amount)', () => {
    const result = { preimage: 'abc123', feesPaid: 5000 }; // 5000 millisats = 5 sats
    render(<PaymentResultDisplay result={result} />);

    expect(screen.getByTestId('fees-paid')).toHaveTextContent('5 sats');
  });

  it('floors fee conversion from millisats to sats', () => {
    const result = { preimage: 'abc123', feesPaid: 5500 }; // 5500 millisats = 5.5 sats -> 5 sats
    render(<PaymentResultDisplay result={result} />);

    expect(screen.getByTestId('fees-paid')).toHaveTextContent('5 sats');
  });

  it('includes copy button for preimage', () => {
    const result = { preimage: 'preimage123xyz', feesPaid: 0 };
    render(<PaymentResultDisplay result={result} />);

    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toBeInTheDocument();
    expect(copyButton).toHaveAttribute('data-value', 'preimage123xyz');
  });

  it('has success styling (green background)', () => {
    const result = { preimage: 'abc123', feesPaid: 0 };
    render(<PaymentResultDisplay result={result} />);

    const container = screen.getByTestId('payment-result');
    expect(container).toHaveClass('bg-green-50');
    expect(container).toHaveClass('border-green-200');
  });

  it('renders check icon', () => {
    const result = { preimage: 'abc123', feesPaid: 0 };
    render(<PaymentResultDisplay result={result} />);

    // Check icon is rendered as an SVG
    const svg = screen.getByTestId('payment-result').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-green-600');
  });
});
