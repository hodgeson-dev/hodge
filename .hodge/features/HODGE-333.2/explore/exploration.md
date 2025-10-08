# Exploration: HODGE-333.2

## Title
Auto-detection and review-config.md generation for hodge init

## Problem Statement

After HODGE-333.1 migrated review profiles to markdown with frontmatter, `hodge init` needs to auto-detect project technologies and generate `.hodge/review-config.md` listing applicable review profiles. Currently, developers must manually configure which profiles to use, creating friction and inconsistent review coverage across projects.

The parent epic (HODGE-333) envisioned auto-detection during `hodge init` that would:
- Detect languages (TypeScript, JavaScript, Python, etc.)
- Detect frameworks (React, Vue, Express, etc.)
- Detect testing tools (vitest, jest, pytest, etc.)
- Detect databases (Prisma, Drizzle, etc.)
- Detect UI libraries (MUI, Chakra, Tailwind, etc.)
- Generate `.hodge/review-config.md` with detected profiles

However, several architectural questions needed resolution:
1. How does HODGE-333.2 reference profiles that won't exist until HODGE-333.3?
2. Should detection be hard-coded or dynamic?
3. How do we handle the timing conflict between profile creation (333.3) and detection (333.2)?
4. What happens when `hodge init` is run on an already-initialized project?

## Conversation Summary

### Initialization Workflow Simplification

**Remove `--force` flag entirely**: The existing `hodge init --force` flag that overwrites existing configurations adds complexity and risk. Instead, `hodge init` should fail with a clear message if `.hodge` already exists, directing users to manual cleanup or a future `hodge init --update` command (deferred to later work).

**Rationale**: Simplifies the initialization workflow, reduces risk of accidental data loss, and provides clearer user guidance. The `--update` flag (for re-running detection while preserving manual edits) is valuable but out of scope for HODGE-333.2.

### Comprehensive Detection Scope

**Option B: Only detect technologies with review profiles**: Rather than detecting everything and ignoring missing profiles, we detect only technologies where we have profiles available. This ensures clean separation and no broken references in review-config.md.

**Comprehensive profile coverage** across:
- **Languages**: JavaScript, TypeScript, Python, Go, Rust, Kotlin, Java, Dart
- **Frameworks**: React, Vue, Angular, Svelte, Express, Fastify, NestJS
- **Databases**: Prisma, Drizzle, TypeORM, Sequelize, Mongoose
- **API Styles**: REST, GraphQL, tRPC
- **UI Libraries**: MUI, Chakra UI, Tailwind, Ant Design
- **Test Frameworks**: vitest, jest, mocha, playwright, cypress
- **Build Tools**: typescript, webpack, vite, rollup
- **Linting**: eslint, prettier

**Total: 30+ review profiles** to be created as placeholders in HODGE-333.2.

### Frontmatter-Driven Detection Architecture

**Key Innovation**: Review profiles declare their own detection rules in YAML frontmatter. This eliminates hard-coded detection logic in `hodge init` and enables a plugin-like architecture where profiles are self-describing.

**Example frontmatter**:
```yaml
---
scope: reusable
language: typescript
applies_to: ["**/*.ts", "**/*.tsx"]
version: "1.0.0"
maintained_by: hodge-framework
detection:
  files: ["tsconfig.json"]
  dependencies: ["typescript"]
  match: any  # Match if ANY detection rule passes
---
```

**Detection Rules**:
- `files`: Check for existence of config files (e.g., `tsconfig.json`, `package.json`)
- `dependencies`: Check for package.json dependencies/devDependencies
- `match`: "any" (OR logic) or "all" (AND logic) for combining rules

This approach solves the HODGE-333.2/333.3 timing conflict: HODGE-333.2 creates placeholder profiles with frontmatter only, HODGE-333.3 adds the markdown content.

### Multi-Technology Handling

**Capture all detected technologies**: If a project has both React and Vue in dependencies (rare but possible), add both to review-config.md. Conflict resolution and precedence rules will be handled later by the composition system (HODGE-333.4).

**Rationale**: Keeps detection simple and comprehensive. The review command's composition system already handles precedence and conflicts, so detection doesn't need to make judgment calls.

### Clean Detection Output

**Show results only**: Auto-detection logging shows clean, focused output of what was detected (e.g., "✓ TypeScript", "✓ React", "✓ Prisma") without verbose checking details. Maintains professional UX and respects user's time.

### Architecture Decision: Phased Profile Creation

**HODGE-333.2**: Create placeholder profiles with frontmatter only
- Frontmatter contains detection rules, metadata, versioning
- Markdown body contains placeholder text: "Profile content coming in HODGE-333.3"
- Enables auto-detection to work immediately
- Provides framework for HODGE-333.3 to fill in

**HODGE-333.3**: Add markdown content to placeholder profiles
- Replace placeholder text with actual review criteria
- Maintain frontmatter structure (don't modify detection rules)
- Test profiles with actual review command

This phasing enables HODGE-333.2 to be independently shippable and testable.

## Implementation Approaches

### Approach 1: Frontmatter-Driven Profile Discovery (Recommended)

**Description**: Review profiles declare their own detection rules in YAML frontmatter. The auto-detection service reads all profiles in `review-profiles/`, parses their frontmatter, and executes the detection rules against the project. Detected profiles are written to `.hodge/review-config.md`.

**Architecture**:

**1. Profile Frontmatter Schema** (with detection rules):
```yaml
---
scope: reusable
language: typescript
applies_to: ["**/*.ts", "**/*.tsx"]
version: "1.0.0"
frontmatter_version: "1.0.0"
maintained_by: hodge-framework
detection:
  files: ["tsconfig.json"]
  dependencies: ["typescript"]
  match: any
---
```

**2. Profile Discovery Service**:
- Scans `review-profiles/` directory recursively
- Reads frontmatter from all `.md` files
- Builds registry of profiles with detection rules
- Returns map of `profile-path → detection-rules`

**3. Auto-Detection Service**:
- Takes profile registry from discovery service
- For each profile, evaluates detection rules:
  - `files`: Check if any listed files exist in project root
  - `dependencies`: Parse package.json, check if any listed deps exist
  - `match: any`: Pass if ANY rule matches (OR logic)
  - `match: all`: Pass if ALL rules match (AND logic)
- Returns list of detected profile paths

**4. Review Config Generator**:
- Takes detected profile paths
- Generates `.hodge/review-config.md` with:
  - List of active profiles
  - Auto-detection results section (what was detected and why)
  - Manual customization instructions
  - Timestamp and version metadata

**5. Placeholder Profile Creation**:
- Create 30+ placeholder profiles in HODGE-333.2
- Each profile has complete frontmatter (detection rules, metadata)
- Markdown body: `# [Profile Name]\n\n*Profile content coming in HODGE-333.3*`
- Organized in subdirectories:
  - `review-profiles/languages/`
  - `review-profiles/frameworks/`
  - `review-profiles/databases/`
  - `review-profiles/ui-libraries/`
  - `review-profiles/testing/`
  - `review-profiles/build-tools/`
  - `review-profiles/api-styles/`

**Integration with `hodge init`**:
```typescript
// In InitCommand.execute()
1. Check if .hodge exists → fail with clear message (no --force)
2. Run ProjectDetector.detectProject() (existing)
3. Run ProfileDiscoveryService.discoverProfiles()
4. Run AutoDetectionService.detectProfiles(projectInfo, profileRegistry)
5. Run ReviewConfigGenerator.generate(detectedProfiles)
6. Generate structure (existing)
7. Show completion message with detected profiles
```

**Pros**:
- Self-describing profiles (plugin-like architecture)
- No hard-coded detection logic in hodge init
- Easy to add new profiles (just create file with frontmatter)
- Solves HODGE-333.2/333.3 timing conflict cleanly
- Independently testable (detection service, generator, frontmatter parser)
- Scalable (community can contribute profiles with detection rules)

**Cons**:
- Frontmatter schema slightly more complex (adds `detection` field)
- Need to scan all profile files on init (but init is one-time operation)
- Placeholder profiles feel incomplete until HODGE-333.3

**When to use**: When building extensible systems where configuration should be declarative and self-describing.

---

### Approach 2: Hard-Coded Detection with Profile Stubs

**Description**: Create hard-coded detection logic in `hodge init` that checks for specific files/dependencies and maps to profile names. Create placeholder profiles as empty stubs to be filled in HODGE-333.3.

**Architecture**:

**Detection Logic** (in InitCommand or AutoDetectionService):
```typescript
const detectedProfiles: string[] = [];

// Language detection
if (await fs.pathExists('tsconfig.json')) {
  detectedProfiles.push('languages/typescript.md');
}
if (packageJson.dependencies?.react) {
  detectedProfiles.push('frameworks/react.md');
}
// ... 30+ more hard-coded checks
```

**Profile Stubs**:
- Minimal frontmatter (no detection rules)
- Empty markdown body
- HODGE-333.3 fills in both frontmatter and content

**Pros**:
- Simple and straightforward
- All detection logic in one place
- Easy to understand and debug

**Cons**:
- Hard-coded detection logic becomes maintenance burden
- Every new profile requires code changes in two places (detection + profile file)
- Not extensible for community contributions
- Tight coupling between hodge init and profile definitions
- Doesn't scale well (30+ if/else checks)

**When to use**: For small, fixed sets of profiles that rarely change.

---

### Approach 3: Hybrid with Detection Registry

**Description**: Maintain a separate detection registry file (e.g., `detection-rules.json`) that maps profile paths to detection rules. Profiles contain minimal frontmatter. Detection service reads registry and evaluates rules.

**Architecture**:

**Detection Registry** (`review-profiles/detection-rules.json`):
```json
{
  "languages/typescript.md": {
    "files": ["tsconfig.json"],
    "dependencies": ["typescript"],
    "match": "any"
  },
  "frameworks/react.md": {
    "dependencies": ["react"],
    "match": "any"
  }
}
```

**Profiles**: Minimal frontmatter, no detection rules

**Pros**:
- Centralized detection rules
- Profiles remain simpler
- Detection logic still declarative (not hard-coded)

**Cons**:
- Introduces additional file to maintain (detection-rules.json)
- Profile definition split across two files (profile.md + registry)
- Less discoverable (can't see detection rules by reading profile)
- Adds synchronization burden (keep registry in sync with profiles)

**When to use**: When you want centralized detection rules but profiles should remain minimal.

---

## Recommendation

**Use Approach 1: Frontmatter-Driven Profile Discovery**

This approach best aligns with HODGE-333.2 requirements and the overall HODGE-333 architecture:

1. **Self-Describing Profiles**: Each profile declares its own detection rules, making them truly modular and plugin-like. This aligns with Hodge's philosophy of decentralized, composable components.

2. **Solves Timing Conflict**: Placeholder profiles with complete frontmatter enable HODGE-333.2 to ship a working auto-detection system before HODGE-333.3 adds profile content.

3. **Scalability**: Adding new profiles is trivial (create file with frontmatter). No code changes needed in hodge init. Enables future community contributions.

4. **Maintainability**: Detection logic lives with the profile it describes. No synchronization between separate files or hard-coded checks.

5. **Extensibility**: Future enhancements (e.g., version-specific detection, platform-specific rules) can be added to frontmatter schema without changing core detection service.

6. **Testability**: Each component (profile discovery, frontmatter parsing, detection evaluation, config generation) is independently testable with clear contracts.

7. **Consistency with HODGE-333.1**: HODGE-333.1 established frontmatter-based profiles. This approach extends that pattern logically.

**Implementation Priority**:
1. Define frontmatter schema with `detection` field
2. Implement ProfileDiscoveryService (scan review-profiles/, parse frontmatter)
3. Implement AutoDetectionService (evaluate detection rules)
4. Implement ReviewConfigGenerator (generate .hodge/review-config.md)
5. Create 30+ placeholder profiles with detection frontmatter
6. Integrate into InitCommand (remove --force, add detection flow)
7. Add comprehensive tests (smoke + integration)

## Decisions Decided During Exploration

1. ✓ **Remove `--force` flag** - `hodge init` fails with clear message if `.hodge` exists
2. ✓ **Defer `hodge init --update`** - Re-initialization with manual edit preservation deferred to future work (not HODGE-333.2 scope)
3. ✓ **Option B: Only detect technologies with profiles** - Don't detect everything, only what we have profiles for
4. ✓ **Frontmatter-driven detection** - Profiles declare detection rules in YAML frontmatter (`detection` field)
5. ✓ **Create placeholder profiles in HODGE-333.2** - Frontmatter only (with detection rules), markdown content added in HODGE-333.3
6. ✓ **Add all detected technologies** - React + Vue both added if both found; conflict resolution handled by composition system (HODGE-333.4)
7. ✓ **Show "results only" logging** - Clean, focused output during auto-detection (e.g., "✓ TypeScript", "✓ React")
8. ✓ **Comprehensive profile coverage** - 30+ technologies: languages (TS, JS, Python, Go, Rust, Kotlin, Java, Dart), frameworks (React, Vue, Angular, Svelte, Express, Fastify, NestJS), databases (Prisma, Drizzle, TypeORM, Sequelize, Mongoose), API styles (REST, GraphQL, tRPC), UI libraries (MUI, Chakra, Tailwind, Ant Design), testing (vitest, jest, mocha, playwright, cypress), build tools (webpack, vite, rollup), linting (eslint, prettier)
9. ✓ **Frontmatter schema extension** - Add `detection` field with `files`, `dependencies`, and `match` subfields
10. ✓ **Profile organization** - Organize profiles in subdirectories by category (languages/, frameworks/, databases/, ui-libraries/, testing/, build-tools/, api-styles/)

## No Decisions Needed

All architectural questions resolved during exploration. Ready to proceed to `/build`.

## Test Intentions

### Frontmatter Schema with Detection Rules
- Can parse frontmatter with `detection` field (files, dependencies, match)
- Validates `match` field is "any" or "all"
- Handles profiles without detection rules gracefully (skips auto-detection)
- Validates `files` and `dependencies` are arrays of strings

### Profile Discovery Service
- Scans `review-profiles/` recursively for `.md` files
- Parses frontmatter from all discovered profiles
- Builds registry mapping profile paths to detection rules
- Handles profiles without detection rules (skips them)
- Handles malformed frontmatter gracefully (logs warning, continues)

### Auto-Detection Service - Languages
- Detects TypeScript (tsconfig.json exists OR "typescript" in dependencies)
- Detects JavaScript (package.json exists AND no tsconfig.json)
- Detects Python (requirements.txt, setup.py, or pyproject.toml exists)
- Detects Go (go.mod exists)
- Detects Rust (Cargo.toml exists)
- Detects Java (pom.xml or build.gradle exists)
- Detects Kotlin ("kotlin" in dependencies OR .kt files in src/)
- Detects Dart (pubspec.yaml exists)

### Auto-Detection Service - Frameworks
- Detects React ("react" in dependencies)
- Detects Vue ("vue" in dependencies)
- Detects Angular ("@angular/core" in dependencies)
- Detects Svelte ("svelte" in dependencies)
- Detects Express ("express" in dependencies)
- Detects Fastify ("fastify" in dependencies)
- Detects NestJS ("@nestjs/core" in dependencies)

### Auto-Detection Service - Databases
- Detects Prisma ("prisma" or "@prisma/client" in dependencies)
- Detects Drizzle ("drizzle-orm" in dependencies)
- Detects TypeORM ("typeorm" in dependencies)
- Detects Sequelize ("sequelize" in dependencies)
- Detects Mongoose ("mongoose" in dependencies)

### Auto-Detection Service - UI Libraries
- Detects MUI ("@mui/material" in dependencies)
- Detects Chakra UI ("@chakra-ui/react" in dependencies)
- Detects Tailwind ("tailwindcss" in dependencies)
- Detects Ant Design ("antd" in dependencies)

### Auto-Detection Service - Testing
- Detects vitest ("vitest" in devDependencies)
- Detects jest ("jest" in devDependencies)
- Detects mocha ("mocha" in devDependencies)
- Detects playwright ("@playwright/test" in devDependencies)
- Detects cypress ("cypress" in devDependencies)

### Auto-Detection Service - Build Tools & Linting
- Detects webpack ("webpack" in dependencies OR webpack.config.js exists)
- Detects vite ("vite" in dependencies OR vite.config.js exists)
- Detects rollup ("rollup" in dependencies OR rollup.config.js exists)
- Detects eslint ("eslint" in devDependencies OR .eslintrc* exists)
- Detects prettier ("prettier" in devDependencies OR .prettierrc* exists)

### Auto-Detection Service - API Styles
- Detects GraphQL ("graphql" in dependencies)
- Detects tRPC ("@trpc/server" in dependencies)
- Detects REST (Express, Fastify, or NestJS detected)

### Detection Rule Evaluation
- Evaluates `match: any` (OR logic) - passes if ANY rule matches
- Evaluates `match: all` (AND logic) - passes if ALL rules match
- Handles missing files gracefully (returns false, doesn't error)
- Handles missing package.json gracefully (file-based detection still works)

### Review Config Generator
- Generates `.hodge/review-config.md` with detected profiles
- Includes auto-detection results section (what was detected)
- Includes timestamp and version metadata
- Includes manual customization instructions
- Lists profiles in logical order (languages → frameworks → databases → UI → testing → build tools)

### Placeholder Profile Creation
- Creates 30+ placeholder profiles with detection frontmatter
- Profiles organized in subdirectories (languages/, frameworks/, etc.)
- Each profile has complete frontmatter (scope, version, detection rules)
- Markdown body: "# [Profile Name]\n\n*Profile content coming in HODGE-333.3*"
- Frontmatter includes `frontmatter_version: "1.0.0"` for future evolution

### hodge init Integration
- Fails with clear message if `.hodge` already exists (no --force flag)
- Runs auto-detection after project detection
- Generates `.hodge/review-config.md` with detected profiles
- Shows clean detection output ("✓ TypeScript", "✓ React", etc.)
- Completion message includes detected review profiles count

### Multi-Technology Handling
- Adds both React and Vue if both detected (no conflict resolution)
- Adds all detected test frameworks (vitest + jest if both present)
- Handles projects with 10+ detected technologies gracefully

### Error Handling
- Handles profile discovery failures gracefully (logs warning, continues)
- Handles frontmatter parsing errors gracefully (skips profile, logs warning)
- Handles detection rule evaluation errors gracefully (skips profile, logs warning)
- All errors logged to pino logs for debugging

---

*Template created: 2025-10-07T18:53:52.589Z*
*Exploration completed: 2025-10-07T19:30:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
