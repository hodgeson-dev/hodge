# Test Intentions: HODGE-357.6

## Feature: File Splitting - Module Reorganization with Strategic Exemptions

### TI-1: Template Exemption Behavior
**Given** ESLint configuration with template file exemptions
**When** running `npm run lint`
**Then** `claude-commands.ts` and `pm-scripts-templates.ts` should not report max-lines violations

**Rationale**: Template files containing auto-generated or embedded content should be exempt from line limits.

---

### TI-2: Functionality Preservation After Splits
**Given** a file has been split into multiple modules
**When** running the full test suite (`npm test`)
**Then** all 1300+ tests should pass with no new failures

**Rationale**: File reorganization should not change behavior. All existing tests must continue to pass.

---

### TI-3: Import Path Correctness
**Given** files have been reorganized into subdirectories
**When** TypeScript compilation runs (`npm run typecheck`)
**Then** all imports should resolve correctly with no compilation errors

**Rationale**: Split files require updated import paths. TypeScript compilation validates all paths resolve.

---

### TI-4: Module Cohesion Validation
**Given** a file has been split
**When** reviewing the resulting modules
**Then** each module should represent a focused, cohesive responsibility (not arbitrary splits)

**Rationale**: Splits should improve comprehension by separating concerns, not just mechanically reduce line counts.

---

### TI-5: ESLint Violation Reduction
**Given** all phases complete
**When** running `npm run lint`
**Then** max-lines violations should reduce from 10 to 0-3 (severe violations eliminated, legitimate exemptions documented)

**Rationale**: Goal is to eliminate clear violations while preserving legitimate exemptions for templates and cohesive borderline files.

---

*Test intentions represent behavioral expectations, not implementation details.*
