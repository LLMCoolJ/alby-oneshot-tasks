/**
 * LightningAddress Page and Component Tests
 * Spec: 07-scenario-2-lightning-address.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LightningAddressDisplay } from '@/pages/2-LightningAddress/components/LightningAddressDisplay';
import { PayToAddressForm } from '@/pages/2-LightningAddress/components/PayToAddressForm';
import * as hooks from '@/hooks';
import * as lnAddressPaymentHook from '@/hooks/useLightningAddressPayment';

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

// Mock @/hooks/useLightningAddressPayment
const mockPayToAddress = vi.fn();
const mockFetchAddressInfo = vi.fn();
const mockReset = vi.fn();

vi.mock('@/hooks/useLightningAddressPayment', () => ({
  useLightningAddressPayment: vi.fn(() => ({
    payToAddress: mockPayToAddress,
    fetchAddressInfo: mockFetchAddressInfo,
    loading: false,
    error: null,
    addressInfo: null,
    result: null,
    reset: mockReset,
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

describe('LightningAddressDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset useWallet mock to default with lud16
    vi.mocked(hooks.useWallet).mockReturnValue({
      status: 'connected',
      balance: 100000000,
      info: { alias: 'Test Wallet', lud16: 'bob@testnet.getalby.com' },
      error: null,
      id: 'bob',
      nwcUrl: null,
    } as ReturnType<typeof hooks.useWallet>);
  });

  it('displays the Lightning Address from wallet info', () => {
    render(<LightningAddressDisplay />);
    expect(screen.getByText('bob@testnet.getalby.com')).toBeInTheDocument();
  });

  it('shows warning when no Lightning Address available', () => {
    vi.mocked(hooks.useWallet).mockReturnValue({
      status: 'connected',
      balance: 100000000,
      info: { alias: 'Test Wallet', lud16: undefined },
      error: null,
      id: 'bob',
      nwcUrl: null,
    } as ReturnType<typeof hooks.useWallet>);

    render(<LightningAddressDisplay />);
    expect(screen.getByText(/no lightning address found/i)).toBeInTheDocument();
  });

  it('includes copy button', () => {
    render(<LightningAddressDisplay />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays "My Lightning Address" label', () => {
    render(<LightningAddressDisplay />);
    expect(screen.getByText('My Lightning Address')).toBeInTheDocument();
  });

  it('displays "How it works" info section', () => {
    render(<LightningAddressDisplay />);
    expect(screen.getByText('How it works')).toBeInTheDocument();
    expect(screen.getByText(/works like an email/i)).toBeInTheDocument();
  });
});

describe('PayToAddressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayToAddress.mockReset();
    mockFetchAddressInfo.mockReset();
    mockReset.mockReset();

    // Reset useLightningAddressPayment mock to default
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: null,
      result: null,
      reset: mockReset,
    });
  });

  it('renders Lightning Address input field', () => {
    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByTestId('lightning-address-input')).toBeInTheDocument();
    expect(screen.getByText('Lightning Address')).toBeInTheDocument();
  });

  it('renders amount and comment inputs', () => {
    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByTestId('amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('comment-input')).toBeInTheDocument();
  });

  it('renders pay button', () => {
    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByTestId('pay-address-btn')).toBeInTheDocument();
    expect(screen.getByText('Pay Lightning Address')).toBeInTheDocument();
  });

  it('validates Lightning Address format and shows error for invalid format', async () => {
    const user = userEvent.setup();
    render(<PayToAddressForm onLog={() => {}} />);

    const input = screen.getByTestId('lightning-address-input');
    await user.type(input, 'not-an-address');

    // The error should be shown (invalid format)
    expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
  });

  it('does not show error for valid Lightning Address format', async () => {
    const user = userEvent.setup();
    render(<PayToAddressForm onLog={() => {}} />);

    const input = screen.getByTestId('lightning-address-input');
    await user.type(input, 'bob@getalby.com');

    // No error should be shown
    expect(screen.queryByText(/invalid format/i)).not.toBeInTheDocument();
  });

  it('fetches address info on blur for valid address', async () => {
    const user = userEvent.setup();
    mockFetchAddressInfo.mockResolvedValue({
      min: 1,
      max: 1000000,
      description: 'Test',
      commentAllowed: 255,
      fixed: false,
    });

    const onLog = vi.fn();
    render(<PayToAddressForm onLog={onLog} />);

    const input = screen.getByTestId('lightning-address-input');
    await user.type(input, 'bob@getalby.com');
    await user.tab(); // blur

    await waitFor(() => {
      expect(mockFetchAddressInfo).toHaveBeenCalledWith('bob@getalby.com');
    });

    expect(onLog).toHaveBeenCalledWith('Fetching LNURL data for bob@getalby.com...', 'info');
  });

  it('does not fetch address info on blur for invalid address', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    render(<PayToAddressForm onLog={onLog} />);

    const input = screen.getByTestId('lightning-address-input');
    await user.type(input, 'invalid');
    await user.tab(); // blur

    expect(mockFetchAddressInfo).not.toHaveBeenCalled();
  });

  it('shows min/max when address info is available', () => {
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: { min: 1, max: 1000000, description: 'Test', commentAllowed: 255, fixed: false },
      result: null,
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByTestId('address-info')).toBeInTheDocument();
    expect(screen.getByText('1 sats')).toBeInTheDocument();
    expect(screen.getByText('1,000,000 sats')).toBeInTheDocument();
  });

  it('shows description in address info when available', () => {
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: { min: 1, max: 1000000, description: 'Pay me sats!', commentAllowed: 255, fixed: false },
      result: null,
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByText('Pay me sats!')).toBeInTheDocument();
  });

  it('disables comment field when not supported', () => {
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: { min: 1, max: 1000000, description: 'Test', commentAllowed: undefined, fixed: false },
      result: null,
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByTestId('comment-input')).toBeDisabled();
    expect(screen.getByText('Comments not supported')).toBeInTheDocument();
  });

  it('shows comment character limit when comments are allowed', () => {
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: { min: 1, max: 1000000, description: 'Test', commentAllowed: 255, fixed: false },
      result: null,
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByText('Up to 255 characters')).toBeInTheDocument();
    expect(screen.getByTestId('comment-input')).not.toBeDisabled();
  });

  it('submits payment with correct data (without comment)', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockPayToAddress.mockResolvedValue({ preimage: 'abc123def456', feesPaid: 0 });

    render(<PayToAddressForm onLog={onLog} />);

    const addressInput = screen.getByTestId('lightning-address-input');
    const amountInput = screen.getByTestId('amount-input');

    await user.type(addressInput, 'bob@getalby.com');
    await user.clear(amountInput);
    await user.type(amountInput, '2000');

    await user.click(screen.getByTestId('pay-address-btn'));

    await waitFor(() => {
      expect(mockPayToAddress).toHaveBeenCalledWith({
        address: 'bob@getalby.com',
        amount: 2000,
        comment: undefined,
      });
    });

    expect(onLog).toHaveBeenCalledWith('Paying 2000 sats to bob@getalby.com...', 'info');
  });

  it('submits payment with comment when comments allowed', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockPayToAddress.mockResolvedValue({ preimage: 'abc123def456', feesPaid: 0 });

    // Set addressInfo with commentAllowed
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: { min: 1, max: 1000000, description: 'Test', commentAllowed: 255, fixed: false },
      result: null,
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={onLog} />);

    const addressInput = screen.getByTestId('lightning-address-input');
    const amountInput = screen.getByTestId('amount-input');
    const commentInput = screen.getByTestId('comment-input');

    await user.type(addressInput, 'bob@getalby.com');
    await user.clear(amountInput);
    await user.type(amountInput, '2000');
    await user.type(commentInput, 'Thanks!');

    await user.click(screen.getByTestId('pay-address-btn'));

    await waitFor(() => {
      expect(mockPayToAddress).toHaveBeenCalledWith({
        address: 'bob@getalby.com',
        amount: 2000,
        comment: 'Thanks!',
      });
    });

    expect(onLog).toHaveBeenCalledWith('Paying 2000 sats to bob@getalby.com...', 'info');
  });

  it('logs invalid address error when submitting invalid address', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(<PayToAddressForm onLog={onLog} />);

    const addressInput = screen.getByTestId('lightning-address-input');
    await user.type(addressInput, 'invalid');

    // Trigger form submit directly
    const form = screen.getByTestId('pay-to-address-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Invalid Lightning Address format', 'error');
    });
    expect(mockPayToAddress).not.toHaveBeenCalled();
  });

  it('logs invalid amount error when amount is too low', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();

    render(<PayToAddressForm onLog={onLog} />);

    const addressInput = screen.getByTestId('lightning-address-input');
    const amountInput = screen.getByTestId('amount-input');

    await user.type(addressInput, 'bob@getalby.com');
    await user.clear(amountInput);
    await user.type(amountInput, '0');

    // Trigger form submit directly
    const form = screen.getByTestId('pay-to-address-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Invalid amount', 'error');
    });
    expect(mockPayToAddress).not.toHaveBeenCalled();
  });

  it('handles payment error', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockPayToAddress.mockRejectedValue(new Error('Payment failed'));

    render(<PayToAddressForm onLog={onLog} />);

    const addressInput = screen.getByTestId('lightning-address-input');
    await user.type(addressInput, 'bob@getalby.com');
    await user.click(screen.getByTestId('pay-address-btn'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Payment failed: Payment failed', 'error');
    });
  });

  it('handles non-Error exceptions with generic message', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockPayToAddress.mockRejectedValue('Unknown error');

    render(<PayToAddressForm onLog={onLog} />);

    const addressInput = screen.getByTestId('lightning-address-input');
    await user.type(addressInput, 'bob@getalby.com');
    await user.click(screen.getByTestId('pay-address-btn'));

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Payment failed: Unknown error', 'error');
    });
  });

  it('displays error from hook', () => {
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: 'Wallet not connected',
      addressInfo: null,
      result: null,
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByTestId('error-message')).toHaveTextContent('Wallet not connected');
  });

  it('shows success state when result is available', () => {
    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: null,
      result: { preimage: 'abc123def456', feesPaid: 0 },
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={() => {}} />);

    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    expect(screen.getByTestId('reset-payment-btn')).toBeInTheDocument();
  });

  it('calls reset when "Make Another Payment" is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(lnAddressPaymentHook.useLightningAddressPayment).mockReturnValue({
      payToAddress: mockPayToAddress,
      fetchAddressInfo: mockFetchAddressInfo,
      loading: false,
      error: null,
      addressInfo: null,
      result: { preimage: 'abc123def456', feesPaid: 0 },
      reset: mockReset,
    });

    render(<PayToAddressForm onLog={() => {}} />);

    await user.click(screen.getByTestId('reset-payment-btn'));

    expect(mockReset).toHaveBeenCalled();
  });

  it('disables pay button when address or amount is empty', () => {
    render(<PayToAddressForm onLog={() => {}} />);

    // Initially amount has default value but address is empty
    expect(screen.getByTestId('pay-address-btn')).toBeDisabled();
  });

  it('handles fetch address info error', async () => {
    const user = userEvent.setup();
    const onLog = vi.fn();
    mockFetchAddressInfo.mockRejectedValue(new Error('LNURL fetch failed'));

    render(<PayToAddressForm onLog={onLog} />);

    const input = screen.getByTestId('lightning-address-input');
    await user.type(input, 'bob@getalby.com');
    await user.tab(); // blur

    await waitFor(() => {
      expect(onLog).toHaveBeenCalledWith('Failed to fetch address info: LNURL fetch failed', 'error');
    });
  });
});
