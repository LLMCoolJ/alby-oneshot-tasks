import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Fiat Conversion Page
 * Spec: 13-scenario-8-fiat-conversion.md
 * Page URL: /fiat-conversion
 *
 * Tests UI elements and page structure. Cannot test actual fiat conversion
 * functionality without real API calls.
 */

test.describe('Fiat Conversion Page', () => {
  test.describe('Page Structure', () => {
    test('displays page title and description', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify scenario page structure
      const scenarioPage = page.getByTestId('scenario-page');
      await expect(scenarioPage).toBeVisible();

      // Verify title
      const title = page.getByTestId('scenario-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Fiat Conversion');

      // Verify description
      const description = page.getByTestId('scenario-description');
      await expect(description).toBeVisible();
      await expect(description).toContainText('fiat');

      // Capture screenshot
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-title.png',
        fullPage: false,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays Alice and Bob wallet cards', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify Alice's wallet card
      const aliceCard = page.getByTestId('wallet-card-alice');
      await expect(aliceCard).toBeVisible();
      await expect(aliceCard).toContainText("Alice's Wallet");

      // Verify Bob's wallet card
      const bobCard = page.getByTestId('wallet-card-bob');
      await expect(bobCard).toBeVisible();
      await expect(bobCard).toContainText("Bob's Wallet");

      expect(consoleErrors).toHaveLength(0);
    });

    test('captures initial page state screenshot', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Capture initial page state
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-initial.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Currency Settings Section', () => {
    test('displays currency selector component', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify currency selector is visible
      const currencySelector = page.getByTestId('currency-selector');
      await expect(currencySelector).toBeVisible();

      // Verify settings title
      await expect(page.getByText('Currency Settings')).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays currency dropdown', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify currency dropdown
      const dropdown = page.getByTestId('currency-dropdown');
      await expect(dropdown).toBeVisible();

      // Verify display currency label
      await expect(page.getByText('Display Currency')).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('currency dropdown has all supported currencies', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      const dropdown = page.getByTestId('currency-dropdown');
      await expect(dropdown).toBeVisible();

      // Verify all currency options are present
      await expect(dropdown.locator('option[value="USD"]')).toHaveCount(1);
      await expect(dropdown.locator('option[value="EUR"]')).toHaveCount(1);
      await expect(dropdown.locator('option[value="GBP"]')).toHaveCount(1);
      await expect(dropdown.locator('option[value="CAD"]')).toHaveCount(1);
      await expect(dropdown.locator('option[value="AUD"]')).toHaveCount(1);
      await expect(dropdown.locator('option[value="JPY"]')).toHaveCount(1);
      await expect(dropdown.locator('option[value="CHF"]')).toHaveCount(1);

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays exchange rate information', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify exchange rate display
      const exchangeRate = page.getByTestId('exchange-rate-display');
      await expect(exchangeRate).toBeVisible();

      // Verify rate label
      await expect(page.getByText('Current Exchange Rate')).toBeVisible();

      // Capture screenshot
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-currency-settings.png',
        fullPage: false,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('can change currency selection', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Select different currency
      const dropdown = page.getByTestId('currency-dropdown');
      await dropdown.selectOption('EUR');

      // Verify selection changed
      await expect(dropdown).toHaveValue('EUR');

      // Select another currency
      await dropdown.selectOption('GBP');
      await expect(dropdown).toHaveValue('GBP');

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Quick Reference Section', () => {
    test('displays quick reference component', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify quick reference is visible
      const quickReference = page.getByTestId('quick-reference');
      await expect(quickReference).toBeVisible();

      // Verify title
      await expect(page.getByText('Quick Reference')).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays educational note about satoshis', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Verify educational note
      await expect(page.getByText(/Did you know/)).toBeVisible();
      await expect(page.getByText(/satoshi.*smallest unit/i)).toBeVisible();
      await expect(page.getByText(/100,000,000 sats in 1 BTC/)).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays reference amounts for common values', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Wait for conversions to load
      await page.waitForLoadState('networkidle');

      // Verify reference amounts are displayed (may show loading first)
      await expect(page.getByTestId('quick-reference')).toBeVisible();

      // Capture screenshot of quick reference
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-quick-reference.png',
        fullPage: false,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Wallet Connect Prompts (Disconnected State)', () => {
    test('shows wallet connect form for Alice when not connected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Alice's wallet should show connect form
      const aliceConnect = page.getByTestId('wallet-connect-alice');
      await expect(aliceConnect).toBeVisible();

      // NWC URL input should be present
      const aliceNwcInput = page.getByTestId('nwc-url-input-alice');
      await expect(aliceNwcInput).toBeVisible();

      // Connect button should be present
      const aliceConnectButton = page.getByTestId('connect-button-alice');
      await expect(aliceConnectButton).toBeVisible();
      await expect(aliceConnectButton).toHaveText('Connect Wallet');

      // Connect button should be disabled when no URL entered
      await expect(aliceConnectButton).toBeDisabled();

      expect(consoleErrors).toHaveLength(0);
    });

    test('shows wallet connect form for Bob when not connected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Bob's wallet should show connect form
      const bobConnect = page.getByTestId('wallet-connect-bob');
      await expect(bobConnect).toBeVisible();

      // NWC URL input should be present
      const bobNwcInput = page.getByTestId('nwc-url-input-bob');
      await expect(bobNwcInput).toBeVisible();

      // Connect button should be present
      const bobConnectButton = page.getByTestId('connect-button-bob');
      await expect(bobConnectButton).toBeVisible();
      await expect(bobConnectButton).toHaveText('Connect Wallet');

      // Connect button should be disabled when no URL entered
      await expect(bobConnectButton).toBeDisabled();

      expect(consoleErrors).toHaveLength(0);
    });

    test('enables connect button when NWC URL is entered', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Type into Alice's NWC input
      const aliceNwcInput = page.getByTestId('nwc-url-input-alice');
      await aliceNwcInput.fill('nostr+walletconnect://test');

      // Connect button should now be enabled
      const aliceConnectButton = page.getByTestId('connect-button-alice');
      await expect(aliceConnectButton).toBeEnabled();

      // Capture screenshot showing enabled state
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-connect-enabled.png',
        fullPage: false,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Conversion Calculator Not Visible When Disconnected', () => {
    test('does not show conversion calculator for Alice when not connected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Conversion calculator should NOT be visible when disconnected
      // (it's inside aliceContent which requires connected status)
      const aliceCard = page.getByTestId('wallet-card-alice');
      const calculator = aliceCard.getByTestId('conversion-calculator');
      await expect(calculator).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Transaction Log', () => {
    test('displays transaction log section', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Transaction log should be visible
      const transactionLog = page.getByTestId('transaction-log');
      await expect(transactionLog).toBeVisible();

      // Log should show empty state initially
      const emptyState = page.getByTestId('transaction-log-empty');
      await expect(emptyState).toBeVisible();
      await expect(emptyState).toContainText('No events yet');

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Page Layout', () => {
    test('captures page layout screenshot', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Capture desktop layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-layout.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('wallet cards are displayed in grid layout on desktop', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Use desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/fiat-conversion');

      // Both wallet cards should be visible
      const aliceCard = page.getByTestId('wallet-card-alice');
      const bobCard = page.getByTestId('wallet-card-bob');

      await expect(aliceCard).toBeVisible();
      await expect(bobCard).toBeVisible();

      // Verify they are in a grid layout (should have lg:grid-cols-2)
      const walletGrid = page.locator('.grid.lg\\:grid-cols-2');
      await expect(walletGrid).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Mobile Responsive', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE viewport

    test('displays wallet cards stacked on mobile', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Both wallet cards should be visible
      const aliceCard = page.getByTestId('wallet-card-alice');
      const bobCard = page.getByTestId('wallet-card-bob');

      await expect(aliceCard).toBeVisible();
      await expect(bobCard).toBeVisible();

      // Capture mobile layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-mobile.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to fiat conversion page from sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Start at home (redirects to simple-payment)
      await page.goto('/');

      // Click on Fiat Conversion link in sidebar (scenario 8)
      const scenarioLink = page.getByTestId('scenario-link-8');
      await scenarioLink.click();

      // Should navigate to fiat-conversion
      await expect(page).toHaveURL('/fiat-conversion');

      // Verify correct page loaded
      const title = page.getByTestId('scenario-title');
      await expect(title).toHaveText('Fiat Conversion');

      expect(consoleErrors).toHaveLength(0);
    });

    test('scenario link is highlighted in sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Eighth scenario link should be active
      const scenarioLink = page.getByTestId('scenario-link-8');
      await expect(scenarioLink).toBeVisible();
      await expect(scenarioLink).toHaveClass(/bg-bitcoin/);

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Page Content Verification', () => {
    test('has correct page structure', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify the main layout structure
      const mainContent = page.locator('main');
      await expect(mainContent).toBeVisible();

      // Verify sidebar exists
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toBeVisible();

      // Verify wallet section header content
      await expect(page.getByText("Alice's Wallet")).toBeVisible();
      await expect(page.getByText("Bob's Wallet")).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays fiat conversion specific content', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Verify fiat conversion specific content
      await expect(page.getByText('Fiat Conversion')).toBeVisible();
      await expect(page.getByText('Current Exchange Rate')).toBeVisible();

      // Capture final page state
      await page.screenshot({
        path: 'tests/e2e/screenshots/13-fiat-conversion-content.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Accessibility', () => {
    test('has accessible form controls', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // NWC input should have proper labeling
      const aliceNwcInput = page.getByTestId('nwc-url-input-alice');
      await expect(aliceNwcInput).toHaveAttribute('placeholder');

      // Connect buttons should have accessible text
      const aliceConnectButton = page.getByTestId('connect-button-alice');
      await expect(aliceConnectButton).toHaveText('Connect Wallet');

      // Currency dropdown should be accessible
      const currencyDropdown = page.getByTestId('currency-dropdown');
      await expect(currencyDropdown).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('currency selector has proper label', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/fiat-conversion');

      // Currency selector should have a label
      await expect(page.getByText('Display Currency')).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });
});
