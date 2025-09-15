# Approach 2: Incremental Validation with Change Detection

## Implementation Strategy
Cache validation results and only re-run when files have changed using checksums and timestamps.

## Code Sketch

```typescript
import crypto from 'crypto';
import { CacheManager } from '../lib/cache-manager';

export class IncrementalHardenCommand {
  private cache = CacheManager.getInstance();

  async execute(feature: string, options: HardenOptions = {}): Promise<void> {
    // Get file checksums for change detection
    const currentChecksum = await this.calculateProjectChecksum();

    // Check cached results
    const cacheKey = `harden:${feature}:${currentChecksum}`;
    const cachedResults = await this.cache.get(cacheKey);

    if (cachedResults && !options.force) {
      console.log(chalk.green('✨ Using cached validation results (no changes detected)'));
      return this.displayResults(cachedResults);
    }

    // Only run what's needed
    const results = await this.runIncrementalValidation(feature, options);

    // Cache results
    await this.cache.set(cacheKey, results, { ttl: 3600000 }); // 1 hour

    return this.displayResults(results);
  }

  private async calculateProjectChecksum(): Promise<string> {
    // Smart checksum calculation
    const relevantFiles = await this.getRelevantFiles();
    const checksums = await Promise.all(
      relevantFiles.map(async (file) => {
        const content = await fs.readFile(file);
        return crypto.createHash('md5').update(content).digest('hex');
      })
    );

    return crypto
      .createHash('md5')
      .update(checksums.join(''))
      .digest('hex');
  }

  private async runIncrementalValidation(
    feature: string,
    options: HardenOptions
  ): Promise<ValidationResults> {
    const changeSet = await this.detectChanges(feature);

    const tasks = [];

    // Only run tests if test files or source changed
    if (changeSet.tests || changeSet.source) {
      tasks.push(this.runTests());
    }

    // Only lint changed files
    if (changeSet.source) {
      tasks.push(this.runLinting(changeSet.changedFiles));
    }

    // Only typecheck if TypeScript files changed
    if (changeSet.typescript) {
      tasks.push(this.runTypeCheck());
    }

    // Build only if needed
    if (changeSet.requiresBuild) {
      tasks.push(this.runBuild());
    }

    return Promise.all(tasks);
  }

  private async detectChanges(feature: string): Promise<ChangeSet> {
    const lastRun = await this.cache.get(`harden:${feature}:lastrun`);

    if (!lastRun) {
      return { all: true }; // First run, check everything
    }

    // Use git diff to detect changes since last run
    const { stdout } = await execAsync(
      `git diff --name-only ${lastRun.commit} HEAD`
    );

    const changedFiles = stdout.split('\n').filter(Boolean);

    return {
      tests: changedFiles.some(f => f.includes('.test.') || f.includes('.spec.')),
      source: changedFiles.some(f => f.startsWith('src/')),
      typescript: changedFiles.some(f => f.endsWith('.ts') || f.endsWith('.tsx')),
      changedFiles,
      requiresBuild: changedFiles.some(f => f.startsWith('src/')),
    };
  }
}
```

## Performance Improvements
- **No changes**: Instant (100% faster)
- **Small changes**: Only affected validations run (70-90% faster)
- **Full changes**: Same as current (0% improvement)
- **Average case**: 60-80% faster

## Pros
- ✅ Massive speed improvement for iterative development
- ✅ Intelligent change detection
- ✅ Reduces unnecessary work
- ✅ Git-aware (uses commits for tracking)
- ✅ Configurable cache TTL

## Cons
- ❌ More complex implementation
- ❌ Requires cache management
- ❌ May miss external dependency changes
- ❌ Git dependency for change detection

## Compatibility
- ✅ Same command interface
- ✅ Can force full validation with --force
- ✅ Falls back to full validation on cache miss