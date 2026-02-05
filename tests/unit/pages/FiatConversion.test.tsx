/**
 * FiatConversion Page and Component Tests
 * Spec: 13-scenario-8-fiat-conversion.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversionCalculator } from '@/pages/8-FiatConversion/components/ConversionCalculator';
import { QuickReference } from '@/pages/8-FiatConversion/components/QuickReference';
import { CurrencySelector } from '@/pages/8-FiatConversion/components/CurrencySelector';

// Mock @getalby/lightning-tools/fiat
vi.mock('@getalby/lightning-tools/fiat', () => ({
  getFiatValue: vi.fn().mockResolvedValue(42),
  getSatoshiValue: vi.fn().mockResolvedValue(1000),
  getFormattedFiatValue: vi.fn().mockResolvedValue('$42.00'),
}));

// Mock @/hooks
vi.mock('@/hooks', () => ({
  useWallet: vi.fn(() => ({
    status: 'connected',
    balance: 100000000, // 100,000 sats in millisats
    info: { alias: 'Test Wallet' },
    error: null,
  })),
  useBalance: vi.fn(() => ({
    sats: 100000,
    loading: false,
    error: null,
  })),
  useFiatRate: vi.fn(() => ({
    fiatValue: 42000,
    formattedFiat: '$42.00',
    loading: false,
    error: null,
  })),
  useTransactionLog: vi.fn(() => ({
    entries: [],
    addLog: vi.fn(),
    clearLogs: vi.fn(),
  })),
}));

// Mock UI components
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual('@/components/ui');
  return {
    ...actual,
    Input: ({ value, onChange, placeholder, className, 'data-testid': testId, ...props }: {
      value: string;
      onChange: (e: { target: { value: string } }) => void;
      placeholder?: string;
      className?: string;
      'data-testid'?: string;
      type?: string;
    }) => (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        data-testid={testId}
        {...props}
      />
    ),
  };
});

describe('ConversionCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders conversion calculator container', () => {
    render(<ConversionCalculator currency="USD" />);

    expect(screen.getByTestId('conversion-calculator')).toBeInTheDocument();
  });

  it('renders calculator title', () => {
    render(<ConversionCalculator currency="USD" />);

    expect(screen.getByText('Conversion Calculator')).toBeInTheDocument();
  });

  it('renders sats input field', () => {
    render(<ConversionCalculator currency="USD" />);

    expect(screen.getByTestId('sats-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter sats/i)).toBeInTheDocument();
  });

  it('renders fiat input field', () => {
    render(<ConversionCalculator currency="USD" />);

    expect(screen.getByTestId('fiat-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter amount/i)).toBeInTheDocument();
  });

  it('renders sats to fiat result display', () => {
    render(<ConversionCalculator currency="USD" />);

    expect(screen.getByTestId('sats-to-fiat-result')).toBeInTheDocument();
  });

  it('renders fiat to sats result display', () => {
    render(<ConversionCalculator currency="USD" />);

    expect(screen.getByTestId('fiat-to-sats-result')).toBeInTheDocument();
  });

  it('converts sats to fiat', async () => {
    render(<ConversionCalculator currency="USD" />);

    const input = screen.getByPlaceholderText(/enter sats/i);
    await userEvent.type(input, '100000');

    await waitFor(() => {
      expect(screen.getByTestId('sats-to-fiat-result')).toHaveTextContent(/\$42/);
    });
  });

  it('converts fiat to sats', async () => {
    render(<ConversionCalculator currency="USD" />);

    const input = screen.getByPlaceholderText(/enter amount/i);
    await userEvent.type(input, '100');

    await waitFor(() => {
      expect(screen.getByTestId('fiat-to-sats-result')).toHaveTextContent(/1,000 sats/);
    });
  });

  it('shows placeholder when sats input is empty', () => {
    render(<ConversionCalculator currency="USD" />);

    // Result should show dash when empty
    const result = screen.getByTestId('sats-to-fiat-result');
    expect(result).toHaveTextContent('—');
  });

  it('shows placeholder when fiat input is empty', () => {
    render(<ConversionCalculator currency="USD" />);

    // Result should show dash when empty
    const result = screen.getByTestId('fiat-to-sats-result');
    expect(result).toHaveTextContent('—');
  });

  it('displays currency symbol for USD', () => {
    render(<ConversionCalculator currency="USD" />);

    // USD symbol should be shown
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('displays currency symbol for EUR', () => {
    render(<ConversionCalculator currency="EUR" />);

    // EUR symbol should be shown
    expect(screen.getByText('€')).toBeInTheDocument();
  });

  it('displays currency symbol for GBP', () => {
    render(<ConversionCalculator currency="GBP" />);

    // GBP symbol should be shown
    expect(screen.getByText('£')).toBeInTheDocument();
  });

  it('displays currency symbol for JPY', () => {
    render(<ConversionCalculator currency="JPY" />);

    // JPY symbol should be shown
    expect(screen.getByText('¥')).toBeInTheDocument();
  });

  it('has arrow indicators', () => {
    render(<ConversionCalculator currency="USD" />);

    // Should have conversion arrows
    const arrows = screen.getAllByText('→');
    expect(arrows).toHaveLength(2);
  });
});

describe('QuickReference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders quick reference container', () => {
    render(<QuickReference currency="USD" />);

    expect(screen.getByTestId('quick-reference')).toBeInTheDocument();
  });

  it('renders quick reference title', () => {
    render(<QuickReference currency="USD" />);

    expect(screen.getByText('Quick Reference')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<QuickReference currency="USD" />);

    expect(screen.getByText('Loading conversions...')).toBeInTheDocument();
  });

  it('shows reference amounts', async () => {
    render(<QuickReference currency="USD" />);

    await waitFor(() => {
      expect(screen.getByText(/1 sat/)).toBeInTheDocument();
      expect(screen.getByText(/1K sats/)).toBeInTheDocument();
      expect(screen.getByText(/1M sats/)).toBeInTheDocument();
    });
  });

  it('displays educational note', async () => {
    render(<QuickReference currency="USD" />);

    await waitFor(() => {
      expect(screen.getByText(/Did you know/)).toBeInTheDocument();
      expect(screen.getByText(/satoshi.*smallest unit/i)).toBeInTheDocument();
    });
  });

  it('shows 100,000,000 sats in 1 BTC info', async () => {
    render(<QuickReference currency="USD" />);

    await waitFor(() => {
      expect(screen.getByText(/100,000,000 sats in 1 BTC/)).toBeInTheDocument();
    });
  });

  it('renders reference amounts with data-testid', async () => {
    render(<QuickReference currency="USD" />);

    await waitFor(() => {
      expect(screen.getByTestId('reference-1')).toBeInTheDocument();
      expect(screen.getByTestId('reference-100')).toBeInTheDocument();
      expect(screen.getByTestId('reference-1000')).toBeInTheDocument();
      expect(screen.getByTestId('reference-10000')).toBeInTheDocument();
      expect(screen.getByTestId('reference-100000')).toBeInTheDocument();
      expect(screen.getByTestId('reference-1000000')).toBeInTheDocument();
    });
  });

  it('formats amounts correctly', async () => {
    render(<QuickReference currency="USD" />);

    await waitFor(() => {
      // Check formatted amounts
      expect(screen.getByText('1 sat')).toBeInTheDocument();
      expect(screen.getByText('100 sats')).toBeInTheDocument();
      expect(screen.getByText('1K sats')).toBeInTheDocument();
      expect(screen.getByText('10K sats')).toBeInTheDocument();
      expect(screen.getByText('100K sats')).toBeInTheDocument();
      expect(screen.getByText('1M sats')).toBeInTheDocument();
    });
  });
});

describe('CurrencySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders currency selector container', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByTestId('currency-selector')).toBeInTheDocument();
  });

  it('renders currency settings title', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByText('Currency Settings')).toBeInTheDocument();
  });

  it('renders currency dropdown', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByTestId('currency-dropdown')).toBeInTheDocument();
  });

  it('has display currency label', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByText('Display Currency')).toBeInTheDocument();
  });

  it('renders exchange rate display', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByTestId('exchange-rate-display')).toBeInTheDocument();
  });

  it('displays current exchange rate label', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByText('Current Exchange Rate')).toBeInTheDocument();
  });

  it('renders BTC rate display', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByTestId('btc-rate')).toBeInTheDocument();
  });

  it('renders sat rate display', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByTestId('sat-rate')).toBeInTheDocument();
  });

  it('displays 1 BTC equals text', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByText(/1 BTC =/)).toBeInTheDocument();
  });

  it('displays 1 sat approximately text', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByText(/1 sat ≈/)).toBeInTheDocument();
  });

  it('lists all supported currencies in dropdown', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    const dropdown = screen.getByTestId('currency-dropdown');

    expect(dropdown).toHaveTextContent('USD');
    expect(dropdown).toHaveTextContent('EUR');
    expect(dropdown).toHaveTextContent('GBP');
    expect(dropdown).toHaveTextContent('CAD');
    expect(dropdown).toHaveTextContent('AUD');
    expect(dropdown).toHaveTextContent('JPY');
    expect(dropdown).toHaveTextContent('CHF');
  });

  it('calls onCurrencyChange when currency is selected', async () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    const dropdown = screen.getByTestId('currency-dropdown');
    await userEvent.selectOptions(dropdown, 'EUR');

    expect(mockOnChange).toHaveBeenCalledWith('EUR');
  });

  it('displays currency symbols in options', () => {
    const mockOnChange = vi.fn();
    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    const dropdown = screen.getByTestId('currency-dropdown');

    expect(dropdown).toHaveTextContent('$');
    expect(dropdown).toHaveTextContent('€');
    expect(dropdown).toHaveTextContent('£');
    expect(dropdown).toHaveTextContent('¥');
  });
});

describe('ConversionCalculator edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles zero sats input', async () => {
    render(<ConversionCalculator currency="USD" />);

    const input = screen.getByPlaceholderText(/enter sats/i);
    await userEvent.type(input, '0');

    await waitFor(() => {
      // Should not convert zero or negative
      const result = screen.getByTestId('sats-to-fiat-result');
      expect(result).toHaveTextContent('—');
    });
  });

  it('handles zero fiat input', async () => {
    render(<ConversionCalculator currency="USD" />);

    const input = screen.getByPlaceholderText(/enter amount/i);
    await userEvent.type(input, '0');

    await waitFor(() => {
      // Should not convert zero or negative
      const result = screen.getByTestId('fiat-to-sats-result');
      expect(result).toHaveTextContent('—');
    });
  });

  it('clears result when sats input is cleared', async () => {
    const user = userEvent.setup();
    render(<ConversionCalculator currency="USD" />);

    const input = screen.getByPlaceholderText(/enter sats/i);
    await user.type(input, '1000');

    // Wait for conversion
    await waitFor(() => {
      expect(screen.getByTestId('sats-to-fiat-result')).not.toHaveTextContent('—');
    });

    // Clear the input
    await user.clear(input);

    await waitFor(() => {
      expect(screen.getByTestId('sats-to-fiat-result')).toHaveTextContent('—');
    });
  });
});

describe('CurrencySelector loading state', () => {
  it('shows loading state when fetching rate', async () => {
    vi.clearAllMocks();
    const mockOnChange = vi.fn();

    // Remock useFiatRate for loading state
    const hooks = await import('@/hooks');
    vi.mocked(hooks.useFiatRate).mockReturnValue({
      fiatValue: null,
      formattedFiat: null,
      loading: true,
      error: null,
    });

    render(<CurrencySelector currency="USD" onCurrencyChange={mockOnChange} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
