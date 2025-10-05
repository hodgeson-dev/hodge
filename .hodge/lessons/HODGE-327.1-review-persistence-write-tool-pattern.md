# Lessons Learned: HODGE-327.1

## Feature: Review Report Persistence with Write Tool Pattern

### The Problem

The `/review` command displayed valuable architectural analysis reports but they vanished after the user responded to the menu. Users needed persistent storage in `.hodge/reviews/` with metadata (timestamp, scope, profile, feature context, finding counts) to reference findings when fixing issues.

During implementation, we initially attempted to create a `ReviewPersistenceService` class to handle file writing, but this violated the established Hodge pattern where AI writes content files using the Write tool, not Service classes.

### Approach Taken

**Initial Approach (Wrong)**:
Started building `ReviewPersistenceService` class with methods for:
- `generateFilename()` - Convert file paths to slugs
- `extractMetadata()` - Parse reports for finding counts
- `detectFeatureContext()` - Git blame analysis
- `saveReport()` - Write files with YAML frontmatter

This approach seemed logical based on HODGE-322's Service pattern guidance, which advocates extracting testable business logic into Service classes.

**Corrected Approach (Right)**:
After user intervention, pivoted to Pure Template Implementation:
- Enhanced `.claude/commands/review.md` template with save/discard prompt
- Embedded bash logic for filename generation and metadata extraction
- Used Write tool to save reports (consistent with `/explore` and `/ship`)
- Documented new "Slash Command File Creation Pattern" in standards.md

### Key Learnings

#### 1. Service Classes Are NOT For Slash Command File Operations

**Discovery**: The project already had a consistent pattern where AI writes content files using the Write tool:
- `/explore` → AI writes `exploration.md`
- `/ship` → AI writes `.hodge/lessons/HODGE-XXX-slug.md`
- `/decide` → AI writes decisions

But this pattern wasn't explicitly documented, leading to the wrong assumption that Service classes should handle file writing.

**What Went Wrong**:
Started implementing `ReviewPersistenceService` because:
- HODGE-322 lesson advocates Service classes for testable business logic
- Seemed like "proper" architecture to separate concerns
- Filename generation and metadata extraction felt like business logic

**What Actually Matters**:
- **CLI creates structure** (directories, tracking files, PM integration)
- **AI creates content** (markdown files with user-facing content)
- Service classes are for CLI business logic, NOT slash command file operations

**Solution Applied**:
1. Deleted `ReviewPersistenceService.ts`
2. Moved all logic to `.claude/commands/review.md` template
3. Used bash for simple operations (sed, grep, awk)
4. Used Write tool for file creation
5. **Documented pattern in standards.md** to prevent future violations

#### 2. Standards Documentation Prevents Pattern Drift

**Discovery**: Without explicit documentation, good patterns can be violated even with the best intentions.

**What Worked Well**:
Added new "Slash Command File Creation Pattern" section to standards.md with:
- Clear responsibility breakdown (AI vs CLI)
- Code examples showing ❌ BAD vs ✅ GOOD patterns
- Concrete examples from existing commands
- Explanation of why the pattern matters

**Code Example from Standards**:
```typescript
// ❌ BAD: Service class writing files for slash commands
class ReviewPersistenceService {
  saveReport(report: string): void {
    writeFileSync('.hodge/reviews/...', report);
  }
}

// ✅ GOOD: Slash command template using Write tool
// In .claude/commands/review.md:
// Use Write tool to save report with YAML frontmatter
```

**Impact**:
- Future contributors can reference standards before implementation
- AI can check standards during pre-ship reviews
- Pattern is now enforceable in code reviews
- Reduces architectural thrash and rework

#### 3. User Intervention Catches What AI Might Miss

**Discovery**: The user asked a critical question: "Are you sure the persistence should go through `hodge`? How is the writing of explorations.md, decisions.md, and lessons learned handled?"

This question triggered investigation that revealed:
- `/explore` template writes exploration.md using Write tool
- `/ship` template writes lessons using Write tool
- Pattern was consistent but undocumented

**What This Reveals**:
- AI can miss existing patterns when they're not explicitly documented
- User domain knowledge is invaluable for catching architectural misalignments
- Quick questions can save hours of implementation thrash

**Pattern Established**:
When implementing new slash command features, ALWAYS check:
1. How do existing slash commands handle similar operations?
2. Is there an established pattern in the codebase?
3. Should this pattern be documented in standards.md?

#### 4. Template-Based Logic Is Acceptable For Simple Operations

**Discovery**: Not everything needs TypeScript. Simple bash operations in templates are fine for:
- Filename generation (sed, awk)
- Metadata extraction (grep with regex)
- Feature detection (git blame parsing)

**Why This Works**:
- Bash is fast and well-suited for text manipulation
- Template logic is visible and easily understood
- Write tool handles file I/O reliably
- No need for Service class boilerplate

**When To Use Templates vs Service Classes**:
- **Templates (slash commands)**: Content generation, user interaction, file writing
- **Service Classes (CLI)**: Business logic, data processing, PM integration, testable operations

### Code Examples

**Before (Wrong Approach)**:
```typescript
// src/lib/review-persistence-service.ts
export class ReviewPersistenceService {
  generateFilename(scope: string, target: string): string {
    const targetSlug = target.replace(/\//g, '-').replace(/[^a-zA-Z0-9-_.]/g, '-');
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    return `${targetSlug}-${timestamp}.md`;
  }

  saveReport(report: string, metadata: ReviewMetadata): string {
    const filename = this.generateFilename(metadata.scope, metadata.target);
    const filepath = join('.hodge', 'reviews', filename);
    const frontmatter = `---\nreviewed_at: ${metadata.reviewed_at}\n...---\n`;
    writeFileSync(filepath, frontmatter + report, 'utf-8');
    return filepath;
  }
}
```

**After (Correct Approach)**:
```markdown
<!-- .claude/commands/review.md -->
## Step 6: Save Review Report (Optional)

### If user chooses 's' (Save):

1. **Generate filename** from file path and timestamp:
```bash
FILE_SLUG=$(echo "{{file_path}}" | sed 's|^\./||' | sed 's|/|-|g' | sed 's|[^a-zA-Z0-9._-]|-|g')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")
FILENAME="${FILE_SLUG}-${TIMESTAMP}.md"
```

2. **Use Write tool to save report** with YAML frontmatter:

Create the full report content with metadata header, then use the Write tool:

**File path**: `.hodge/reviews/{{filename}}`
**Content structure**:
```markdown
---
reviewed_at: {{iso_timestamp}}
scope: file
target: {{file_path}}
---

{{full_report_content}}
```
```

### Impact

**Development Efficiency**:
- ✅ Caught architectural mismatch before shipping
- ✅ Deleted ~150 lines of unnecessary Service class code
- ✅ Pivoted to correct pattern in < 30 minutes
- ✅ Documented pattern to prevent future violations

**Code Quality**:
- ✅ Follows established Hodge workflow patterns
- ✅ Standards.md now documents Write tool usage
- ✅ All harden validations passed (tests, lint, typecheck, build)
- ✅ Template-only changes (no TypeScript code to test)

**Architecture**:
- ✅ Clean separation: CLI = orchestration, AI = content generation
- ✅ Prevented Service class proliferation
- ✅ Consistent with explore/ship/decide workflows
- ✅ Future-proof for scope expansion (directory/pattern/recent/all)

### Related Decisions

From `.hodge/features/HODGE-327.1/build/build-plan.md`:

**Architectural Pivot**: Use Pure Template Implementation (Approach 2) instead of Service-Based Persistence (Approach 1)
- Discovered that AI writes exploration.md, decisions.md, and lessons via Write tool
- Service class approach violated this established pattern
- CLI only creates directory structures, not content files

**Write Tool Standardization**: Document Write tool as the standard pattern for slash command file creation
- Consistent with explore, ship, decide workflows
- Maintains clean separation: CLI = orchestration, AI = content generation
- Write tool handles parent directory creation automatically

### Validation

**Harden Phase Results**:
- ✅ All tests passed (existing tests continue working)
- ✅ Zero ESLint errors
- ✅ Zero TypeScript errors
- ✅ Build successful
- ✅ Total validation time: 35.2 seconds

**Files Changed**:
- 1 template file enhanced (review.md, +98 lines)
- 1 auto-generated sync (claude-commands.ts, +98 lines)
- 1 standards update (standards.md, +34 lines)
- 1 Service class deleted (review-persistence-service.ts, -150 lines)

### Lessons for Future Work

1. **Check existing patterns before implementing**
   - Grep for similar file operations in templates
   - Review how explore/ship/decide handle file writing
   - Ask: "Is there already a pattern for this?"

2. **Document patterns proactively**
   - If you discover an undocumented pattern, document it immediately
   - Update standards.md with examples (❌ BAD vs ✅ GOOD)
   - Save future developers from making the same mistakes

3. **Service classes are for CLI business logic, not slash command file operations**
   - Slash commands use Write tool for file creation
   - Service classes handle data processing, PM integration, testable operations
   - Don't conflate the two responsibilities

4. **User questions are architectural guardrails**
   - When a user asks "Are you sure?", investigate thoroughly
   - Domain knowledge catches what documentation might miss
   - Quick clarifications prevent hours of rework

5. **Bash in templates is perfectly acceptable**
   - Not everything needs TypeScript
   - Simple text manipulation is well-suited for bash
   - Focus on readability and maintainability

---

**Documented**: October 4, 2025
**Developer**: Michael Kelly
**AI Assistant**: Claude Code (Claude Sonnet 4.5)
**Workflow**: Explore → Build → Pivot → Harden → Ship (Hodge progressive development)
