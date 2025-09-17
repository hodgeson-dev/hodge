import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { SessionManager } from './session-manager';
import { existsSync } from 'fs';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  const testSessionFile = '.hodge/.session';

  beforeEach(async () => {
    sessionManager = new SessionManager();
    // Clean up any existing session
    if (existsSync(testSessionFile)) {
      await fs.unlink(testSessionFile);
    }
  });

  afterEach(async () => {
    // Clean up after tests
    if (existsSync(testSessionFile)) {
      await fs.unlink(testSessionFile);
    }
  });

  describe('Smoke Tests', () => {
    it('should create a SessionManager instance', () => {
      expect(sessionManager).toBeDefined();
      expect(sessionManager.save).toBeDefined();
      expect(sessionManager.load).toBeDefined();
    });

    it('should save a session without errors', async () => {
      await expect(
        sessionManager.save({
          feature: 'test-feature',
          mode: 'explore',
          summary: 'Testing session save',
        })
      ).resolves.not.toThrow();
    });

    it('should load a saved session', async () => {
      await sessionManager.save({
        feature: 'test-feature',
        mode: 'build',
        summary: 'Test session',
      });

      const session = await sessionManager.load();
      expect(session).toBeDefined();
      expect(session?.feature).toBe('test-feature');
      expect(session?.mode).toBe('build');
      expect(session?.summary).toBe('Test session');
    });
  });

  describe('Integration Tests', () => {
    it('should add commands to session history', async () => {
      await sessionManager.addCommand('hodge explore test');
      await sessionManager.addCommand('hodge build test');

      const session = await sessionManager.load();
      expect(session?.recentCommands).toContain('hodge explore test');
      expect(session?.recentCommands).toContain('hodge build test');
    });

    it('should limit command history to 10 items', async () => {
      // Add 12 commands
      for (let i = 1; i <= 12; i++) {
        await sessionManager.addCommand(`command-${i}`);
      }

      const session = await sessionManager.load();
      expect(session?.recentCommands).toHaveLength(10);
      expect(session?.recentCommands?.[0]).toBe('command-3'); // First 2 should be dropped
      expect(session?.recentCommands?.[9]).toBe('command-12'); // Last should be most recent
    });

    it('should add decisions to session history', async () => {
      await sessionManager.addDecision('Use TypeScript');
      await sessionManager.addDecision('Implement caching');

      const session = await sessionManager.load();
      expect(session?.recentDecisions).toContain('Use TypeScript');
      expect(session?.recentDecisions).toContain('Implement caching');
    });

    it('should update context correctly', async () => {
      await sessionManager.updateContext('auth-feature', 'harden');

      const session = await sessionManager.load();
      expect(session?.feature).toBe('auth-feature');
      expect(session?.mode).toBe('harden');
    });

    it('should return null for non-existent session', async () => {
      const session = await sessionManager.load();
      expect(session).toBeNull();
    });

    it('should handle corrupted session files gracefully', async () => {
      // Create a corrupted session file
      await fs.mkdir('.hodge', { recursive: true });
      await fs.writeFile(testSessionFile, 'invalid json content', 'utf-8');

      const session = await sessionManager.load();
      expect(session).toBeNull();
    });
  });

  describe('Session Expiry', () => {
    it('should cleanup expired sessions', async () => {
      // Create a session with old timestamp
      const oldSession = {
        v: 1 as const,
        ts: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
        feature: 'old-feature',
        mode: 'explore' as const,
        recentCommands: [],
        recentDecisions: [],
      };

      await fs.mkdir('.hodge', { recursive: true });
      await fs.writeFile(testSessionFile, JSON.stringify(oldSession), 'utf-8');

      const session = await sessionManager.load();
      expect(session).toBeNull();
      expect(existsSync(testSessionFile)).toBe(false);
    });
  });

  describe('Display Formatting', () => {
    it('should format session for display', async () => {
      await sessionManager.save({
        feature: 'display-test',
        mode: 'ship',
        summary: 'Ready to ship',
        nextAction: 'Run tests',
      });

      const session = await sessionManager.load();
      const formatted = sessionManager.formatForDisplay(session!);

      expect(formatted).toContain('display-test');
      expect(formatted).toContain('ship');
      expect(formatted).toContain('Ready to ship');
      expect(formatted).toContain('Run tests');
    });
  });
});
