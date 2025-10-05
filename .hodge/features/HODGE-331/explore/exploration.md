# Exploration: HODGE-331

## Title
Clean up hodge logs command pretty output to hide logger metadata

## Feature Overview
**PM Issue**: HODGE-331
**Type**: general
**Created**: 2025-10-05T06:01:24.893Z

## Problem Statement
The `hodge logs` command displays logger internal metadata (like `{ "name": "ship", "enableConsole": true }`) alongside log messages, making the output cluttered and difficult to read. Users need a clean, readable format that shows only relevant information.

## Conversation Summary
The issue stems from the recent dual logging implementation (HODGE-330) where logger metadata is appearing in the pretty-printed output. The current filtering logic at `src/commands/logs.ts:209-216` excludes some fields but misses logger-specific internals like `name`, `enableConsole`, etc.

Users want a clean format: `timestamp level [Command] message` with capitalized command names in brackets. When legitimate user data exists (not logger internals), it should be displayed line-by-line and indented below the main message for readability.

The solution should enhance the existing `formatLogLine` method to:
1. Properly identify and filter ALL logger internal fields
2. Capitalize and bracket command names
3. Format extra user data in a readable line-by-line structure
4. Preserve raw JSON output in non-pretty mode for debugging

## Implementation Approaches

### Approach 1: Expanded Blocklist Filtering
**Description**: Extend the existing exclusion list to include all known logger internal fields.

**Pros**:
- Minimal code changes - just expand the existing array
- Easy to understand and maintain
- Quick to implement

**Cons**:
- Fragile - new logger fields require manual updates
- Could miss future logger internals
- Reactive approach (fix after problems appear)

**When to use**: When the logger API is stable and internal fields are well-documented.

### Approach 2: Metadata Filtering with Structured Extra Data
**Description**: Identify logger internals by checking for pino/logger-specific property patterns, then format remaining data as line-by-line output.

**Pros**:
- More robust - catches logger internals even if fields change
- Cleaner output with structured extra data display
- Proactive approach (handles unknown logger fields)
- Formats user data readably (line-by-line, indented)

**Cons**:
- Slightly more complex logic
- Requires understanding of pino's metadata structure

**When to use**: When you want a future-proof solution that handles both current and future logger internals gracefully.

### Approach 3: Allowlist with Explicit User Data
**Description**: Only show fields that are explicitly marked as user data, filtering everything else by default.

**Pros**:
- Safest approach - nothing shows unless intended
- Completely eliminates logger metadata risk
- Clear contract for what appears in logs

**Cons**:
- Requires changes to how logging is done throughout the codebase
- More invasive - affects all log calls
- Could hide useful debug information unintentionally

**When to use**: When you need absolute control and are willing to update logging calls.

## Recommendation
**Approach 2: Metadata Filtering with Structured Extra Data**

This approach strikes the best balance:
- Handles current logger metadata issues robustly
- Future-proofs against new pino internal fields
- Provides readable line-by-line formatting for legitimate user data
- Requires changes only in the logs command (isolated impact)
- Maintains backward compatibility with existing log files

Implementation will enhance `formatLogLine` to:
1. Detect and filter pino/logger internals (hostname, name, enableConsole, etc.)
2. Capitalize command names and format as `[Command]`
3. Display extra user data line-by-line, indented: `  key: value`
4. Preserve raw JSON in non-pretty mode

## Test Intentions
Behavioral expectations to verify:

1. **Logger metadata hidden**: Internal fields like `name`, `enableConsole`, `hostname`, `pid` should not appear in pretty output
2. **Command formatting**: Command names should be capitalized and bracketed: `[Ship]`, `[Build]`, `[Explore]`
3. **Extra data formatting**: Legitimate user data should appear indented, line-by-line below the message
4. **Basic format preserved**: Output follows `timestamp level [Command] message` structure
5. **Raw mode intact**: `--no-pretty` flag still shows complete JSON for debugging

## Decisions Decided During Exploration
1. ✓ Use `timestamp level [Command] message` format (not minimal or verbose alternatives)
2. ✓ Improve logs command filtering rather than changing logger behavior
3. ✓ Display legitimate extra data line-by-line, indented (Option C format)
4. ✓ Use initial caps for command names (Ship, Build, Explore)

## No Decisions Needed

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions (optional - approach already clear)
- [ ] Proceed to `/build HODGE-331` with Approach 2

---
*Template created: 2025-10-05T06:01:24.893Z*
*Exploration completed: 2025-10-05T06:05:00.000Z*
