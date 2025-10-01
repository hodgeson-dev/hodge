# Test Intentions: HODGE-313

## What Should This Feature Do?

This feature should ensure PM issues created via `/build` (without prior `/plan`) have meaningful descriptions extracted from decisions, not "No description available".

## Behavior Checklist

### Core Behavior
- [ ] When creating PM issue after `/decide` without `/explore`, description should be extracted from decisions
- [ ] PM issue title should be `"HODGE-XXX: <meaningful description>"` not `"HODGE-XXX: No description available"`
- [ ] Existing `/plan` after `/explore` behavior should remain unchanged (use exploration.md)

### Description Extraction Logic
- [ ] Should prioritize decisions containing "implement", "approach", "use"
- [ ] Should fall back to first substantial decision (>30 chars)
- [ ] Should clean decision text (remove phase markers like `[harden]`)
- [ ] Should truncate long descriptions appropriately (100 chars)
- [ ] Should handle missing decisions gracefully

### Edge Cases
- [ ] Feature with no exploration.md and no decisions → "No description available" (acceptable)
- [ ] Feature with only 1 very short decision → use that decision
- [ ] Feature with many technical decisions → extract most descriptive one
- [ ] Feature with existing exploration.md → use exploration (unchanged)

## Success Criteria

**The fix is successful when:**
1. PM issues created from `/build` after `/decide` have meaningful titles
2. The description accurately reflects the feature based on decisions
3. No regression in existing exploration-based description extraction
4. Works for both single issues and epics
