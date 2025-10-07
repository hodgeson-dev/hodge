# Lessons Learned: HODGE-334

## Feature: Auto-Load Parent and Sibling Context for Sub-Feature Exploration

### The Problem

When exploring sub-features (e.g., HODGE-333.3), developers had to manually load parent context with `/hodge HODGE-333`, and even then, they missed valuable insights from shipped sibling features (HODGE-333.1, HODGE-333.2). This created:
- Duplicated effort across sub-features
- Missed patterns and architectural decisions from siblings
- Incomplete context for making informed implementation choices

The solution needed to automatically detect sub-features, load parent and sibling context, and present it intelligently to the AI for synthesis during exploration.

### The Wrong Path: CLI Content Synthesis

**Initial Approach**: Build a service that reads files, parses markdown, extracts sections (problem statements, decisions, recommendations), and returns pre-digested content summaries to the AI.

**Implementation Started**:
```typescript
class SubFeatureContextService {
  loadParentContext(parent: string): ParentContext {
    const exploration = readFileSync(explorationPath, 'utf-8');

    // Extract Problem Statement
    const problemMatch = exploration.match(/## Problem Statement\s+([\s\S]*?)(?=\n## |$)/);
    context.problemStatement = problemMatch[1].trim();

    // Extract Recommendation
    const recommendationMatch = exploration.match(/## Recommendation\s*\n+([\s\S]*?)(?=\n## |$)/);
    context.recommendation = recommendationMatch[1].trim();

    // Extract decisions...
    // Extract lessons...

    return context; // Pre-digested summary
  }
}
```

**The CLI output**:
```
📚 Sub-Feature Context for HODGE-333.3

Parent: HODGE-333
Problem Statement: Need consistent review profile format across the codebase.
Recommendation: Use unified markdown approach with gray-matter frontmatter parsing.

Shipped Siblings:
  HODGE-333.1:
    Decisions: Simplified approach - no AST parsing
    Infrastructure: frontmatter-parser.ts, markdown-utils.ts
    Lessons: Gray-matter is much simpler than AST parsing
```

**Why This Was Wrong**:
1. **CLI doing AI work**: The CLI was interpreting content (deciding what's important, how to summarize)
2. **Rigid extraction**: Regex patterns couldn't adapt to conversation context or user needs
3. **Lost flexibility**: AI couldn't dig deeper into specific sections or ask follow-up questions about the content
4. **Violated architecture principle**: "AI writes content, CLI creates structure" from standards.md

### The Right Path: CLI Identifies, AI Interprets

**Critical Realization**: The user asked "Ultrathink about what you just said, the CLI gathers context but doesn't return the context to the AI. The AI must then re-gather the context. Is that right? If so, why did the CLI gather the context in the first place?"

This exposed the fundamental flaw: **The CLI should identify WHAT to read, not WHAT it says**.

**Corrected Approach**: CLI uses codified rules to build a file manifest with metadata, returns paths and precedence, lets AI read and synthesize naturally.

**Implementation**:
```typescript
interface FileManifest {
  parent?: {
    feature: string;
    files: FileManifestEntry[];  // Just paths + metadata
  };
  siblings: Array<{
    feature: string;
    shippedAt: string;
    files: FileManifestEntry[];  // Just paths + metadata
  }>;
  suggestedReadingOrder: string;
}

interface FileManifestEntry {
  path: string;                    // File location
  type: 'exploration' | 'decisions' | 'ship-record' | 'lessons';
  feature: string;
  precedence: number;              // 1=read first, 4=read last
  timestamp?: string;
}

class SubFeatureContextService {
  buildFileManifest(parent: string, exclude: string[]): FileManifest | null {
    // CLI identifies which files exist and are relevant
    // CLI assigns reading precedence
    // CLI validates ship records (codified rule: validationPassed: true)
    // CLI returns structured manifest
    // NO reading, NO parsing, NO content interpretation
  }
}
```

**CLI Output (File Manifest)**:
```
📚 Sub-Feature Context Available
Feature: HODGE-333.3 (child of HODGE-333)

Parent: HODGE-333
  - .hodge/features/HODGE-333/explore/exploration.md
  - .hodge/features/HODGE-333/decisions.md

Shipped Siblings (2):
  HODGE-333.1 (shipped 2025-10-05):
    - .hodge/features/HODGE-333.1/ship/ship-record.json
    - .hodge/lessons/HODGE-333.1-frontmatter-parsing.md

  HODGE-333.2 (shipped 2025-10-06):
    - .hodge/features/HODGE-333.2/ship/ship-record.json

Suggested reading order: parent exploration → parent decisions → sibling ship records → sibling lessons
```

**Template Instructions to AI** (`.claude/commands/explore.md`):
```markdown
### 1. Sub-Feature Context (Auto-Loaded)
**IMPORTANT**: If the CLI output shows "📚 Sub-Feature Context Available", you MUST:

1. **Read all listed files** in the suggested order:
   - Parent exploration.md (understand the epic)
   - Parent decisions.md (know what was decided)
   - Sibling ship records (see what worked)
   - Sibling lessons (learn from experience)

2. **Synthesize context naturally** during exploration conversation:
   - Reference parent problem statement when discussing requirements
   - Mention sibling decisions when exploring approaches
   - Cite lessons learned when identifying gotchas
   - Leverage infrastructure created by siblings
```

**AI Then Reads and Synthesizes**:
- AI uses Read tool to access files
- AI extracts what's relevant to the conversation
- AI adapts depth based on user questions
- AI references context naturally: "Since HODGE-333.1 used gray-matter for frontmatter parsing, we could extend that approach..."

### Key Learnings

#### 1. Separation of Concerns: CLI vs AI

**Discovery**: We started building content extraction logic (regex parsing, section extraction, summarization) in the CLI service before realizing this violated the core architecture principle.

**The Principle**:
- **CLI Responsibility**: Structure discovery using codified rules
  - Detect patterns (HODGE-333.1 is sub-feature of HODGE-333)
  - Validate state (ship-record.json has validationPassed: true)
  - Identify relevant files (exploration.md exists, decisions.md exists)
  - Assign metadata (precedence, timestamps, types)
  - Return structured manifest (paths + metadata)

- **AI Responsibility**: Content interpretation and synthesis
  - Read files based on manifest
  - Extract relevant information for current context
  - Synthesize across multiple sources
  - Adapt to conversation needs
  - Reference naturally during exploration

**Why This Matters**:
- **Flexibility**: AI can dig deeper, skip irrelevant parts, adapt to user questions
- **Simplicity**: CLI logic stays focused on detection and validation
- **Testability**: Test CLI with file existence checks, not content parsing
- **Maintainability**: Content changes don't require CLI updates
- **Evolution**: Easy to add new file types without changing extraction logic

**Code Example - The Right Way**:
```typescript
// CLI: Just paths and metadata, no content reading
buildFileManifest(parent: string): FileManifest {
  const files: FileManifestEntry[] = [];

  // Check existence (codified rule)
  const explorationPath = join(parentDir, 'explore', 'exploration.md');
  if (existsSync(explorationPath)) {
    files.push({
      path: explorationPath,
      type: 'exploration',
      feature: parent,
      precedence: 1,  // Read first
    });
  }

  // Validate ship record (codified rule)
  const shipRecord = this.loadShipRecord(sibling);
  if (shipRecord?.validationPassed) {
    files.push({
      path: shipRecordPath,
      type: 'ship-record',
      precedence: 3,
      timestamp: shipRecord.timestamp,
    });
  }

  return { parent, files, suggestedReadingOrder: "..." };
}

// AI (in template): Reads and interprets
Read(manifestEntry.path) → extracts what's needed for conversation
```

#### 2. Codified Rules Enable Reliable Detection

**What Worked**: Clear, testable rules for sub-feature detection:
- Pattern: `/^(HODGE-\d+)\.(\d+)$/` (numeric only, one level deep)
- Validation: `shipRecord.validationPassed === true`
- Exclusion: User input parsed as `['333.1', 'HODGE-333.1']`

**Why**: These rules are deterministic, testable, and don't require content interpretation.

**Tests Validate Rules**:
```typescript
smokeTest('detects sub-feature pattern correctly', () => {
  expect(service.detectSubFeature('HODGE-333.1')).toEqual({
    isSubFeature: true,
    parent: 'HODGE-333',
  });
});

smokeTest('validates ship records correctly', () => {
  // Only includes siblings with validationPassed: true
  expect(manifest.siblings).toHaveLength(1);
  expect(manifest.siblings[0].feature).toBe('HODGE-333.1');
});
```

#### 3. Precedence Guides Without Constraining

**Solution**: Assign precedence numbers to guide AI reading order:
1. Parent exploration (understand the epic)
2. Parent decisions (know constraints)
3. Sibling ship records (see what was built)
4. Sibling lessons (learn from experience)

**Why This Works**:
- AI knows where to start
- AI can deviate if conversation needs it
- User sees suggested order but isn't forced
- New file types can slot into precedence scheme

#### 4. Template Instructions Bridge CLI and AI

**Pattern**: CLI outputs manifest → Template translates to AI instructions → AI executes

**Template Layer**:
```markdown
### 1. Sub-Feature Context (Auto-Loaded)
If CLI shows "📚 Sub-Feature Context Available":
1. Read files in suggested order
2. Synthesize during conversation
3. Ask user about exclusions
```

**Why Effective**:
- Template is the "translation layer" between CLI data and AI behavior
- AI gets clear instructions without CLI needing to understand AI capabilities
- Easy to update AI behavior without touching CLI code

### Impact

**Before This Feature**:
- Developers manually ran `/hodge HODGE-333` to load parent
- Sibling context completely missed
- Duplicated work across sub-features
- Inconsistent awareness of architectural decisions

**After This Feature**:
- Automatic parent and sibling context detection
- File manifest presented to AI for intelligent synthesis
- 18 tests validating detection and manifest building
- Clean separation: CLI identifies, AI interprets

**Before This Lesson**:
- Started building content extraction in CLI
- Regex parsing for markdown sections
- Pre-digested summaries returned to AI
- Violating "AI writes content, CLI creates structure" principle

**After This Lesson**:
- CLI only identifies files and validates state
- File manifest with paths and metadata
- AI reads and synthesizes naturally
- Architecture principle followed correctly

### Related Decisions

From `.hodge/features/HODGE-334/explore/exploration.md`:
1. **Sub-feature pattern scope**: Only numeric patterns (HODGE-333.1) one level deep
2. **Shipped status check**: Use ship/ship-record.json with validationPassed: true
3. **Implementation approach**: Backend service (Approach 2) for testability and reusability
4. **Context presentation style**: Hybrid - file manifest + AI synthesis (not CLI summaries)

### Pattern Potential: CLI/AI Separation Architecture

**Reusable Pattern for Future Features**:

When building features that involve context loading, document analysis, or content synthesis:

1. **Define Codified Rules** (CLI domain):
   - What patterns to detect (regex, file paths, naming conventions)
   - What state to validate (flags, checksums, timestamps)
   - What files to include/exclude
   - What precedence to assign

2. **Build File Manifest** (CLI output):
   ```typescript
   interface Manifest {
     items: Array<{
       path: string;           // Where to find it
       type: string;           // What kind of thing it is
       metadata: object;       // Context-specific data
       precedence: number;     // Suggested reading order
     }>;
     suggestedAction: string;  // What to do with it
   }
   ```

3. **Provide AI Instructions** (Template):
   - What to read
   - In what order
   - How to synthesize
   - When to reference

4. **Let AI Interpret** (AI execution):
   - Read files using manifest
   - Extract relevant content
   - Synthesize across sources
   - Adapt to conversation

**This Pattern Applies To**:
- ✅ `/explore` sub-feature context (HODGE-334)
- 🔄 `/review` profile loading (needs audit - mentioned in lesson)
- 🔄 `/build` context loading (future enhancement)
- 🔄 `/decide` decision context (future enhancement)

### Action Item: Audit /review Command

**User Insight**: "We need to take another look at our initial implementation of the /review process to ensure that it follows the same pattern."

**Current Implementation to Audit**:
- Does `/review` CLI parse review profile content or just identify files?
- Does it return file paths or pre-digested profile data?
- Does AI read markdown files directly or receive summaries?

**Expected Pattern**:
```typescript
// CLI should:
interface ReviewManifest {
  profiles: Array<{
    path: string;              // .hodge/review-profiles/security.md
    name: string;              // 'security'
    type: 'review-profile';
    precedence: number;
  }>;
  scope: {
    files: string[];           // Files to review
    type: 'file' | 'directory' | 'recent';
  };
}

// AI should:
// 1. Read profile markdown files
// 2. Extract review criteria
// 3. Apply to code review
// 4. Generate report
```

**If audit finds violations**, create follow-up feature to refactor `/review` to match this pattern.

---

_Documented: 2025-10-07_
_Stats: 507 lines service code, 248 lines smoke tests, 274 lines integration tests, 18 tests total_
