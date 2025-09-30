# PM Mapping Check Pattern

**Category**: template-validation
**Frequency**: Used in slash commands
**Confidence**: 95%

## Description
Pattern for checking if a feature has a PM issue with actual external ID mapping. This pattern correctly distinguishes between:
- Features with PM issues created (has `externalID` field)
- Features with local ID only (no PM issue created yet)

## The Problem
Simple grep for feature ID returns false positives:
```bash
# ❌ WRONG: Returns true even without externalID
cat .hodge/id-mappings.json | grep "HODGE-298"
```

This matches entries like:
```json
"HODGE-298": {
  "localID": "HODGE-298",
  "created": "2025-09-29T19:09:56.299Z"
  // NO externalID - PM issue NOT created
}
```

## The Solution
Enhanced grep pattern that checks for `externalID` field:
```bash
# ✅ CORRECT: Only returns true if externalID exists
cat .hodge/id-mappings.json | grep -A 2 "\"{{feature}}\"" | grep "externalID"
```

## How It Works
1. `grep -A 2 "\"{{feature}}\""` - Find the feature ID and include 2 lines after it
2. `| grep "externalID"` - Check if those lines contain externalID field
3. Exit code 0 = externalID found (PM issue exists)
4. Exit code 1 = externalID not found (no PM issue)

## Examples

### Example 1: Entry WITH externalID (mapped)
```json
"HODGE-297": {
  "localID": "HODGE-297",
  "created": "2025-09-29T18:34:46.744Z",
  "externalID": "4aa0eecf-5b2b-4c0f-ba16-d89fed8cb98d",
  "pmTool": "linear"
}
```
Result: grep exits 0 (found)

### Example 2: Entry WITHOUT externalID (unmapped)
```json
"HODGE-298": {
  "localID": "HODGE-298",
  "created": "2025-09-29T19:09:56.299Z"
}
```
Result: grep exits 1 (not found)

### Example 3: Sub-story IDs (HODGE-297.1)
```json
"HODGE-297.1": {
  "localID": "HODGE-297.1",
  "created": "2025-09-29T18:49:50.922Z",
  "externalID": "136191a8-5027-41d6-acea-4ee179a4bbaf",
  "pmTool": "linear"
}
```
Result: Pattern handles dots correctly

## When to Use
- Slash command templates that need to check PM issue status
- Before prompting user to create PM issues
- When deciding whether to update PM issue status
- Any template that branches based on PM tracking

## Testing
See `src/lib/claude-commands.smoke.test.ts` for smoke tests that verify:
- Detects entries WITH externalID as mapped
- Detects entries WITHOUT externalID as unmapped
- Handles feature IDs with dots (HODGE-XXX.Y format)

## Related Patterns
- `input-validation.md` - Validate before processing
- `error-boundary.md` - Handle missing files gracefully

## History
- **2025-09-30**: Created for HODGE-309 (fix false positive in HODGE-306)
- **Issue**: build.md was showing mapped when externalID missing
- **Fix**: Enhanced grep pattern to check for externalID field

---
*First seen: 2025-09-30T19:40:00.000Z*
*Pattern type: Bash command in AI template*
