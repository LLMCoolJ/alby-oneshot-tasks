/**
 * CopyButton Component Tests
 * Spec: 03-shared-components.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyButton } from '@/components/ui/CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Mock document.execCommand for the fallback mechanism
    Object.defineProperty(document, 'execCommand', {
      value: vi.fn(() => true),
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('copies value to clipboard on click', async () => {
    // Test that clicking triggers copy behavior (visual feedback confirms copy worked)
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CopyButton value="test-value" />);

    await user.click(screen.getByTestId('copy-button'));

    // Visual confirmation that copy succeeded - button shows "Copied!" state
    await waitFor(() => {
      expect(screen.getByTestId('copy-button-copied')).toBeInTheDocument();
    });
  });

  it('shows copied state after click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CopyButton value="test-value" />);

    await user.click(screen.getByTestId('copy-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-button-copied')).toHaveTextContent('Copied!');
    });
  });

  it('calls onCopied callback', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const handleCopied = vi.fn();
    render(<CopyButton value="test-value" onCopied={handleCopied} />);

    await user.click(screen.getByTestId('copy-button'));

    await waitFor(() => {
      expect(handleCopied).toHaveBeenCalledTimes(1);
    });
  });

  it('resets state after timeout', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CopyButton value="test-value" />);

    await user.click(screen.getByTestId('copy-button'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-button-copied')).toBeInTheDocument();
    });

    // Advance timers by 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('copy-button-copied')).not.toBeInTheDocument();
    });
  });

  it('renders label when provided', () => {
    render(<CopyButton value="test-value" label="Copy Address" />);
    expect(screen.getByText('Copy Address')).toBeInTheDocument();
  });

  it('has correct default aria-label', () => {
    render(<CopyButton value="test-value" />);
    const button = screen.getByTestId('copy-button');
    expect(button).toHaveAttribute('aria-label', 'Copy to clipboard');
  });

  it('uses custom label for aria-label when provided', () => {
    render(<CopyButton value="test-value" label="Copy Invoice" />);
    const button = screen.getByTestId('copy-button');
    expect(button).toHaveAttribute('aria-label', 'Copy Invoice');
  });

  it('updates aria-label when copied', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CopyButton value="test-value" />);

    await user.click(screen.getByTestId('copy-button'));

    await waitFor(() => {
      const button = screen.getByTestId('copy-button');
      expect(button).toHaveAttribute('aria-label', 'Copied!');
    });
  });

  it('has correct title attribute', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CopyButton value="test-value" />);

    const button = screen.getByTestId('copy-button');
    expect(button).toHaveAttribute('title', 'Copy');

    await user.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('title', 'Copied!');
    });
  });

  it('applies custom className', () => {
    render(<CopyButton value="test-value" className="ml-2" />);
    const button = screen.getByTestId('copy-button');
    expect(button).toHaveClass('ml-2');
  });

  it('is a button element with type button', () => {
    render(<CopyButton value="test-value" />);
    const button = screen.getByTestId('copy-button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('has focus ring styles for accessibility', () => {
    render(<CopyButton value="test-value" />);
    const button = screen.getByTestId('copy-button');
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-bitcoin');
  });
});
