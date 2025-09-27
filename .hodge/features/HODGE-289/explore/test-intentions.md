# Test Intentions for HODGE-289

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Core Requirements
- [ ] Should not crash when executed
- [ ] Should complete within reasonable time (<500ms)
- [ ] Should handle invalid input gracefully
- [ ] Should integrate with existing systems

## Config-Specific Requirements
- [ ] Should load configuration from correct sources in priority order
- [ ] Should handle missing config files gracefully
- [ ] Should validate configuration schema on load
- [ ] Should never expose secrets in logs or error messages

## Configuration Priority Tests
- [ ] Environment variables override config file settings
- [ ] Config file settings override built-in defaults
- [ ] Invalid config doesn't crash, falls back to defaults
- [ ] Partial config merges correctly with defaults

## Migration Tests
- [ ] Should migrate existing .hodge/config.json settings
- [ ] Should preserve existing PM tool configuration
- [ ] Should not lose data during migration
- [ ] Should create backup of old config before migration

## Security Tests
- [ ] API keys should only come from environment variables
- [ ] Config files should never contain actual secrets
- [ ] Should warn if secrets detected in hodge.json
- [ ] Should handle ${ENV_VAR} interpolation safely

## Developer Experience
- [ ] hodge init should create sensible default config
- [ ] Config errors should provide helpful messages
- [ ] Should support config validation command
- [ ] Should document all config options clearly

## Backward Compatibility
- [ ] Existing projects should continue working
- [ ] Old environment variables should still work
- [ ] Should provide deprecation warnings appropriately
- [ ] Migration should be optional initially

## Notes
Key test scenarios discovered during exploration:

- Need to handle both `.hodge/config.json` (generated) and `hodge.json` (user)
- Must ensure secrets never end up in version control
- Config loading should be fast (<50ms) to not slow down commands
- Should support both team-wide settings and personal overrides

---
*Generated during exploration phase. Convert to actual tests during build phase.*