# Exploration: HODGE-333.1

## Title
Frontmatter Infrastructure + YAML Migration for Markdown Review Profiles

## Problem Statement

The current review system uses YAML profiles (default.yml) which creates format inconsistency with the project's markdown-based standards, principles, patterns, and lessons. We need to migrate to a unified markdown + YAML frontmatter format while maintaining backward compatibility for the existing /review file command and establishing the infrastructure foundation for future profile composition and scope expansion.

## Conversation Summary

### Current State Analysis

The existing `default.yml` profile contains 8 criteria categories:
1. **Lessons Learned Violations** (blocker) - Cross-references `.hodge/lessons/`
2. **Single Responsibility Principle** (warning) - General OOP principle
3. **DRY Violations** (suggestion) - Code duplication detection
4. **Coupling & Cohesion** (warning) - Module dependency analysis
5. **Complexity Hotspots** (warning) - Nesting, length, conditionals
6. **Naming Consistency** (suggestion) - Intent-revealing names
7. **Error Handling** (warning) - Missing error handling, empty catches
8. **Pattern Adherence** (warning) - Cross-references `.hodge/patterns/`

All 8 criteria are language-agnostic and apply universally to TypeScript, JavaScript, Python, Java, Go, and Kotlin.

### Key Architectural Insights

**Redundant Cross-References**: The "Lessons Learned Violations" and "Pattern Adherence" criteria are redundant because `ContextAggregator` already loads `.hodge/lessons/` and `.hodge/patterns/` into the review context. The AI receives this context regardless of profile criteria, so we don't need explicit criteria telling it to check them.

**Single Universal Profile**: All remaining criteria (SRP, DRY, Coupling, Complexity, Naming, Error Handling) are universal coding principles that belong in a single `general-coding-standards.md` profile that ships with the Hodge framework.

### Migration Strategy Decisions

**Profile Split**: Migrate `default.yml` → `general-coding-standards.md` (single file with 6 universal criteria)

**Removed Criteria**: Eliminate "Lessons Learned Violations" and "Pattern Adherence" (already handled by ContextAggregator)

**File Deletion**: Delete `default.yml` entirely after migration (no backward compatibility needed - pre-release product)

**Class Rename**: Rename `ProfileLoader` → `ReviewProfileLoader` for clarity about profile type

### Technology Choices

**Frontmatter Parsing**: Selected `gray-matter` library
- Industry standard (5M weekly downloads)
- Actively maintained (last publish: 2 months ago)
- Clean API: `matter(fileContent)` returns `{ data, content }`
- Handles edge cases (escaped delimiters, different syntaxes)
- Used by Next.js, Gatsby, Docusaurus

**Markdown AST Parsing**: Selected `unified` + `remark-parse` + `remark-frontmatter`
- Robust handling of markdown edge cases (nested formatting, code blocks, etc.)
- Extensible for future composition system (HODGE-333.4)
- Industry standard (80M+ downloads/week combined)
- Supports programmatic section extraction, validation, and merging
- Future-proof for directory/pattern/recent/all review scopes

**Why Not Regex**: While simpler, regex is fragile for markdown and won't support the composition system's needs for programmatic section merging and reordering.

### Format Specifications

**Frontmatter Schema** (with versioning):
```yaml
---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
applies_to: ["**/*"]
version: "1.0.0"
maintained_by: hodge-framework
---
```

**Section-Level Enforcement** (explicit markers):
```markdown
## Single Responsibility Principle
**Enforcement: SUGGESTED** | **Severity: WARNING**

A class/function should have one reason to change...
```

**Severity Mapping**:
- YAML `blocker` → Markdown `MANDATORY` / `BLOCKER`
- YAML `warning` → Markdown `SUGGESTED` / `WARNING`
- YAML `suggestion` → Markdown `GUIDANCE` / `SUGGESTION`

### Backward Compatibility

**Review Command Output**: Maintain existing format from `.hodge/reviews/*.md`:
- Same frontmatter structure (reviewed_at, scope, target, profile, findings)
- Same report sections (Blockers, Warnings, Suggestions)
- Same finding format (Location, Description, Rationale, Suggested Action)
- Profile name updates from "Default Code Quality" → "General Coding Standards"

**File Command**: `/review file <path>` continues working with identical UX

## Implementation Approaches

### Approach 1: Layered Refactoring with New Abstractions (Recommended)

**Description**: Incrementally build new markdown infrastructure alongside existing YAML system, then switch over in final step. Create clean abstraction layers for frontmatter parsing, content extraction, and enforcement detection.

**Architecture**:

**Layer 1: Frontmatter Parser** (new module)
```typescript
// src/lib/frontmatter-parser.ts
import matter from 'gray-matter';

export interface FrontmatterData {
  frontmatter_version: string;
  scope: 'reusable' | 'project';
  type: string;
  version: string;
  // ... other fields
}

export function parseFrontmatter(content: string): {
  data: FrontmatterData;
  content: string;
} {
  const { data, content: markdown } = matter(content);
  return { data: data as FrontmatterData, content: markdown };
}
```

**Layer 2: Markdown Section Parser** (new module)
```typescript
// src/lib/markdown-section-parser.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';

export interface EnforcementMarker {
  enforcement: 'MANDATORY' | 'SUGGESTED' | 'GUIDANCE';
  severity: 'BLOCKER' | 'WARNING' | 'SUGGESTION';
}

export interface ProfileSection {
  heading: string;
  enforcement: EnforcementMarker;
  content: string;
}

export function extractSections(markdown: string): ProfileSection[] {
  // Use remark AST to find headings and enforcement markers
}
```

**Layer 3: ReviewProfileLoader Refactor** (refactor existing)
```typescript
// src/lib/review-profile-loader.ts (renamed from profile-loader.ts)
export class ReviewProfileLoader {
  loadProfile(profileName: string): ReviewProfile {
    const profilePath = join(this.profilesDir, `${profileName}.md`);

    if (!existsSync(profilePath)) {
      throw new Error(`Profile not found: ${profilePath}`);
    }

    const content = readFileSync(profilePath, 'utf-8');
    const { data, content: markdown } = parseFrontmatter(content);
    const sections = extractSections(markdown);

    return this.buildProfile(data, sections);
  }

  private buildProfile(data: FrontmatterData, sections: ProfileSection[]): ReviewProfile {
    // Transform markdown sections into ReviewProfile format
  }
}
```

**Migration Steps**:
1. Add `gray-matter`, `unified`, `remark-parse`, `remark-frontmatter` dependencies
2. Create frontmatter-parser.ts module with validation
3. Create markdown-section-parser.ts module with AST parsing
4. Create general-coding-standards.md profile from default.yml content
5. Refactor ProfileLoader → ReviewProfileLoader (support markdown)
6. Update review.ts import statements
7. Delete default.yml
8. Write smoke tests for all layers
9. Run full test suite to verify backward compatibility

**Pros**:
- Clean separation of concerns (frontmatter, sections, profile loading)
- Easy to test each layer independently
- Existing ReviewProfile type unchanged (minimal refactoring)
- Can swap implementations without breaking consumers
- Clear migration path with rollback points

**Cons**:
- More initial code to write (3 new modules)
- Transformation from markdown sections to ReviewProfile type

**When to use**: When you want maintainable, testable code with clear abstractions for future enhancement.

---

### Approach 2: Direct Inline Migration

**Description**: Refactor ProfileLoader to directly parse markdown using gray-matter + simple string parsing, without separate abstraction layers.

**Architecture**:

```typescript
// src/lib/review-profile-loader.ts (renamed, refactored)
import matter from 'gray-matter';

export class ReviewProfileLoader {
  loadProfile(profileName: string): ReviewProfile {
    const profilePath = join(this.profilesDir, `${profileName}.md`);
    const content = readFileSync(profilePath, 'utf-8');

    // Parse frontmatter
    const { data, content: markdown } = matter(content);

    // Simple regex parsing for sections
    const sections = markdown.split(/^## /m).filter(s => s.trim());

    const criteria = sections.map(section => {
      const lines = section.split('\n');
      const name = lines[0].trim();

      // Extract enforcement with regex
      const enforcementMatch = lines[1]?.match(/\*\*Enforcement: (\w+)\*\*.*\*\*Severity: (\w+)\*\*/);
      const enforcement = enforcementMatch?.[1] || 'SUGGESTED';
      const severity = enforcementMatch?.[2] || 'WARNING';

      return {
        name,
        severity: severity.toLowerCase() as SeverityLevel,
        patterns: [lines.slice(2).join('\n')],
        custom_instructions: ''
      };
    });

    return {
      name: data.name || profileName,
      description: data.description || '',
      applies_to: data.applies_to || ['**/*'],
      criteria
    };
  }
}
```

**Pros**:
- Minimal code changes (single file refactor)
- Faster to implement initially
- No new abstraction layers to maintain

**Cons**:
- Regex parsing fragile (won't handle edge cases)
- Hard to test (parsing logic coupled with file I/O)
- No structured validation of frontmatter schema
- Difficult to extend for composition system (HODGE-333.4)
- Loses semantic information from markdown structure

**When to use**: Quick prototypes or simple one-off migrations (NOT recommended for production).

---

### Approach 3: Hybrid - Gray-matter + Manual Section Parsing

**Description**: Use gray-matter for frontmatter, but skip remark AST parsing in favor of simpler manual section extraction. Middle ground between Approach 1 and 2.

**Architecture**:

```typescript
// src/lib/frontmatter-parser.ts
import matter from 'gray-matter';
export function parseFrontmatter(content: string) { /* same as Approach 1 */ }

// src/lib/review-profile-loader.ts
export class ReviewProfileLoader {
  loadProfile(profileName: string): ReviewProfile {
    const content = readFileSync(profilePath, 'utf-8');
    const { data, content: markdown } = parseFrontmatter(content);

    // Manual section parsing (more robust than regex, simpler than AST)
    const sections = this.extractSections(markdown);
    return this.buildProfile(data, sections);
  }

  private extractSections(markdown: string): ProfileSection[] {
    const lines = markdown.split('\n');
    const sections: ProfileSection[] = [];
    let currentSection: Partial<ProfileSection> | null = null;

    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentSection) sections.push(currentSection as ProfileSection);
        currentSection = { heading: line.slice(3), content: '' };
      } else if (line.match(/\*\*Enforcement:/)) {
        const match = line.match(/Enforcement: (\w+).*Severity: (\w+)/);
        if (currentSection && match) {
          currentSection.enforcement = {
            enforcement: match[1] as any,
            severity: match[2] as any
          };
        }
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) sections.push(currentSection as ProfileSection);
    return sections;
  }
}
```

**Pros**:
- More robust than pure regex
- Avoids heavy remark dependency
- Still separates frontmatter parsing
- Easier to understand than AST manipulation

**Cons**:
- Manual parsing still fragile (nested markdown, code blocks)
- Will need refactoring for composition system anyway
- No benefit over Approach 1 except smaller dependency tree

**When to use**: When dependency size is critical concern, but you still want some structure.

## Recommendation

**Use Approach 1: Layered Refactoring with New Abstractions**

This approach best aligns with HODGE-333.1's role as the **foundation story** for the entire epic:

**1. Foundation for HODGE-333.4 Composition System**
- Story 333.4 needs to programmatically merge sections from multiple profiles
- Requires AST-level understanding to handle conflicts, reordering, deduplication
- Layered approach with remark provides this infrastructure now

**2. Robust Long-Term Architecture**
- Frontmatter schema will evolve (versioning exists for this reason)
- Section parsing must handle edge cases (code blocks, nested formatting, etc.)
- Clean abstractions allow swapping implementations without breaking consumers

**3. Testability and Maintainability**
- Each layer (frontmatter, sections, loader) testable in isolation
- Clear contracts between layers
- Easy to add validation, logging, error handling per layer

**4. Minimal Risk with Rollback Points**
- New modules created alongside existing code
- Can test thoroughly before switching
- Old YAML loader remains until final step

**5. Sets Pattern for Future Stories**
- 333.2 (auto-detection) and 333.3 (profile library) will use these same abstractions
- Consistency across epic reduces cognitive load

**Implementation Priority**:
1. Add dependencies (gray-matter, unified, remark)
2. Create frontmatter-parser.ts (smoke tests)
3. Create markdown-section-parser.ts (smoke tests)
4. Create general-coding-standards.md profile
5. Refactor ProfileLoader → ReviewProfileLoader
6. Integration tests (verify /review file works)
7. Delete default.yml
8. Full test suite validation

## Test Intentions

### Frontmatter Parsing and Validation
- Can parse YAML frontmatter from markdown files using gray-matter
- Validates required frontmatter fields (frontmatter_version, scope, type, version)
- Validates frontmatter_version is "1.0.0" (matches epic schema decision)
- Handles missing frontmatter gracefully with clear error message
- Handles malformed YAML frontmatter with clear error message
- Handles empty frontmatter with clear error message

### Section Enforcement Detection
- Extracts section headings from markdown using remark AST
- Reads section-level enforcement markers (**Enforcement: MANDATORY**)
- Reads section-level severity markers (**Severity: BLOCKER**)
- Correctly maps enforcement levels (MANDATORY, SUGGESTED, GUIDANCE)
- Correctly maps severity levels (BLOCKER, WARNING, SUGGESTION)
- Handles missing enforcement markers with sensible defaults
- Handles malformed enforcement markers with clear error messages
- Extracts section content (markdown body after heading and markers)

### YAML to Markdown Migration
- Converts default.yml to general-coding-standards.md format
- Maintains semantic equivalence for 6 universal criteria (SRP, DRY, Coupling, Complexity, Naming, Error Handling)
- Correctly maps YAML severities to markdown enforcement/severity pairs
- Preserves custom_instructions as markdown section content
- Removes redundant lesson/pattern criteria (handled by ContextAggregator)
- Profile frontmatter contains all required fields
- Profile sections contain proper enforcement markers

### Backward Compatibility
- /review file command continues working after migration
- ReviewProfileLoader loads markdown profiles successfully
- Review command output maintains same format (blockers/warnings/suggestions)
- Review report frontmatter maintains same structure
- Review findings maintain same format (Location, Description, Rationale, Suggested Action)
- Profile name updates from "Default Code Quality" to "General Coding Standards"
- No errors when running existing review workflow end-to-end

## Decisions Decided During Exploration

1. ✓ **Use gray-matter library for frontmatter parsing** - Industry standard (5M downloads/week), actively maintained, handles edge cases better than manual parsing
2. ✓ **Use unified/remark for markdown AST parsing** - Robust, extensible, future-proof for composition system (HODGE-333.4), handles markdown edge cases
3. ✓ **Split default.yml into single general-coding-standards.md file** - Remove redundant lesson/pattern criteria already handled by ContextAggregator, keep 6 universal principles
4. ✓ **Delete default.yml entirely after migration** - No backward compatibility needed (pre-release product), clean break to markdown
5. ✓ **Rename ProfileLoader → ReviewProfileLoader** - Clarity about profile type (review profiles vs other potential profile types)
6. ✓ **Validate frontmatter schemas** - Required since we're versioning them (frontmatter_version field), enables future schema evolution
7. ✓ **Severity mapping** - blocker→MANDATORY/BLOCKER, warning→SUGGESTED/WARNING, suggestion→GUIDANCE/SUGGESTION
8. ✓ **Maintain existing review report format** - Keep blockers/warnings/suggestions sections with Location, Description, Rationale, Suggested Action format
9. ✓ **Write smoke tests for all core behaviors** - Frontmatter parsing, section extraction, migration, backward compatibility

## Decisions Needed

**No Decisions Needed** - All architectural and implementation decisions were resolved during exploration.

---
*Template created: 2025-10-06T22:30:00.000Z*
*Exploration completed: 2025-10-06T23:15:00.000Z*
