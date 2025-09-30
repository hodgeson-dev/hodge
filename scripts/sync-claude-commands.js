#!/usr/bin/env node

/**
 * Synchronize .claude/commands/*.md files to src/lib/claude-commands.ts
 * This ensures that manual updates to slash commands are included in the build
 */

const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = path.join(__dirname, '..', '.claude', 'commands');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'lib', 'claude-commands.ts');

function escapeForTypeScript(content) {
  // Escape backticks and dollar signs for template literals
  return content
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/`/g, '\\`') // Escape backticks
    .replace(/\${/g, '\\${'); // Escape template literal syntax
}

function generateTypeScript(commands) {
  const header = `/**
 * Claude Code slash command definitions for Hodge
 *
 * AUTO-GENERATED from .claude/commands/*.md
 * Do not edit directly - edit the source files and run: npm run sync:commands
 */

export interface ClaudeCommand {
  name: string;
  content: string;
}

export function getClaudeCommands(): ClaudeCommand[] {
  return [`;

  const footer = `  ];
}`;

  const commandEntries = commands
    .map((cmd) => {
      const escaped = escapeForTypeScript(cmd.content);
      return `    {
      name: '${cmd.name}',
      content: \`${escaped}\`
    }`;
    })
    .join(',\n');

  return `${header}
${commandEntries}
${footer}
`;
}

async function syncCommands() {
  console.log('🔄 Syncing Claude slash commands...');

  try {
    // Check if commands directory exists
    if (!fs.existsSync(COMMANDS_DIR)) {
      console.error('❌ Commands directory not found:', COMMANDS_DIR);
      process.exit(1);
    }

    // Read all .md files from commands directory
    const files = fs
      .readdirSync(COMMANDS_DIR)
      .filter((file) => file.endsWith('.md'))
      .sort(); // Sort for consistent output

    if (files.length === 0) {
      console.error('❌ No .md files found in', COMMANDS_DIR);
      process.exit(1);
    }

    console.log(`📖 Found ${files.length} command files`);

    // Read content of each file
    const commands = files.map((file) => {
      const name = path.basename(file, '.md');
      const filePath = path.join(COMMANDS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');

      console.log(`  ✓ ${name}`);

      return { name, content };
    });

    // Generate TypeScript code
    const tsCode = generateTypeScript(commands);

    // Write to output file
    fs.writeFileSync(OUTPUT_FILE, tsCode, 'utf8');

    // Format the generated file with Prettier
    try {
      const { execSync } = require('child_process');
      execSync(`npx prettier --write ${OUTPUT_FILE}`, { stdio: 'pipe' });
      console.log('✨ Formatted generated file with Prettier');
    } catch (prettierError) {
      console.warn('⚠️  Warning: Could not format with Prettier:', prettierError.message);
      console.warn('   Generated file may not pass prettier checks');
    }

    console.log(`✅ Successfully synced ${commands.length} commands to ${OUTPUT_FILE}`);
    console.log('📝 Remember to commit the updated claude-commands.ts file');
  } catch (error) {
    console.error('❌ Error syncing commands:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncCommands();
}

module.exports = { syncCommands };
