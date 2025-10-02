import { describe } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLAUDE_COMMANDS_DIR = path.join(__dirname, '../../.claude/commands');

describe('Conversational Exploration Template', () => {
  smokeTest('explore.md contains conversational exploration section', async () => {
    const explorePath = path.join(CLAUDE_COMMANDS_DIR, 'explore.md');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Verify required sections exist
    if (!content.includes('## Conversational Exploration (REQUIRED)')) {
      throw new Error('Missing: Conversational Exploration section');
    }
    if (!content.includes('### Phase 1: Context Loading (REQUIRED)')) {
      throw new Error('Missing: Phase 1 Context Loading');
    }
    if (!content.includes('### Phase 2: Conversational Discovery (REQUIRED)')) {
      throw new Error('Missing: Phase 2 Conversational Discovery');
    }
    if (!content.includes('### Phase 3: Conversation Synthesis & Preview (REQUIRED)')) {
      throw new Error('Missing: Phase 3 Synthesis & Preview');
    }
  });

  smokeTest('explore.md contains required coverage areas', async () => {
    const explorePath = path.join(CLAUDE_COMMANDS_DIR, 'explore.md');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Verify coverage areas
    const requiredAreas = ['What & Why', 'Gotchas & Considerations', 'Test Intentions'];

    for (const area of requiredAreas) {
      if (!content.includes(area)) {
        throw new Error(`Missing required coverage area: ${area}`);
      }
    }
  });

  smokeTest('explore.md contains conversation guidelines', async () => {
    const explorePath = path.join(CLAUDE_COMMANDS_DIR, 'explore.md');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Verify conversation guidelines
    const guidelines = [
      'Natural dialogue style',
      'Provide periodic summaries',
      'Present options',
      'Scale to complexity',
    ];

    for (const guideline of guidelines) {
      if (!content.includes(guideline)) {
        throw new Error(`Missing conversation guideline: ${guideline}`);
      }
    }
  });

  smokeTest('explore.md contains preview format instructions', async () => {
    const explorePath = path.join(CLAUDE_COMMANDS_DIR, 'explore.md');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Verify preview format exists
    if (!content.includes('## Preview: exploration.md Summary')) {
      throw new Error('Missing: Preview format section');
    }
    if (!content.includes('a) ✅ Approve and write to exploration.md')) {
      throw new Error('Missing: Approval options in preview');
    }
  });

  smokeTest('explore.md contains error handling guidance', async () => {
    const explorePath = path.join(CLAUDE_COMMANDS_DIR, 'explore.md');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Verify error handling
    if (!content.includes('Error Handling')) {
      throw new Error('Missing: Error Handling section');
    }
    if (!content.includes('user can provide direction or request restart')) {
      throw new Error('Missing: User control error handling');
    }
  });

  smokeTest('explore.md maintains backward compatibility fallback', async () => {
    const explorePath = path.join(CLAUDE_COMMANDS_DIR, 'explore.md');
    const content = await fs.readFile(explorePath, 'utf-8');

    // Verify fallback to traditional approach exists
    if (!content.includes('### Phase 4: Traditional Approach Generation')) {
      throw new Error('Missing: Traditional approach fallback');
    }
  });
});
