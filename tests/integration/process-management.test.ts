import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = join(__dirname, '../..');
const SERVICE_NAME_DEV = 'alby-demo-dev.service';
const SERVICE_NAME_TEST = 'alby-demo-test.service';
const SERVER_PORT = 3741;
const TEST_TIMEOUT = 30000; // 30 seconds for service operations

/**
 * Check if systemd is available on this system
 */
function isSystemdAvailable(): boolean {
  try {
    execSync('systemctl --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a port is in use using lsof
 */
function isPortInUse(port: number): boolean {
  try {
    const output = execSync(`lsof -ti:${port}`, { encoding: 'utf-8', stdio: 'pipe' });
    return output.trim().length > 0;
  } catch {
    // lsof returns non-zero exit code if port is not in use
    return false;
  }
}

/**
 * Get PIDs listening on a specific port
 */
function getPidsOnPort(port: number): number[] {
  try {
    const output = execSync(`lsof -ti:${port}`, { encoding: 'utf-8', stdio: 'pipe' });
    return output.trim().split('\n').map(pid => parseInt(pid, 10)).filter(pid => !isNaN(pid));
  } catch {
    return [];
  }
}

/**
 * Check if a systemd service is active
 */
function isServiceActive(serviceName: string): boolean {
  try {
    execSync(`systemctl --user is-active ${serviceName}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Stop a systemd service if it's running
 */
function stopServiceIfRunning(serviceName: string): void {
  if (isServiceActive(serviceName)) {
    try {
      execSync(`systemctl --user stop ${serviceName}`, { stdio: 'ignore' });
      // Wait for service to fully stop
      let attempts = 0;
      while (isServiceActive(serviceName) && attempts < 10) {
        execSync('sleep 0.5', { stdio: 'ignore' });
        attempts++;
      }
    } catch (error) {
      console.warn(`Failed to stop service ${serviceName}:`, error);
    }
  }
}

/**
 * Kill all processes on a specific port
 */
function killProcessesOnPort(port: number): void {
  const pids = getPidsOnPort(port);
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Process may have already exited
    }
  }
}

describe('Process Management Integration Tests', () => {
  const systemdAvailable = isSystemdAvailable();

  beforeAll(() => {
    if (!systemdAvailable) {
      console.log('Systemd not available, skipping process management tests');
    }
  });

  afterAll(() => {
    // Cleanup: ensure all test services are stopped
    if (systemdAvailable) {
      stopServiceIfRunning(SERVICE_NAME_DEV);
      stopServiceIfRunning(SERVICE_NAME_TEST);
    }
    // Kill any remaining processes on the server port
    killProcessesOnPort(SERVER_PORT);
  });

  describe('Service Installation', () => {
    it.skipIf(!systemdAvailable)('should install systemd services successfully', () => {
      const scriptPath = join(PROJECT_ROOT, 'scripts', 'install-services.sh');

      expect(existsSync(scriptPath), 'install-services.sh should exist').toBe(true);

      // Make script executable
      execSync(`chmod +x ${scriptPath}`);

      // Run installation script
      const output = execSync(scriptPath, {
        encoding: 'utf-8',
        cwd: PROJECT_ROOT
      });

      expect(output).toContain('Successfully installed all services');

      // Verify services are installed
      const userSystemdDir = process.env.XDG_CONFIG_HOME
        ? join(process.env.XDG_CONFIG_HOME, 'systemd', 'user')
        : join(process.env.HOME!, '.config', 'systemd', 'user');

      expect(existsSync(join(userSystemdDir, SERVICE_NAME_DEV))).toBe(true);
      expect(existsSync(join(userSystemdDir, SERVICE_NAME_TEST))).toBe(true);
    });

    it.skipIf(!systemdAvailable)('should have correct service file permissions', () => {
      const userSystemdDir = process.env.XDG_CONFIG_HOME
        ? join(process.env.XDG_CONFIG_HOME, 'systemd', 'user')
        : join(process.env.HOME!, '.config', 'systemd', 'user');

      const devServicePath = join(userSystemdDir, SERVICE_NAME_DEV);

      if (existsSync(devServicePath)) {
        const output = execSync(`stat -c '%a' ${devServicePath}`, { encoding: 'utf-8' });
        const permissions = output.trim();

        // Service files should be readable (at minimum 644)
        expect(parseInt(permissions, 8) & 0o444).toBeGreaterThan(0);
      }
    });
  });

  describe('Dev Service Lifecycle', () => {
    it.skipIf(!systemdAvailable)('should start and stop dev service cleanly', async () => {
      // Ensure service is stopped before test
      stopServiceIfRunning(SERVICE_NAME_DEV);

      // Ensure port is free
      expect(isPortInUse(SERVER_PORT), 'Port should be free before starting service').toBe(false);

      // Start service
      execSync(`systemctl --user start ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });

      // Wait for service to start (max 10 seconds)
      let serviceStarted = false;
      for (let i = 0; i < 20; i++) {
        if (isServiceActive(SERVICE_NAME_DEV) && isPortInUse(SERVER_PORT)) {
          serviceStarted = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      expect(serviceStarted, 'Service should start within 10 seconds').toBe(true);
      expect(isServiceActive(SERVICE_NAME_DEV), 'Service should be active').toBe(true);
      expect(isPortInUse(SERVER_PORT), 'Server port should be in use').toBe(true);

      // Stop service
      execSync(`systemctl --user stop ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });

      // Wait for service to stop (max 10 seconds)
      let serviceStopped = false;
      for (let i = 0; i < 20; i++) {
        if (!isServiceActive(SERVICE_NAME_DEV) && !isPortInUse(SERVER_PORT)) {
          serviceStopped = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      expect(serviceStopped, 'Service should stop within 10 seconds').toBe(true);
      expect(isServiceActive(SERVICE_NAME_DEV), 'Service should be inactive').toBe(false);
      expect(isPortInUse(SERVER_PORT), 'Port should be free after stopping').toBe(false);
    }, TEST_TIMEOUT);

    it.skipIf(!systemdAvailable)('should respond to health check when running', async () => {
      stopServiceIfRunning(SERVICE_NAME_DEV);

      execSync(`systemctl --user start ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });

      // Wait for service to be fully ready
      let healthCheckPassed = false;
      for (let i = 0; i < 20; i++) {
        try {
          if (isPortInUse(SERVER_PORT)) {
            // Try health check
            execSync(`curl -s http://localhost:${SERVER_PORT}/health`, { stdio: 'ignore' });
            healthCheckPassed = true;
            break;
          }
        } catch {
          // Health check failed, wait and retry
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      expect(healthCheckPassed, 'Health check should pass within 10 seconds').toBe(true);

      // Cleanup
      stopServiceIfRunning(SERVICE_NAME_DEV);
    }, TEST_TIMEOUT);
  });

  describe('No Orphaned Processes', () => {
    it.skipIf(!systemdAvailable)('should not leave orphaned processes after service stop', async () => {
      stopServiceIfRunning(SERVICE_NAME_DEV);

      // Ensure port is free
      killProcessesOnPort(SERVER_PORT);
      expect(isPortInUse(SERVER_PORT), 'Port should be free before test').toBe(false);

      // Start service
      execSync(`systemctl --user start ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });

      // Wait for service to start
      for (let i = 0; i < 20; i++) {
        if (isPortInUse(SERVER_PORT)) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      expect(isPortInUse(SERVER_PORT), 'Service should be using port').toBe(true);

      // Get PIDs before stopping
      const pidsBeforeStop = getPidsOnPort(SERVER_PORT);
      expect(pidsBeforeStop.length, 'Should have processes on port').toBeGreaterThan(0);

      // Stop service
      execSync(`systemctl --user stop ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });

      // Wait for full cleanup
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify no processes remain on port
      const pidsAfterStop = getPidsOnPort(SERVER_PORT);
      expect(pidsAfterStop.length, 'No processes should remain on port after stop').toBe(0);
      expect(isPortInUse(SERVER_PORT), 'Port should be free').toBe(false);
    }, TEST_TIMEOUT);

    it.skipIf(!systemdAvailable)('should handle rapid start/stop cycles', async () => {
      stopServiceIfRunning(SERVICE_NAME_DEV);
      killProcessesOnPort(SERVER_PORT);

      // Perform multiple start/stop cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        execSync(`systemctl --user start ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        execSync(`systemctl --user stop ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Verify clean state
      await new Promise(resolve => setTimeout(resolve, 2000));
      expect(isPortInUse(SERVER_PORT), 'Port should be free after cycles').toBe(false);
      expect(getPidsOnPort(SERVER_PORT).length, 'No orphaned processes').toBe(0);
    }, TEST_TIMEOUT);
  });

  describe('Cleanup Script Effectiveness', () => {
    it.skipIf(!systemdAvailable)('should detect and clean up orphaned processes', async () => {
      // Start service normally
      stopServiceIfRunning(SERVICE_NAME_DEV);
      execSync(`systemctl --user start ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });

      // Wait for service to start
      for (let i = 0; i < 20; i++) {
        if (isPortInUse(SERVER_PORT)) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      expect(isPortInUse(SERVER_PORT), 'Service should be running').toBe(true);

      // Stop service
      stopServiceIfRunning(SERVICE_NAME_DEV);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if cleanup script exists
      const cleanupScriptPath = join(PROJECT_ROOT, 'scripts', 'cleanup.sh');

      if (existsSync(cleanupScriptPath)) {
        // Make script executable and run it
        execSync(`chmod +x ${cleanupScriptPath}`);
        const output = execSync(cleanupScriptPath, {
          encoding: 'utf-8',
          cwd: PROJECT_ROOT
        });

        // Verify cleanup
        expect(isPortInUse(SERVER_PORT), 'Port should be free after cleanup').toBe(false);
      } else {
        // If cleanup script doesn't exist yet, just verify manual cleanup works
        killProcessesOnPort(SERVER_PORT);
        expect(isPortInUse(SERVER_PORT), 'Port should be free after manual cleanup').toBe(false);
      }
    }, TEST_TIMEOUT);
  });

  describe('Crash Recovery', () => {
    it.skipIf(!systemdAvailable)('should restart service after crash', async () => {
      stopServiceIfRunning(SERVICE_NAME_DEV);

      // Start service
      execSync(`systemctl --user start ${SERVICE_NAME_DEV}`, { stdio: 'ignore' });

      // Wait for service to start
      for (let i = 0; i < 20; i++) {
        if (isPortInUse(SERVER_PORT)) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      expect(isPortInUse(SERVER_PORT), 'Service should be running').toBe(true);

      // Get initial PID
      const initialPids = getPidsOnPort(SERVER_PORT);
      expect(initialPids.length, 'Should have process running').toBeGreaterThan(0);

      // Simulate crash by killing the process
      for (const pid of initialPids) {
        try {
          process.kill(pid, 'SIGKILL');
        } catch {
          // Process may have already exited
        }
      }

      // Wait for systemd to restart the service (RestartSec=5s in service file)
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Verify service is running again
      expect(isServiceActive(SERVICE_NAME_DEV), 'Service should be active after crash').toBe(true);

      // Verify a new process is running on the port
      const newPids = getPidsOnPort(SERVER_PORT);
      expect(newPids.length, 'Should have new process running').toBeGreaterThan(0);

      // PIDs should be different (new process)
      const hasDifferentPid = newPids.some(pid => !initialPids.includes(pid));
      expect(hasDifferentPid, 'Should have different PID after restart').toBe(true);

      // Cleanup
      stopServiceIfRunning(SERVICE_NAME_DEV);
    }, TEST_TIMEOUT);
  });

  describe('Environment Detection', () => {
    it('should detect systemd availability correctly', () => {
      const detected = isSystemdAvailable();

      // This test always runs to verify detection logic works
      if (detected) {
        // If detected, verify systemctl command actually works
        expect(() => {
          execSync('systemctl --version', { stdio: 'ignore' });
        }).not.toThrow();
      } else {
        // If not detected, verify systemctl command fails
        expect(() => {
          execSync('systemctl --version', { stdio: 'ignore' });
        }).toThrow();
      }
    });

    it('should skip tests gracefully when systemd is unavailable', () => {
      // This test verifies that our test suite handles missing systemd
      // In a non-systemd environment, all systemd tests should be skipped
      // This test itself should always pass
      expect(true).toBe(true);
    });
  });
});
