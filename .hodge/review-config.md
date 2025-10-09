---
version: "1.0.0"
created_by: hodge init
last_updated: "2025-10-09T03:30:00.000Z"
auto_detected: false
manually_curated: true
---

# Review Configuration

This file specifies which review profiles to use for this project.
Manually curated to match actual project versions.

## Active Profiles

### Languages

- `languages/javascript-es2020+.md` - JavaScript ES2020+
- `languages/typescript-5.x.md` - TypeScript 5.x

### Testing

- `testing/vitest-1.x.md` - Vitest 1.x (closest match for 3.x until vitest-3.x.md is created)

## Auto-Detection Results

Originally detected during `hodge init`, then manually refined:

- **TypeScript 5.x**: Project uses typescript@^5.3.3
- **JavaScript ES2020+**: Modern JavaScript features in use
- **Vitest 1.x**: Project uses vitest@^3.2.4 (no 3.x profile exists yet, using 1.x as best available match)

## Manual Customization

You can add or remove profiles by editing the Active Profiles section above.
Changes are preserved when running `hodge init --update` (future feature).

To add a profile manually:
1. Find the profile in the Hodge profiles library
2. Add it to the appropriate category above
3. The review command will automatically include it
