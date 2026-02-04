/**
 * Layout Component Tests
 * Spec: 05-layout.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

// Mock the Sidebar component to isolate Layout tests
vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <aside data-testid="mock-sidebar" data-open={open}>
      <button onClick={onClose} data-testid="mock-sidebar-close">
        Close
      </button>
    </aside>
  ),
}));

const renderWithRouter = (children: React.ReactNode) => {
  return render(<BrowserRouter>{children}</BrowserRouter>);
};

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders children', () => {
      renderWithRouter(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders the header with Lightning Demo title', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      expect(screen.getByText('Lightning Demo')).toBeInTheDocument();
    });

    it('shows Testnet badge', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      expect(screen.getByTestId('testnet-badge')).toBeInTheDocument();
      expect(screen.getByText('Testnet')).toBeInTheDocument();
    });

    it('shows mobile menu button', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });

    it('renders Sidebar component', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    });

    it('renders main content area', () => {
      renderWithRouter(
        <Layout>
          <div data-testid="main-content">Main Content</div>
        </Layout>
      );
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Mobile Menu Interactions', () => {
    it('opens sidebar when mobile menu button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const menuButton = screen.getByTestId('mobile-menu-button');
      const sidebar = screen.getByTestId('mock-sidebar');

      // Initially sidebar should be closed
      expect(sidebar).toHaveAttribute('data-open', 'false');

      // Click to open
      await user.click(menuButton);
      expect(sidebar).toHaveAttribute('data-open', 'true');
    });

    it('closes sidebar when close callback is triggered', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const menuButton = screen.getByTestId('mobile-menu-button');
      const sidebar = screen.getByTestId('mock-sidebar');

      // Open the sidebar first
      await user.click(menuButton);
      expect(sidebar).toHaveAttribute('data-open', 'true');

      // Close via the sidebar's close button
      const closeButton = screen.getByTestId('mock-sidebar-close');
      await user.click(closeButton);
      expect(sidebar).toHaveAttribute('data-open', 'false');
    });

    it('sidebar starts closed by default', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      const sidebar = screen.getByTestId('mock-sidebar');
      expect(sidebar).toHaveAttribute('data-open', 'false');
    });
  });

  describe('Styling and Structure', () => {
    it('has min-h-screen class on container', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      // The container div should have min-h-screen for full height
      const container = screen.getByText('Content').closest('.min-h-screen');
      expect(container).toBeInTheDocument();
    });

    it('has proper background color class', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      const container = screen.getByText('Content').closest('.bg-slate-50');
      expect(container).toBeInTheDocument();
    });

    it('renders main element for content', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('renders header element for mobile', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('mobile menu button has accessible label', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      const menuButton = screen.getByRole('button', { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it('Testnet badge is visually identifiable', () => {
      renderWithRouter(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      const badge = screen.getByTestId('testnet-badge');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  describe('Multiple Children', () => {
    it('renders multiple children correctly', () => {
      renderWithRouter(
        <Layout>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </Layout>
      );
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('renders complex nested children', () => {
      renderWithRouter(
        <Layout>
          <div className="parent">
            <h1>Title</h1>
            <p>Paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </Layout>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
});
