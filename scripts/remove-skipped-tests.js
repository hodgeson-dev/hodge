#!/usr/bin/env node

/**
 * Script to remove all skipped tests from the codebase
 * Part of the progressive testing strategy implementation
 */

const fs = require('fs');
const path = require('path');

const testFiles = [
  'src/commands/explore.new-style.test.ts',
  'src/commands/init.test.ts',
  'src/commands/harden-optimized.test.ts',
  'src/commands/build-optimized.test.ts',
];

let totalRemoved = 0;

function removeSkippedTests(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const result = [];
  let inSkippedTest = false;
  let skipDepth = 0;
  let removedCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect start of skipped test
    if (line.includes('it.skip(') || line.includes('it.skip(')) {
      inSkippedTest = true;
      skipDepth = 1;
      removedCount++;

      // Count opening braces to track depth
      for (const char of line) {
        if (char === '{') skipDepth++;
        if (char === '}') skipDepth--;
      }

      // Remove empty line before if exists
      if (result.length > 0 && result[result.length - 1].trim() === '') {
        result.pop();
      }
      continue;
    }

    // Track depth while in skipped test
    if (inSkippedTest) {
      for (const char of line) {
        if (char === '{') skipDepth++;
        if (char === '}') skipDepth--;
      }

      // Check if we've closed the test
      if (skipDepth === 0) {
        inSkippedTest = false;

        // Skip the next line if it's empty (cleanup spacing)
        if (i + 1 < lines.length && lines[i + 1].trim() === '') {
          i++;
        }
      }
      continue;
    }

    // Keep non-skipped lines
    result.push(line);
  }

  // Clean up multiple empty lines
  const cleaned = [];
  let prevEmpty = false;
  for (const line of result) {
    if (line.trim() === '') {
      if (!prevEmpty) {
        cleaned.push(line);
        prevEmpty = true;
      }
    } else {
      cleaned.push(line);
      prevEmpty = false;
    }
  }

  // Don't end file with multiple empty lines
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].trim() === '') {
    cleaned.pop();
  }
  cleaned.push(''); // Single empty line at end

  fs.writeFileSync(filePath, cleaned.join('\n'));

  return removedCount;
}

console.log('🧹 Removing skipped tests...\n');

for (const file of testFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const count = removeSkippedTests(fullPath);
    if (count > 0) {
      console.log(`✓ Removed ${count} skipped test(s) from ${file}`);
      totalRemoved += count;
    }
  }
}

console.log(`\n✅ Total skipped tests removed: ${totalRemoved}`);
console.log('📝 Remember to update TEST-STRATEGY.md with anti-patterns!');
