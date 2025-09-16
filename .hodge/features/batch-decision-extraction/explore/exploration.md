# Exploration: Batch Decision Extraction

## Feature Overview
Extract and review multiple decisions from long exploration discussions, allowing batch processing of pending decisions.

## Context
- **Date**: 2025-01-16
- **User Note**: "Look carefully at how this will be different than what we're doing right now. What we're doing right now is working pretty well."
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Implement batch decision extraction with careful design consideration")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-4-enhanced-features`

## Problem Statement
Long exploration sessions (like today's) generate many implicit decisions that need to be:
- Identified and extracted
- Reviewed for accuracy
- Recorded formally
- Linked to features

Current `/decide` interactive mode works well, but could be enhanced for better decision discovery.

## Current Behavior Analysis

### What Works Well Now
The current `/decide` command in interactive mode:
1. Manually identifies pending decisions
2. Presents them one by one
3. Waits for user input
4. Records chosen decisions

### Enhancement Opportunities
1. **Automated discovery** of decision points in conversation
2. **Bulk review** interface for efficiency
3. **Context preservation** from discussion
4. **Smart categorization** of decisions

## Approaches Explored

### Approach 1: Keep Current Manual System
Continue with current interactive mode only
- **Pros**: Works well, user has full control
- **Cons**: May miss decisions in long discussions

### Approach 2: Full AI Analysis
Use AI to analyze entire conversation for decisions
- **Pros**: Comprehensive, finds hidden decisions
- **Cons**: May over-extract, false positives, privacy concerns

### Approach 3: Hybrid Enhancement (RECOMMENDED)
Enhance current system with optional extraction
- **Pros**:
  - Keeps working manual mode
  - Adds discovery assistance
  - User reviews all suggestions
  - Can skip extraction if not needed
- **Cons**:
  - More complex than current system

## Recommended Approach: Careful Enhancement

### Design Principles
1. **Don't break what works** - Current interactive mode remains default
2. **Optional extraction** - User chooses when to use it
3. **Review required** - Never auto-record without review
4. **Context-aware** - Understands exploration vs general discussion

### Enhanced Command Flow
```bash
hodge decide --extract
# OR
hodge decide --from-discussion

# System scans for decisions, then shows:
```

### Extraction Interface
```
📋 Found 5 potential decisions from recent discussion:

1. ✅ Use HODGE.md for cross-tool compatibility
   Context: Makes Hodge work with any AI tool
   Confidence: HIGH
   Source: Explicit agreement
   [Accept / Modify / Skip]

2. 🤔 Implement session management in Phase 2
   Context: Allows context restoration between sessions
   Confidence: MEDIUM
   Source: Implied from discussion
   [Accept / Modify / Skip]

3. ❓ Use TypeScript for new features
   Context: Mentioned but not explicitly decided
   Confidence: LOW
   [Accept / Modify / Skip]

Review mode: [A]ccept all high confidence / [R]eview each / [C]ancel
```

### Decision Patterns to Detect
```typescript
const decisionIndicators = {
  explicit: [
    /we should/i,
    /let's go with/i,
    /the decision is/i,
    /we've decided/i
  ],
  implicit: [
    /the best approach/i,
    /this makes sense/i,
    /we'll implement/i
  ],
  questions: [
    /should we/i,
    /which approach/i,
    /do we need/i
  ]
};
```

### Comparison with Current Behavior

| Aspect | Current `/decide` | Enhanced `/decide --extract` |
|--------|------------------|------------------------------|
| Decision Discovery | Manual | Automated + Manual |
| Review Process | One by one | Batch or one by one |
| Context | User provides | Extracted from discussion |
| Speed | Slower for many | Faster for many |
| Control | Full | Full (nothing automatic) |
| Complexity | Simple | More complex |

## Test Intentions
- [ ] Extraction identifies real decisions
- [ ] False positive rate is low
- [ ] User can modify extracted decisions
- [ ] Batch accept/reject works
- [ ] Context is preserved correctly
- [ ] Original interactive mode still works
- [ ] Performance with long discussions

## Implementation Details

1. **DecisionExtractor Class**
   - Location: `src/lib/decision-extractor.ts`
   - Scans conversation/files for patterns
   - Ranks confidence levels
   - Preserves context

2. **Enhanced Decide Command**
   ```typescript
   class DecideCommand {
     async execute(decision?: string, options?: DecideOptions) {
       if (options.extract || options.fromDiscussion) {
         const extracted = await this.extractPendingDecisions();
         await this.presentBatchReview(extracted);
       } else {
         // Current behavior unchanged
         await this.interactiveMode(decision);
       }
     }
   }
   ```

## Key Decisions Made
1. ✅ Implement with careful design consideration
2. ✅ Keep current behavior as default
3. ✅ Make extraction optional
4. ✅ Require user review of all extracted decisions

## User Feedback Integration
Per user: "What we're doing right now is working pretty well"
- Current interactive mode remains unchanged
- Extraction is purely additive
- Can ignore extraction feature if not needed
- Focus on enhancing, not replacing

## Next Steps
1. Build after other features are stable
2. Start with simple pattern matching
3. Test with real exploration sessions
4. Iterate based on usage
5. Consider AI-assisted extraction later

## Related Features
- **Uses**: session-management (restore pending decisions)
- **Updates**: pm-adapter-hooks (record decisions in PM)
- **Enhances**: Current `/decide` command

## References
- Implementation Plan: `IMPLEMENTATION_PLAN.md#phase-4`
- Decisions: `.hodge/decisions.md` (2025-01-16)
- Current Implementation: `src/commands/decide.ts`
- Today's Session: Example of long exploration needing extraction