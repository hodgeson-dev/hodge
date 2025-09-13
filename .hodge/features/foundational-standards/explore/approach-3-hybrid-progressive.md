# Approach 3: Hybrid Progressive Standards

## Concept
Start with essential standards, progressively add more based on both best practices and emergent patterns.

## Implementation Sketch

### Layer 1: Non-Negotiable Foundation (Day 1)
```typescript
// .hodge/standards.md
## Essential Standards (Enforced)
- TypeScript strict mode
- No any types without justification
- All public APIs must have tests
- Semantic commit messages (feat:, fix:, etc.)
```

### Layer 2: Recommended Practices (Week 1)
```typescript
## Recommended Standards (Suggested in explore, enforced in harden)
- Error handling: Use Result<T, E> pattern
- File naming: kebab-case.ts
- Test coverage: Minimum 80%
- Documentation: JSDoc for public APIs

class StandardsEngine {
  enforce(mode: Mode, rule: Rule) {
    switch(mode) {
      case 'explore':
        return rule.level === 'essential' ? 'error' : 'warn';
      case 'build':
        return rule.level !== 'optional' ? 'error' : 'warn';
      case 'harden':
        return 'error'; // Everything enforced
    }
  }
}
```

### Layer 3: Learned Patterns (Ongoing)
```typescript
// Automatically detected and suggested
interface LearnedStandard {
  pattern: string;
  confidence: number;  // 0-1
  frequency: number;   // Times seen
  promotion: 'suggest' | 'recommend' | 'enforce';
}

// Example: After seeing consistent pattern
{
  pattern: 'Commands return Result<T, Error>',
  confidence: 0.95,
  frequency: 12,
  promotion: 'recommend'
}
```

### Implementation Example
```typescript
// src/core/standards/StandardsManager.ts
export class StandardsManager {
  private standards: Map<string, Standard>;
  
  constructor() {
    this.loadFoundational();  // Load from .hodge/standards.md
    this.loadLearned();       // Load from .hodge/patterns/
  }
  
  check(file: string, mode: Mode): ValidationResult {
    const issues: Issue[] = [];
    
    for (const standard of this.standards.values()) {
      if (this.shouldApply(standard, mode)) {
        const result = standard.validate(file);
        if (!result.valid) {
          issues.push({
            ...result.issue,
            severity: this.getSeverity(standard, mode)
          });
        }
      }
    }
    
    return { issues };
  }
}
```

## Pros
- ✅ Best of both worlds
- ✅ Quick start with safety
- ✅ Room for evolution
- ✅ Mode-appropriate enforcement
- ✅ Dogfoods Hodge's philosophy

## Cons
- ❌ More complex to implement
- ❌ Need clear categorization
- ❌ Requires judgment calls

## Compatibility
- Perfect fit for Hodge's three-mode system
- Can integrate ESLint for foundational rules
- Custom validation for learned patterns
- Progressive enhancement model