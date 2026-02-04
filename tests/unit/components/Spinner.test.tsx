/**
 * Spinner Component Tests
 * Spec: 03-shared-components.md
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/ui/Spinner';

describe('Spinner', () => {
  it('renders with spin animation', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('has accessible role', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('has screen reader text', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Spinner size="sm" />);
    let spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-4');
    expect(spinner).toHaveClass('h-4');

    rerender(<Spinner size="md" />);
    spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-6');
    expect(spinner).toHaveClass('h-6');

    rerender(<Spinner size="lg" />);
    spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-8');
    expect(spinner).toHaveClass('h-8');
  });

  it('defaults to medium size', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('w-6');
    expect(spinner).toHaveClass('h-6');
  });

  it('applies custom className', () => {
    render(<Spinner className="text-white" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('text-white');
  });

  it('has bitcoin border color', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('border-bitcoin');
  });

  it('has transparent segment for animation effect', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('border-t-transparent');
  });

  it('respects reduced motion preference', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('motion-reduce:animate-none');
  });

  it('renders as circular element', () => {
    render(<Spinner />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveClass('rounded-full');
  });
});
