# PM Status Tracking - Build Context

## Chosen Approach
**Convention-Based with Smart Defaults** (Decision made 2025-09-13)

## Key Requirements
1. `/explore feature-x` pulls PM issue data as exploration context
2. Automatic status transitions as modes change
3. Works with Linear first, extensible to other PM tools
4. Smart pattern matching with optional overrides

## Technical Decisions
- Use abstract base class for PM adapters
- Convention patterns in separate module for reusability
- Store overrides in `.hodge/pm-overrides.json`
- Cache PM state mappings for performance

## Files Being Created/Modified
- `src/lib/pm/base-adapter.ts` - Abstract PM adapter class
- `src/lib/pm/conventions.ts` - Pattern matching logic
- `src/lib/pm/linear-adapter.ts` - Linear implementation
- `src/lib/pm/index.ts` - PM module exports
- `src/lib/pm/types.ts` - TypeScript interfaces
- `src/lib/pm/pm-adapter.test.ts` - Tests

## Integration Points
- Mode manager will call PM adapter on transitions
- Explore command will fetch issue context
- Ship command will mark issues as done