/**
 * Sidebar Component Tests
 * Spec: 05-layout.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { SCENARIOS, CONSTANTS } from '@/types';

const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the sidebar element', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('renders Lightning Demo title', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      expect(screen.getByText('Lightning Demo')).toBeInTheDocument();
    });

    it('renders Alice & Bob Scenarios subtitle', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      expect(screen.getByText('Alice & Bob Scenarios')).toBeInTheDocument();
    });

    it('renders close button', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-close-button')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('renders all scenario links', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);

      SCENARIOS.forEach((scenario) => {
        expect(screen.getByText(scenario.name)).toBeInTheDocument();
      });
    });

    it('renders correct number of scenario links (8 scenarios)', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);

      const scenarioLinks = SCENARIOS.map((s) =>
        screen.getByTestId(`scenario-link-${s.id}`)
      );
      expect(scenarioLinks).toHaveLength(8);
    });

    it('each scenario link has correct path', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);

      SCENARIOS.forEach((scenario) => {
        const link = screen.getByTestId(`scenario-link-${scenario.id}`);
        expect(link).toHaveAttribute('href', scenario.path);
      });
    });

    it('renders scenario icons', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);

      SCENARIOS.forEach((scenario) => {
        const link = screen.getByTestId(`scenario-link-${scenario.id}`);
        expect(link).toHaveTextContent(scenario.icon);
      });
    });

    it('Simple Payment scenario links to /simple-payment', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const link = screen.getByText('Simple Payment').closest('a');
      expect(link).toHaveAttribute('href', '/simple-payment');
    });

    it('Lightning Address scenario links to /lightning-address', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const link = screen.getByText('Lightning Address').closest('a');
      expect(link).toHaveAttribute('href', '/lightning-address');
    });
  });

  describe('External Links', () => {
    it('renders faucet link', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      expect(screen.getByText('Get Testnet Sats')).toBeInTheDocument();
      expect(screen.getByTestId('faucet-link')).toBeInTheDocument();
    });

    it('faucet link has correct href', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const faucetLink = screen.getByTestId('faucet-link');
      expect(faucetLink).toHaveAttribute('href', CONSTANTS.MUTINYNET_FAUCET_URL);
    });

    it('faucet link opens in new tab', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const faucetLink = screen.getByTestId('faucet-link');
      expect(faucetLink).toHaveAttribute('target', '_blank');
      expect(faucetLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders SDK docs link', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      expect(screen.getByText('Alby SDK Docs')).toBeInTheDocument();
      expect(screen.getByTestId('sdk-docs-link')).toBeInTheDocument();
    });

    it('SDK docs link has correct href', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sdkLink = screen.getByTestId('sdk-docs-link');
      expect(sdkLink).toHaveAttribute(
        'href',
        'https://github.com/getAlby/alby-js-sdk'
      );
    });

    it('SDK docs link opens in new tab', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sdkLink = screen.getByTestId('sdk-docs-link');
      expect(sdkLink).toHaveAttribute('target', '_blank');
      expect(sdkLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Close Button Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithRouter(<Sidebar open={true} onClose={onClose} />);

      await user.click(screen.getByLabelText('Close menu'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when a scenario link is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithRouter(<Sidebar open={true} onClose={onClose} />);

      await user.click(screen.getByText('Simple Payment'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when any navigation link is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithRouter(<Sidebar open={true} onClose={onClose} />);

      await user.click(screen.getByText('Nostr Zap'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mobile Overlay', () => {
    it('shows overlay when open', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
    });

    it('does not show overlay when closed', () => {
      renderWithRouter(<Sidebar open={false} onClose={() => {}} />);
      expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
    });

    it('clicking overlay calls onClose', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      renderWithRouter(<Sidebar open={true} onClose={onClose} />);

      await user.click(screen.getByTestId('sidebar-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('overlay has aria-hidden attribute', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const overlay = screen.getByTestId('sidebar-overlay');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Open/Closed State', () => {
    it('sidebar is visible when open is true', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('sidebar is hidden when open is false', () => {
      renderWithRouter(<Sidebar open={false} onClose={() => {}} />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('sidebar has transition classes for animation', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('transform', 'transition-transform', 'duration-300');
    });
  });

  describe('Active Route Highlighting', () => {
    it('highlights the active route (simple-payment)', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />, {
        initialEntries: ['/simple-payment'],
      });
      const simplePaymentLink = screen.getByTestId('scenario-link-1');
      expect(simplePaymentLink).toHaveClass('bg-bitcoin/10', 'text-bitcoin');
    });

    it('highlights the active route (fiat-conversion)', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />, {
        initialEntries: ['/fiat-conversion'],
      });
      const fiatConversionLink = screen.getByTestId('scenario-link-8');
      expect(fiatConversionLink).toHaveClass('bg-bitcoin/10', 'text-bitcoin');
    });

    it('inactive routes do not have active styling', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />, {
        initialEntries: ['/simple-payment'],
      });
      const notificationsLink = screen.getByTestId('scenario-link-3');
      expect(notificationsLink).not.toHaveClass('bg-bitcoin/10');
      expect(notificationsLink).toHaveClass('text-slate-600');
    });
  });

  describe('Accessibility', () => {
    it('close button has accessible label', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const closeButton = screen.getByRole('button', { name: /close menu/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('navigation is wrapped in nav element', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const nav = document.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('scenario icons have aria-hidden attribute', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('sidebar has aside element semantics', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const aside = document.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('sidebar has correct width', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('w-64');
    });

    it('sidebar has correct background', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('bg-white');
    });

    it('sidebar has border', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('border-r', 'border-slate-200');
    });

    it('sidebar is fixed positioned', () => {
      renderWithRouter(<Sidebar open={true} onClose={() => {}} />);
      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toHaveClass('fixed', 'inset-y-0', 'left-0');
    });
  });
});
