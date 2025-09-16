# Context Scaling Analysis

## Current Context Sizes

### Always Loaded (~160 lines)
- `.hodge/standards.md`: 28 lines
- `CLAUDE.md`: 104 lines
- Current slash command: ~30-100 lines

### Pattern Files (~600 lines total)
- `test-pattern.md`: 273 lines
- `structure-pattern.md`: 331 lines
- Future: error, api, auth patterns: ~200 lines each

### Philosophy/Guides (~600 lines)
- `TEST-STRATEGY.md`: 337 lines
- `CONTRIBUTING.md`: 274 lines

## Worst-Case Scenario
**Maximum context:** ~1,400 lines (if all patterns loaded)
**With philosophy:** ~2,000 lines

## When This Becomes a Problem

### Current State: ✅ Manageable
- 2,000 lines ≈ 6,000 tokens
- Well within Claude's 200k context window
- Fast to process, no performance issues

### Future Concerns: ⚠️
At 10+ patterns × 200 lines each:
- 2,000+ lines just in patterns
- 3,000+ total lines loaded
- Slower processing, potential confusion

### Breaking Point: ❌
At 20+ patterns or complex patterns:
- 4,000+ lines of patterns
- Context becomes unwieldy
- AI may miss relevant information

## Vectorization Trigger Points

Consider vector storage when:

1. **Pattern Count > 10**
   - Hard to know which to load
   - Manual loading becomes error-prone

2. **Total Pattern Lines > 2,000**
   - Too much context at once
   - Diminishing returns on loading everything

3. **Semantic Search Needed**
   - "Find patterns similar to X"
   - "What pattern handles Y?"

4. **Cross-Reference Complexity**
   - Patterns reference other patterns
   - Need to trace relationships

## Proposed Solution: Hybrid Approach

### Phase 1 (Current) - Manual Intelligence
- Keep patterns small (<200 lines)
- Trust AI to load relevant ones
- Use clear naming conventions

### Phase 2 (10+ patterns) - Pattern Index
Create `.hodge/patterns/INDEX.md`:
```markdown
# Pattern Index
- `test-pattern.md` - Testing examples (273 lines)
- `structure-pattern.md` - File structures (331 lines)
- `error-pattern.md` - Error handling (150 lines)
```

### Phase 3 (20+ patterns) - Vector Storage
```javascript
// .hodge/lib/pattern-vectorizer.js
class PatternVectorizer {
  async indexPatterns() {
    // Embed patterns using OpenAI/local embeddings
    // Store in .hodge/vectors/patterns.db
  }

  async findRelevant(query, limit = 3) {
    // Return top 3 most relevant patterns
    // Load only those into context
  }
}
```

## Optimization Strategies

### 1. Pattern Chunking
Split large patterns into focused chunks:
```
test-pattern.md →
  - test-smoke-pattern.md (50 lines)
  - test-integration-pattern.md (50 lines)
  - test-mocks-pattern.md (50 lines)
```

### 2. Progressive Loading
```javascript
// Load based on confidence
if (confidence > 0.8) loadPattern('exact-match.md');
if (confidence > 0.5) loadPattern('related.md');
if (confidence > 0.3) loadPatternSummary('maybe.md');
```

### 3. Context Budget
```javascript
const CONTEXT_BUDGET = 1000; // lines
const loaded = prioritizePatterns(needed, CONTEXT_BUDGET);
```

## Recommendations

### Immediate Actions
1. ✅ Keep patterns under 200 lines each
2. ✅ Use clear, searchable headings
3. ✅ Add pattern descriptions to INDEX

### When Reaching 10 Patterns
1. Create pattern index/registry
2. Add pattern tags/categories
3. Consider pattern dependencies

### When Reaching 20 Patterns
1. Implement vector search
2. Build pattern recommendation engine
3. Create pattern composition tools

## Metrics to Track

```javascript
// Add to hodge telemetry
{
  "context_loads": {
    "patterns_loaded": ["test", "structure"],
    "total_lines": 604,
    "load_time_ms": 23,
    "relevance_score": 0.85
  }
}
```

---
*Current status: Well within limits. No action needed.*
*Monitor pattern growth and revisit at 10+ patterns.*