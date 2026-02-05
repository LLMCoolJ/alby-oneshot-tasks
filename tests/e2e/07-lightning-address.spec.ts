import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Lightning Address Payment
 * Spec: 07-scenario-2-lightning-address.md
 * Page URL: /lightning-address
 *
 * Tests UI elements and page structure. Cannot test actual payments
 * without real wallet connections.
 */

test.describe('Lightning Address Payment Page', () => {
  test.describe('Page Structure', () => {
    test('displays page title and description', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/lightning-address');

      // Verify scenario page structure
      const scenarioPage = page.getByTestId('scenario-page');
      await expect(scenarioPage).toBeVisible();

      // Verify title
      const title = page.getByTestId('scenario-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Lightning Address Payment');

      // Verify description
      const description = page.getByTestId('scenario-description');
      await expect(description).toBeVisible();
      await expect(description).toContainText('Pay to a Lightning Address');
      await expect(description).toContainText('invoice creation automatically');

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays Alice and Bob wallet cards', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/lightning-address');

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

      await page.goto('/lightning-address');

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Capture initial page state
      await page.screenshot({
        path: 'tests/e2e/screenshots/07-lightning-address-initial.png',
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

      await page.goto('/lightning-address');

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

      await page.goto('/lightning-address');

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

      await page.goto('/lightning-address');

      // Type into Alice's NWC input
      const aliceNwcInput = page.getByTestId('nwc-url-input-alice');
      await aliceNwcInput.fill('nostr+walletconnect://test');

      // Connect button should now be enabled
      const aliceConnectButton = page.getByTestId('connect-button-alice');
      await expect(aliceConnectButton).toBeEnabled();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Forms Not Visible When Disconnected', () => {
    test('does not show lightning address display when Bob is disconnected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/lightning-address');

      // Lightning address display should NOT be visible when disconnected
      // The component is rendered conditionally based on bobWallet.status === 'connected'
      const lightningAddressDisplay = page.locator('text=My Lightning Address');
      await expect(lightningAddressDisplay).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('does not show pay to address form when Alice is disconnected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/lightning-address');

      // Pay to address form should NOT be visible when disconnected
      const payToAddressForm = page.getByTestId('pay-to-address-form');
      await expect(payToAddressForm).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Transaction Log', () => {
    test('displays transaction log section', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/lightning-address');

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

      await page.goto('/lightning-address');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Capture desktop layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/07-lightning-address-layout.png',
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
      await page.goto('/lightning-address');

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

      await page.goto('/lightning-address');

      // Both wallet cards should be visible
      const aliceCard = page.getByTestId('wallet-card-alice');
      const bobCard = page.getByTestId('wallet-card-bob');

      await expect(aliceCard).toBeVisible();
      await expect(bobCard).toBeVisible();

      // On mobile, cards should be stacked (grid with single column)
      // Capture mobile layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/07-lightning-address-mobile.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to lightning-address page from sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Start at home (redirects to simple-payment)
      await page.goto('/');

      // Click on Lightning Address link in sidebar
      const scenarioLink = page.getByTestId('scenario-link-2');
      await scenarioLink.click();

      // Should navigate to lightning-address
      await expect(page).toHaveURL('/lightning-address');

      // Verify correct page loaded
      const title = page.getByTestId('scenario-title');
      await expect(title).toHaveText('Lightning Address Payment');

      expect(consoleErrors).toHaveLength(0);
    });

    test('scenario link is highlighted in sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/lightning-address');

      // Second scenario link should be active
      const scenarioLink = page.getByTestId('scenario-link-2');
      await expect(scenarioLink).toBeVisible();
      await expect(scenarioLink).toHaveClass(/bg-bitcoin/);

      expect(consoleErrors).toHaveLength(0);
    });
  });
});
