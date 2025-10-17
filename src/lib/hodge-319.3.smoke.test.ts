import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

describe('[smoke] HODGE-319.3: Smart Decision Extraction Template', () => {
  const buildTemplatePath = path.join(process.cwd(), '.claude', 'commands', 'build.md');

  it('should have Decision Extraction section before PM check', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    const decisionSectionIndex = content.indexOf('## Decision Extraction (Before Build)');
    const pmCheckIndex = content.indexOf('## PM Issue Check (Before Build)');

    expect(decisionSectionIndex).toBeGreaterThan(0);
    expect(pmCheckIndex).toBeGreaterThan(decisionSectionIndex);
  });

  it('should include Step 1: Check for decisions.md', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('### Step 1: Check for decisions.md');
    expect(content).toContain('cat .hodge/features/{{feature}}/decisions.md');
  });

  it('should include Step 2: Check for wrong-location decisions.md', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('### Step 2: Check for wrong-location decisions.md');
    expect(content).toContain('cat .hodge/features/{{feature}}/explore/decisions.md');
    expect(content).toContain('Would you like me to move it for you?');
  });

  it('should include Step 3: Extract from exploration.md', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('### Step 3: Extract from exploration.md');
    expect(content).toContain('cat .hodge/features/{{feature}}/explore/exploration.md');
    expect(content).toContain('## Recommendation');
    expect(content).toContain('## Decisions Needed');
  });

  it('should include Step 4: Handle Extraction Results', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('### Step 4: Handle Extraction Results');
  });

  it('should handle Case A: Single Recommendation with 3 options (HODGE-346.3 format)', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    // Updated in HODGE-326: Case A now handles empty decisions (silent proceed)
    // Case B handles non-empty decisions (show prompt with 3 options)
    expect(content).toContain('**Case A: Recommendation Found + Decisions Needed is EMPTY**');
    expect(content).toContain('**Case B: Recommendation Found + Decisions Needed HAS items**');
    // HODGE-346.3: Changed to a) ⭐ format
    expect(content).toMatch(/a\) ⭐ Use this recommendation and proceed with \/build/);
    expect(content).toMatch(/b\) Go to \/decide to formalize decisions first/);
    expect(content).toMatch(/c\) Skip and build without guidance/);
  });

  it('should handle Case B: Multiple Recommendations with pick-one flow', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('**Case B: Multiple Recommendations Found**');
    expect(content).toContain('Which recommendation would you like to use?');
    expect(content).toContain('a) Use recommendation 1');
    expect(content).toContain('Proceed with /build using this guidance?');
  });

  it('should handle Case C: No Recommendation Found (HODGE-346.3 format)', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('**Case C: No Recommendation Found**');
    expect(content).toContain('No decisions.md found and exploration.md has no recommendation');
    // HODGE-346.3: Changed format - now uses bulleted slash commands, not choice menu
    expect(content).toMatch(/• `\/decide`/);
  });

  it('should handle Case D: exploration.md Missing', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('**Case D: exploration.md Missing**');
    expect(content).toContain('Fall back to current behavior');
  });

  it('should display recommendations verbatim (not summarized)', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('[Full verbatim text of Recommendation section]');
    expect(content).toContain('[Full verbatim text of selected Recommendation]');
  });

  it('should extract Decisions Needed section', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    // Updated in HODGE-326: conditional logic splits cases
    expect(content).toContain('Unresolved decisions still need attention:');
    expect(content).toContain('[Decision 1 title]');
    expect(content).toContain('[Decision 2 title]');
  });

  it('should preserve existing PM check functionality', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('## PM Issue Check (Before Build)');
    expect(content).toContain('cat .hodge/id-mappings.json');
    expect(content).toContain('grep "externalID"');
  });

  it('should preserve existing build command execution', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    expect(content).toContain('## Command Execution');
    expect(content).toContain('hodge build {{feature}}');
    expect(content).toContain('hodge build {{feature}} --skip-checks');
  });

  it('should have clear user prompts with visual separators', async () => {
    const content = await fs.readFile(buildTemplatePath, 'utf-8');
    const separatorCount = (content.match(/━━━━━━━━/g) || []).length;
    expect(separatorCount).toBeGreaterThanOrEqual(4); // At least 4 visual separators
  });
});
