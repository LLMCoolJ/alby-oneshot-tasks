/**
 * Card Component Tests
 * Spec: 03-shared-components.md
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Card Title">Content</Card>);
    expect(screen.getByTestId('card-title')).toHaveTextContent('Card Title');
  });

  it('renders subtitle when provided', () => {
    render(<Card subtitle="Card subtitle">Content</Card>);
    expect(screen.getByTestId('card-subtitle')).toHaveTextContent('Card subtitle');
  });

  it('renders header action', () => {
    render(
      <Card headerAction={<button>Action</button>}>
        Content
      </Card>
    );
    expect(screen.getByTestId('card-header-action')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Card footer={<div>Footer content</div>}>Content</Card>);
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
  });

  it('applies base styles', () => {
    render(<Card>Content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('shadow-sm');
    expect(card).toHaveClass('rounded-xl');
  });

  it('does not render header when no header props provided', () => {
    render(<Card>Content</Card>);
    expect(screen.queryByTestId('card-header')).not.toBeInTheDocument();
  });

  it('renders header when only headerAction is provided', () => {
    render(<Card headerAction={<button>Action</button>}>Content</Card>);
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
  });

  it('applies padding classes based on padding prop', () => {
    const { rerender } = render(<Card padding="none">Content</Card>);
    let content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-0');

    rerender(<Card padding="sm">Content</Card>);
    content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-3');

    rerender(<Card padding="md">Content</Card>);
    content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-4');

    rerender(<Card padding="lg">Content</Card>);
    content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-6');
  });

  it('defaults to medium padding', () => {
    render(<Card>Content</Card>);
    const content = screen.getByTestId('card-content');
    expect(content).toHaveClass('p-4');
  });

  it('renders title and subtitle together', () => {
    render(
      <Card title="Title" subtitle="Subtitle">
        Content
      </Card>
    );
    expect(screen.getByTestId('card-title')).toHaveTextContent('Title');
    expect(screen.getByTestId('card-subtitle')).toHaveTextContent('Subtitle');
  });

  it('renders complete card with all props', () => {
    render(
      <Card
        title="Full Card"
        subtitle="Complete example"
        headerAction={<button>Edit</button>}
        footer={<span>Footer</span>}
        className="w-96"
        padding="lg"
      >
        Main content
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveClass('w-96');
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByTestId('card-subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('card-header-action')).toBeInTheDocument();
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toHaveClass('p-6');
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });
});
