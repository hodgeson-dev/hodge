# Hodge Implementation Plan

## Overview
Hodge is a balanced AI development framework that provides "Freedom to explore, discipline to build, confidence to ship." Published as NPM package `@agile-explorations/hodge`.

## Core Philosophy
- **Three Modes**: Explore (creative), Build (structured), Harden (production-ready)
- **Progressive Standards**: Suggested → Recommended → Enforced
- **Learn From Code**: Patterns extracted from actual implementations
- **Cross-Tool Compatibility**: Works with any AI assistant (Claude, Cursor, Continue, Aider, etc.)

## Current Status

### ✅ Completed Features
- [x] Init command with Hodge Way templates
- [x] Basic explore/build/harden/ship CLI commands
- [x] Claude slash commands (prototype versions)
- [x] Standards and decisions framework
- [x] PM script templates (Linear integration)
- [x] Pattern learning in ship command
- [x] Interactive commit generation
- [x] Git push integration with safety checks
- [x] PR creation support

### 🚧 In Progress
- [ ] Cross-tool compatibility (HODGE.md generation)
- [ ] Session management for context persistence
- [ ] PM adapter interface and hooks
- [ ] Batch decision extraction

## Implementation Phases

### Phase 1: Cross-Tool Compatibility (Priority 1)
**Timeline: 1-2 days**

#### Tasks
- [ ] Create `HodgeFileGenerator` class
  - [ ] Aggregate context from `.hodge/features/` directories
  - [ ] Generate HODGE.md with current mode context
  - [ ] Include tool-specific sections
- [ ] Add HODGE.md generation to all commands
  - [ ] `explore` command
  - [ ] `build` command
  - [ ] `harden` command
  - [ ] `ship` command
  - [ ] `decide` command
  - [ ] `status` command
- [ ] Create symlink strategy for tool compatibility
  - [ ] HODGE.md → CLAUDE.md symlink
  - [ ] Document setup for other tools
- [ ] Generate tool-specific config files
  - [ ] `.continuerc.json` for Continue.dev
  - [ ] `.aider.conf.yml` for Aider
  - [ ] Cursor workspace settings

#### Architecture Decisions
- **Hybrid approach**: Keep directories for detailed storage, HODGE.md as aggregated view
- **HODGE.md primary**: Universal context file with tool-specific symlinks
- **Auto-regeneration**: HODGE.md regenerated on each command, not manually edited

### Phase 2: Session Management
**Timeline: 1 day**

#### Tasks
- [ ] Implement `SessionManager` class
  - [ ] Checkpoint after commands
  - [ ] Track current feature/mode
  - [ ] Remember conversation context
  - [ ] Store next suggested steps
- [ ] Add session restoration
  - [ ] On `hodge status`
  - [ ] Prompt to continue where left off
  - [ ] Regenerate HODGE.md with context
- [ ] Session cleanup strategy
  - [ ] Auto-cleanup old sessions
  - [ ] Configurable retention policy

#### Session Context Schema
```typescript
interface Session {
  currentFeature: string;
  currentMode: Mode;
  recentCommands: Command[];
  recentDecisions: Decision[];
  pendingDecisions: string[];
  nextSuggestedCommand: string;
  lastAISummary: string;
}
```

### Phase 3: PM Integration Hooks
**Timeline: 2-3 days**

#### Tasks
- [ ] Define `PMAdapter` interface
  ```typescript
  interface PMAdapter {
    onExplore(feature: string): Promise<void>;
    onDecide(decision: string, feature: string): Promise<void>;
    onBuild(feature: string): Promise<void>;
    onHarden(feature: string): Promise<void>;
    onShip(feature: string): Promise<void>;
  }
  ```
- [ ] Implement `LinearAdapter`
  - [ ] Status transitions
  - [ ] Issue comments
  - [ ] Use existing PM scripts
- [ ] Add PM hooks to all commands
  - [ ] No-op if unconfigured
  - [ ] Configurable workflow states
- [ ] PM workflow configuration
  ```json
  {
    "pm": {
      "tool": "linear",
      "workflow": {
        "explore": "in-discovery",
        "build": "in-progress",
        "harden": "in-review",
        "ship": "done"
      }
    }
  }
  ```

### Phase 4: Enhanced Features
**Timeline: 2-3 days**

#### Tasks
- [ ] Auto-decision on explore option (c)
  - [ ] Record decision automatically
  - [ ] Generate decision artifacts
  - [ ] Maintain audit trail
- [ ] Batch decision extraction
  - [ ] Scan for decision points in discussion
  - [ ] Interactive review interface
  - [ ] Bulk recording to decisions.md
- [ ] Pattern reuse system
  - [ ] `--like` flag for similar features
  - [ ] Suggest relevant patterns
- [ ] Failure tracking
  - [ ] `.hodge/features/{feature}/failed/` directory
  - [ ] Capture why approaches failed
  - [ ] Learn from mistakes

## HODGE.md Format Specification

```markdown
# HODGE.md - Feature: {feature} ({mode} mode)

## Current State
- Mode: {mode}
- Stage: {explore|build|harden|shipped}
- PM Issue: {issueId}

## Commands
- Test: `npm test`
- Type check: `npm run typecheck`
- Next: `hodge {nextMode} {feature}`

## Standards ({level})
{standards for current mode}

## Recent Work
{recent changes and decisions}

## TODOs
{extracted from code}

## For AI Assistants
{mode-specific guidelines}
```

## Directory Structure (Maintained)

```
.hodge/features/{feature}/
├── explore/
│   ├── exploration.md      # Detailed approaches
│   ├── test-intentions.md  # What to test
│   └── context.json        # State
├── build/
│   └── context.json
├── harden/
│   ├── validation-results.json
│   └── harden-report.md
├── ship/
│   └── ship-summary.md
├── HODGE.md               # Current aggregated context
└── issue-id.txt           # PM link
```

## Testing Strategy

### Unit Tests
- [ ] HodgeFileGenerator tests
- [ ] SessionManager tests
- [ ] PMAdapter tests
- [ ] Decision extraction tests

### Integration Tests
- [ ] Full workflow test (explore → ship)
- [ ] Cross-tool compatibility test
- [ ] Session persistence test
- [ ] PM integration test

### Manual Testing Checklist
- [ ] Test with Claude Code
- [ ] Test with Cursor
- [ ] Test with Continue.dev
- [ ] Test with Aider
- [ ] Test session restoration
- [ ] Test PM status updates

## Success Metrics

### Technical
- [ ] HODGE.md works with all major AI tools
- [ ] Session context persists between uses
- [ ] PM issues update automatically
- [ ] Pattern extraction and reuse working

### User Experience
- [ ] Reduced friction in explore → build flow
- [ ] Context never lost between sessions
- [ ] Decisions captured from long discussions
- [ ] Works seamlessly with existing workflow

## Configuration Philosophy

- **Start minimal**: Basic features that work
- **Progressive enhancement**: Add complexity as needed
- **Convention over configuration**: Smart defaults
- **Tool agnostic**: Works with any AI assistant

## Next Immediate Actions

1. **Start building HodgeFileGenerator**
   ```typescript
   // src/lib/hodge-file-generator.ts
   export class HodgeFileGenerator {
     static async generate(feature: string, mode: string) {
       // Aggregate context
       // Format for AI tools
       // Write to multiple locations
     }
   }
   ```

2. **Add to existing commands**
   ```typescript
   // In each command's execute method
   await HodgeFileGenerator.generate(feature, mode);
   ```

3. **Test with multiple AI tools**
   - Verify HODGE.md is readable
   - Test context persistence
   - Validate workflow

## Decisions Made

1. ✅ **Hybrid approach**: Directories for storage, HODGE.md as view
2. ✅ **HODGE.md primary**: Universal context file with symlinks
3. ✅ **Session management now**: Basic checkpointing immediately
4. ✅ **Auto-decision**: Record when choosing recommended approach
5. ✅ **Batch extraction**: With careful design consideration
6. ✅ **PM hooks now**: Build interface with Linear implementation
7. ✅ **Priority**: Cross-tool compatibility first

## Development Workflow

```bash
# Development cycle
npm run dev          # Watch mode
npm test            # Run tests
npm run build       # Build for production
npm link            # Test locally

# Testing
hodge explore test-feature
# Verify HODGE.md generated
# Test with AI tool
hodge build test-feature
# Verify context updated
```

## Timeline

| Week | Focus | Deliverable |
|------|-------|------------|
| 1 | Cross-Tool Compatibility | HODGE.md generation working |
| 2 | Session & PM | Context persistence, PM hooks |
| 3 | Polish | Batch decisions, pattern reuse |
| 4 | Testing & Release | Full test coverage, documentation |

---

*"Freedom to explore, discipline to build, confidence to ship."*