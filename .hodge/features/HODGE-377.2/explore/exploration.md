# Exploration: PM-Required Feature Creation with Dynamic Issue Detection and Two-Step Workflow

**Created**: 2025-11-01
**Status**: Exploring

## Problem Statement

Hodge must support both targeted issue workflows (exploring a specific PM issue like HOD-123) and new feature workflows (creating PM issues after exploration), while intelligently distinguishing PM issue IDs from feature descriptions across all PM adapters (Linear, GitHub, Local).

## Context

**Project Type**: Framework Enhancement (Team Collaboration - PM Integration)

**Parent Feature**: HODGE-377 - Team Development with Feature Branches & Workflow Refinement

This is the second sub-feature of the HODGE-377 epic. It builds on HODGE-377.1's team mode detection infrastructure by implementing the actual feature creation workflows that enforce PM-provided IDs. The parent exploration established a Dual-Mode Architecture, though our exploration revealed this is better understood as "adapter selection" rather than distinct modes.

## Related Features

- HODGE-377 - Parent epic (Team Development)
- HODGE-377.1 - Team Mode Detection & Configuration (shipped)
- HODGE-002 - PM integration foundation
- HODGE-004 - Context management

## Conversation Summary

We explored how feature creation should work when PM integration is active, starting with the fundamental flow question: when does PM issue creation happen? The key insight was that PM issues should be created **after** the exploration summary is approved but **before** the AI writes exploration.md - this prevents orphaned issues from abandoned explorations while giving the AI the feature ID it needs to write files to the correct path.

The conversation revealed that "team mode" vs "solo mode" is really just a matter of which PM adapter is active (Linear, GitHub, or Local). All adapters follow identical workflows - there's no behavioral difference between using Linear and using the Local adapter. This significantly simplifies the mental model.

For PM ID detection, we determined adapter-specific regex patterns are needed since each PM tool uses different ID formats. The pattern must match the **entire input** (not just part of it) to distinguish issue IDs from descriptions that happen to contain ID-like strings.

We clarified two distinct workflows: **targeted issue** (`/explore HOD-123` where user knows the issue ID) and **new feature** (`/explore add user auth` where issue is created after exploration). For targeted issues, the CLI fetches the issue and presents confirmation options to prevent accidental wrong-issue exploration.

Re-exploration emerged as an important use case - developers should be able to revisit features when approaches need reconsideration. The `--rerun` flag provides explicit intent and forces the user to provide context for why they're re-exploring. The old exploration.md gets overwritten (preserved in git history) to keep the current version as the single source of truth.

Error handling prioritized fail-fast for this feature - retry and queue logic adds complexity better suited for HODGE-377.4 (Enhanced PM Sync). When PM operations fail in 377.2, the command errors clearly and the user retries when PM is available.

Finally, we discovered that test-intentions.md is redundant - the CLI creates it with placeholder content, but the AI already writes test intentions into exploration.md during conversation synthesis. We should remove the CLI's test-intentions.md creation entirely.

## Implementation Approaches

### Approach 1: Two-Step Dynamic Detection Workflow (Recommended)

**Description**:

Adapter-agnostic workflow where PM issue creation happens after exploration approval but before file writing. Each PM adapter provides its own ID detection regex. The CLI handles PM operations (fetch/create), returns IDs to AI, and AI writes exploration files to the returned feature path.

**Architecture**:
```typescript
// PM Adapter interface (existing, extends with ID detection)
interface PMAdapter {
  isValidIssueID(input: string): boolean;  // New method
  fetchIssue(id: string): Promise<PMIssue>;
  createIssue(title: string, description: string): Promise<PMIssue>;
}

// Linear adapter
class LinearAdapter implements PMAdapter {
  isValidIssueID(input: string): boolean {
    return /^[A-Z]+-\d+$/.test(input);  // HOD-123, PROJ-456
  }
}

// GitHub adapter
class GitHubAdapter implements PMAdapter {
  isValidIssueID(input: string): boolean {
    return /^#?\d+$/.test(input);  // #123 or 123
  }
}

// Local adapter
class LocalAdapter implements PMAdapter {
  isValidIssueID(input: string): boolean {
    return /^HOD-\d+$/.test(input);  // HOD-001
  }
}

// Opening call workflow
async function exploreOpening(input: string) {
  const adapter = getActiveAdapter();  // From config

  if (adapter.isValidIssueID(input)) {
    // Targeted issue workflow
    const issue = await adapter.fetchIssue(input);
    console.log(`Found PM issue: ${issue.id} - ${issue.title}`);
    console.log(`Description: ${issue.description}`);
    console.log('Options: a) Use this issue, b) Cancel, c) Create different issue');
    // AI template handles user choice
  } else {
    // New feature workflow - just pass through
    console.log('Starting new feature exploration');
  }
}

// Closing call workflow (new --create-issue flag)
async function exploreClosing(title: string, description: string) {
  const adapter = getActiveAdapter();
  const issue = await adapter.createIssue(title, description);

  // Create directory
  const featureDir = `.hodge/features/${issue.id}/explore/`;
  await fs.mkdir(featureDir, { recursive: true });

  // Return feature ID to AI
  console.log(`Feature ID: ${issue.id}`);
  return issue.id;
}

// AI template then writes:
// .hodge/features/${returned_id}/explore/exploration.md
```

**New CLI Commands**:
```bash
# Opening call (existing, enhanced with ID detection)
hodge explore <input>
  - If input matches adapter's ID pattern → fetch issue, confirm
  - If input doesn't match → pass through as description

# Closing call (new flag for issue creation)
hodge explore --create-issue --title "..." --description "..."
  - Creates PM issue via active adapter
  - Creates feature directory
  - Returns feature ID to AI

# Re-exploration (new flag)
hodge explore <issue-id> --rerun "reason for re-exploring"
  - Reads existing exploration.md for context
  - AI starts conversation with re-exploration focus
  - Overwrites exploration.md after new synthesis
```

**Pros**:
- Clean separation: CLI handles PM operations, AI handles content
- Adapter-agnostic implementation (all adapters use same workflow)
- No orphaned PM issues (created only after approval)
- AI gets feature ID before writing files (no chicken-egg problem)
- Simple error handling (fail fast, clear messages)
- Explicit re-exploration intent (prevents accidents)

**Cons**:
- Requires new `--create-issue` flag on explore command
- Two CLI calls per exploration (opening + closing)
- Adapter developers must implement `isValidIssueID()` method
- No retry/queue logic for PM failures (acceptable, deferred to 377.4)

**When to use**:
When you want consistent PM integration across all adapters with clear separation of concerns between CLI (operations) and AI (content).

---

### Approach 2: AI-Driven PM Operations

**Description**:

AI template calls PM adapter methods directly through a new PM service, eliminating the two-step CLI workflow. AI detects IDs, fetches issues, creates issues, and writes files in one continuous flow.

**Architecture**:
```typescript
// AI template pseudo-code
const input = getUserInput();
const pmService = new PMService();

// Detect ID
if (pmService.looksLikeIssueID(input)) {
  const issue = await pmService.fetchIssue(input);
  // Show to user, start exploration with issue context
}

// After exploration approval
const issue = await pmService.createIssue(title, description);
writeFile(`.hodge/features/${issue.id}/explore/exploration.md`, content);
```

**Pros**:
- Single flow (no CLI round-trips)
- AI has full control over timing
- Simpler from user's perspective (one command)
- More flexible (AI can adapt flow based on conversation)

**Cons**:
- Violates "CLI handles PM operations" separation from standards
- AI template becomes more complex
- Harder to test (PM operations embedded in template logic)
- Inconsistent with existing patterns (CLI owns PM integration)
- Error handling harder (AI template must handle PM failures)

**When to use**:
When AI templates need fine-grained control over PM timing and you're willing to embed operational logic in templates.

---

### Approach 3: Placeholder ID with Lazy PM Creation

**Description**:

CLI generates temporary placeholder ID (e.g., `PENDING-001`) immediately, AI writes files using placeholder, then CLI replaces placeholder with real PM ID after issue creation succeeds.

**Architecture**:
```typescript
// Opening: Generate placeholder
const placeholderId = generatePlaceholder();  // PENDING-001
createDirectory(`.hodge/features/${placeholderId}/explore/`);
console.log(`Temporary ID: ${placeholderId}`);

// AI writes files to PENDING-001/explore/

// Closing: Replace placeholder
const realIssue = await adapter.createIssue(title, description);
renameDirectory(`.hodge/features/${placeholderId}`, `.hodge/features/${realIssue.id}`);
updateFiles(placeholderId, realIssue.id);  // Update references in files
```

**Pros**:
- AI gets ID immediately (no waiting for PM)
- Simpler AI template (doesn't need to handle two-step)
- Can queue PM creation for retry without blocking
- Works even when PM is temporarily unavailable

**Cons**:
- Directory renaming is fragile (what if other processes reference it?)
- File content updates error-prone (might miss references)
- Placeholder IDs confusing ("what is PENDING-001?")
- Adds complexity for marginal benefit
- Git history shows directory rename (messy)

**When to use**:
When PM availability is unreliable and you need to continue work regardless of PM status.

---

## Recommendation

**Approach 1 - Two-Step Dynamic Detection Workflow**

**Rationale**:

Approach 1 provides the cleanest separation of concerns while maintaining consistency with Hodge's architectural principles. The CLI owns PM operations (fetch, create), the AI owns content (exploration synthesis, file writing), and the two-step workflow eliminates the chicken-egg problem of needing a feature ID before writing files.

The adapter-agnostic implementation is elegant - all three adapters (Linear, GitHub, Local) implement the same `isValidIssueID()` method and follow identical workflows. This eliminates the confusing "team mode" vs "solo mode" mental model in favor of simpler "which adapter is configured?" thinking.

ID detection being adapter-specific but workflow being adapter-agnostic strikes the right balance. Each adapter knows its own ID format (Linear uses `PROJ-123`, GitHub uses `#123`, Local uses `HOD-001`), but all follow the same two-step creation process.

Re-exploration with the `--rerun` flag provides explicit intent without complex version management. Overwriting exploration.md keeps the current version as the single source of truth while git history preserves old versions for reference.

Error handling via fail-fast is appropriate for this feature. Retry and queue logic belongs in HODGE-377.4 (Enhanced PM Sync) where we're building comprehensive PM synchronization. For 377.2, clear error messages and user retry is sufficient.

Removing test-intentions.md eliminates redundancy - test intentions belong in exploration.md as part of the exploration document, not in a separate file that just duplicates content.

The two CLI calls (opening + closing) might seem like overhead, but it's actually clearer: opening handles "what are we exploring?" and closing handles "create the PM issue now." This maps well to the conversational exploration workflow.

## Test Intentions

### Core Behaviors

1. **Detects PM issue IDs using adapter-specific patterns**
   - Linear adapter: Matches `PROJ-123` format, rejects `#123` or `HOD-001`
   - GitHub adapter: Matches `#123` or `123` format, rejects `PROJ-123`
   - Local adapter: Matches `HOD-001` format, rejects other formats
   - All adapters: Only match if entire input matches (not partial)

2. **Fetches existing PM issue when ID detected**
   - Input: `/explore HOD-123`
   - CLI calls active adapter's `fetchIssue("HOD-123")`
   - Displays issue title, description, URL
   - Presents options: a) Use this issue, b) Cancel, c) Create different issue
   - AI template receives issue context

3. **Errors clearly when PM issue not found**
   - Input: `/explore HOD-999` (doesn't exist)
   - CLI attempts fetch, receives 404
   - Error message: "Issue HOD-999 not found in [adapter name]. Check issue ID or create new feature."
   - Command exits (no continuation)

4. **Treats non-matching input as feature description**
   - Input: `/explore add user authentication`
   - Adapter's `isValidIssueID()` returns false
   - CLI passes through as description
   - AI starts new feature exploration conversation

5. **Creates PM issue after exploration summary approved**
   - User approves exploration synthesis
   - AI calls `hodge explore --create-issue --title "..." --description "..."`
   - CLI creates issue via active adapter
   - CLI creates directory `.hodge/features/{issue-id}/explore/`
   - CLI returns feature ID to AI

6. **AI writes exploration.md to correct feature path**
   - After receiving feature ID from CLI
   - AI writes `.hodge/features/{issue-id}/explore/exploration.md`
   - File contains full exploration synthesis (including test intentions)
   - No test-intentions.md file created

7. **Supports re-exploration with --rerun flag**
   - Input: `/explore HOD-123 --rerun "Need to reconsider authentication approach"`
   - CLI checks if exploration.md exists
   - If exists: Loads existing content for AI context
   - AI starts conversation: "I see you previously explored this. What needs reconsideration?"
   - After synthesis: Overwrites exploration.md (old version in git history)

8. **Errors when re-exploring without --rerun flag**
   - Input: `/explore HOD-123` (already has exploration.md)
   - CLI detects existing exploration
   - Error: "HOD-123 already explored. Use --rerun to re-explore or /build to continue."
   - Prevents accidental overwrites

9. **Fails fast when PM issue creation fails**
   - API returns error (network, auth, rate limit)
   - CLI shows clear error: "Failed to create PM issue: [error details]"
   - Command exits without creating files
   - User retries when PM is available
   - No queuing/retry logic (deferred to HODGE-377.4)

10. **Does not create test-intentions.md file**
    - After exploration, only exploration.md exists
    - Test intentions section is part of exploration.md
    - No separate test-intentions.md file in explore/ directory

### Edge Cases

11. **Handles partial ID matches in descriptions**
    - Input: `/explore Fix ABC-123 bug in authentication`
    - Adapter's regex doesn't match (not entire input)
    - Treated as feature description, not ID
    - AI starts new feature exploration

12. **Handles multiple credentials with adapter selection**
    - Both Linear and GitHub credentials present
    - Config specifies `pm.tool: "linear"`
    - Uses Linear adapter for ID detection and operations
    - GitHub adapter ignored

13. **Validates adapter is configured before PM operations**
    - Active adapter is Local (no PM credentials)
    - `/explore HOD-123` works (Local adapter handles it)
    - Feature creation works (Local generates HOD-XXX IDs)
    - No errors about missing PM credentials

14. **Preserves existing exploration when re-run canceled**
    - User starts `/explore HOD-123 --rerun "..."`
    - During conversation, user decides not to proceed
    - Original exploration.md unchanged
    - No partial/temp files created

15. **Handles whitespace in issue ID input**
    - Input: `/explore  HOD-123  ` (extra spaces)
    - CLI trims input before pattern matching
    - Successfully detects as issue ID
    - Fetches issue HOD-123

## Decisions Decided During Exploration

1. ✓ **PM issue creation timing**: After exploration summary approved by user, before AI writes exploration.md
2. ✓ **Issue ID detection**: Adapter-specific regex patterns, entire input must match (not partial matches)
3. ✓ **Targeted issue workflow**: `/explore HOD-123` fetches issue from active adapter, shows confirmation options (use/cancel/create different)
4. ✓ **Re-exploration**: `--rerun` flag with reason required, overwrites exploration.md
5. ✓ **File creation**: Two-step process (User approves → CLI creates issue & returns ID → AI writes exploration.md)
6. ✓ **Error handling**: Fail fast on PM errors (no queue/retry in this feature)
7. ✓ **Files created**: Only exploration.md (remove test-intentions.md creation from CLI)
8. ✓ **Re-exploration file strategy**: Overwrite completely, git history preserves old versions
9. ✓ **Retry/queue mechanism**: Deferred to HODGE-377.4 (Enhanced PM Sync)
10. ✓ **Queue processing trigger**: Opportunistic retry at start of next workflow command (part of HODGE-377.4)
11. ✓ **No "team mode" distinction**: All adapters (Linear, GitHub, Local) use identical workflow
12. ✓ **Adapter selection**: Based on `pm.tool` config setting when multiple credentials present
13. ✓ **ID pattern matching**: Must match entire input string, not substring within larger description
14. ✓ **Confirmation flow**: Show fetched issue details with options (a/b/c) rather than just yes/no

## No Decisions Needed

All architectural questions resolved during exploration conversation.

## Next Steps

1. ✅ Exploration complete - all decisions resolved
2. Ready for `/build HODGE-377.2` to implement PM-required feature creation
3. This builds on HODGE-377.1's adapter infrastructure and enables HODGE-377.5 (Feature ID abstraction)
