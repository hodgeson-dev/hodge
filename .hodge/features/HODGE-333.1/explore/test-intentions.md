# Test Intentions: HODGE-333.1

## Frontmatter Parsing and Validation
- ✓ Can parse YAML frontmatter from markdown files using gray-matter
- ✓ Validates required frontmatter fields (frontmatter_version, scope, type, version)
- ✓ Validates frontmatter_version is "1.0.0" (matches epic schema decision)
- ✓ Handles missing frontmatter gracefully with clear error message
- ✓ Handles malformed YAML frontmatter with clear error message
- ✓ Handles empty frontmatter with clear error message

## Section Enforcement Detection
- ✓ Extracts section headings from markdown using remark AST
- ✓ Reads section-level enforcement markers (**Enforcement: MANDATORY**)
- ✓ Reads section-level severity markers (**Severity: BLOCKER**)
- ✓ Correctly maps enforcement levels (MANDATORY, SUGGESTED, GUIDANCE)
- ✓ Correctly maps severity levels (BLOCKER, WARNING, SUGGESTION)
- ✓ Handles missing enforcement markers with sensible defaults
- ✓ Handles malformed enforcement markers with clear error messages
- ✓ Extracts section content (markdown body after heading and markers)

## YAML to Markdown Migration
- ✓ Converts default.yml to general-coding-standards.md format
- ✓ Maintains semantic equivalence for 6 universal criteria (SRP, DRY, Coupling, Complexity, Naming, Error Handling)
- ✓ Correctly maps YAML severities to markdown enforcement/severity pairs
- ✓ Preserves custom_instructions as markdown section content
- ✓ Removes redundant lesson/pattern criteria (handled by ContextAggregator)
- ✓ Profile frontmatter contains all required fields
- ✓ Profile sections contain proper enforcement markers

## Backward Compatibility
- ✓ /review file command continues working after migration
- ✓ ReviewProfileLoader loads markdown profiles successfully
- ✓ Review command output maintains same format (blockers/warnings/suggestions)
- ✓ Review report frontmatter maintains same structure
- ✓ Review findings maintain same format (Location, Description, Rationale, Suggested Action)
- ✓ Profile name updates from "Default Code Quality" to "General Coding Standards"
- ✓ No errors when running existing review workflow end-to-end

---

*4 behavioral categories covering frontmatter parsing/validation, section enforcement detection, YAML-to-markdown migration, and backward compatibility*
