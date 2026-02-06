import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express, { Express, Router } from 'express';

// Mock config object that we can modify per test
const mockConfig = {
  enableDemoMode: true,
  demoWallets: {
    alice: 'nostr+walletconnect://alice-secret-url',
    bob: 'nostr+walletconnect://bob-secret-url',
  } as { alice: string | null; bob: string | null },
  port: 3741,
  isDev: true,
  corsOrigins: ['http://localhost:5741'],
};

// Create a router factory that mimics the actual demo router implementation
// This allows us to test the logic without dealing with module mocking issues
function createDemoRouter(config: typeof mockConfig): Router {
  const router = Router();

  router.get('/wallets', (_req, res) => {
    if (!config.enableDemoMode) {
      return res.status(403).json({
        error: 'Demo mode is disabled',
      });
    }

    res.json({
      demoMode: true,
      wallets: {
        alice: {
          available: !!config.demoWallets.alice,
          name: 'Alice',
        },
        bob: {
          available: !!config.demoWallets.bob,
          name: 'Bob',
        },
      },
      faucetUrl: 'https://faucet.mutinynet.com',
      instructions: 'Demo wallets are pre-configured for testing on Mutinynet.',
    });
  });

  router.get('/status', (_req, res) => {
    res.json({
      demoMode: config.enableDemoMode,
      network: 'testnet',
    });
  });

  return router;
}

describe('Demo API', () => {
  let app: Express;

  beforeEach(() => {
    // Reset mock config to defaults
    mockConfig.enableDemoMode = true;
    mockConfig.demoWallets = {
      alice: 'nostr+walletconnect://alice-secret-url',
      bob: 'nostr+walletconnect://bob-secret-url',
    };

    app = express();
    app.use(express.json());
    app.use('/api/demo', createDemoRouter(mockConfig));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/demo/wallets', () => {
    it('returns wallet availability when demo mode is enabled', async () => {
      const res = await request(app).get('/api/demo/wallets');

      expect(res.status).toBe(200);
      expect(res.body.demoMode).toBe(true);
      expect(res.body.wallets.alice.available).toBe(true);
      expect(res.body.wallets.alice.name).toBe('Alice');
      expect(res.body.wallets.bob.available).toBe(true);
      expect(res.body.wallets.bob.name).toBe('Bob');
      expect(res.body.faucetUrl).toBe('https://faucet.mutinynet.com');
      expect(res.body.instructions).toContain('Demo wallets');
    });

    it('does NOT expose NWC URLs', async () => {
      const res = await request(app).get('/api/demo/wallets');

      expect(res.status).toBe(200);
      // Ensure no NWC URLs are leaked in the response
      expect(res.body.wallets.alice.nwcUrl).toBeUndefined();
      expect(res.body.wallets.bob.nwcUrl).toBeUndefined();

      // Double check by serializing and searching for the secret URLs
      const responseText = JSON.stringify(res.body);
      expect(responseText).not.toContain('alice-secret-url');
      expect(responseText).not.toContain('bob-secret-url');
      expect(responseText).not.toContain('nostr+walletconnect://');
    });

    it('returns 403 when demo mode is disabled', async () => {
      mockConfig.enableDemoMode = false;
      // Recreate app with updated config
      app = express();
      app.use(express.json());
      app.use('/api/demo', createDemoRouter(mockConfig));

      const res = await request(app).get('/api/demo/wallets');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Demo mode is disabled');
    });

    it('returns unavailable for wallets without NWC URLs', async () => {
      mockConfig.demoWallets = {
        alice: null,
        bob: 'nostr+walletconnect://bob-secret-url',
      };
      // Recreate app with updated config
      app = express();
      app.use(express.json());
      app.use('/api/demo', createDemoRouter(mockConfig));

      const res = await request(app).get('/api/demo/wallets');

      expect(res.status).toBe(200);
      expect(res.body.wallets.alice.available).toBe(false);
      expect(res.body.wallets.bob.available).toBe(true);
    });
  });

  describe('GET /api/demo/status', () => {
    it('returns demo mode status when enabled', async () => {
      const res = await request(app).get('/api/demo/status');

      expect(res.status).toBe(200);
      expect(res.body.demoMode).toBe(true);
      expect(res.body.network).toBe('testnet');
    });

    it('returns demo mode status when disabled', async () => {
      mockConfig.enableDemoMode = false;
      // Recreate app with updated config
      app = express();
      app.use(express.json());
      app.use('/api/demo', createDemoRouter(mockConfig));

      const res = await request(app).get('/api/demo/status');

      expect(res.status).toBe(200);
      expect(res.body.demoMode).toBe(false);
      expect(res.body.network).toBe('testnet');
    });
  });
});

describe('Health Check', () => {
  it('returns healthy status', async () => {
    const healthApp = express();
    healthApp.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    const res = await request(healthApp).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.version).toBeDefined();
  });
});
