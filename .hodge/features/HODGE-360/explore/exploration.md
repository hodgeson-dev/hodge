# Exploration: Streamline /harden File Generation

**Created**: 2025-10-29
**Status**: Exploring

## Problem Statement

The `/harden` command currently generates 5 files, some of which duplicate information or aren't used by the AI workflow:
- `validation-results.json` - Tool diagnostics (✅ needed)
- `review-manifest.yaml` - Context loading guide (✅ needed)
- `critical-files.md` - Top 10 risk-ranked files (🔄 duplicates data in manifest)
- `review-report.md` - AI-written review findings (✅ needed)
- `harden-report.md` - Human-readable summary (❌ unused)

**Goal**: Generate only the data files AI needs to accomplish the `/harden` workflow, eliminating redundant human-readable summaries.

## Context

**Project Type**: Hodge CLI framework
**Phase**: Harden phase optimization

### Current Workflow Analysis

The `/harden` template follows this flow:
1. **CLI generates** 3 files (validation-results.json, review-manifest.yaml, critical-files.md)
2. **AI reads** validation results to find errors/warnings
3. **AI reads** review manifest to determine tier and context files to load
4. **AI reads** critical-files.md to prioritize which files get deep review (lines 317-319)
5. **AI conducts** risk-based review (deep on critical files, quick scan others)
6. **AI writes** review-report.md with findings

### Key Insight

The `critical-files.md` contains algorithmic data (risk scores, rankings) that could be structured data in the manifest rather than a separate markdown file. The user prefers to look at data files (JSON/YAML) rather than interpreted summaries.

## Conversation Summary

User identified that:
- `critical-files.md` and `review-manifest.yaml` both contain file lists (duplication)
- `harden-report.md` is a human-readable summary that's never referenced in the workflow
- Preference is for AI-consumable data files only, not interpretive summaries

Solution agreed upon:
- Consolidate critical files data into `review-manifest.yaml` as a new `critical_files[]` section
- Stop generating `critical-files.md` and `harden-report.md`
- Keep `auto-fix-report.json` and `validation-results.json` (tool outputs)
- Keep `review-report.md` (AI-written findings)

## Implementation Approaches

### Approach 1: Manifest Enhancement with Critical Files Section

**Description**: Add a structured `critical_files` section to `review-manifest.yaml` containing the ranked file list with risk scores and factors.

**Implementation**:
```yaml
# review-manifest.yaml structure
version: '1.0'
feature: HODGE-XXX
generated_at: '2025-10-29T00:00:00.000Z'
recommended_tier: full

# Existing sections
change_analysis: {...}
changed_files: [...]
context: {...}
scope: {...}

# NEW: Critical files section
critical_files:
  algorithm: "risk-weighted-v1.0"
  total_files: 46
  top_n: 10
  files:
    - path: "src/bundled-config/tool-registry.yaml"
      rank: 1
      score: 116
      risk_factors:
        - "1 blocker issue"
    - path: "src/lib/toolchain-service.ts"
      rank: 2
      score: 100
      risk_factors:
        - "large change (227 lines)"
        - "new file"
```

**Pros**:
- Single source of truth for file metadata
- Structured data (easier to parse programmatically)
- Consistent YAML format across all file lists
- Reduces file count from 5 to 3 data files
- Maintains all information AI needs for risk-based review

**Cons**:
- Slightly larger manifest file
- Need to update manifest generation code
- Need to update `/harden` template to read from manifest

**When to use**: When you want minimal files with maximum information density

### Approach 2: Keep Critical Files Separate but as JSON

**Description**: Convert `critical-files.md` to `critical-files.json` for structured data, stop generating `harden-report.md`.

**Implementation**:
```json
// critical-files.json
{
  "algorithm": "risk-weighted-v1.0",
  "generated_at": "2025-10-29T00:00:00.000Z",
  "total_files": 46,
  "top_n": 10,
  "critical_files": [
    {
      "path": "src/bundled-config/tool-registry.yaml",
      "rank": 1,
      "score": 116,
      "risk_factors": ["1 blocker issue"]
    }
  ]
}
```

**Pros**:
- Separation of concerns (manifest = context, critical = prioritization)
- Easier to modify critical file selection algorithm independently
- JSON is even more structured than YAML

**Cons**:
- Still maintains separate file (4 files instead of 3)
- Duplication between changed_files in manifest and critical_files JSON
- More files for AI to read

**When to use**: When you want strict separation between context loading and file prioritization

### Approach 3: Minimal Data-Only Approach (Recommended)

**Description**: Combine Approach 1 with complete removal of all human-readable summaries. Generate only machine-readable data.

**Files Generated**:
1. `validation-results.json` - Tool execution results
2. `review-manifest.yaml` - Enhanced with critical_files section
3. `auto-fix-report.json` - Auto-fix results
4. `review-report.md` - AI-written findings (only human-readable file, but it's AI's output)

**Code Changes**:
- `src/lib/review-manifest-generator.ts` - Add `critical_files` section to manifest
- `src/commands/harden/harden-review.ts` - Remove `writeCriticalFiles()` and `writeHardenReport()` calls
- Remove or deprecate `src/lib/critical-files-report-generator.ts` (if only used for MD generation)
- Remove or deprecate `src/lib/quality-report-generator.ts` (if it generates harden-report.md)

**Template Changes**:
- `.claude/commands/harden.md`:
  - Remove Step 2.6 "Read Critical Files Manifest"
  - Update Step 5 line 317 to reference `review-manifest.yaml > critical_files[]`
  - Remove references to `harden-report.md`
  - Update line 159 display summary to not mention critical-files.md
  - Update line 613 validation checklist if it references harden-report.md

**Pros**:
- Minimal file generation (3 data files + 1 AI output)
- No duplication between files
- Consistent with user preference for data over summaries
- Cleaner harden directory
- Easier to understand what each file does

**Cons**:
- Requires coordinated changes across multiple files
- Template updates must be synchronized with code changes

**When to use**: When you want the cleanest, most data-focused approach (matches user requirements)

## Recommendation

**Use Approach 3: Minimal Data-Only Approach**

**Rationale**:
- Directly addresses user's concern about duplication and unnecessary files
- Maintains all information AI needs for the workflow
- Single source of truth for file metadata (review-manifest.yaml)
- Aligns with Hodge philosophy of "AI writes content, CLI creates structure"
- Reduces cognitive load (fewer files = clearer purpose)
- Data files are more valuable than interpreted summaries for debugging

**Risk Mitigation**:
- Template updates are straightforward (remove references, update one step)
- No loss of information (critical files data preserved in manifest)
- Review-report.md still provides human-readable output (AI-generated)

## Test Intentions

**Behavioral Expectations**:
1. ✅ `hodge harden FEATURE --review` generates exactly 3 files: validation-results.json, review-manifest.yaml, auto-fix-report.json
2. ✅ review-manifest.yaml contains `critical_files` section with ranked file list
3. ✅ critical_files section includes algorithm, top_n, and files array with rank/score/risk_factors
4. ✅ harden directory does NOT contain critical-files.md
5. ✅ harden directory does NOT contain harden-report.md
6. ✅ AI can parse critical files from review-manifest.yaml during review step
7. ✅ /harden template references correct file locations
8. ✅ review-report.md is still generated by AI (unchanged)

## Decisions Decided During Exploration

1. ✓ **Consolidate critical files into review-manifest.yaml** - Reduces file count and eliminates duplication
2. ✓ **Stop generating harden-report.md** - Unused human summary not part of AI workflow
3. ✓ **Keep validation-results.json and auto-fix-report.json** - Core tool outputs needed by AI
4. ✓ **Update /harden template** - Must sync with code changes for consistency

## Decisions Needed

**No unresolved decisions** - All questions resolved during exploration.

## Next Steps

Ready to build with Approach 3 (Minimal Data-Only).