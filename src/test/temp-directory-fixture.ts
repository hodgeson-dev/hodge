/**
 * TempDirectoryFixture: Robust temporary directory management for tests
 *
 * Solves persistent test flakiness issues:
 * - Guarantees unique directory names (UUID instead of timestamp)
 * - Implements retry logic for cleanup operations
 * - Verifies operations complete before proceeding
 * - Handles platform-specific file system quirks
 * - Self-cleans even on test failure
 *
 * Usage:
 * ```typescript
 * let fixture: TempDirectoryFixture;
 *
 * beforeEach(async () => {
 *   fixture = new TempDirectoryFixture();
 *   await fixture.setup();
 * });
 *
 * afterEach(async () => {
 *   await fixture.cleanup();
 * });
 *
 * test('example', async () => {
 *   const dir = fixture.getPath();
 *   // Use dir for test operations
 * });
 * ```
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export interface TempDirectoryOptions {
  /** Prefix for directory name (default: 'hodge-test') */
  prefix?: string;
  /** Maximum retry attempts for cleanup (default: 5) */
  maxRetries?: number;
  /** Delay between retries in ms (default: 50) */
  retryDelay?: number;
  /** Whether to verify directory exists after creation (default: true) */
  verifyCreation?: boolean;
}

export class TempDirectoryFixture {
  private dirPath: string | null = null;
  private options: Required<TempDirectoryOptions>;
  private isSetup = false;

  constructor(options: TempDirectoryOptions = {}) {
    this.options = {
      prefix: options.prefix ?? 'hodge-test',
      maxRetries: options.maxRetries ?? 5,
      retryDelay: options.retryDelay ?? 50,
      verifyCreation: options.verifyCreation ?? true,
    };
  }

  /**
   * Set up the temporary directory
   * Call this in beforeEach
   */
  async setup(): Promise<string> {
    if (this.isSetup) {
      throw new Error('TempDirectoryFixture already set up. Call cleanup() first.');
    }

    // Generate truly unique directory name using UUID
    const uniqueName = `${this.options.prefix}-${randomUUID()}`;
    this.dirPath = join(tmpdir(), uniqueName);

    // Create directory with recursive flag
    await fs.mkdir(this.dirPath, { recursive: true });

    // Verify creation if requested
    if (this.options.verifyCreation) {
      await this.verifyDirectoryExists();
    }

    this.isSetup = true;
    return this.dirPath;
  }

  /**
   * Get the path to the temporary directory
   * Throws if setup() hasn't been called
   */
  getPath(): string {
    if (!this.isSetup || !this.dirPath) {
      throw new Error('TempDirectoryFixture not set up. Call setup() first.');
    }
    return this.dirPath;
  }

  /**
   * Clean up the temporary directory with retry logic
   * Call this in afterEach
   */
  async cleanup(): Promise<void> {
    if (!this.isSetup || !this.dirPath) {
      return; // Nothing to clean up
    }

    const dirToClean = this.dirPath;
    this.dirPath = null;
    this.isSetup = false;

    // Attempt cleanup with retries
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        // Check if directory still exists
        const exists = await this.directoryExists(dirToClean);
        if (!exists) {
          return; // Already cleaned up
        }

        // Force removal with all contents
        await fs.rm(dirToClean, {
          recursive: true,
          force: true,
          maxRetries: 3,
          retryDelay: 10,
        });

        // Verify removal
        const stillExists = await this.directoryExists(dirToClean);
        if (!stillExists) {
          return; // Successfully cleaned up
        }

        // If it still exists after rm, something is wrong
        throw new Error(`Directory still exists after cleanup: ${dirToClean}`);
      } catch (error) {
        lastError = error as Error;

        // If this isn't the last attempt, wait and retry
        if (attempt < this.options.maxRetries - 1) {
          await this.delay(this.options.retryDelay * (attempt + 1));
          continue;
        }
      }
    }

    // If we got here, all retries failed
    console.warn(
      `Failed to clean up temp directory after ${this.options.maxRetries} attempts: ${dirToClean}`,
      lastError
    );

    // Don't throw - we don't want to fail the test because of cleanup issues
    // The OS will eventually clean up temp directories
  }

  /**
   * Write a file within the temp directory
   */
  async writeFile(relativePath: string, content: string): Promise<string> {
    const filePath = join(this.getPath(), relativePath);
    const dir = join(filePath, '..');

    // Ensure parent directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');

    // Verify file exists
    await fs.access(filePath);

    return filePath;
  }

  /**
   * Read a file from the temp directory
   */
  async readFile(relativePath: string): Promise<string> {
    const filePath = join(this.getPath(), relativePath);
    return fs.readFile(filePath, 'utf-8');
  }

  /**
   * Check if a file exists in the temp directory
   */
  async fileExists(relativePath: string): Promise<boolean> {
    const filePath = join(this.getPath(), relativePath);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List files in the temp directory
   */
  async listFiles(relativePath = '.'): Promise<string[]> {
    const dirPath = join(this.getPath(), relativePath);
    return fs.readdir(dirPath);
  }

  /**
   * Verify directory exists
   */
  private async verifyDirectoryExists(): Promise<void> {
    if (!this.dirPath) {
      throw new Error('No directory path set');
    }

    try {
      const stats = await fs.stat(this.dirPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path exists but is not a directory: ${this.dirPath}`);
      }
    } catch (error) {
      throw new Error(`Failed to verify directory exists: ${this.dirPath}`, { cause: error });
    }
  }

  /**
   * Check if directory exists (without throwing)
   */
  private async directoryExists(path: string): Promise<boolean> {
    try {
      const stats = await fs.stat(path);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Helper function to create a temp directory fixture with custom options
 */
export function createTempDirectory(options?: TempDirectoryOptions): TempDirectoryFixture {
  return new TempDirectoryFixture(options);
}

/**
 * Helper function for tests that need multiple temp directories
 */
export async function withTempDirectories<T>(
  count: number,
  fn: (dirs: string[]) => Promise<T>
): Promise<T> {
  const fixtures = Array.from({ length: count }, () => new TempDirectoryFixture());

  try {
    // Setup all directories
    const dirs = await Promise.all(fixtures.map((f) => f.setup()));

    // Run test function
    return await fn(dirs);
  } finally {
    // Cleanup all directories (in parallel for speed)
    await Promise.all(fixtures.map((f) => f.cleanup()));
  }
}
