import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Layout & Navigation
 * Spec: 05-layout.md
 */

test.describe('Layout & Navigation', () => {
  test.describe('Desktop Layout', () => {
    test('displays sidebar with all 8 scenario links', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Wait for sidebar to be visible
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toBeVisible();

      // Verify all 8 scenario links are present
      const scenarioLinks = [
        { id: 1, name: 'Simple Payment' },
        { id: 2, name: 'Lightning Address' },
        { id: 3, name: 'Notifications' },
        { id: 4, name: 'Hold Invoice' },
        { id: 5, name: 'Proof of Payment' },
        { id: 6, name: 'Transaction History' },
        { id: 7, name: 'Nostr Zap' },
        { id: 8, name: 'Fiat Conversion' },
      ];

      for (const scenario of scenarioLinks) {
        const link = page.getByTestId(`scenario-link-${scenario.id}`);
        await expect(link).toBeVisible();
        await expect(link).toContainText(scenario.name);
      }

      // Capture desktop layout screenshot
      await page.screenshot({
        path: 'tests/e2e/screenshots/05-layout-desktop.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('navigates between scenarios correctly', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Start at home (redirects to simple-payment)
      await page.goto('/');
      await expect(page).toHaveURL('/simple-payment');

      // Navigate to Lightning Address (scenario 2)
      const lightningAddressLink = page.getByTestId('scenario-link-2');
      await lightningAddressLink.click();
      await expect(page).toHaveURL('/lightning-address');

      // Navigate to Fiat Conversion (scenario 8)
      const fiatConversionLink = page.getByTestId('scenario-link-8');
      await fiatConversionLink.click();
      await expect(page).toHaveURL('/fiat-conversion');

      // Navigate back to Simple Payment (scenario 1)
      const simplePaymentLink = page.getByTestId('scenario-link-1');
      await simplePaymentLink.click();
      await expect(page).toHaveURL('/simple-payment');

      expect(consoleErrors).toHaveLength(0);
    });

    test('highlights active scenario link', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/simple-payment');

      // First scenario should be active (has active styling)
      const activeLink = page.getByTestId('scenario-link-1');
      await expect(activeLink).toHaveClass(/bg-bitcoin/);

      // Other links should not have active class
      const inactiveLink = page.getByTestId('scenario-link-2');
      await expect(inactiveLink).not.toHaveClass(/bg-bitcoin/);

      expect(consoleErrors).toHaveLength(0);
    });

    test('external links have correct attributes', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Check faucet link
      const faucetLink = page.getByTestId('faucet-link');
      await expect(faucetLink).toBeVisible();
      await expect(faucetLink).toHaveAttribute('target', '_blank');
      await expect(faucetLink).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(faucetLink).toHaveAttribute('href', 'https://faucet.mutinynet.com');

      // Check SDK docs link
      const sdkDocsLink = page.getByTestId('sdk-docs-link');
      await expect(sdkDocsLink).toBeVisible();
      await expect(sdkDocsLink).toHaveAttribute('target', '_blank');
      await expect(sdkDocsLink).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(sdkDocsLink).toHaveAttribute('href', 'https://github.com/getAlby/alby-js-sdk');

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Mobile Layout', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE viewport

    test('shows mobile header with menu button', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Mobile header should be visible
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      await expect(mobileMenuButton).toBeVisible();

      // Testnet badge should be visible in mobile header
      const testnetBadge = page.getByTestId('testnet-badge');
      await expect(testnetBadge).toBeVisible();
      await expect(testnetBadge).toHaveText('Testnet');

      // Sidebar should be hidden initially (translated off-screen)
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/-translate-x-full/);

      // Capture mobile layout with sidebar closed
      await page.screenshot({
        path: 'tests/e2e/screenshots/05-layout-mobile-closed.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('opens sidebar on menu button click', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Click mobile menu button
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      await mobileMenuButton.click();

      // Sidebar should be visible (translated to 0)
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/translate-x-0/);

      // Overlay should be visible
      const overlay = page.getByTestId('sidebar-overlay');
      await expect(overlay).toBeVisible();

      // Capture mobile layout with sidebar open
      await page.screenshot({
        path: 'tests/e2e/screenshots/05-layout-mobile-open.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('closes sidebar on close button click', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Open sidebar
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      await mobileMenuButton.click();

      // Verify sidebar is open
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/translate-x-0/);

      // Wait for sidebar animation to complete (300ms transition)
      await page.waitForTimeout(350);

      // Click close button
      const closeButton = page.getByTestId('sidebar-close-button');
      await closeButton.click({ force: true });

      // Sidebar should be hidden again
      await expect(sidebar).toHaveClass(/-translate-x-full/);

      // Overlay should not be visible
      const overlay = page.getByTestId('sidebar-overlay');
      await expect(overlay).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('closes sidebar on overlay click', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Open sidebar
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      await mobileMenuButton.click();

      // Verify sidebar is open
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/translate-x-0/);

      // Click overlay to close
      const overlay = page.getByTestId('sidebar-overlay');
      await overlay.click();

      // Sidebar should be hidden
      await expect(sidebar).toHaveClass(/-translate-x-full/);

      expect(consoleErrors).toHaveLength(0);
    });

    test('closes sidebar when navigating to a scenario', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Open sidebar
      const mobileMenuButton = page.getByTestId('mobile-menu-button');
      await mobileMenuButton.click();

      // Verify sidebar is open
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toHaveClass(/translate-x-0/);

      // Wait for sidebar animation to complete (300ms transition)
      await page.waitForTimeout(350);

      // Click on a scenario link
      const lightningAddressLink = page.getByTestId('scenario-link-2');
      await lightningAddressLink.click({ force: true });

      // URL should change
      await expect(page).toHaveURL('/lightning-address');

      // Sidebar should be closed
      await expect(sidebar).toHaveClass(/-translate-x-full/);

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('sidebar visibility changes with viewport resize', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Start with desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/');

      // On desktop, sidebar should be visible (lg:translate-x-0)
      const sidebar = page.getByTestId('sidebar');
      const mobileMenuButton = page.getByTestId('mobile-menu-button');

      // Mobile menu button should be hidden on desktop (lg:hidden)
      await expect(mobileMenuButton).not.toBeVisible();

      // Resize to mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Mobile menu button should now be visible
      await expect(mobileMenuButton).toBeVisible();

      // Sidebar should be hidden (off-screen) on mobile
      await expect(sidebar).toHaveClass(/-translate-x-full/);

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Layout Structure', () => {
    test('renders main content area correctly', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/simple-payment');

      // Main content should be rendered
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();

      // Main content should have left padding for sidebar on desktop
      await expect(mainContent).toHaveClass(/lg:pl-64/);

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays Lightning Demo branding in sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/');

      // Logo heading should be visible
      const sidebar = page.getByTestId('sidebar');
      const brandingHeading = sidebar.getByRole('heading', { name: 'Lightning Demo' });
      await expect(brandingHeading).toBeVisible();

      // Tagline should be visible
      const tagline = sidebar.getByText('Alice & Bob Scenarios');
      await expect(tagline).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });
});
