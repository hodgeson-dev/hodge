# Test Intentions for HODGE-283 - Standards Enforcement Clarity

## Purpose
Document what we intend to test for the standards enforcement clarity improvements.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Standards.md should have clear enforcement metadata for each section
- [ ] AI should correctly parse enforcement levels from metadata
- [ ] Enforcement should be progressive across phases
- [ ] Critical standards should remain clearly marked

## AI Understanding Tests
- [ ] AI correctly identifies which standards are suggestions in Explore phase
- [ ] AI correctly identifies which standards are required in Build phase
- [ ] AI correctly identifies which standards are mandatory in Harden phase
- [ ] AI correctly identifies which standards are blocking in Ship phase
- [ ] AI handles standards that apply to all phases (like CLI non-interactive)

## Slash Command Integration Tests
- [ ] /build command should check Build-level standards
- [ ] /harden command should check Harden-level standards and warn about violations
- [ ] /ship command should block on any mandatory standard violations
- [ ] Standards checking should happen automatically, not require manual review

## Documentation Tests
- [ ] Standards.md remains readable and clear for humans
- [ ] Enforcement levels are unambiguous
- [ ] No conflicts between section-level and item-level enforcement
- [ ] Progressive enforcement model is preserved

## Backward Compatibility Tests
- [ ] Existing features still work with updated standards
- [ ] Existing slash commands still parse standards correctly
- [ ] No breaking changes to project workflow
- [ ] Migration path is clear if changes needed

## Edge Cases
- [ ] Standards that evolve across phases (e.g., type safety)
- [ ] Standards that are always critical (e.g., security)
- [ ] Standards that have exceptions in certain contexts
- [ ] New standards added later inherit correct enforcement

## User Experience
- [ ] AI provides clear feedback about standards violations
- [ ] Enforcement level is obvious in error messages
- [ ] Suggestions vs requirements vs mandatory is clear
- [ ] Progressive path from explore to ship is intuitive

## Notes
Key scenarios to validate:
- AI running /build on code with `any` types (should pass)
- AI running /harden on code with `any` types (should warn/fail)
- AI running /ship without full test coverage (should block)
- AI understanding CLI non-interactive applies to all phases

---
*Generated during exploration phase. Convert to actual tests during build phase.*