# HOD-6: Implement hodge init command

## Decision Made
- **Chosen Approach**: Smart Context-Aware Init
- **Date**: 2025-09-13
- **Rationale**: Truly minimal interaction (0-1 questions), comprehensive auto-detection including project name

## Implementation Plan

### Phase 1: Core Detection Engine
1. Implement project name detection (package.json, git, directory)
2. Implement project type detection (Node, Python, etc.)
3. Implement PM tool detection (env vars, git remote)
4. Implement testing/linting/build tool detection

### Phase 2: Smart Question Flow
1. Determine context (existing project vs empty directory)
2. Show detected configuration
3. Ask appropriate question:
   - Existing project → "Initialize with detected settings? (Y/n)"
   - Empty directory → "Project name? (directory-name)"
   - Force mode → No question

### Phase 3: Structure Creation
1. Generate config.json with all detected settings
2. Create standards.md based on detected tools
3. Create template decisions.md
4. Create empty patterns/ and features/ directories

## Key Features
- **Comprehensive auto-detection** of name, type, PM tool, testing, linting, package manager
- **Context-aware questions** - only asks what's necessary
- **Transparent feedback** - shows what was detected
- **Fast initialization** - <5 seconds for most projects
- **CLI flags** for different modes (--yes, --force, future --wizard)

## Technical Details
```typescript
// Detection priority for project name
1. package.json → name field
2. pyproject.toml → project.name
3. Cargo.toml → package.name  
4. Git remote → extract repo name
5. Directory name (fallback)

// Question flow logic
if (hasFullDetection) → confirmOnly()
else if (isEmpty) → askNameOnly()
else → showPartialAndConfirm()
```

## Files to Create/Modify
- `src/commands/init.ts` - Main init command implementation
- `src/lib/detectors/index.ts` - Detection engine
- `src/lib/detectors/project.ts` - Project info detection
- `src/lib/detectors/pm-tool.ts` - PM tool detection (reuse existing)
- `src/lib/detectors/code-quality.ts` - Linting/testing detection
- `src/lib/init/structure.ts` - .hodge structure creation
- `src/lib/init/templates.ts` - Template file contents

## Dependencies
- `inquirer` or `prompts` for confirmation/name prompt
- Existing fs/path modules
- Existing PM detection logic (reuse)

## Next Steps
Ready for `/build HOD-6` to implement smart context-aware init