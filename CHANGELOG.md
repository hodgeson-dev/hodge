# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Professional OSS organization and rebranding (HODGE-352)
  - Rebranded from `@agile-explorations/hodge` to `@hodgeson/hodge`
  - Added CODE_OF_CONDUCT.md and SECURITY.md for OSS best practices
  - Created comprehensive documentation structure (`docs/getting-started.md`, `docs/basic-usage.md`, `docs/advanced/`)
  - Added examples/ directory structure for future sample projects
  - Created scripts/README.md documenting all build, CI/CD, and PM scripts
  - Professional README.md with badges (build status, npm version, license)
  - Domain: www.hodgeson.dev (developer-focused, future-proof)
- Auto-save context when switching features (HODGE-052)
  - Automatically saves context.json when switching between features
  - Non-blocking implementation with error resilience
  - User notification on successful saves
  - Integration with explore, build, harden, and ship commands
  - Behavioral test coverage following "test behavior, not implementation" principle
- Cross-tool compatibility feature with HODGE.md generation
  - Automatic context file generation for any AI assistant
  - Integration with `hodge status` command
  - Tool detection for future enhancements (Claude, Cursor, Copilot)
  - Comprehensive test coverage (93.72%)
  - Full documentation with JSDoc comments

### Changed
- Package name changed from `@agile-explorations/hodge` to `@hodgeson/hodge` (HODGE-352)
- Repository moved from `github.com/agile-explorations/hodge` to `github.com/hodgeson-dev/hodge` (HODGE-352)
- Homepage set to www.hodgeson.dev (HODGE-352)
- Status command now generates HODGE.md automatically
- Session manager now supports basePath parameter for test isolation

### Removed
- Deleted outdated directories: `podge/`, `tests/` (empty), `docs/` (old content) (HODGE-352)
- Removed obsolete files: `file`, `IMPLEMENTATION_PLAN.md` (HODGE-352)

### Fixed
- Session manager test isolation to prevent test interference

## [0.1.0-alpha.1] - 2025-01-16

### Added
- Initial Hodge implementation with TypeScript
- Core commands: init, explore, decide, build, harden, ship, status
- Standards validation system
- Pattern learning capabilities
- PM tool integration (Linear adapter)
- Template-based project initialization
- Hodge core standards templates

### Changed
- N/A

### Fixed
- N/A