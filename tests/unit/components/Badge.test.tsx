/**
 * Badge Component Tests
 * Spec: 03-shared-components.md
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-slate-100');
    expect(badge).toHaveClass('text-slate-800');
  });

  it('applies correct variant colors', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    let badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');

    rerender(<Badge variant="warning">Warning</Badge>);
    badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');

    rerender(<Badge variant="error">Error</Badge>);
    badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');

    rerender(<Badge variant="info">Info</Badge>);
    badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');

    rerender(<Badge variant="default">Default</Badge>);
    badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-slate-100');
    expect(badge).toHaveClass('text-slate-800');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    let badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('px-2');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('py-0.5');
    expect(badge).toHaveClass('text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('px-3');
    expect(badge).toHaveClass('py-1');
    expect(badge).toHaveClass('text-base');
  });

  it('applies custom className', () => {
    render(<Badge className="ml-2">Custom</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('ml-2');
  });

  it('renders as pill shape (rounded-full)', () => {
    render(<Badge>Pill</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('rounded-full');
  });

  it('renders as inline element', () => {
    render(<Badge>Inline</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('inline-flex');
    expect(badge.tagName).toBe('SPAN');
  });

  it('defaults to medium size', () => {
    render(<Badge>Default Size</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('px-2.5');
    expect(badge).toHaveClass('text-sm');
  });

  it('applies font-medium class', () => {
    render(<Badge>Font</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('font-medium');
  });
});
