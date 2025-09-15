# Approach 2: Scoped NPM with Short GitHub

## Naming Strategy
Use NPM scoping for organization while keeping GitHub and domains short.

## Implementation

### NPM Package
- **Name**: `@hodgeson/cli`
- **CLI Command**: `hodge`
- **Usage**:
  ```bash
  npm install -g @hodgeson/cli
  hodge init
  ```
- **Future packages**:
  - `@hodgeson/patterns` - Pattern library
  - `@hodgeson/standards` - Standards collection
  - `@hodgeson/ai-adapter` - AI integrations

### GitHub Repository
- **Name**: `hodgeson/hodge`
- **URL**: `github.com/hodgeson/hodge`
- **Organization**: "hodgeson" org with multiple repos:
  - `hodgeson/hodge` - Main CLI tool
  - `hodgeson/patterns` - Community patterns
  - `hodgeson/docs` - Documentation
  - `hodgeson/podge-spec` - .podge file specification

### Web Domain
- **Primary**: `hodge.dev`
- **Project site**: `hodgeson.com`
- **Documentation**: `docs.hodge.dev`
- **Pattern library**: `patterns.hodge.dev`

### File Extensions
- **`.podge`**: Portable archives (Portable hODGEson)
- **`.hodge`**: Local project directory
- **`hodgeson.json`**: Configuration file

## Pros
- ✅ NPM scope prevents naming conflicts
- ✅ Allows ecosystem expansion under @hodgeson scope
- ✅ Shorter domain (hodge.dev) is catchier
- ✅ Clear separation of concerns
- ✅ Professional NPM organization appearance

## Cons
- ❌ Slightly more complex NPM install command
- ❌ Brand split between hodgeson/hodge
- ❌ Requires NPM organization setup

## Brand Architecture
```
@hodgeson (NPM Organization)
    ├── @hodgeson/cli → hodge command
    ├── @hodgeson/patterns
    └── @hodgeson/standards

hodgeson (GitHub Organization)
    ├── hodge (main repo)
    ├── patterns
    └── docs
```