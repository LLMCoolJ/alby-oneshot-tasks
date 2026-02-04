/**
 * Input Component Tests
 * Spec: 03-shared-components.md
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByTestId('input-label')).toHaveTextContent('Email');
  });

  it('renders error message when provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByTestId('input-error')).toHaveTextContent('This field is required');
  });

  it('renders hint when no error', () => {
    render(<Input hint="Enter your email address" />);
    expect(screen.getByTestId('input-hint')).toHaveTextContent('Enter your email address');
  });

  it('does not render hint when error is present', () => {
    render(<Input error="Error" hint="Hint text" />);
    expect(screen.queryByTestId('input-hint')).not.toBeInTheDocument();
    expect(screen.getByTestId('input-error')).toBeInTheDocument();
  });

  it('applies error styles when error is set', () => {
    render(<Input error="Error message" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('forwards ref to input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(screen.getByTestId('input'));
  });

  it('handles onChange events', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    await user.type(screen.getByTestId('input'), 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders left addon', () => {
    render(<Input leftAddon={<span>$</span>} />);
    expect(screen.getByTestId('input-left-addon')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders right addon', () => {
    render(<Input rightAddon={<span>sats</span>} />);
    expect(screen.getByTestId('input-right-addon')).toBeInTheDocument();
    expect(screen.getByText('sats')).toBeInTheDocument();
  });

  it('renders both addons', () => {
    render(<Input leftAddon={<span>$</span>} rightAddon={<span>USD</span>} />);
    expect(screen.getByTestId('input-left-addon')).toBeInTheDocument();
    expect(screen.getByTestId('input-right-addon')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Input size="sm" />);
    let input = screen.getByTestId('input');
    expect(input).toHaveClass('py-1.5');
    expect(input).toHaveClass('text-sm');

    rerender(<Input size="md" />);
    input = screen.getByTestId('input');
    expect(input).toHaveClass('py-2');
    expect(input).toHaveClass('text-base');

    rerender(<Input size="lg" />);
    input = screen.getByTestId('input');
    expect(input).toHaveClass('py-3');
    expect(input).toHaveClass('text-lg');
  });

  it('associates label with input via htmlFor', () => {
    render(<Input label="Username" id="username-input" />);
    const label = screen.getByTestId('input-label');
    const input = screen.getByTestId('input');

    expect(label).toHaveAttribute('for', 'username-input');
    expect(input).toHaveAttribute('id', 'username-input');
  });

  it('has aria-describedby pointing to error message', () => {
    render(<Input error="Error" id="test-input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('has aria-describedby pointing to hint when no error', () => {
    render(<Input hint="Helpful hint" id="test-input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-hint');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });
});
