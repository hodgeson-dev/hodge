# Approach 2: Emergent Standards

## Concept
Start with minimal standards, let them emerge from actual code patterns, then formalize what works.

## Implementation Sketch

### Phase 1: Minimal Starting Standards
```yaml
# .hodge/standards.yml
version: 0.1.0
mode: learning  # learning -> suggested -> enforced

core:
  - Use TypeScript
  - Write tests for public APIs
  - Document public interfaces
```

### Phase 2: Pattern Detection
```typescript
class StandardsLearner {
  async detectPatterns() {
    // Scan codebase for:
    // - Repeated code structures
    // - Naming patterns
    // - File organization patterns
    // - Test patterns
    
    return {
      detected: [
        'Pattern: Error handling with Result types',
        'Pattern: Dependency injection for adapters',
        'Pattern: Command/Query separation'
      ],
      frequency: {
        'async/await': 45,
        'Promises': 2,
        'callbacks': 0
      }
    };
  }
}
```

### Phase 3: Standard Evolution
```typescript
// Week 1: Suggested
"Consider using async/await (used in 95% of async code)"

// Week 3: Recommended  
"async/await is recommended (team convention)"

// Week 5: Enforced
"ERROR: Use async/await instead of Promise chains"
```

## Pros
- ✅ Standards fit actual needs
- ✅ Natural, not forced
- ✅ Team buy-in through participation
- ✅ Flexible and adaptive

## Cons
- ❌ Inconsistency early on
- ❌ More refactoring needed
- ❌ Takes time to stabilize
- ❌ May miss best practices

## Compatibility
- Requires pattern detection system
- Need to track code metrics
- Can gradually add linting rules