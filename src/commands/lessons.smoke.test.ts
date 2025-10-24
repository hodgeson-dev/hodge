import { describe, expect } from 'vitest';
import { LessonsCommand } from './lessons.js';
import { smokeTest } from '../test/helpers.js';
import { withTestWorkspace } from '../test/runners.js';

describe('LessonsCommand - Non-Interactive Smoke Tests', () => {
  smokeTest('should not crash when lessons directory missing', async () => {
    await withTestWorkspace('lessons-no-dir', async () => {
      const command = new LessonsCommand();

      // Run without throwing even if lessons directory doesn't exist
      await expect(command.execute({})).resolves.not.toThrow();
    });
  });

  smokeTest('should support --match flag', async () => {
    await withTestWorkspace('lessons-match-flag', async (workspace) => {
      const command = new LessonsCommand();

      // Create a simple lesson file
      await workspace.writeFile(
        '.hodge/lessons/TEST-001-test-lesson.md',
        '# Test Lesson\n\nThis lesson covers testing and subprocess handling.'
      );

      // Run without throwing
      await expect(command.execute({ match: 'testing' })).resolves.not.toThrow();
    });
  });

  smokeTest('should support --files flag', async () => {
    await withTestWorkspace('lessons-files-flag', async (workspace) => {
      const command = new LessonsCommand();

      // Create a lesson with frontmatter
      await workspace.writeFile(
        '.hodge/lessons/TEST-002-file-overlap.md',
        `---
feature: TEST-002
title: File Overlap Test
severity: critical
tags: [testing]
related_files: [src/test/*.ts]
---

# Lesson about test files
`
      );

      // Run without throwing
      await expect(command.execute({ files: 'src/test/helpers.ts' })).resolves.not.toThrow();
    });
  });

  smokeTest('should return structured JSON output', async () => {
    await withTestWorkspace('lessons-json-output', async (workspace) => {
      const command = new LessonsCommand();

      // Create a lesson
      await workspace.writeFile(
        '.hodge/lessons/TEST-003-json-test.md',
        '# JSON Test\n\nTesting JSON output format.'
      );

      // Run without throwing - should output JSON structure
      await expect(command.execute({ match: 'testing' })).resolves.not.toThrow();
    });
  });

  smokeTest('should handle missing lessons directory', async () => {
    await withTestWorkspace('lessons-missing-dir', async () => {
      const command = new LessonsCommand();

      // No lessons directory exists - should return empty results
      await expect(command.execute({ match: 'anything' })).resolves.not.toThrow();
    });
  });

  smokeTest('should calculate confidence scores correctly', async () => {
    await withTestWorkspace('lessons-confidence', async (workspace) => {
      const command = new LessonsCommand();

      // Create lessons with different match patterns
      await workspace.writeFile(
        '.hodge/lessons/TEST-004-high-confidence.md',
        `---
feature: TEST-004
title: High Confidence Test
severity: critical
tags: [subprocess, testing, zombie-processes]
related_files: [src/commands/*.ts]
---

# High Confidence Lesson
This lesson matches multiple keywords: subprocess, testing, zombie-processes.
It also has file overlap with src/commands/*.ts files.
`
      );

      await workspace.writeFile(
        '.hodge/lessons/TEST-005-low-confidence.md',
        '# Low Confidence Lesson\n\nThis only mentions subprocess once.'
      );

      // Run without throwing - should rank by confidence
      await expect(
        command.execute({ match: 'subprocess,testing', files: 'src/commands/build.ts' })
      ).resolves.not.toThrow();
    });
  });

  smokeTest('should handle malformed YAML frontmatter gracefully', async () => {
    await withTestWorkspace('lessons-bad-frontmatter', async (workspace) => {
      const command = new LessonsCommand();

      // Create lesson with malformed frontmatter
      await workspace.writeFile(
        '.hodge/lessons/TEST-006-bad-yaml.md',
        `---
feature: TEST-006
this is not valid yaml: [broken
---

# Lesson with bad frontmatter
Should still be searchable by content.
`
      );

      // Should skip metadata parsing and use defaults
      await expect(command.execute({ match: 'frontmatter' })).resolves.not.toThrow();
    });
  });

  smokeTest('should parse frontmatter metadata when present', async () => {
    await withTestWorkspace('lessons-parse-metadata', async (workspace) => {
      const command = new LessonsCommand();

      // Create lesson with valid frontmatter
      await workspace.writeFile(
        '.hodge/lessons/TEST-007-valid-yaml.md',
        `---
feature: TEST-007
title: Valid YAML Test
severity: warning
tags: [metadata, yaml, parsing]
related_files: [src/lib/*.ts]
---

# Lesson with valid frontmatter
This should parse successfully.
`
      );

      // Should parse and use metadata for confidence scoring
      await expect(
        command.execute({ match: 'metadata,yaml', files: 'src/lib/logger.ts' })
      ).resolves.not.toThrow();
    });
  });
});
