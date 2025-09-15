# Decision: Hodgeson Branding Strategy

## Decision Summary
After exploring three naming approaches and five logo concepts, the recommendation is to adopt the **Hybrid Practical Naming** strategy with the **Compass Rose** logo design.

## Selected Approach

### Naming Convention
- **Project Name**: Hodgeson
- **NPM Package**: `hodge-cli`
- **CLI Command**: `hodge`
- **GitHub Organization**: `hodgeson`
- **Main Repository**: `hodgeson/hodge-cli`
- **Primary Domain**: `hodgeson.com`
- **Archive Extension**: `.podge` (Portable hODGEson files)

### Visual Identity
- **Logo**: Compass Rose with three colored points
- **Colors**:
  - Explore: Cyan (#06B6D4)
  - Build: Blue (#3B82F6)
  - Ship: Green (#10B981)
- **Typography**: Modern sans-serif (Inter or Space Grotesk)
- **Tagline**: "Freedom to explore, discipline to build, confidence to ship"

## Rationale

### Why Hybrid Practical Naming?
1. **Availability**: `hodge-cli` more likely available than `hodgeson` on NPM
2. **Discoverability**: Clear package purpose, good for SEO
3. **Flexibility**: Room for ecosystem growth (hodge-patterns, hodge-podge, etc.)
4. **Brand Clarity**: Hodgeson as project, hodge as tool, .podge as format

### Why Compass Rose Logo?
1. **Symbolism**: Perfect match for "exploration" concept
2. **Structure**: Three points map directly to explore/build/ship modes
3. **Versatility**: Works in color, monochrome, and ASCII
4. **Professional**: Clean, modern, memorable design
5. **Scalable**: From favicon to billboard

## Implementation Actions

### Immediate (Phase 1)
- [ ] Register `hodgeson` organization on GitHub
- [ ] Create `hodgeson/hodge-cli` repository
- [ ] Check availability of `hodge-cli` on NPM
- [ ] Register `hodgeson.com` domain

### Short-term (Phase 2)
- [ ] Design logo variations (SVG, PNG, ASCII)
- [ ] Update package.json with new name
- [ ] Create brand guidelines document
- [ ] Update README with new branding

### Long-term (Phase 3)
- [ ] Migrate existing hodge code to hodgeson/hodge-cli
- [ ] Set up hodgeson.com website
- [ ] Create .podge file specification
- [ ] Develop brand ecosystem packages

## Package Ecosystem Structure

```
hodgeson/                    # GitHub Organization
├── hodge-cli/              # Main CLI tool
├── patterns/               # Community patterns
├── podge-spec/            # .podge file specification
├── website/               # hodgeson.com source
└── docs/                  # Documentation

NPM Packages:
├── hodge-cli              # Main CLI → installs 'hodge' command
├── hodge-patterns         # Pattern library
├── hodge-podge           # .podge file utilities
└── hodge-ai              # AI adapter integrations
```

## File Structure Changes

### Current → New
- `.hodge/` → `.hodge/` (unchanged - local directory)
- `CLAUDE.md` → `HODGESON.md` (project configuration)
- N/A → `.podge` files (new portable format)

## Migration Path

1. **Soft Launch**: Create new structure without breaking existing
2. **Dual Support**: Support both old and new names temporarily
3. **Communication**: Clear migration guide for users
4. **Deprecation**: Phase out old naming after transition period

## Success Metrics

- NPM weekly downloads > 1000 within 6 months
- GitHub stars > 500 within 1 year
- Community patterns > 50 .podge files
- Clear brand recognition in AI development community

## Decision Commitment

This decision establishes Hodgeson as a professional, scalable brand for AI-assisted development workflows. The combination of practical naming and strong visual identity positions the project for growth while maintaining clarity and accessibility.

**Decision Date**: 2025-01-15
**Decision Maker**: Project Team
**Status**: APPROVED for implementation

---

*Use `/build hodgeson-branding` to begin implementing this branding strategy*