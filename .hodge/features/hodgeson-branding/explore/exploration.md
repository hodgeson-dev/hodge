# Hodgeson Branding Exploration

## Project Structure
- **Project Name**: Hodgeson
- **CLI Tool**: hodge
- **Archive Format**: .podge files
- **Tagline**: "Freedom to explore, discipline to build, confidence to ship"

## Naming Approaches

### Approach 1: Unified "Hodgeson" Branding
- **NPM**: `hodgeson`
- **GitHub**: `hodgeson/hodgeson`
- **Domain**: `hodgeson.dev`
- **Pros**: Strong unified brand, professional appearance
- **Cons**: Potential naming conflicts, longer package name

### Approach 2: Scoped NPM with Short GitHub
- **NPM**: `@hodgeson/cli`
- **GitHub**: `hodgeson/hodge`
- **Domain**: `hodge.dev` + `hodgeson.com`
- **Pros**: NPM organization structure, ecosystem-ready
- **Cons**: More complex install, brand split

### Approach 3: Hybrid Practical Naming
- **NPM**: `hodge-cli`
- **GitHub**: `hodgeson/hodge-cli`
- **Domain**: `hodgeson.com`
- **Pros**: Likely available, SEO-friendly, clear purpose
- **Cons**: Less elegant, "cli" suffix redundant

## Logo Concepts

### Top 3 Recommendations:

1. **The Compass Rose** - Modern geometric compass with three colored points representing explore/build/ship modes. Professional and memorable.

2. **The Triple Arrow** - Three interconnected arrows showing forward momentum and continuous improvement cycle. Works great in terminals.

3. **The Constellation** - Connected dots forming abstract pattern, representing workflow connections. Flexible and modern.

### Color Palette:
- Explore: Cyan (#06B6D4)
- Build: Blue (#3B82F6)
- Ship: Green (#10B981)

## Recommendation

Based on exploration, **Approach 3 (Hybrid Practical)** with **Compass Rose logo** seems best because:

1. **Practical Naming**:
   - `hodge-cli` is likely available on NPM
   - Clear what the package does
   - Good for SEO and discoverability
   - `hodgeson.com` for main website

2. **Brand Clarity**:
   - Hodgeson = The project/framework
   - hodge = The CLI command
   - .podge = The portable archive files

3. **Visual Identity**:
   - Compass rose perfectly captures exploration theme
   - Three points map to three modes
   - Professional and scalable design
   - Works in color and monochrome

## Implementation Plan

### Immediate Actions:
1. Register `hodgeson` organization on GitHub
2. Check/register `hodge-cli` on NPM
3. Secure `hodgeson.com` domain
4. Create logo variations (color, mono, ASCII)

### Package Structure:
```
NPM Packages:
- hodge-cli (main CLI tool)
- hodge-patterns (pattern library)
- hodge-podge (podge file utilities)

GitHub Repos:
- hodgeson/hodge-cli
- hodgeson/patterns
- hodgeson/docs
- hodgeson/podge-spec
```

### File Naming:
- `.hodge/` - Local project directory
- `.podge` - Portable Hodgeson archive files
- `hodgeson.config.js` - Configuration file
- `HODGESON.md` - Project documentation

## Next Steps

Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build hodgeson-branding`
d) Save progress and switch context → `/save`
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):