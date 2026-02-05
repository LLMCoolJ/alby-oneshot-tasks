import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Transaction History Page
 * Spec: 11-scenario-6-transaction-history.md
 * Page URL: /transaction-history
 *
 * Tests UI elements and page structure. Cannot test actual transaction
 * loading without real wallet connections.
 */

test.describe('Transaction History Page', () => {
  test.describe('Page Structure', () => {
    test('displays page title and description', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/transaction-history');

      // Verify scenario page structure
      const scenarioPage = page.getByTestId('scenario-page');
      await expect(scenarioPage).toBeVisible();

      // Verify title
      const title = page.getByTestId('scenario-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Transaction History');

      // Verify description
      const description = page.getByTestId('scenario-description');
      await expect(description).toBeVisible();
      await expect(description).toContainText('transaction history');

      // Capture screenshot
      await page.screenshot({
        path: 'tests/e2e/screenshots/11-transaction-history-title.png',
        fullPage: false,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays Alice and Bob wallet cards', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/transaction-history');

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

      await page.goto('/transaction-history');

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Capture initial page state
      await page.screenshot({
        path: 'tests/e2e/screenshots/11-transaction-history-initial.png',
        fullPage: true,
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

      await page.goto('/transaction-history');

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

      await page.goto('/transaction-history');

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

      await page.goto('/transaction-history');

      // Type into Alice's NWC input
      const aliceNwcInput = page.getByTestId('nwc-url-input-alice');
      await aliceNwcInput.fill('nostr+walletconnect://test');

      // Connect button should now be enabled
      const aliceConnectButton = page.getByTestId('connect-button-alice');
      await expect(aliceConnectButton).toBeEnabled();

      // Capture screenshot showing enabled state
      await page.screenshot({
        path: 'tests/e2e/screenshots/11-transaction-history-connect-enabled.png',
        fullPage: false,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Transaction List Not Visible When Disconnected', () => {
    test('does not show transaction list for Alice when not connected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/transaction-history');

      // Transaction list should NOT be visible when disconnected
      const transactionList = page.getByTestId('transaction-list-alice');
      await expect(transactionList).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('does not show transaction list for Bob when not connected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/transaction-history');

      // Transaction list should NOT be visible when disconnected
      const transactionList = page.getByTestId('transaction-list-bob');
      await expect(transactionList).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Transaction Log', () => {
    test('displays transaction log section', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/transaction-history');

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

      await page.goto('/transaction-history');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Capture desktop layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/11-transaction-history-layout.png',
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
      await page.goto('/transaction-history');

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

      await page.goto('/transaction-history');

      // Both wallet cards should be visible
      const aliceCard = page.getByTestId('wallet-card-alice');
      const bobCard = page.getByTestId('wallet-card-bob');

      await expect(aliceCard).toBeVisible();
      await expect(bobCard).toBeVisible();

      // Capture mobile layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/11-transaction-history-mobile.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to transaction history page from sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Start at home (redirects to simple-payment)
      await page.goto('/');

      // Click on Transaction History link in sidebar (scenario 6)
      const scenarioLink = page.getByTestId('scenario-link-6');
      await scenarioLink.click();

      // Should navigate to transaction-history
      await expect(page).toHaveURL('/transaction-history');

      // Verify correct page loaded
      const title = page.getByTestId('scenario-title');
      await expect(title).toHaveText('Transaction History');

      expect(consoleErrors).toHaveLength(0);
    });

    test('scenario link is highlighted in sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/transaction-history');

      // Sixth scenario link should be active
      const scenarioLink = page.getByTestId('scenario-link-6');
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

      await page.goto('/transaction-history');

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

    test('displays transaction history specific content', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/transaction-history');

      // Verify transaction history specific content
      await expect(page.getByText('Transaction History')).toBeVisible();
      await expect(page.getByText(/filter/i)).toBeVisible();

      // Capture final page state
      await page.screenshot({
        path: 'tests/e2e/screenshots/11-transaction-history-content.png',
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

      await page.goto('/transaction-history');

      // NWC input should have proper labeling
      const aliceNwcInput = page.getByTestId('nwc-url-input-alice');
      await expect(aliceNwcInput).toHaveAttribute('placeholder');

      // Connect buttons should have accessible text
      const aliceConnectButton = page.getByTestId('connect-button-alice');
      await expect(aliceConnectButton).toHaveText('Connect Wallet');

      expect(consoleErrors).toHaveLength(0);
    });
  });
});
