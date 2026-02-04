import { test, expect } from '@playwright/test';

test.describe('Project Setup - Application Bootstrap', () => {
  test('dev server starts and app loads successfully', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    // Verify the page loads
    await expect(page).toHaveURL('/');

    // Verify page title contains "Lightning"
    await expect(page).toHaveTitle(/Lightning/);

    // Verify the root element exists and app content is rendered
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Verify the placeholder heading is displayed
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Lightning Wallet Demo');

    // Verify no console errors occurred during load
    expect(consoleErrors).toHaveLength(0);
  });

  test('page has correct meta configuration', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    // Verify full page title
    await expect(page).toHaveTitle('Lightning Wallet Demo - Alice & Bob');

    // Verify viewport meta tag exists (responsive design)
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');

    // Verify description meta tag exists
    const descriptionMeta = page.locator('meta[name="description"]');
    await expect(descriptionMeta).toHaveAttribute(
      'content',
      'Interactive Bitcoin Lightning Network demo using Alby SDK'
    );

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('Tailwind CSS styles are applied', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('/');

    // Verify Tailwind CSS classes are working by checking computed styles
    const container = page.locator('#root > div');
    await expect(container).toBeVisible();

    // Check that min-h-screen class applies (should equal viewport height)
    const { minHeight, viewportHeight } = await container.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        minHeight: parseInt(computed.minHeight, 10),
        viewportHeight: window.innerHeight,
      };
    });
    expect(minHeight).toBe(viewportHeight);

    // Check background color from bg-slate-50 class
    const bgColor = await container.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // bg-slate-50 is rgb(248, 250, 252)
    expect(bgColor).toBe('rgb(248, 250, 252)');

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
