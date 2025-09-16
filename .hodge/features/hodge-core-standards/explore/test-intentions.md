# Test Intentions for Hodge Core Standards

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Core standards should load from Hodge installation directory
- [ ] Project standards should override core standards when specified
- [ ] Standards cascade should follow correct precedence order
- [ ] Phase-aware standards should apply correctly per mode

## Configuration Testing
- [ ] Should load .hodgerc.default.json from Hodge core
- [ ] Should load .hodgerc.json from project root
- [ ] Should merge configurations with correct precedence
- [ ] Should handle missing configuration files gracefully
- [ ] Should validate configuration schema
- [ ] Should support extending presets (@hodge/recommended, etc.)

## Standards Resolution
- [ ] Core standards should be accessible via API
- [ ] Effective standards should merge core + project correctly
- [ ] Standards should be queryable by key/path
- [ ] Phase-specific standards should resolve correctly
- [ ] Override mechanism should work for all standard types

## Progressive Standards Application
- [ ] Explore phase should use relaxed standards
- [ ] Build phase should use moderate standards
- [ ] Harden phase should use strict standards
- [ ] Ship phase should enforce all standards
- [ ] Standards should be retrievable for current phase

## CLI Integration
- [ ] `hodge standards --list` should show all effective standards
- [ ] `hodge standards --core` should show only core standards
- [ ] `hodge standards --explain <key>` should provide details
- [ ] `hodge standards --diff` should show project differences
- [ ] `hodge init` should create initial standards configuration

## Preset System
- [ ] Should load @hodge/recommended by default
- [ ] Should support @hodge/strict preset
- [ ] Should support @hodge/rapid preset
- [ ] Should allow custom presets from npm packages
- [ ] Presets should be composable

## Migration Support
- [ ] Should detect existing project standards format
- [ ] Should offer migration to new format
- [ ] Should preserve custom standards during migration
- [ ] Should create backup before migration
- [ ] Should validate migrated configuration

## Edge Cases
- [ ] Should handle circular preset dependencies
- [ ] Should handle invalid configuration gracefully
- [ ] Should handle missing core standards files
- [ ] Should handle version mismatches
- [ ] Should handle conflicting overrides

## Performance Criteria
- [ ] Standards loading should complete < 50ms
- [ ] Configuration resolution should be cached
- [ ] Standards queries should be instant (< 5ms)
- [ ] Should not impact command startup time significantly

## User Experience
- [ ] Should provide clear error messages for invalid config
- [ ] Should suggest fixes for common configuration issues
- [ ] Should document available standards clearly
- [ ] Should make overriding intuitive
- [ ] Should provide examples in generated config

## Integration Tests
- [ ] Should work with existing explore/build/harden/ship commands
- [ ] Should integrate with linting configuration
- [ ] Should integrate with test runner configuration
- [ ] Should work with PM integration
- [ ] Should work with pattern learning system

## Notes
Additional test scenarios discovered during exploration:
- Configuration cascade similar to ESLint makes testing straightforward
- Preset system will need careful testing for conflicts
- Phase-aware standards are critical to test thoroughly
- Migration path needs comprehensive testing to avoid data loss
- Core principles should be immutable but their application can be configured

---
*Generated during exploration phase. Convert to actual tests during build phase.*