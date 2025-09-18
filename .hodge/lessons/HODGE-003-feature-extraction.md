# Lessons Learned: HODGE-003 Feature Extraction

## Feature: AI-Driven Feature Extraction from Decisions

### The Problem
We needed to extract coherent features from project decisions, preserving the AI's analysis of why certain decisions belong together.

### Initial Approach (Wrong)
Tried to implement pattern matching in code (`FeatureExtractor` class) to identify features from decision text.

**Why it failed**: Feature extraction is intellectual work that requires understanding context and relationships - this is AI's strength, not pattern matching.

### Final Solution
1. **AI analyzes decisions** and identifies coherent features
2. **AI generates YAML spec** with full context
3. **Backend creates feature** from specification

### Key Learnings

#### 1. Context Loss Problem
**Discovery**: Initial `--pre-populate` approach only passed decision text, losing:
- Why these decisions form a coherent unit
- Scope boundaries (in/out)
- Dependencies identified by AI
- Effort estimates
- Specific exploration questions

**Solution**: Rich YAML specifications that preserve all AI analysis.

#### 2. CLI Argument Limitations
**Discovery**: Complex structured data doesn't fit in CLI arguments.

**Solution**: File-based transfer through `.hodge/tmp/feature-extraction/`
```bash
# Instead of complex escaping:
hodge explore "feature" --decisions "..." --scope "..." --deps "..."

# Clean file reference:
hodge explore "feature" --from-spec .hodge/tmp/feature-extraction/spec.yaml
```

#### 3. Template Coupling
**Discovery**: decide.md was documenting hodge's internal behavior.

**Bad Pattern**:
```markdown
This will:
- Create directory X
- Update file Y
- Generate file Z
```

**Good Pattern**:
```markdown
The feature is now created and ready for exploration.
```

#### 4. Spec Files as Documentation
**Discovery**: We initially planned to auto-delete spec files after processing.

**Insight**: These files are valuable historical artifacts that document:
- Why features were created
- AI's reasoning and analysis
- Complete context for debugging
- Audit trail of decisions

**Decision**: Preserve spec files, provide cleanup utilities for old files.

### Code Examples

#### The FeatureSpecLoader Pattern
```typescript
// Clean separation: Loader validates and converts
class FeatureSpecLoader {
  async loadSpec(filePath: string): Promise<FeatureSpec> {
    const content = await fs.readFile(filePath, 'utf-8');
    const spec = yaml.load(content) as FeatureSpec;
    this.validateSpec(spec);
    return spec;
  }

  // Convert to format needed by existing code
  toPopulatorMetadata(spec: FeatureSpec) {
    return {
      description: spec.feature.description,
      scope: spec.feature.scope,
      dependencies: spec.feature.dependencies,
      rationale: spec.feature.rationale,
      explorationAreas: spec.feature.exploration_areas,
    };
  }
}
```

#### The Enhanced FeaturePopulator
```typescript
// Now accepts rich metadata
async populateFromDecisions(
  featureName: string,
  decisions: string[] = [],
  metadata?: {  // Optional rich context
    description?: string;
    scope?: { included?: string[]; excluded?: string[] };
    dependencies?: string[];
    effort?: string;
    rationale?: string;
    explorationAreas?: Array<{
      area: string;
      questions: string[];
    }>;
  }
): Promise<void>
```

### Impact

This architectural pattern enables:
1. **Full context preservation** from AI analysis to implementation
2. **Clean separation** between AI work and backend work
3. **Debugging capability** through preserved spec files
4. **Loose coupling** between templates and implementation

### Related Decisions
- "Feature extraction specs are preserved as audit trail"
- "Slash command templates abstract backend implementation"
- "Complex data transfer uses file-based approach"

---
_Documented: 2025-01-18_