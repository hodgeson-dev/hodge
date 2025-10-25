import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('[smoke] explore.md template - "what" vs "how" framework (HODGE-348)', () => {
  it('should contain "what" vs "how" decision framework section', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('#### "What" vs "How" Decision Framework');
    expect(exploreTemplate).toContain("**Explore in /explore** (affects what's possible):");
    expect(exploreTemplate).toContain('**Defer to /decide** (implementation details):');
  });

  it('should include concrete examples of "what" decisions for /explore', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    // Examples that should be explored
    expect(exploreTemplate).toContain('REST vs GraphQL');
    expect(exploreTemplate).toContain('Architecture choices that affect capabilities');
    expect(exploreTemplate).toContain('Technology decisions that constrain or enable features');
    expect(exploreTemplate).toContain('High-level approach options');
  });

  it('should include concrete examples of "how" decisions to defer to /decide', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    // Examples that should be deferred
    expect(exploreTemplate).toContain('Specific library/framework choices');
    expect(exploreTemplate).toContain('which GraphQL library');
    expect(exploreTemplate).toContain('Code organization patterns');
    expect(exploreTemplate).toContain('Validation strategies');
    expect(exploreTemplate).toContain('Authentication/authorization mechanisms');
  });

  it('should include checkmark/x-mark examples with clear rationale', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    // Positive examples (explore)
    expect(exploreTemplate).toContain('✅ Explore: "Should we use REST or GraphQL?"');
    expect(exploreTemplate).toContain('(affects API capabilities)');

    // Negative examples (defer to /decide)
    expect(exploreTemplate).toContain('❌ Explore: "Which GraphQL library should we use?"');
    expect(exploreTemplate).toContain('→ Defer to /decide');
  });

  it('should include FOCUS statement about "what" vs "how"', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('**FOCUS**: This phase focuses on the **"what"**');
    expect(exploreTemplate).toContain('Save the **"how"** (implementation details) for `/decide`');
  });
});

describe('[smoke] explore.md template - conversation pacing (HODGE-348)', () => {
  it('should include soft turn count hint in conversation guidelines', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('**Conversation pacing**:');
    expect(exploreTemplate).toContain('Aim for 5-7 exchanges');
    expect(exploreTemplate).toContain('conclude earlier if understanding is complete');
  });

  it('should mention stopping before "how" details', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('**Stop before "how" details**:');
    expect(exploreTemplate).toContain('implementation specifics');
    expect(exploreTemplate).toContain("note they're for `/decide` phase");
  });
});

describe('[smoke] explore.md template - complexity signals (HODGE-348)', () => {
  it('should include complexity signals section', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('#### Complexity Signals (When to Recommend /plan):');
    expect(exploreTemplate).toContain('Watch for these signals');
  });

  it('should list specific complexity signals', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('**Multiple components**:');
    expect(exploreTemplate).toContain('**Long conversations**:');
    expect(exploreTemplate).toContain('**User cues**:');
    expect(exploreTemplate).toContain('**Integration complexity**:');
    expect(exploreTemplate).toContain('**Unclear dependencies**:');
  });

  it('should include recommendation threshold', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('When you notice 2+ complexity signals');
    expect(exploreTemplate).toContain('explicitly recommend');
  });

  it('should include /plan recommendation template', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('Consider using `/plan {{feature}}`');
    expect(exploreTemplate).toContain('sub-issues that can be explored and built independently');
  });
});

describe('[smoke] explore.md template - test intention depth (HODGE-348)', () => {
  it('should include test intention depth guidance', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    expect(exploreTemplate).toContain('**Test Intention Depth**:');
  });

  it('should differentiate parent vs sub-feature test intentions', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    // Parent features
    expect(exploreTemplate).toContain('**Parent features**');
    expect(exploreTemplate).toContain('High-level behavioral expectations only');

    // Sub-features
    expect(exploreTemplate).toContain('**Sub-features**');
    expect(exploreTemplate).toContain('More specific test intentions including edge cases');
  });

  it('should include examples of different test intention depths', () => {
    const exploreTemplate = readFileSync(
      join(__dirname, '../../.claude/commands/explore.md'),
      'utf-8'
    );

    // Parent feature example
    expect(exploreTemplate).toContain('HODGE-348');
    expect(exploreTemplate).toContain('exploration completes within context limits');

    // Sub-feature example
    expect(exploreTemplate).toContain('HODGE-348.1');
    expect(exploreTemplate).toContain('handles invalid input gracefully');
  });
});
