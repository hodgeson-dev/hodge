# Exploration: HODGE-242 - Fix Ship Commit Message Workflow

## Problem Statement
The ship command currently generates generic, uninformative commit messages and doesn't provide an interactive approval/regeneration workflow. Users previously had rich, detailed commit messages with the option to approve or regenerate them, but this functionality has been lost.

### Current Issues
1. **Generic Messages**: All commits get the same template:
   ```
   feat: HODGE-XXX
   - Implementation complete
   - Tests passing
   - Documentation updated
   ```

2. **No Rich Analysis**: The command doesn't analyze actual file changes to generate meaningful commit messages

3. **Broken Interactive Mode**: The ui.md file gets regenerated on each run, losing user edits

4. **--yes Flag Bypass**: Using --yes completely skips interaction and uses the generic message

5. **No Approval Workflow**: Users can't approve/reject/regenerate messages interactively

## Desired Behavior
Generate commit messages that:
- Summarize actual changes made (files modified, lines changed)
- Group changes by type (features, tests, docs, refactoring)
- Explain the "why" behind changes
- Include breaking changes warnings if applicable
- Allow interactive approval with options to regenerate

## Example of Desired Output
```
fix: eliminate CommonJS warnings by downgrading ESM-only dependencies (HODGE-229)

## What Changed
- Downgraded chalk from v5 to v4.1.2 (CommonJS compatible)
- Downgraded inquirer from v9 to v8.2.6 (CommonJS compatible)
- Downgraded ora from v8 to v5.4.1 (CommonJS compatible)
- Added smoke and integration tests (2 new test files, 7 test cases)

## Why This Change
Following user report of ExperimentalWarning on every hodge command execution.
Root cause: TypeScript compiles to CommonJS but dependencies were ESM-only.

## Impact
- Eliminates all CommonJS warnings
- No functionality changes
- All commands run cleanly
```

## Implementation Approaches

### Approach 1: Enhanced Git Analysis with AI Generation
**Description**: Deep analysis of git diff with AI-powered message generation
**Implementation**:
```typescript
// Analyze changes in detail
const analysis = await analyzeGitChanges();
// Group by type: features, tests, docs, refactor
const groupedChanges = groupChangesByType(analysis);
// Generate rich message with AI
const message = await generateAICommitMessage(groupedChanges, feature);
// Interactive approval
const approved = await promptForApproval(message);
```

**Pros**:
- Rich, contextual commit messages
- Understands code changes semantically
- Can explain complex refactorings
- Adapts to different change types

**Cons**:
- Requires AI integration in CLI
- May need rate limiting
- Depends on AI service availability

### Approach 2: Template-Based with Smart Detection
**Description**: Enhanced templates with pattern matching for common changes
**Implementation**:
```typescript
// Detect patterns in changes
const pattern = detectChangePattern(gitDiff);
// Select appropriate template
const template = selectTemplate(pattern);
// Fill template with extracted data
const message = fillTemplate(template, extractedData);
// Simple approve/reject/edit workflow
const final = await interactiveEdit(message);
```

**Pros**:
- Predictable and consistent
- Works offline
- Fast generation
- Easy to customize templates

**Cons**:
- Less contextual than AI
- May miss nuanced changes
- Requires maintaining templates

### Approach 3: Hybrid Progressive Enhancement (RECOMMENDED)
**Description**: Use templates as base, enhance with AI when available
**Implementation**:
```typescript
// Phase 1: Smart template generation
const baseMessage = generateSmartTemplate(gitAnalysis);

// Phase 2: AI enhancement (if available)
if (isAIAvailable() && !options.offline) {
  const enhanced = await enhanceWithAI(baseMessage, gitDiff);
  baseMessage = enhanced;
}

// Phase 3: Interactive approval with state persistence
const state = await loadOrCreateState(feature);
if (!state.approved) {
  const final = await interactiveApproval(baseMessage, {
    options: ['approve', 'regenerate', 'edit', 'cancel'],
    preserveEdits: true
  });
  await saveState(feature, final);
}
```

**Key Features**:
- **Progressive Enhancement**: Works without AI, better with it
- **State Persistence**: Edits are preserved between runs
- **Interactive Menu**: Clear options for approve/regenerate/edit
- **Rich Analysis**: Extracts meaningful info from git diff
- **Graceful Degradation**: Falls back to templates if AI unavailable

**Implementation Details**:

1. **Git Analysis Enhancement**:
   ```typescript
   interface EnhancedGitAnalysis {
     stats: { files: number, insertions: number, deletions: number };
     filesByType: Map<string, FileChange[]>;
     breakingChanges: string[];
     dependencies: DependencyChange[];
     testCoverage: { added: number, removed: number };
     primaryChange: 'feature' | 'fix' | 'refactor' | 'docs' | 'test';
   }
   ```

2. **State Management Fix**:
   ```typescript
   // Don't regenerate ui.md if it exists and has edits
   const existingUI = await readUIFile(feature);
   if (existingUI?.edited && !options.force) {
     return existingUI;
   }
   ```

3. **Interactive Approval Flow**:
   ```
   Ship Commit Message:
   ─────────────────────
   [Generated message displayed here]
   ─────────────────────

   Options:
   (a) Approve and commit
   (r) Regenerate message
   (e) Edit message
   (c) Cancel ship

   Choice [a/r/e/c]: _
   ```

**Pros**:
- Best of both worlds
- Works in all environments
- Progressive enhancement
- Preserves user edits
- Clear interactive flow

**Cons**:
- More complex implementation
- Need to handle both paths
- Requires careful state management

## Recommendation
**Approach 3: Hybrid Progressive Enhancement** is the recommended solution because:

1. **Backwards Compatible**: Works immediately with template improvements
2. **Future Proof**: Can add AI enhancement without breaking changes
3. **User Friendly**: Clear interactive flow with persistent edits
4. **Environment Agnostic**: Works in Claude Code, terminal, CI/CD
5. **Progressive**: Each phase adds value independently

## Implementation Plan
1. **Phase 1**: Fix state persistence (edits getting lost)
2. **Phase 2**: Enhance git analysis to extract meaningful data
3. **Phase 3**: Implement smart templates based on change patterns
4. **Phase 4**: Add interactive approval flow with clear options
5. **Phase 5**: (Future) Add AI enhancement layer

## Test Intentions
- [ ] Edits to commit messages are preserved between runs
- [ ] --yes flag uses smart template, not generic message
- [ ] Interactive mode presents clear approve/regenerate/edit options
- [ ] Commit messages reflect actual changes made
- [ ] Different change types generate appropriate messages
- [ ] State is properly cleaned up after successful commit

## Next Steps
- [ ] Review the recommended approaches
- [ ] Decide on Hybrid Progressive Enhancement
- [ ] Proceed to `/build HODGE-242`

---
*Enhanced exploration for commit message workflow (2025-09-22)*