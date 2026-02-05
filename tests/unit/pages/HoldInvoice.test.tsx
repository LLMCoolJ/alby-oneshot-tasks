/**
 * Hold Invoice Page and Component Tests
 * Spec: 09-scenario-4-hold-invoice.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateHoldInvoice } from '@/pages/4-HoldInvoice/components/CreateHoldInvoice';
import { HoldInvoiceStatus } from '@/pages/4-HoldInvoice/components/HoldInvoiceStatus';
import { PayHoldInvoice } from '@/pages/4-HoldInvoice/components/PayHoldInvoice';
import type { HoldInvoice } from '@/types';

// Mock hooks - using vi.hoisted for proper hoisting
const {
  mockCreateHoldInvoice,
  mockSettleHoldInvoice,
  mockCancelHoldInvoice,
  mockPayInvoice,
  mockSubscribe,
  mockUnsubscribe,
} = vi.hoisted(() => ({
  mockCreateHoldInvoice: vi.fn(),
  mockSettleHoldInvoice: vi.fn(),
  mockCancelHoldInvoice: vi.fn(),
  mockPayInvoice: vi.fn(),
  mockSubscribe: vi.fn(),
  mockUnsubscribe: vi.fn(),
}));

vi.mock('@/hooks/useHoldInvoice', () => ({
  useHoldInvoice: vi.fn(() => ({
    createHoldInvoice: mockCreateHoldInvoice,
    settleHoldInvoice: mockSettleHoldInvoice,
    cancelHoldInvoice: mockCancelHoldInvoice,
    loading: false,
    error: null,
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
  useTransactionLog: vi.fn(() => ({
    entries: [],
    addLog: vi.fn(),
    clearLogs: vi.fn(),
  })),
}));

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    isSubscribed: false,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    error: null,
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

const mockHoldInvoice: HoldInvoice = {
  invoice: 'lnbc50000n1test...',
  paymentHash: 'a'.repeat(64),
  preimage: 'b'.repeat(64),
  state: 'created',
  amount: 5000000, // 5000 sats in millisats
};

describe('CreateHoldInvoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateHoldInvoice.mockReset().mockResolvedValue(mockHoldInvoice);
  });

  it('renders form with amount and description inputs', () => {
    render(<CreateHoldInvoice onCreated={() => {}} onLog={() => {}} />);

    expect(screen.getByTestId('create-hold-invoice-form')).toBeInTheDocument();
    expect(screen.getByTestId('hold-invoice-amount')).toBeInTheDocument();
    expect(screen.getByTestId('hold-invoice-description')).toBeInTheDocument();
    expect(screen.getByTestId('create-hold-invoice-button')).toBeInTheDocument();
  });

  it('has default amount value of 5000', () => {
    render(<CreateHoldInvoice onCreated={() => {}} onLog={() => {}} />);

    const amountInput = screen.getByTestId('hold-invoice-amount');
    expect(amountInput).toHaveValue(5000);
  });

  it('renders informational note about hold invoices', () => {
    render(<CreateHoldInvoice onCreated={() => {}} onLog={() => {}} />);

    expect(screen.getByText(/hold invoices allow conditional payments/i)).toBeInTheDocument();
  });

  it('creates hold invoice when form is submitted', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onLog = vi.fn();

    render(<CreateHoldInvoice onCreated={onCreated} onLog={onLog} />);

    await user.click(screen.getByTestId('create-hold-invoice-button'));

    await waitFor(() => {
      expect(mockCreateHoldInvoice).toHaveBeenCalledWith({
        amount: 5000000, // 5000 sats * 1000
        description: 'Hold Invoice Demo',
      });
    });

    expect(onLog).toHaveBeenCalledWith('Generating preimage and payment hash...', 'info');
    expect(onCreated).toHaveBeenCalledWith(mockHoldInvoice);
  });

  it('uses custom description when provided', async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const onLog = vi.fn();

    render(<CreateHoldInvoice onCreated={onCreated} onLog={onLog} />);

    const descriptionInput = screen.getByTestId('hold-invoice-description');
    await user.type(descriptionInput, 'Custom escrow payment');

    await user.click(screen.getByTestId('create-hold-invoice-button'));

    await waitFor(() => {
      expect(mockCreateHoldInvoice).toHaveBeenCalledWith({
        amount: 5000000,
        description: 'Custom escrow payment',
      });
    });
  });

  it('validates amount before creating invoice', () => {
    // Test that validation logic exists by checking the input has min attribute set
    render(<CreateHoldInvoice onCreated={() => {}} onLog={() => {}} />);

    const amountInput = screen.getByTestId('hold-invoice-amount');
    // Input should have required attribute for HTML5 validation
    expect(amountInput).toBeRequired();
    // Input should have minimum value set
    expect(amountInput).toHaveAttribute('min', '1');
  });

  it('handles creation failure', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockCreateHoldInvoice.mockRejectedValueOnce(new Error('Creation failed'));

    render(<CreateHoldInvoice onCreated={() => {}} onLog={onLog} />);

    await user.click(screen.getByTestId('create-hold-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Failed: Creation failed', 'error');
    });
  });
});

describe('HoldInvoiceStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettleHoldInvoice.mockReset().mockResolvedValue(undefined);
    mockCancelHoldInvoice.mockReset().mockResolvedValue(undefined);
  });

  it('renders status container with correct test id', () => {
    render(
      <HoldInvoiceStatus
        holdInvoice={mockHoldInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('hold-invoice-status')).toBeInTheDocument();
  });

  it('displays amount in sats', () => {
    render(
      <HoldInvoiceStatus
        holdInvoice={mockHoldInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('hold-invoice-amount')).toHaveTextContent('5,000 sats');
  });

  it('shows Created badge for created state', () => {
    render(
      <HoldInvoiceStatus
        holdInvoice={mockHoldInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('hold-invoice-state-badge')).toHaveTextContent('Created');
  });

  it('displays QR code and invoice string for created state', () => {
    render(
      <HoldInvoiceStatus
        holdInvoice={mockHoldInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    expect(screen.getByTestId('hold-invoice-string')).toBeInTheDocument();
    expect(screen.getByTestId('hold-invoice-string')).toHaveValue('lnbc50000n1test...');
  });

  it('shows Settle and Cancel buttons for accepted state', () => {
    const acceptedInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'accepted' };

    render(
      <HoldInvoiceStatus
        holdInvoice={acceptedInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('settle-hold-invoice-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-hold-invoice-button')).toBeInTheDocument();
    expect(screen.getByText('Payment is held. Choose an action:')).toBeInTheDocument();
  });

  it('shows Held badge for accepted state', () => {
    const acceptedInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'accepted' };

    render(
      <HoldInvoiceStatus
        holdInvoice={acceptedInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('hold-invoice-state-badge')).toHaveTextContent('Held');
  });

  it('settles hold invoice when Settle button is clicked', async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    const onLog = vi.fn();
    const acceptedInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'accepted' };

    render(
      <HoldInvoiceStatus
        holdInvoice={acceptedInvoice}
        onStateChange={onStateChange}
        onReset={() => {}}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('settle-hold-invoice-button'));

    await waitFor(() => {
      expect(mockSettleHoldInvoice).toHaveBeenCalledWith(mockHoldInvoice.preimage);
    });

    expect(onLog).toHaveBeenCalledWith('Settling hold invoice (revealing preimage)...', 'info');
    expect(onStateChange).toHaveBeenCalledWith('settled');
    expect(onLog).toHaveBeenCalledWith('Invoice settled! Funds received.', 'success');
  });

  it('cancels hold invoice when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onStateChange = vi.fn();
    const onLog = vi.fn();
    const acceptedInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'accepted' };

    render(
      <HoldInvoiceStatus
        holdInvoice={acceptedInvoice}
        onStateChange={onStateChange}
        onReset={() => {}}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('cancel-hold-invoice-button'));

    await waitFor(() => {
      expect(mockCancelHoldInvoice).toHaveBeenCalledWith(mockHoldInvoice.paymentHash);
    });

    expect(onLog).toHaveBeenCalledWith('Cancelling hold invoice (refunding payer)...', 'info');
    expect(onStateChange).toHaveBeenCalledWith('cancelled');
    expect(onLog).toHaveBeenCalledWith('Invoice cancelled! Payer refunded.', 'success');
  });

  it('shows reset button for settled state', () => {
    const settledInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'settled' };

    render(
      <HoldInvoiceStatus
        holdInvoice={settledInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('reset-hold-invoice-button')).toBeInTheDocument();
    expect(screen.getByText('Funds have been received successfully.')).toBeInTheDocument();
  });

  it('shows reset button for cancelled state', () => {
    const cancelledInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'cancelled' };

    render(
      <HoldInvoiceStatus
        holdInvoice={cancelledInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByTestId('reset-hold-invoice-button')).toBeInTheDocument();
    expect(screen.getByText('Payment has been refunded to the payer.')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const settledInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'settled' };

    render(
      <HoldInvoiceStatus
        holdInvoice={settledInvoice}
        onStateChange={() => {}}
        onReset={onReset}
        onLog={() => {}}
      />
    );

    await user.click(screen.getByTestId('reset-hold-invoice-button'));

    expect(onReset).toHaveBeenCalled();
  });

  it('shows technical details in expandable section', () => {
    render(
      <HoldInvoiceStatus
        holdInvoice={mockHoldInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={() => {}}
      />
    );

    expect(screen.getByText('Technical Details')).toBeInTheDocument();
  });

  it('handles settle failure', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockSettleHoldInvoice.mockRejectedValueOnce(new Error('Settle failed'));
    const acceptedInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'accepted' };

    render(
      <HoldInvoiceStatus
        holdInvoice={acceptedInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('settle-hold-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Settle failed: Settle failed', 'error');
    });
  });

  it('handles cancel failure', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockCancelHoldInvoice.mockRejectedValueOnce(new Error('Cancel failed'));
    const acceptedInvoice: HoldInvoice = { ...mockHoldInvoice, state: 'accepted' };

    render(
      <HoldInvoiceStatus
        holdInvoice={acceptedInvoice}
        onStateChange={() => {}}
        onReset={() => {}}
        onLog={onLog}
      />
    );

    await user.click(screen.getByTestId('cancel-hold-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Cancel failed: Cancel failed', 'error');
    });
  });
});

describe('PayHoldInvoice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayInvoice.mockReset().mockResolvedValue({ preimage: 'abc123', feesPaid: 0 });
  });

  it('renders component with correct test id', () => {
    render(<PayHoldInvoice invoice="lnbc..." state="created" onLog={() => {}} />);

    expect(screen.getByTestId('pay-hold-invoice')).toBeInTheDocument();
  });

  it('shows Not Paid status initially', () => {
    render(<PayHoldInvoice invoice="lnbc..." state="created" onLog={() => {}} />);

    expect(screen.getByTestId('payment-status-not-paid')).toHaveTextContent('Not Paid');
  });

  it('renders invoice input and pay button', () => {
    render(<PayHoldInvoice invoice="lnbc..." state="created" onLog={() => {}} />);

    expect(screen.getByTestId('pay-hold-invoice-input')).toBeInTheDocument();
    expect(screen.getByTestId('pay-hold-invoice-button')).toBeInTheDocument();
  });

  it('pays invoice when Pay button is clicked', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(<PayHoldInvoice invoice="lnbc..." state="created" onLog={onLog} />);

    await user.click(screen.getByTestId('pay-hold-invoice-button'));

    await waitFor(() => {
      expect(mockPayInvoice).toHaveBeenCalledWith('lnbc...');
    });

    expect(onLog).toHaveBeenCalledWith('Paying hold invoice...', 'info');
    expect(onLog).toHaveBeenCalledWith('Payment completed!', 'success');
  });

  it('uses input invoice if provided', async () => {
    const user = userEvent.setup();

    render(<PayHoldInvoice invoice="" state="created" onLog={() => {}} />);

    const input = screen.getByTestId('pay-hold-invoice-input');
    await user.type(input, 'lnbc_custom...');

    await user.click(screen.getByTestId('pay-hold-invoice-button'));

    await waitFor(() => {
      expect(mockPayInvoice).toHaveBeenCalledWith('lnbc_custom...');
    });
  });

  it('logs error when no invoice provided', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(<PayHoldInvoice invoice="" state="created" onLog={onLog} />);

    await user.click(screen.getByTestId('pay-hold-invoice-button'));

    expect(onLog).toHaveBeenCalledWith('Please enter an invoice', 'error');
  });

  it('handles payment failure', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockPayInvoice.mockRejectedValueOnce(new Error('Payment failed'));

    render(<PayHoldInvoice invoice="lnbc..." state="created" onLog={onLog} />);

    await user.click(screen.getByTestId('pay-hold-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Payment failed: Payment failed', 'error');
    });
  });

  it('shows cancelled status when state is cancelled', () => {
    render(<PayHoldInvoice invoice="lnbc..." state="cancelled" onLog={() => {}} />);

    expect(screen.getByTestId('payment-status-cancelled')).toHaveTextContent('Cancelled');
    // Pay button should not be visible for cancelled state
    expect(screen.queryByTestId('pay-hold-invoice-button')).not.toBeInTheDocument();
  });

  it('handles cancellation message in payment error', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockPayInvoice.mockRejectedValueOnce(new Error('Invoice was cancelled'));

    render(<PayHoldInvoice invoice="lnbc..." state="created" onLog={onLog} />);

    await user.click(screen.getByTestId('pay-hold-invoice-button'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Payment was cancelled - funds refunded', 'info');
    });
  });

  it('hides input and button after successful payment', async () => {
    const user = userEvent.setup();

    render(<PayHoldInvoice invoice="lnbc..." state="created" onLog={() => {}} />);

    await user.click(screen.getByTestId('pay-hold-invoice-button'));

    await waitFor(() => {
      expect(screen.getByTestId('payment-status-completed')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('pay-hold-invoice-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pay-hold-invoice-button')).not.toBeInTheDocument();
  });
});
