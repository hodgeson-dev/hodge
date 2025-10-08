#!/usr/bin/env node

/**
 * Synchronize review-profiles/ to .hodge/review-profiles/
 * This ensures the Hodge project's own .hodge directory has the latest profiles
 * during development.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, '..', 'review-profiles');
const DEST_DIR = path.join(__dirname, '..', '.hodge', 'review-profiles');

async function syncProfiles() {
  console.log('🔄 Syncing review profiles...');

  try {
    // Check if source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
      console.error('❌ Source directory not found:', SOURCE_DIR);
      process.exit(1);
    }

    // Ensure destination directory exists
    await fs.ensureDir(DEST_DIR);

    // Count files before sync
    const countFiles = (dir) => {
      let count = 0;
      const walk = (d) => {
        const files = fs.readdirSync(d);
        files.forEach((file) => {
          const filePath = path.join(d, file);
          if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
          } else if (file.endsWith('.md')) {
            count++;
          }
        });
      };
      walk(dir);
      return count;
    };

    const fileCount = countFiles(SOURCE_DIR);
    console.log(`📖 Found ${fileCount} profile files`);

    // Copy entire directory structure
    await fs.copy(SOURCE_DIR, DEST_DIR, {
      overwrite: true,
    });

    console.log(`✅ Successfully synced ${fileCount} profiles to ${DEST_DIR}`);
    console.log('📝 Directory structure preserved');
  } catch (error) {
    console.error('❌ Error syncing profiles:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncProfiles();
}

export { syncProfiles };
