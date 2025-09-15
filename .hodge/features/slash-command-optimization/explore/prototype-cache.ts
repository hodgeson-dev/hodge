/**
 * Prototype: Cache Manager for Slash Command Optimization
 *
 * This demonstrates how a simple caching layer can dramatically
 * reduce file system operations across Hodge commands.
 */

import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash?: string;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<any>>();
  private ttl: number;

  private constructor(ttl = 5000) {
    this.ttl = ttl;
  }

  static getInstance(ttl?: number): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(ttl);
    }
    return CacheManager.instance;
  }

  /**
   * Get or load data with caching
   */
  async getOrLoad<T>(
    key: string,
    loader: () => Promise<T>,
    options?: {
      ttl?: number;
      checksum?: boolean;
    }
  ): Promise<T> {
    const cached = this.cache.get(key);
    const ttl = options?.ttl ?? this.ttl;

    // Check if cache is still valid
    if (cached && Date.now() - cached.timestamp < ttl) {
      // If checksum validation is enabled for files
      if (options?.checksum && key.startsWith('file:')) {
        const filePath = key.slice(5);
        if (existsSync(filePath)) {
          const currentHash = await this.getFileHash(filePath);
          if (currentHash === cached.hash) {
            return cached.data;
          }
        }
      } else {
        return cached.data;
      }
    }

    // Load fresh data
    const data = await loader();

    // Calculate hash for file-based cache
    let hash: string | undefined;
    if (options?.checksum && key.startsWith('file:')) {
      const filePath = key.slice(5);
      hash = await this.getFileHash(filePath);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hash
    });

    return data;
  }

  /**
   * Batch load multiple files efficiently
   */
  async batchLoad<T = string>(
    paths: string[],
    transformer?: (content: string) => T
  ): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    await Promise.all(
      paths.map(async (path) => {
        try {
          const data = await this.getOrLoad(
            `file:${path}`,
            async () => {
              const content = await fs.readFile(path, 'utf-8');
              return transformer ? transformer(content) : content;
            }
          );
          results.set(path, data as T);
        } catch {
          results.set(path, null);
        }
      })
    );

    return results;
  }

  /**
   * Check multiple file existence in parallel
   */
  async checkExistence(paths: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      paths.map(async (path) => {
        const exists = await this.getOrLoad(
          `exists:${path}`,
          async () => {
            try {
              await fs.access(path);
              return true;
            } catch {
              return false;
            }
          },
          { ttl: 1000 } // Shorter TTL for existence checks
        );
        results.set(path, exists);
      })
    );

    return results;
  }

  /**
   * Clear cache for specific keys or patterns
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = typeof pattern === 'string'
      ? new RegExp(pattern.replace(/\*/g, '.*'))
      : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    // This would track hits/misses in production
    return {
      size: this.cache.size,
      hits: 0, // Would be tracked
      misses: 0, // Would be tracked
      hitRate: 0
    };
  }

  /**
   * Calculate file hash for validation
   */
  private async getFileHash(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }
}

/**
 * Feature State Cache - Optimized for Hodge commands
 */
export class FeatureStateCache {
  private cache = CacheManager.getInstance();

  /**
   * Load complete feature state in one operation
   */
  async loadFeatureState(feature: string): Promise<{
    hasExploration: boolean;
    hasDecision: boolean;
    hasBuild: boolean;
    hasHarden: boolean;
    isProductionReady: boolean;
    issueId: string | null;
    validation: any | null;
  }> {
    const basePath = `.hodge/features/${feature}`;

    // Parallel check all directories and files
    const paths = [
      `${basePath}/explore`,
      `${basePath}/explore/decision.md`,
      `${basePath}/build`,
      `${basePath}/harden`,
      `${basePath}/harden/validation-results.json`,
      `${basePath}/issue-id.txt`
    ];

    const existence = await this.cache.checkExistence(paths);

    // Load validation results if they exist
    let validation = null;
    let isProductionReady = false;
    if (existence.get(paths[4])) {
      validation = await this.cache.getOrLoad(
        `file:${paths[4]}`,
        async () => JSON.parse(await fs.readFile(paths[4], 'utf-8'))
      );
      isProductionReady = Object.values(validation as any)
        .every((r: any) => r.passed);
    }

    // Load issue ID if it exists
    let issueId = null;
    if (existence.get(paths[5])) {
      issueId = await this.cache.getOrLoad(
        `file:${paths[5]}`,
        async () => (await fs.readFile(paths[5], 'utf-8')).trim()
      );
    }

    return {
      hasExploration: existence.get(paths[0]) ?? false,
      hasDecision: existence.get(paths[1]) ?? false,
      hasBuild: existence.get(paths[2]) ?? false,
      hasHarden: existence.get(paths[3]) ?? false,
      isProductionReady,
      issueId,
      validation
    };
  }
}

/**
 * Example usage in optimized command
 */
export class OptimizedCommand {
  private cache = CacheManager.getInstance();
  private featureCache = new FeatureStateCache();

  async execute(feature: string): Promise<void> {
    // Load everything in parallel with caching
    const [
      featureState,
      standards,
      patterns,
      config
    ] = await Promise.all([
      this.featureCache.loadFeatureState(feature),
      this.loadStandards(),
      this.loadPatterns(),
      this.loadConfig()
    ]);

    // Use cached data for decision making
    console.log('Feature state loaded from cache:', featureState);

    // Invalidate cache when making changes
    if (featureState.hasExploration) {
      // Do something that modifies state
      this.cache.invalidate(`file:.hodge/features/${feature}/*`);
    }
  }

  private async loadStandards() {
    return this.cache.getOrLoad(
      'standards',
      async () => fs.readFile('.hodge/standards.md', 'utf-8'),
      { ttl: 30000 } // 30 seconds for rarely changing files
    );
  }

  private async loadPatterns() {
    return this.cache.getOrLoad(
      'patterns',
      async () => {
        const files = await fs.readdir('.hodge/patterns');
        return Promise.all(
          files.map(f => fs.readFile(`.hodge/patterns/${f}`, 'utf-8'))
        );
      },
      { ttl: 30000 }
    );
  }

  private async loadConfig() {
    return this.cache.getOrLoad(
      'config',
      async () => JSON.parse(
        await fs.readFile('.hodge/config.json', 'utf-8')
      ),
      { ttl: 60000 } // 1 minute for config
    );
  }
}