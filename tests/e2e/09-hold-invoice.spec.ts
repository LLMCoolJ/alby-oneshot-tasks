import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Hold Invoice (Escrow) Page
 * Spec: 09-scenario-4-hold-invoice.md
 * Page URL: /hold-invoice
 *
 * Tests UI elements and page structure. Cannot test actual hold invoice
 * operations without real wallet connections.
 */

test.describe('Hold Invoice (Escrow) Page', () => {
  test.describe('Page Structure', () => {
    test('displays page title and description', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Verify scenario page structure
      const scenarioPage = page.getByTestId('scenario-page');
      await expect(scenarioPage).toBeVisible();

      // Verify title
      const title = page.getByTestId('scenario-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Hold Invoice (Escrow)');

      // Verify description
      const description = page.getByTestId('scenario-description');
      await expect(description).toBeVisible();
      await expect(description).toContainText('Conditional payments');
      await expect(description).toContainText('hold invoices');

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays Alice and Bob wallet cards', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

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

      await page.goto('/hold-invoice');

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Capture initial page state
      await page.screenshot({
        path: 'tests/e2e/screenshots/09-hold-invoice-initial.png',
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

      await page.goto('/hold-invoice');

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

      await page.goto('/hold-invoice');

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

      await page.goto('/hold-invoice');

      // Type into Bob's NWC input
      const bobNwcInput = page.getByTestId('nwc-url-input-bob');
      await bobNwcInput.fill('nostr+walletconnect://test');

      // Connect button should now be enabled
      const bobConnectButton = page.getByTestId('connect-button-bob');
      await expect(bobConnectButton).toBeEnabled();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Components Not Visible When Disconnected', () => {
    test('does not show create hold invoice form when Bob is disconnected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Create hold invoice form should NOT be visible when disconnected
      const createForm = page.getByTestId('create-hold-invoice-form');
      await expect(createForm).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('does not show pay hold invoice component when Alice is disconnected', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Pay hold invoice should NOT be visible when disconnected
      const payComponent = page.getByTestId('pay-hold-invoice');
      await expect(payComponent).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Transaction Log', () => {
    test('displays transaction log section', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

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

  test.describe('How Hold Invoices Work Section', () => {
    test('displays explainer section with three steps', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Verify explainer section exists
      await expect(page.getByText('How Hold Invoices Work')).toBeVisible();

      // Verify the three steps
      await expect(page.getByText('1. Create')).toBeVisible();
      await expect(page.getByText('2. Hold')).toBeVisible();
      await expect(page.getByText('3. Settle/Cancel')).toBeVisible();

      // Verify descriptions
      await expect(page.getByText(/preimage and its hash/i)).toBeVisible();
      await expect(page.getByText(/funds are locked/i)).toBeVisible();
      await expect(page.getByText(/reveals preimage to receive/i)).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('captures explainer section screenshot', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Capture screenshot focused on the explainer section
      await page.screenshot({
        path: 'tests/e2e/screenshots/09-hold-invoice-explainer.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Page Layout', () => {
    test('captures page layout screenshot', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Capture desktop layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/09-hold-invoice-layout.png',
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
      await page.goto('/hold-invoice');

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

      await page.goto('/hold-invoice');

      // Both wallet cards should be visible
      const aliceCard = page.getByTestId('wallet-card-alice');
      const bobCard = page.getByTestId('wallet-card-bob');

      await expect(aliceCard).toBeVisible();
      await expect(bobCard).toBeVisible();

      // Capture mobile layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/09-hold-invoice-mobile.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('explainer section is responsive on mobile', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // All three steps should still be visible on mobile
      await expect(page.getByText('1. Create')).toBeVisible();
      await expect(page.getByText('2. Hold')).toBeVisible();
      await expect(page.getByText('3. Settle/Cancel')).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to hold invoice page from sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Start at home (redirects to simple-payment)
      await page.goto('/');

      // Click on Hold Invoice link in sidebar (scenario 4)
      const scenarioLink = page.getByTestId('scenario-link-4');
      await scenarioLink.click();

      // Should navigate to hold-invoice
      await expect(page).toHaveURL('/hold-invoice');

      // Verify correct page loaded
      const title = page.getByTestId('scenario-title');
      await expect(title).toHaveText('Hold Invoice (Escrow)');

      expect(consoleErrors).toHaveLength(0);
    });

    test('scenario link is highlighted in sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Fourth scenario link should be active
      const scenarioLink = page.getByTestId('scenario-link-4');
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

      await page.goto('/hold-invoice');

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

    test('displays hold invoice specific content', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/hold-invoice');

      // Verify hold invoice specific terminology
      await expect(page.getByText(/escrow/i)).toBeVisible();
      // Use first() since "preimage" appears multiple times in the explainer
      await expect(page.getByText(/preimage/i).first()).toBeVisible();
      await expect(page.getByText(/settles or cancels/i)).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });
});
