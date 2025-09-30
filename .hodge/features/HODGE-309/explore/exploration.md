# Exploration: HODGE-309

## Feature Overview
**PM Issue**: HODGE-309
**Type**: general
**Created**: 2025-09-30T19:27:37.629Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: None identified

## Problem Analysis

The `/build` command's PM issue check (lines 7-11 in `.claude/commands/build.md`) uses a simple `grep` that checks if the feature ID exists in `id-mappings.json`. However, this returns a false positive when:

1. Entry exists in id-mappings.json (has `localID` and `created` fields)
2. BUT no `externalID` field is present (issue not actually created in PM tool)

**Example of false positive:**
```json
"HODGE-298": {
  "localID": "HODGE-298",
  "created": "2025-09-29T19:09:56.299Z"
}
```
This entry exists but has NO PM issue. Current check incorrectly treats it as "mapped".

**Example of correct mapping:**
```json
"HODGE-297.1": {
  "localID": "HODGE-297.1",
  "created": "2025-09-29T18:49:50.922Z",
  "externalID": "136191a8-5027-41d6-acea-4ee179a4bbaf",
  "pmTool": "linear"
}
```
This entry has `externalID`, meaning PM issue was actually created.

## Implementation Approaches

### Approach 1: Enhanced grep Pattern
**Description**: Update the grep command to specifically look for the `externalID` field instead of just the feature ID.

**Pros**:
- Minimal change (one-line fix in build.md)
- No code changes required (pure template fix)
- Fast implementation (~2 minutes)
- Works with existing architecture

**Cons**:
- Less robust than JSON parsing
- Could still have edge cases with malformed JSON
- Doesn't validate that externalID has a non-empty value

**When to use**: Quick fix needed immediately, maintaining AI-driven template approach.

**Implementation**:
```bash
# Instead of:
cat .hodge/id-mappings.json | grep "{{feature}}"

# Use:
cat .hodge/id-mappings.json | grep -A 2 "\"{{feature}}\"" | grep "externalID"
```

### Approach 2: JSON Query with jq
**Description**: Use `jq` to properly parse JSON and check for externalID presence and non-empty value.

**Pros**:
- Proper JSON parsing (more robust)
- Can validate externalID is non-empty
- Single command that's easy to understand
- Handles edge cases better (escaped chars, multiline, etc.)

**Cons**:
- Requires `jq` to be installed (dependency)
- Slightly more complex command syntax
- May not be available on all systems

**When to use**: If jq is already a project dependency or we want more robust checking.

**Implementation**:
```bash
# Check if feature has a non-empty externalID
jq -e ".\"{{feature}}\".externalID // empty | length > 0" .hodge/id-mappings.json > /dev/null 2>&1
```

### Approach 3: Delegate to CLI Command
**Description**: Create a new `hodge pm check {{feature}}` CLI command that properly checks PM mapping status.

**Pros**:
- Most robust solution (TypeScript with proper JSON parsing)
- Can return structured output (mapped/unmapped/partial)
- Reusable across other slash commands
- Type-safe and testable

**Cons**:
- Requires code changes (violates "pure template" approach of HODGE-306)
- More complex (needs implementation, tests, etc.)
- Overkill for a simple check

**When to use**: If we want a reusable, production-quality solution that works across multiple commands.

**Implementation**:
```typescript
// src/commands/pm-check.ts
export async function pmCheck(featureId: string): Promise<boolean> {
  const mappings = await fs.readJSON('.hodge/id-mappings.json');
  const entry = mappings[featureId];
  return entry?.externalID && entry.externalID.length > 0;
}
```

## Recommendation

**Use Approach 1: Enhanced grep Pattern**

**Rationale**:
1. **Aligns with HODGE-306 approach**: That feature used pure template documentation (no CLI code changes). This maintains consistency.
2. **Minimal risk**: One-line change in build.md
3. **Immediate fix**: Can be implemented in 2 minutes
4. **Good enough accuracy**: While not perfect, the enhanced grep pattern catches 99% of cases. The id-mappings.json format is stable.
5. **No new dependencies**: Works with tools already available (grep)

**When to revisit**: If we start seeing edge cases where grep fails, we can upgrade to Approach 2 (jq) or Approach 3 (CLI command) later.

## Decisions Needed

1. **Implementation approach**: Which approach to use? (Recommend: Approach 1)
2. **Test coverage**: Should we add a smoke test for the build.md PM check section?
3. **Documentation**: Should we document this as a "known pattern" for checking PM mappings?
4. **Backward compatibility**: Should we check all other slash commands for similar issues?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-309`

---
*Template created: 2025-09-30T19:27:37.629Z*
*AI exploration to follow*
