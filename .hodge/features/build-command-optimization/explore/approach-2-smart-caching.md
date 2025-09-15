# Approach 2: Smart Caching with Lazy Loading

## Implementation Strategy
Use the existing CacheManager to cache expensive operations and lazy-load resources only when needed.

## Code Sketch

```typescript
import { CacheManager } from '../lib/cache-manager';

export class CachedBuildCommand {
  private cache = CacheManager.getInstance();

  async execute(feature: string, options: BuildOptions = {}): Promise<void> {
    // Cache standards loading (rarely changes)
    const standards = await this.cache.getOrLoad(
      'build:standards',
      async () => {
        const standardsFile = path.join('.hodge', 'standards.md');
        if (existsSync(standardsFile)) {
          return await fs.readFile(standardsFile, 'utf-8');
        }
        return null;
      },
      { ttl: 300000 } // 5 minutes cache
    );

    // Cache patterns list (changes occasionally)
    const patterns = await this.cache.getOrLoad(
      'build:patterns',
      async () => {
        const patternsDir = path.join('.hodge', 'patterns');
        if (existsSync(patternsDir)) {
          return await fs.readdir(patternsDir);
        }
        return [];
      },
      { ttl: 60000 } // 1 minute cache
    );

    // Lazy load build plan template
    const buildPlan = await this.cache.getOrLoad(
      'build:template',
      async () => this.loadBuildPlanTemplate(),
      { ttl: 600000 } // 10 minutes cache
    );

    // Feature-specific data (not cached)
    const issueId = await this.loadIssueId(feature);

    // Only check what's needed based on options
    if (!options.skipChecks) {
      await this.performChecks(feature);
    }
  }

  private async loadBuildPlanTemplate(): Promise<string> {
    // Load from external file or generate once
    const templateFile = path.join(__dirname, 'templates', 'build-plan.md');
    if (existsSync(templateFile)) {
      return await fs.readFile(templateFile, 'utf-8');
    }
    return this.generateDefaultTemplate();
  }
}
```

## Performance Improvements
- **First run**: Similar to current (~45ms)
- **Subsequent runs**: 85-90% faster (~5-7ms)
- **Memory efficient**: Caches only frequently used data
- **Smart invalidation**: Different TTLs for different data types

## Pros
- ✅ Massive performance gain on repeated operations
- ✅ Intelligent caching strategy
- ✅ Reduces file system pressure
- ✅ Configurable cache TTLs
- ✅ Reuses existing CacheManager

## Cons
- ❌ First run not optimized
- ❌ Cache invalidation complexity
- ❌ Slightly more complex implementation
- ❌ Memory overhead for cache

## Compatibility
- ✅ Uses existing CacheManager
- ✅ Backward compatible
- ✅ Progressive enhancement (works without cache)