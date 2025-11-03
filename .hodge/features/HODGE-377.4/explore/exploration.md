# Exploration: Enhanced PM Synchronization - Rich Comments, Blocker Detection, and Team Visibility

**Created**: 2025-11-03
**Status**: Exploring

## Problem Statement

Teams using Hodge need visibility into feature progress on their PM boards, but current PM integration is one-way (local → remote) with minimal context. PM issues lack decision summaries, blocker tracking, and ship notifications, forcing team members to check local feature directories or ask developers directly for status updates.

## Context

**Project Type**: Framework Enhancement (Team Collaboration - PM Integration)

**Parent Feature**: HODGE-377 - Team Development with Feature Branches & Workflow Refinement

This is the fourth sub-feature of the HODGE-377 epic. It builds on HODGE-377.1's team mode detection, HODGE-377.2's PM-required feature creation, and HODGE-377.3's gitignore/regeneration infrastructure by implementing rich PM synchronization that provides team visibility into feature progress.

## Related Features

- HODGE-377 - Parent epic (Team Development)
- HODGE-377.1 - Team Mode Detection & Configuration (shipped)
- HODGE-377.2 - PM-Required Feature Creation (shipped)
- HODGE-377.3 - Auto-Generated File Management (shipped)
- HODGE-002 - PM integration foundation
- HODGE-004 - Context management

## Conversation Summary

We explored how to enhance PM integration beyond simple issue creation to provide rich team visibility. The key insight: PM issues should serve as communication hubs where team members see decision progress, blocker status, and ship confirmations without needing access to local feature directories.

The conversation clarified the decisions file strategy across workflows: feature-level decisions live in `.hodge/features/{feature-id}/decisions.md` (distinct from exploration decisions in `exploration.md`), while project-level decisions use `.hodge/decisions.md` via `/codify`. This separation preserves exploration as high-level approach selection while decisions.md captures detailed implementation choices made during the `/decide` process (which becomes `/refine` in HODGE-377.6).

For PM comments, we determined that inline summaries are more valuable than file links - team members reading PM issues benefit from seeing "3 decisions made: PostgreSQL for persistence, OAuth2 flow, Redis caching" rather than clicking through to decisions.md. Each comment type gets a distinct emoji for visual scanning: 📋 for decisions, 🚀 for ships, ⚠️ for blockers.

Blocker detection emerged as a collaborative AI-user workflow: the AI proactively identifies potential blockers during `/decide` conversations (dependency analysis, missing requirements) and asks the user for confirmation. Blockers are stored locally in `ship-record.json` for persistence and auto-cleared when `/ship` succeeds. The configuration supports both status-based workflows (Linear, GitHub status fields) and label-based workflows (GitHub labels, Linear custom fields) through `pm.blockerHandling.method`.

Comment failure handling follows HODGE-377.1's graceful degradation pattern: failed PM operations queue for retry rather than blocking local development. This ensures developers can continue working even when PM services are temporarily unavailable.

All three PM adapters (Linear, GitHub, Local) must support comment appending. The Local adapter logs comments to a file and maintains status in ship-record.json, providing the same workflow consistency as remote adapters.

Issue description updates were deferred - we set title and description at feature creation (end of `/explore`), but skip file links since code won't be pushed to a public branch yet. This prevents broken links and aligns with the "PM issue created after exploration approval" workflow from HODGE-377.2.

## Implementation Approaches

### Approach 1: Adapter-Agnostic Comment Service with Retry Queue (Recommended)

**Description**:

Create a centralized `PMCommentService` that handles comment appending, blocker management, and retry logic for all PM adapters. Each adapter implements a simple `appendComment()` and `updateStatus()` interface. Failed operations queue locally and retry opportunistically on next workflow command.

**Architecture**:
```typescript
// New service: PMCommentService
class PMCommentService {
  constructor(
    private adapter: BasePMAdapter,
    private queuePath: string = '.hodge/pm-queue.json'
  ) {}

  async appendDecisionComment(
    issueId: string,
    decisions: Decision[],
    hasNewDecisions: boolean
  ): Promise<void> {
    const summary = this.formatDecisionSummary(decisions);
    const comment = `📋 Decisions ${hasNewDecisions ? 'Finalized' : 'Reviewed'} (${decisions.length} decisions)\n\n${summary}\n\nStatus: Ready to build`;

    await this.appendWithRetry(issueId, comment);
  }

  async appendShipComment(
    issueId: string,
    commitSha: string,
    qualityResults: QualityResult[],
    timestamp: Date
  ): Promise<void> {
    const commitLink = await this.constructCommitLink(commitSha);
    const gates = this.formatQualityGates(qualityResults);
    const comment = `🚀 Shipped in commit ${commitSha}\n\n${commitLink}\n\n${gates}\n\nShipped: ${timestamp.toISOString()}`;

    await this.appendWithRetry(issueId, comment);
  }

  async markBlocked(
    issueId: string,
    blockerDetails: string,
    config: BlockerConfig
  ): Promise<void> {
    const comment = `⚠️ Blocked\n\n${blockerDetails}`;
    await this.appendWithRetry(issueId, comment);

    // Update status/label based on config
    if (config.method === 'status') {
      await this.updateStatusWithRetry(issueId, config.blockedStatus);
    } else if (config.method === 'label') {
      await this.addLabelWithRetry(issueId, config.blockedLabel);
    }
  }

  private async appendWithRetry(issueId: string, comment: string): Promise<void> {
    try {
      await this.adapter.appendComment(issueId, comment);
    } catch (error) {
      await this.queueOperation({ type: 'comment', issueId, comment });
      logger.warn('PM comment queued for retry', { issueId });
    }
  }

  async processQueue(): Promise<void> {
    const queue = await this.loadQueue();
    for (const op of queue) {
      try {
        if (op.type === 'comment') {
          await this.adapter.appendComment(op.issueId, op.comment);
        } else if (op.type === 'status') {
          await this.adapter.updateStatus(op.issueId, op.status);
        }
        await this.removeFromQueue(op);
      } catch (error) {
        // Keep in queue for next retry
        logger.debug('PM operation retry failed, keeping in queue', { op });
      }
    }
  }
}

// BasePMAdapter interface additions
interface BasePMAdapter {
  // Existing methods...
  appendComment(issueId: string, comment: string): Promise<void>;
  updateStatus(issueId: string, status: string): Promise<void>;
  addLabel(issueId: string, label: string): Promise<void>;
}

// Configuration
interface BlockerConfig {
  method: 'status' | 'label';
  blockedStatus?: string;  // e.g., "Blocked"
  blockedLabel?: string;   // e.g., "blocked"
}

// Ship record blocker tracking
interface ShipRecord {
  // Existing fields...
  blocked?: {
    reason: string;
    timestamp: string;
  };
}
```

**Integration Points**:
```typescript
// In DecideCommand
class DecideCommand {
  async execute(): Promise<void> {
    // ... existing decide logic ...

    // After writing decisions.md
    const decisions = await this.loadDecisions(featureId);
    const hasNewDecisions = /* check if decisions were added */;

    await this.pmCommentService.appendDecisionComment(
      issueId,
      decisions,
      hasNewDecisions
    );

    // If blocker detected during conversation
    if (blockerDetected) {
      await this.pmCommentService.markBlocked(
        issueId,
        blockerDetails,
        this.config.pm.blockerHandling
      );

      // Update ship-record.json
      await this.updateShipRecord(featureId, {
        blocked: {
          reason: blockerDetails,
          timestamp: new Date().toISOString()
        }
      });
    }
  }
}

// In ShipCommand
class ShipCommand {
  async execute(): Promise<void> {
    // ... existing ship logic ...

    // After git commit succeeds
    const commitSha = await this.getCommitSha();
    const qualityResults = shipRecord.qualityResults;

    await this.pmCommentService.appendShipComment(
      issueId,
      commitSha,
      qualityResults,
      new Date()
    );

    // Clear blocker if present
    if (shipRecord.blocked) {
      await this.clearBlocker(issueId);
      delete shipRecord.blocked;
      await this.saveShipRecord(shipRecord);
    }
  }
}

// Opportunistic queue processing
class ExploreCommand {
  async execute(): Promise<void> {
    await this.pmCommentService.processQueue(); // Retry queued operations
    // ... rest of explore logic ...
  }
}
```

**Pros**:
- Adapter-agnostic implementation (all adapters use same service)
- Graceful degradation (queue for retry on failure)
- Centralized comment formatting (consistency across commands)
- Simple adapter interface (`appendComment`, `updateStatus`, `addLabel`)
- Opportunistic retry minimizes latency (processes queue on next command)
- Clear separation: PMCommentService handles PM sync, commands handle workflow

**Cons**:
- Adds pm-queue.json file to `.hodge/` directory
- Queue processing adds latency to all workflow commands
- Retry logic adds complexity (queue management, deduplication)
- Formatting logic centralized (harder to customize per-adapter if needed)

**When to use**:
When you want robust PM synchronization that doesn't block local development and provides consistent comment formatting across all adapters.

---

### Approach 2: Adapter-Specific Comment Implementations

**Description**:

Each PM adapter implements its own comment formatting and retry logic. Commands call adapter methods directly with raw data (decisions array, quality results), and adapters format comments according to their platform conventions.

**Architecture**:
```typescript
// LinearAdapter
class LinearAdapter implements BasePMAdapter {
  async appendDecisionComment(decisions: Decision[], hasNew: boolean): Promise<void> {
    // Linear-specific formatting (maybe use Linear's markdown features)
    const comment = this.formatForLinear(decisions, hasNew);
    await this.client.createComment({ issueId, body: comment });
  }

  async appendShipComment(commitSha: string, results: QualityResult[]): Promise<void> {
    // Linear-specific ship comment format
    const comment = `🚀 Shipped in ${commitSha}\n...`;
    await this.client.createComment({ issueId, body: comment });
  }
}

// GitHubAdapter
class GitHubAdapter implements BasePMAdapter {
  async appendDecisionComment(decisions: Decision[], hasNew: boolean): Promise<void> {
    // GitHub-specific formatting (maybe use GitHub's task lists)
    const comment = this.formatForGitHub(decisions, hasNew);
    await this.octokit.issues.createComment({ issue_number, body: comment });
  }
}

// Commands call adapter methods directly
class DecideCommand {
  async execute(): Promise<void> {
    const decisions = await this.loadDecisions();
    await this.adapter.appendDecisionComment(decisions, hasNewDecisions);
  }
}
```

**Pros**:
- Adapters can customize formatting for their platform
- No centralized service layer (simpler architecture)
- Platform-specific features available (Linear markdown, GitHub task lists)
- Easier to add adapter-specific enhancements

**Cons**:
- Duplicated formatting logic across adapters
- Inconsistent comment formats across platforms
- Retry logic duplicated in each adapter (or missing)
- Commands tightly coupled to adapter interfaces
- Harder to test (formatting spread across adapters)

**When to use**:
When platform-specific comment features are valuable enough to justify duplicated logic and you don't need graceful degradation.

---

### Approach 3: Event-Based PM Sync

**Description**:

Commands emit events (`DecisionFinalized`, `FeatureShipped`, `BlockerDetected`) and a `PMSyncService` listens for events, formats comments, and handles synchronization asynchronously.

**Architecture**:
```typescript
// Event emitter
class WorkflowEventEmitter {
  emit(event: 'decision_finalized', data: DecisionFinalizedEvent): void;
  emit(event: 'feature_shipped', data: FeatureShippedEvent): void;
  emit(event: 'blocker_detected', data: BlockerDetectedEvent): void;
}

// PM sync service listens
class PMSyncService {
  constructor(private emitter: WorkflowEventEmitter) {
    this.emitter.on('decision_finalized', this.handleDecision.bind(this));
    this.emitter.on('feature_shipped', this.handleShip.bind(this));
    this.emitter.on('blocker_detected', this.handleBlocker.bind(this));
  }

  private async handleDecision(event: DecisionFinalizedEvent): Promise<void> {
    const comment = this.formatDecisionComment(event.decisions);
    await this.appendWithRetry(event.issueId, comment);
  }
}

// Commands emit events
class DecideCommand {
  async execute(): Promise<void> {
    // ... decide logic ...
    this.emitter.emit('decision_finalized', {
      issueId,
      decisions,
      hasNewDecisions
    });
  }
}
```

**Pros**:
- Decoupled architecture (commands don't know about PM sync)
- Easy to add new PM sync behaviors (just add event listeners)
- Asynchronous by default (doesn't block commands)
- Testable in isolation (mock event emitter)

**Cons**:
- More complex architecture (event emitter, listeners, event types)
- Harder to debug (asynchronous flow, event chains)
- Event definitions proliferate (maintenance burden)
- Overkill for current needs (only 3 event types)
- Async makes retry timing unpredictable

**When to use**:
When you anticipate many PM sync behaviors (10+ event types) and need fully asynchronous operation.

---

## Recommendation

**Approach 1 - Adapter-Agnostic Comment Service with Retry Queue**

**Rationale**:

Approach 1 provides the right balance of robustness, consistency, and simplicity. The centralized `PMCommentService` ensures consistent comment formatting across all adapters while maintaining the adapter abstraction layer. Graceful degradation through retry queuing aligns with HODGE-377.1's design philosophy and prevents PM unavailability from blocking local development.

The adapter interface additions are minimal (`appendComment`, `updateStatus`, `addLabel`) and platform-agnostic, making adapter implementations straightforward. Linear, GitHub, and Local adapters all implement the same simple interface without needing platform-specific formatting logic.

Opportunistic queue processing is elegant: every workflow command (`/explore`, `/build`, `/decide`, `/ship`) attempts to process the queue at startup, minimizing retry latency without adding dedicated background workers. Failed operations stay in the queue until PM becomes available.

The blocker workflow integrates cleanly: AI-detected blockers during `/decide` conversations trigger both PM comment/status updates and local ship-record.json persistence. Auto-clearing blockers on successful `/ship` prevents stale blocker state without requiring manual intervention.

Comment formatting is straightforward: decision summaries with count and status, ship notifications with commit SHA and quality gates, blocker details with clear explanations. Distinct emojis (📋/🚀/⚠️) make PM issue timelines scannable.

The approach supports HODGE-377.6's `/decide` → `/refine` migration cleanly: the `appendDecisionComment()` method works identically when called from `RefineCommand` instead of `DecideCommand`, and the file it references changes from `decisions.md` to `refinements.md` without touching the PM sync logic.

Feature-level decisions living in `.hodge/features/{feature-id}/decisions.md` (separate from `exploration.md`) preserves the exploration document as a clean approach summary while capturing detailed implementation choices. Project-level decisions continue using `.hodge/decisions.md` via `/codify`, maintaining clear separation of concerns.

Approach 2's platform-specific formatting adds complexity without clear value - Markdown works consistently across Linear, GitHub, and Local file logging. Approach 3's event-based architecture is overengineered for three event types and makes retry logic harder to reason about.

## Test Intentions

### Core Behaviors

1. **Append decision comment after `/decide` completes**
   - After writing decisions.md to `.hodge/features/{feature-id}/decisions.md`
   - Comment format: `📋 Decisions Finalized (count)\n\nSummary\n\nStatus: Ready to build`
   - Works even if no new decisions (comment says "Decisions Reviewed")
   - Comment includes decision summaries (not file links)

2. **Append ship comment after git commit succeeds**
   - After `git commit` in `/ship` command
   - Comment format: `🚀 Shipped in commit {sha}\n\n{link}\n\n{quality gates}\n\nShipped: {timestamp}`
   - Includes commit SHA, link to commit (if constructible), quality gate summary, timestamp
   - Quality gates show passed/failed for each check

3. **Mark issue as blocked when blocker detected**
   - During `/decide` conversation, AI detects blocker
   - User confirms blocker
   - Appends comment: `⚠️ Blocked\n\n{blocker details}`
   - Updates PM status to blocked (if `method: "status"`)
   - Adds blocked label (if `method: "label"`)
   - Stores blocker in ship-record.json with reason and timestamp

4. **Clear blocker on successful ship**
   - When `/ship` completes and ship-record.json has blocker
   - Removes blocker from ship-record.json
   - Updates PM status from blocked to shipped
   - No explicit "unblocked" comment (ship comment is sufficient)

5. **Queue failed PM operations for retry**
   - PM comment append fails (network error, API error, rate limit)
   - Operation queued to `.hodge/pm-queue.json`
   - Warning logged but command continues
   - Developer not blocked from local work

6. **Process queued operations opportunistically**
   - At start of workflow commands (`/explore`, `/build`, `/decide`, `/ship`)
   - Attempts to process all queued operations
   - Successful operations removed from queue
   - Failed operations remain for next retry

7. **All adapters support comment appending**
   - LinearAdapter: Uses Linear API to create comments
   - GitHubAdapter: Uses Octokit to create issue comments
   - LocalAdapter: Appends to `.hodge/pm-comments.log` file

8. **Adapter-specific status/label updates**
   - LinearAdapter: Updates issue status via Linear API
   - GitHubAdapter: Adds/removes labels via Octokit
   - LocalAdapter: Updates status field in ship-record.json

9. **Blocker configuration via pm.blockerHandling**
   - `method: "status"` → updates status field
   - `method: "label"` → adds/removes label
   - `blockedStatus` customizable (default: "Blocked")
   - `blockedLabel` customizable (default: "blocked")

10. **Feature-level decisions in dedicated file**
    - Decisions from `/decide` written to `.hodge/features/{feature-id}/decisions.md`
    - Separate from exploration.md (which contains exploration-time decisions)
    - Project-level decisions still use `.hodge/decisions.md` via `/codify`

### Edge Cases

11. **Handle missing PM issue ID gracefully**
    - Feature has no PM issue linked (solo mode)
    - PM sync operations skipped silently
    - No errors logged, no queue entries created

12. **Handle commit link construction failure**
    - Git remote URL not found or malformed
    - Ship comment excludes link section
    - Comment still includes SHA, quality gates, timestamp

13. **Prevent duplicate queue entries**
    - Same operation queued multiple times (retry failures)
    - Deduplication by operation type + issueId + content hash
    - Queue file doesn't grow unbounded

14. **Handle blocker cleared manually in PM**
    - User manually updates PM status from "Blocked" → "In Progress"
    - ship-record.json still has blocker entry
    - `/ship` removes blocker from ship-record.json
    - No PM status update conflict

15. **Support AI-initiated blocker detection**
    - During `/decide` conversation, AI identifies dependency blocker
    - AI asks: "This requires X to be ready first. Is that a blocker?"
    - User confirms → blocker workflow triggered
    - User denies → no blocker, normal decision flow

16. **Support user-initiated blocker detection**
    - User mentions blocker during `/decide` conversation
    - AI recognizes blocker mention and captures details
    - Blocker workflow triggered
    - Same outcome as AI-initiated detection

17. **Format quality gates summary clearly**
    - Passed gates: ✓ All tests passing, ✓ No lint errors
    - Failed gates: ✗ Type check failed (3 errors)
    - Mix of passed/failed shown clearly in ship comment

18. **Migration path for /decide → /refine**
    - Comment appending code calls decisions file location generically
    - HODGE-377.6 changes file from `decisions.md` to `refinements.md`
    - PM sync logic unchanged (just file path parameter)

## Decisions Decided During Exploration

1. ✓ **Feature-level decisions location**: `.hodge/features/{feature-id}/decisions.md` (becomes `refinements.md` in HODGE-377.6)
2. ✓ **Project-level decisions location**: `.hodge/decisions.md` via `/codify`
3. ✓ **Decide comment format**: Summary + count + status (no file links)
4. ✓ **Ship comment format**: 🚀 emoji, commit SHA, link to commit, quality gates, timestamp
5. ✓ **Blocker comment format**: ⚠️ emoji, details about what's blocked and why
6. ✓ **Comment timing - decide**: After writing decisions.md (even if no new decisions)
7. ✓ **Comment timing - ship**: After git commit succeeds
8. ✓ **Comment failure handling**: Queue for retry (graceful degradation)
9. ✓ **Blocker configuration**: `pm.blockerHandling.method` ("status" or "label"), default to "status"
10. ✓ **Blocker status/label names**: Customizable via `blockedStatus` and `blockedLabel` config
11. ✓ **Blocker detection**: AI proactively looks for blockers, gets user confirmation
12. ✓ **Blocker persistence**: Store in `ship-record.json` locally
13. ✓ **Blocker resolution**: Auto-clear when `/ship` succeeds (if not manually cleared)
14. ✓ **Adapter requirements**: All adapters must support comment appending
15. ✓ **Local adapter implementation**: Logs to file + maintains status in ship-record.json
16. ✓ **Issue description updates**: Set at feature creation (end of `/explore`), defer file links
17. ✓ **Support for "both" status+label**: Deferred until requested by users
18. ✓ **Migration from /decide to /refine**: Comment appending moves from decisions.md to refinements.md in HODGE-377.6

## No Decisions Needed

All major architectural questions resolved during exploration conversation.

## Next Steps

1. ✅ Exploration complete - all decisions resolved
2. Ready for `/build HODGE-377.4` to implement PM comment synchronization
3. This completes the PM integration infrastructure for HODGE-377 epic
