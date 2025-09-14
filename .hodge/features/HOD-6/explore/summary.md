# HOD-6 Exploration Summary

## Issue Context
- **ID**: HOD-6
- **Title**: Implement hodge init command
- **Description**: One-question setup for new projects
- **Current State**: Backlog

## Approaches Explored

### Approach 1: Minimal One-Question Setup
- Ask only for project name
- Auto-detect everything else
- Smart defaults based on project type
- Best for: Quick start with reasonable defaults

### Approach 2: Guided Interactive Wizard
- Quick vs Custom mode choice
- Progressive disclosure of options
- Educational and transparent
- Best for: Users who want control

### Approach 3: Zero-Config Smart Init
- No questions at all
- Pure auto-detection
- Configure after initialization
- Best for: Instant setup

## REVISED Recommendation

**Implement Smart Context-Aware Init** that adapts based on detection:

### The Smart Approach
- **Existing projects**: Just confirm detected settings (one question)
- **Empty directories**: Ask for project name only (one question)
- **Partial detection**: Show what was found and confirm (one question)
- **Force mode**: No questions at all with --yes flag

### Why This Approach?
1. **Truly minimal**: Zero to one question maximum
2. **Context-aware**: Adapts to project state
3. **Comprehensive detection**: Name, type, PM tool, testing, linting, etc.
4. **Fast**: <5 seconds for most projects
5. **Transparent**: Shows what was detected

### Implementation Plan
```bash
hodge init              # Smart detection with confirmation
hodge init --yes        # Accept all detected settings (zero questions)
hodge init --wizard     # Force interactive mode (future)
hodge init --force      # Overwrite existing .hodge
```

### Core Features for MVP
1. **Comprehensive auto-detection**:
   - Project name from package.json, git, or directory
   - Project type from files and configs
   - PM tool from environment or git remote
   - Testing framework from configs
   - Linting and formatting tools
   - Package manager from lock files
   
2. **Smart question flow**:
   - Existing project → Confirm only
   - Empty directory → Name only
   - Partial detection → Show and confirm
   
3. **Create .hodge structure**:
   - config.json with all detected settings
   - standards.md based on detected tools
   - Empty patterns/ and features/ directories
   - Template decisions.md with examples
   
4. **Clear feedback**:
   - Show what was detected
   - Explain any missing pieces
   - Suggest next steps

### Dependencies Needed
- `inquirer` or `prompts` for confirmation prompt
- Existing fs/path modules for file operations
- Existing PM detection logic can be reused
- No additional dependencies for detection

This revised approach truly delivers "one-question setup" by being smart enough to detect everything, including the project name!