# Project Context for Spec Implementation

## Project
- Name: alby-oneshot-v5
- Directory: /home/j0rd/src/alby-oneshot-v5
- Description: Lightning wallet demo application showcasing NWC (Nostr Wallet Connect) integration with @getalby/sdk

## Tech Stack

**Core:**
- React ^18.3
- TypeScript ^5.6
- Vite ^6.0
- Tailwind CSS ^3.4

**Lightning:**
- @getalby/sdk ^7.0.0
- @getalby/lightning-tools ^6.1.0

**Backend:**
- Express.js ^4.21

**Testing:**
- Vitest ^2.1
- @testing-library/react ^16.0
- @testing-library/jest-dom
- @testing-library/user-event
- Playwright ^1.48
- jsdom

**Utilities:**
- react-router-dom
- qrcode.react
- concurrently
- tsx
- cors

## Project-Specific Skills

| Spec Pattern | Skill | Purpose |
|--------------|-------|---------|
| All specs | alby-agent-skill | Bitcoin/Lightning wallet operations via NWC |

## Reference Files

| Spec | File(s) | Contents |
|------|---------|----------|
| 01-project-setup | `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `playwright.config.ts`, `index.html`, `src/main.tsx`, `src/index.css`, `tests/setup.ts`, `tests/utils/test-wallet.ts` | Project config, test setup, test wallet utilities |
| 02-shared-types | `src/types/index.ts` | Types, interfaces, type guards, constants, SDK re-exports |
| 03-shared-components | `src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Spinner.tsx`, `src/components/ui/QRCode.tsx`, `src/components/ui/CopyButton.tsx`, `src/components/ui/index.ts` | UI primitives (Button, Input, Card, Badge, Spinner, QRCode, CopyButton) |
| 04-wallet-context | `src/context/WalletContext.tsx`, `src/hooks/useWallet.ts`, `src/hooks/useWalletActions.ts`, `src/hooks/useNWCClient.ts`, `src/hooks/useBalance.ts`, `src/hooks/useInvoice.ts`, `src/hooks/usePayment.ts`, `src/hooks/useBudget.ts`, `src/hooks/useFiatRate.ts`, `src/hooks/index.ts`, `src/components/wallet/WalletCard.tsx`, `src/components/wallet/WalletConnect.tsx`, `src/components/wallet/BalanceDisplay.tsx` | WalletContext, WalletProvider, wallet hooks, wallet components |
| 05-layout | `src/App.tsx`, `src/components/layout/Layout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/ScenarioPage.tsx`, `src/components/transaction/TransactionLog.tsx`, `src/hooks/useTransactionLog.ts` | Layout, Sidebar, ScenarioPage, TransactionLog, useTransactionLog hook |
| 14-backend | `server/index.ts`, `server/config.ts`, `server/routes/demo.ts` | Express server, config, demo wallet endpoints |
| 15-testing-strategy | `tests/setup.ts`, `tests/mocks/crypto.ts`, `tests/mocks/nwc.ts`, `tests/mocks/lightning-tools.ts`, `.github/workflows/test.yml` | Testing infrastructure, mocks, patterns |

## Scenario Routes

| Spec | Route | Page Directory |
|------|-------|----------------|
| 06-scenario-1-simple-payment | `/simple-payment` | `src/pages/1-SimplePayment/` |
| 07-scenario-2-lightning-address | `/2-lightning-address` | `src/pages/2-LightningAddress/` |
| 08-scenario-3-notifications | `/notifications` | `src/pages/3-Notifications/` |
| 09-scenario-4-hold-invoice | `/hold-invoice` | `src/pages/4-HoldInvoice/` |
| 10-scenario-5-proof-of-payment | `/proof-of-payment` | `src/pages/5-ProofOfPayment/` |
| 11-scenario-6-transaction-history | `/transaction-history` | `src/pages/6-TransactionHistory/` |
| 12-scenario-7-nostr-zap | `/7-nostr-zap` | `src/pages/7-NostrZap/` |
| 13-scenario-8-fiat-conversion | `/fiat-conversion` | `src/pages/8-FiatConversion/` |

## Available by Spec

| Spec | Import From | Provides |
|------|-------------|----------|
| 00 | — | Documentation only (architecture reference) |
| 01 | `tests/utils/test-wallet` | Project config, test setup, test wallet utilities |
| 02 | `@/types` | Types, interfaces, type guards, constants, SDK re-exports |
| 03 | `@/components/ui` | UI primitives (Button, Input, Card, Badge, Spinner, QRCode, CopyButton) |
| 04 | `@/context/WalletContext`, `@/hooks`, `@/components/wallet/*` | WalletContext, WalletProvider, wallet hooks, wallet components |
| 05 | `@/components/layout/*`, `@/components/transaction/TransactionLog`, `@/hooks/useTransactionLog` | Layout, Sidebar, ScenarioPage, TransactionLog |
| 06 | — | Scenario page (no shared exports) |
| 07 | `@/hooks/useLightningAddressPayment` | Lightning Address payment hook |
| 08 | `@/hooks/useNotifications` | Real-time notification subscription hook |
| 09 | `@/hooks/useHoldInvoice`, `@/lib/crypto` | Hold invoice hook, crypto utilities |
| 10 | — | Scenario page (no shared exports) |
| 11 | `@/hooks/useTransactions` | Transaction listing with pagination |
| 12 | `@/hooks/useZap` | Nostr zap payment hook |
| 13 | — | Scenario page (no shared exports) |
| 14 | `server/config`, `server/routes/demo` | Express server, config, demo endpoints |
| 15 | `tests/mocks/*` | Testing infrastructure, mocks, patterns |

*For complete export lists, read the referenced spec file.*

## Import Availability Rule

Specs are implemented in numerical order. When implementing spec N:
- **You may import from** specs where number < N
- **You may NOT import from** specs where number >= N (they don't exist yet)
- **For spec 01**: No imports available - this is the foundation spec

Example: Implementing spec 06 means you can use imports from specs 02, 03, 04, 05.

## Coding Standards

1. Use `@/` path alias for all src imports (maps to `./src/`)
2. Internal amounts: **millisats** (SDK standard), Display: **satoshis** (use `CONSTANTS.MILLISATS_PER_SAT` for conversion)
3. Use type guards (`isConnectedWallet`, `isSettledTransaction`, etc.) for TypeScript narrowing
4. NWC clients stored in refs (not state) since they're not serializable
5. Error handling: extract message with `error instanceof Error ? error.message : 'Unknown error'`
6. Async state pattern: `{ data, loading, error }` for hook return values
7. Clean up NWC clients on disconnect by calling `client.close()`
8. Use `ScenarioPage` wrapper for all scenario pages with `aliceContent`, `bobContent`, `logs` props
9. Use `useWallet(walletId)` for wallet state, `useWalletActions(walletId)` for mutations
10. Add `data-testid` attributes to all interactive elements for E2E testing
11. All UI components must meet WCAG 2.1 AA accessibility standards
12. Keyboard navigation: all interactive elements focusable via Tab with visible focus ring
13. Use `onLog` callback pattern for component-to-parent logging with type parameter ('info', 'success', 'error')
14. Use `Result<T, E>` type for operations that can fail
15. Use `AsyncState<T>` for async operation state management
16. Lazy load scenario pages with `React.lazy()` and `Suspense`
17. Transaction log entries ordered newest first (prepend)
18. Use `crypto.randomUUID()` for generating unique IDs
19. Debounce API calls with setTimeout (300ms delay for inputs)
20. Mock each `@getalby/lightning-tools` subpath separately (lnurl, bolt11, fiat)

## Test Commands

```bash
npm run typecheck        # Type checking
npm test                 # Unit tests (Vitest)
npm run test:e2e         # E2E tests (Playwright)
npm run test:coverage    # Unit tests with coverage
npm run test:ui          # Vitest UI mode
```

## Test Structure

- Unit tests: `tests/unit/**/*.test.{ts,tsx}`
- E2E tests: `tests/e2e/**/*.spec.ts`
- Screenshots: `tests/e2e/screenshots/`
- Mocks: `tests/mocks/`
- Setup file: `tests/setup.ts`
- Test utilities: `tests/utils/`

## Mock Patterns

### NWC Client Mock
```typescript
vi.mock('@getalby/sdk/nwc', () => ({
  NWCClient: vi.fn().mockImplementation(() => ({
    getInfo: vi.fn().mockResolvedValue({
      alias: 'Test Wallet',
      color: '#ff0000',
      pubkey: 'abc123',
      network: 'testnet',
      block_height: 12345,
      methods: ['pay_invoice', 'make_invoice'],
    }),
    getBalance: vi.fn().mockResolvedValue({ balance: 100_000_000 }),
    makeInvoice: vi.fn().mockResolvedValue({ invoice: 'lnbc...' }),
    payInvoice: vi.fn().mockResolvedValue({ preimage: '...', fees_paid: 1000 }),
    close: vi.fn(),
  })),
}));
```

### Lightning Tools Mocks (mock subpaths separately)
```typescript
vi.mock('@getalby/lightning-tools/lnurl', () => ({
  LightningAddress: vi.fn().mockImplementation(() => ({
    address: 'test@getalby.com',
    fetch: vi.fn().mockResolvedValue(undefined),
    lnurlpData: { min: 1, max: 1000000, description: 'Test', commentAllowed: 255 },
    requestInvoice: vi.fn().mockResolvedValue({ paymentRequest: 'lnbc1000n1...' }),
    zapInvoice: vi.fn().mockResolvedValue({ paymentRequest: 'lnbc...' }),
  })),
}));

vi.mock('@getalby/lightning-tools/bolt11', () => ({
  Invoice: vi.fn().mockImplementation(({ pr }) => ({
    paymentHash: 'abc123def456...',
    validatePreimage: vi.fn().mockReturnValue(true),
  })),
}));

vi.mock('@getalby/lightning-tools/fiat', () => ({
  getFiatValue: vi.fn().mockResolvedValue(42),
  getSatoshiValue: vi.fn().mockResolvedValue(1000),
}));
```

### Hook Mocks
```typescript
vi.mock('@/hooks', () => ({
  useWallet: vi.fn().mockReturnValue({
    status: 'connected',
    balance: 100_000_000,
    error: null,
  }),
  useWalletActions: vi.fn().mockReturnValue({
    refreshBalance: vi.fn().mockResolvedValue(undefined),
  }),
  useInvoice: vi.fn().mockReturnValue({
    createInvoice: vi.fn().mockResolvedValue({ invoice: 'lnbc...' }),
    loading: false,
    error: null,
  }),
  usePayment: vi.fn().mockReturnValue({
    payInvoice: vi.fn().mockResolvedValue({ preimage: '...' }),
    loading: false,
    error: null,
  }),
}));
```

## E2E Test Wallet Setup

```typescript
import { createTestWalletPair } from '../utils/test-wallet';

test.beforeAll(async () => {
  const { alice, bob } = await createTestWalletPair();
  // Use alice and bob NWC URLs in tests
});

test.afterAll(async () => {
  // Close NWC clients to avoid resource leaks
});
```

## Response Format

Sub-agents must return JSON only - no prose, no explanations.
Include only: status, summary, file paths, counts, pass/fail booleans.
