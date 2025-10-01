# Build Plan: HODGE-283 - Standards Enforcement Clarity

## Feature Overview
**PM Issue**: HODGE-283 (linear)
**Status**: In Progress
**Purpose**: Add clear enforcement metadata to standards documentation to help AI assistants understand when each standard applies

## Implementation Checklist

### Core Implementation
- [x] Add enforcement metadata headers to each section in standards.md
- [x] Create quick reference table showing enforcement by phase
- [x] Add Standards Enforcement Guide to principles.md
- [x] Maintain backward compatibility with existing standards

### Integration
- [x] Update standards.md with enforcement metadata
- [x] Update principles.md with interpretation guide
- [x] Preserve existing critical markers and warnings
- [x] Ensure all enforcement levels are clearly documented

### Quality Checks
- [x] Follow coding standards (documentation standards)
- [x] Use consistent enforcement notation format
- [x] Maintain readability for both humans and AI
- [x] Consider all four phases (Explore/Build/Harden/Ship)

## Files Modified
- `.hodge/standards.md` - Added enforcement metadata headers and quick reference table
- `.hodge/principles.md` - Added Standards Enforcement Guide section
- `src/test/standards-enforcement.smoke.test.ts` - Created smoke tests for validation

## Decisions Made
- **Enhanced Header Metadata approach chosen**: Provides best balance of clarity and minimal changes
- **Format standardized**: `**Enforcement: Build(suggested) → Harden(required) → Ship(mandatory)**`
- **Special notation for critical standards**: `**Enforcement: ALL PHASES (mandatory)**`
- **Quick reference table added**: Provides at-a-glance understanding of enforcement progression

## Testing Notes
- Smoke tests verify enforcement metadata is present and parseable
- Tests confirm quick reference table exists
- Tests validate Standards Enforcement Guide in principles.md
- All 7 smoke tests passing

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-283` for production readiness
