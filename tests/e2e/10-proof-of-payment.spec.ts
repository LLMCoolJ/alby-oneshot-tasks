import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Proof of Payment Page
 * Spec: 10-scenario-5-proof-of-payment.md
 * Page URL: /proof-of-payment
 *
 * Tests UI elements and page structure. Cannot test actual payment
 * operations without real wallet connections.
 */

test.describe('Proof of Payment Page', () => {
  test.describe('Page Structure', () => {
    test('displays page title and description', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Verify scenario page structure
      const scenarioPage = page.getByTestId('scenario-page');
      await expect(scenarioPage).toBeVisible();

      // Verify title
      const title = page.getByTestId('scenario-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText('Proof of Payment');

      // Verify description
      const description = page.getByTestId('scenario-description');
      await expect(description).toBeVisible();
      await expect(description).toContainText('preimage');
      await expect(description).toContainText('cryptographically proves');

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays Alice and Bob wallet cards', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

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

      await page.goto('/proof-of-payment');

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Capture initial page state
      await page.screenshot({
        path: 'tests/e2e/screenshots/10-proof-of-payment-initial.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Wallet Connect Prompts (Disconnected State)', () => {
    test('shows wallet connect form for Alice when not connected', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

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

    test('shows wallet connect form for Bob when not connected', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

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

      await page.goto('/proof-of-payment');

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
    test('does not show invoice creator when Bob is disconnected', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Invoice creator should NOT be visible when disconnected
      const invoiceCreator = page.getByTestId('invoice-creator');
      await expect(invoiceCreator).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('does not show pay and prove component when Alice is disconnected', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Pay and prove should NOT be visible when disconnected
      const payAndProve = page.getByTestId('pay-and-prove');
      await expect(payAndProve).not.toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Preimage Verifier Section', () => {
    test('displays preimage verifier section', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Preimage verifier should be visible (it's always shown)
      const preimageVerifier = page.getByTestId('preimage-verifier');
      await expect(preimageVerifier).toBeVisible();

      // Section title should be visible
      await expect(page.getByText('Preimage Verification')).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });

    test('displays manual verification form in expandable section', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Click on manual verification summary to expand
      await page.click('text=Verify manually with any invoice/preimage');

      // Manual verification inputs should be visible
      const manualInvoiceInput = page.getByTestId('manual-invoice-input');
      await expect(manualInvoiceInput).toBeVisible();

      const manualPreimageInput = page.getByTestId('manual-preimage-input');
      await expect(manualPreimageInput).toBeVisible();

      const manualVerifyButton = page.getByTestId('manual-verify-button');
      await expect(manualVerifyButton).toBeVisible();
      await expect(manualVerifyButton).toHaveText('Verify Preimage');

      expect(consoleErrors).toHaveLength(0);
    });

    test('captures manual verification form screenshot', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Expand manual verification
      await page.click('text=Verify manually with any invoice/preimage');

      await page.waitForLoadState('networkidle');

      // Capture screenshot
      await page.screenshot({
        path: 'tests/e2e/screenshots/10-proof-of-payment-manual-verify.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Educational Content', () => {
    test('displays "Why This Matters" educational content', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Educational content should be visible
      const educationalContent = page.getByTestId('educational-content');
      await expect(educationalContent).toBeVisible();

      // Verify heading
      await expect(page.getByText('Why This Matters')).toBeVisible();

      // Verify key points
      await expect(
        page.getByText(/preimage is revealed only when payment succeeds/i)
      ).toBeVisible();
      await expect(
        page.getByText(/cryptographically impossible to guess/i)
      ).toBeVisible();
      await expect(
        page.getByText(/anyone can verify the proof/i)
      ).toBeVisible();
      await expect(page.getByText(/atomic swaps, escrow/i)).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Transaction Log', () => {
    test('displays transaction log section', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

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

      await page.goto('/proof-of-payment');

      // Wait for page to fully load
      await page.waitForLoadState('networkidle');

      // Capture desktop layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/10-proof-of-payment-layout.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('wallet cards are displayed in grid layout on desktop', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Use desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/proof-of-payment');

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

      await page.goto('/proof-of-payment');

      // Both wallet cards should be visible
      const aliceCard = page.getByTestId('wallet-card-alice');
      const bobCard = page.getByTestId('wallet-card-bob');

      await expect(aliceCard).toBeVisible();
      await expect(bobCard).toBeVisible();

      // Capture mobile layout
      await page.screenshot({
        path: 'tests/e2e/screenshots/10-proof-of-payment-mobile.png',
        fullPage: true,
      });

      expect(consoleErrors).toHaveLength(0);
    });

    test('preimage verifier section is responsive on mobile', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Preimage verifier should be visible on mobile
      const preimageVerifier = page.getByTestId('preimage-verifier');
      await expect(preimageVerifier).toBeVisible();

      // Educational content should be visible
      await expect(page.getByText('Why This Matters')).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('Navigation', () => {
    test('can navigate to proof of payment page from sidebar', async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      // Start at home (redirects to simple-payment)
      await page.goto('/');

      // Click on Proof of Payment link in sidebar (scenario 5)
      const scenarioLink = page.getByTestId('scenario-link-5');
      await scenarioLink.click();

      // Should navigate to proof-of-payment
      await expect(page).toHaveURL('/proof-of-payment');

      // Verify correct page loaded
      const title = page.getByTestId('scenario-title');
      await expect(title).toHaveText('Proof of Payment');

      expect(consoleErrors).toHaveLength(0);
    });

    test('scenario link is highlighted in sidebar', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Fifth scenario link should be active
      const scenarioLink = page.getByTestId('scenario-link-5');
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

      await page.goto('/proof-of-payment');

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

    test('displays proof of payment specific content', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/proof-of-payment');

      // Verify proof of payment specific terminology
      await expect(page.getByText(/preimage/i).first()).toBeVisible();
      await expect(page.getByText(/verification/i).first()).toBeVisible();
      // Cryptographic proof related content
      await expect(page.getByText(/cryptographically/i).first()).toBeVisible();

      expect(consoleErrors).toHaveLength(0);
    });
  });
});
