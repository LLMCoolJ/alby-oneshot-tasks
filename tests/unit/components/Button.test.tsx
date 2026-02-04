/**
 * Button Component Tests
 * Spec: 03-shared-components.md
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies primary variant styles by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-bitcoin');
    expect(button).toHaveClass('text-white');
  });

  it('applies correct variant styles', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    let button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-slate-200');
    expect(button).toHaveClass('text-slate-900');

    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-red-600');
    expect(button).toHaveClass('text-white');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByTestId('button');
    expect(button).toHaveClass('bg-transparent');
    expect(button).toHaveClass('text-slate-600');
  });

  it('shows spinner when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByTestId('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);

    await user.click(screen.getByTestId('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders with icon', () => {
    const icon = <span data-testid="custom-icon">Icon</span>;
    render(<Button icon={icon}>With Icon</Button>);

    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByTestId('button');
    expect(button).toHaveClass('py-1.5');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('text-sm');

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByTestId('button');
    expect(button).toHaveClass('py-2');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('text-base');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByTestId('button');
    expect(button).toHaveClass('py-3');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('text-lg');
  });

  it('applies custom className', () => {
    render(<Button className="w-full">Full Width</Button>);
    const button = screen.getByTestId('button');
    expect(button).toHaveClass('w-full');
  });

  it('does not show icon when loading', () => {
    const icon = <span data-testid="custom-icon">Icon</span>;
    render(<Button icon={icon} loading>Loading</Button>);

    expect(screen.queryByTestId('button-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
