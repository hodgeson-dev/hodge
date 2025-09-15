# Decision: HOD-20 Core Mode Commands

## Decision Summary
**Date**: 2025-01-19
**Status**: Accepted
**Approach**: Lightweight Command Pattern

## Rationale
After exploring three implementation approaches, the Lightweight Command Pattern was chosen because:
- Maintains consistency with existing init command pattern
- Simple and straightforward implementation
- Quick to ship, aligning with "ship fast, iterate often" philosophy
- Easy for future developers to understand and maintain
- Can evolve to more complex architecture if needed later

## Next Steps
- Ready for `/build HOD-20` to implement the chosen approach
- Implementation will follow the init command pattern exactly
- Each command (explore/build/harden) as separate class in `src/commands/`

## PM Integration
✅ Decision has been:
- Documented in `.hodge/decisions.md`
- Added as comment to Linear issue HOD-20
- Saved locally in exploration directory

Use `/build HOD-20` to start implementation.