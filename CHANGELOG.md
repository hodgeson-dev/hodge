# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
- Status command now generates HODGE.md automatically
- Session manager now supports basePath parameter for test isolation

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