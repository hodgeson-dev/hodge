# Exploration: Feature Extraction from Decisions

## Feature Overview
Extract concrete features from decisions made during exploration sessions, creating actionable work items.

## Context
- **Date**: 2025-01-16
- **Parent**: feature-context-organization exploration
- **Decision Source**: See `.hodge/decisions.md` (2025-01-16 - "Build feature extraction system")
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md#phase-1-cross-tool-compatibility`

## Problem Statement
Decisions made during exploration often imply features to build, but these aren't automatically extracted into actionable items. We need a system to:
- Parse decisions for feature implications
- Create feature directories automatically
- Bundle relevant context from the decision
- Link back to original exploration

## Recommended Approach: Decision Parser

### Implementation Details

1. **DecisionParser Class**
   - Location: `src/lib/decision-parser.ts`
   - Analyzes decision text for action keywords
   - Identifies feature boundaries
   - Extracts feature names

2. **Feature Extraction Patterns**
   ```typescript
   const featureIndicators = [
     /build (\w+)/i,
     /implement (\w+)/i,
     /create (\w+)/i,
     /add (\w+) feature/i
   ];
   ```

3. **Extraction Command**
   ```bash
   hodge extract-features [--from-exploration <name>]
   # Scans recent decisions
   # Creates feature directories
   # Links to source decisions
   ```

## Test Intentions
- [ ] Parser identifies features from decisions
- [ ] Feature directories created correctly
- [ ] Context bundled appropriately
- [ ] Links to source decisions work
- [ ] Duplicate features handled

## Dependencies
- **Requires**: Decisions in `.hodge/decisions.md`
- **Creates**: Feature directories in `.hodge/features/`
- **Related**: HODGE-004-id-management (for feature IDs)

## Next Steps
1. Implement DecisionParser class
2. Add extract-features command
3. Test with real exploration decisions
4. Add to explore workflow

## Related Features
- **HODGE-004**: ID management for features
- **HODGE-005**: Auto-population of directories
- **Parent**: feature-context-organization