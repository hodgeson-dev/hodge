# Approach 2: Development Watch Mode with Auto-linking

## Implementation Sketch

Create a development mode that watches for changes and automatically maintains the link:

### Package.json additions:
```json
{
  "scripts": {
    "dev:link": "npm run build && npm link && npm run watch",
    "watch": "tsc --watch",
    "test:local": "node scripts/test-local.js"
  }
}
```

### Test harness script:
```javascript
// scripts/test-local.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class LocalTestRunner {
  constructor() {
    this.testDir = path.join(process.cwd(), '.test-workspace');
  }

  async setup() {
    // Create test workspace
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }

    // Initialize test project
    process.chdir(this.testDir);
    if (!fs.existsSync('package.json')) {
      await this.exec('npm init -y');
    }

    // Link hodge
    await this.exec('npm link hodge');
    
    console.log('✅ Test workspace ready at:', this.testDir);
    console.log('🔄 Watching for changes...');
  }

  async exec(cmd) {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, { shell: true, stdio: 'inherit' });
      child.on('close', code => {
        code === 0 ? resolve() : reject(new Error(`Command failed: ${cmd}`));
      });
    });
  }

  async createTestFile() {
    const testFile = `
// Test hodge integration
const hodge = require('hodge');

console.log('Testing hodge locally...');
console.log('Version:', hodge.version);

// Test commands
hodge.init({ silent: true });
hodge.explore('test-feature');
    `;
    
    fs.writeFileSync(path.join(this.testDir, 'test.js'), testFile);
  }
}

// Run
const runner = new LocalTestRunner();
runner.setup()
  .then(() => runner.createTestFile())
  .then(() => console.log('📝 Created test.js - edit to test hodge'))
  .catch(console.error);
```

## Pros
- Automated rebuild on changes
- Dedicated test workspace
- No global pollution (contained)
- Better DX with watch mode
- Can test CLI and programmatic API

## Cons
- More complex setup
- Additional dependencies for watching
- Need to maintain test harness
- Still uses npm link under the hood

## Compatibility with Current Stack
- ✅ Integrates with TypeScript compiler
- ✅ Works with existing build process
- ✅ Can be added without breaking changes
- ✅ Supports hot-reload development