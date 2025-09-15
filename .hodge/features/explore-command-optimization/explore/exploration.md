# Explore Command Optimization Exploration

## Feature Overview
Optimize the `/explore` command for better performance, smarter template generation, and enhanced AI context awareness.

## Current State Analysis

### Performance Bottlenecks
1. **Sequential Operations** (Lines 31-145)
   - File existence checks done one by one
   - Directory creation, file reads, and writes all sequential
   - PM integration check blocks other operations

2. **Redundant File Reads** (Lines 129-145)
   - Patterns directory read on every execution
   - Decisions file parsed for count only
   - No caching of frequently accessed data

3. **Static Template Generation** (Lines 87-124)
   - Same template regardless of project context
   - No intelligence about similar features
   - Misses opportunity for pattern reuse

## Approach 1: Cache Integration + Parallelization

### Implementation Sketch
```typescript
class OptimizedExploreCommand extends ExploreCommand {
  private cache = CacheManager.getInstance();
  private featureCache = new FeatureStateCache();

  async execute(feature: string, options: ExploreOptions) {
    // Parallel operations
    const [
      existingState,
      projectContext,
      similarFeatures,
      pmIssue
    ] = await Promise.all([
      this.checkExistingExploration(feature),
      this.loadProjectContext(),
      this.findSimilarFeatures(feature),
      this.checkPMIntegration(feature)
    ]);

    // Smart template generation based on context
    const template = await this.generateSmartTemplate(
      feature,
      projectContext,
      similarFeatures
    );
  }
}
```

### Pros
- 60-70% faster execution using existing cache infrastructure
- Reuses patterns from similar features
- No new dependencies needed
- Backward compatible

### Cons
- Requires cache-manager.ts to be deployed first
- Cache invalidation complexity
- Memory usage increases slightly

### Compatibility
✅ Works with current TypeScript/Node.js stack
✅ Integrates with existing CacheManager
✅ No breaking changes

## Approach 2: AI-Enhanced Context Generation

### Implementation Sketch
```typescript
class AIEnhancedExploreCommand {
  async execute(feature: string, options: ExploreOptions) {
    // Analyze feature name for intent
    const intent = this.analyzeFeatureIntent(feature);

    // Load relevant examples from codebase
    const examples = await this.findCodeExamples(intent);

    // Generate AI-optimized exploration template
    const template = await this.generateAITemplate({
      feature,
      intent,
      examples,
      patterns: await this.loadRelevantPatterns(intent),
      decisions: await this.loadRelatedDecisions(intent)
    });

    // Create rich context for AI tools
    const aiContext = {
      mode: 'explore',
      feature,
      intent,
      suggestedApproaches: this.generateApproaches(intent),
      relatedCode: examples,
      constraints: await this.detectConstraints()
    };
  }

  private analyzeFeatureIntent(feature: string) {
    // Detect patterns like "auth-", "api-", "ui-", "perf-"
    const patterns = {
      'auth': ['authentication', 'authorization', 'security'],
      'api': ['endpoint', 'REST', 'GraphQL', 'integration'],
      'ui': ['component', 'interface', 'user experience'],
      'perf': ['optimization', 'caching', 'speed'],
      'test': ['testing', 'validation', 'quality']
    };

    for (const [key, keywords] of Object.entries(patterns)) {
      if (feature.toLowerCase().includes(key)) {
        return { type: key, keywords };
      }
    }
    return { type: 'general', keywords: [] };
  }
}
```

### Pros
- Intelligent, context-aware templates
- Better AI tool integration (Claude Code, Cursor, etc.)
- Learns from existing codebase
- Suggests relevant patterns automatically

### Cons
- More complex implementation
- May generate too much context
- Requires careful prompt engineering

### Compatibility
✅ Enhances AI tool experience
✅ Works with all environments
⚠️ Best with AI-enabled environments

## Approach 3: Lazy Loading + Streaming Output

### Implementation Sketch
```typescript
class StreamingExploreCommand {
  async execute(feature: string, options: ExploreOptions) {
    // Start with immediate feedback
    this.streamOutput('🔍 Entering Explore Mode', 'cyan');
    this.streamOutput(`Feature: ${feature}`, 'gray');

    // Create directory immediately
    const exploreDir = this.getExploreDir(feature);
    await fs.mkdir(exploreDir, { recursive: true });

    // Stream progress while loading context
    const contextPromise = this.loadContextLazy(feature);
    this.streamOutput('Loading project context...', 'dim');

    // Generate basic template immediately
    await this.writeBasicTemplate(exploreDir, feature);
    this.streamOutput('✓ Basic exploration created', 'green');

    // Enhance template as context loads
    const context = await contextPromise;
    await this.enhanceTemplate(exploreDir, feature, context);
    this.streamOutput('✓ Enhanced with project context', 'green');

    // Load patterns/decisions only if needed
    if (options.verbose || context.hasRelatedFeatures) {
      const patterns = await this.loadPatternsLazy();
      await this.addPatternsToTemplate(exploreDir, patterns);
    }
  }

  private async loadContextLazy(feature: string) {
    // Load only what's needed, when it's needed
    const essentials = await this.loadEssentials();

    return {
      ...essentials,
      // Lazy getters for expensive operations
      get patterns() { return this.loadPatterns(); },
      get decisions() { return this.loadDecisions(); },
      get similarFeatures() { return this.findSimilar(feature); }
    };
  }
}
```

### Pros
- Instant feedback to user
- Loads only what's needed
- Progressive enhancement of templates
- Better perceived performance

### Cons
- More complex state management
- Template updates after initial creation
- Harder to test

### Compatibility
✅ Great UX improvement
✅ Works in all environments
⚠️ Best for interactive terminals

## Performance Comparison

| Approach | Speed Gain | Complexity | AI Enhancement | UX Impact |
|----------|------------|------------|----------------|-----------|
| Cache + Parallel | 60-70% | Low | None | Good |
| AI-Enhanced | 30-40% | High | Excellent | Excellent |
| Lazy + Streaming | 50-60% | Medium | Good | Excellent |
| **Combined 1+2** | 70-80% | High | Excellent | Excellent |

## Additional Optimizations

### Quick Wins
1. **Memoize pattern loading** - Cache for entire session
2. **Pre-compile templates** - Use template literals instead of string concat
3. **Batch file writes** - Write all files in one Promise.all()
4. **Skip unused checks** - Only check PM if configured

### Smart Features
1. **Feature similarity detection** - Suggest copying from similar features
2. **Pattern matching** - Auto-suggest relevant patterns based on feature name
3. **Decision history** - Show related past decisions
4. **Code search integration** - Find similar implementations in codebase

### AI Enhancements
1. **Semantic feature analysis** - Understand intent from feature name
2. **Context pruning** - Send only relevant context to AI
3. **Example generation** - Provide code examples from codebase
4. **Approach suggestions** - Pre-generate likely approaches

## Recommendation

**Implement Approach 1 + 2 Combined** because:

1. **Immediate Performance Gains**: Cache + parallelization gives 60-70% improvement
2. **Enhanced AI Experience**: Smart context generation improves AI tool integration
3. **Progressive Enhancement**: Start with cache, add AI features incrementally
4. **Low Risk**: Cache layer is already proven, AI enhancements are additive

### Implementation Plan

**Phase 1** (2-3 hours):
- Integrate CacheManager
- Parallelize file operations
- Add batch writes

**Phase 2** (3-4 hours):
- Implement feature intent analysis
- Add smart template generation
- Create context pruning

**Phase 3** (2-3 hours):
- Add similarity detection
- Implement pattern suggestions
- Enhance AI context

## Next Steps

Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build explore-command-optimization`
d) Save progress and switch context → `/save`
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):