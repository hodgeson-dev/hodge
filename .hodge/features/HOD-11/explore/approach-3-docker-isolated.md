# Approach 3: Docker-based Isolated Testing

## Implementation Sketch

Use Docker containers for completely isolated testing environments:

### Dockerfile.dev:
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src
COPY bin ./bin

# Build
RUN npm run build

# Create test workspace
WORKDIR /test-workspace
RUN npm init -y

# Link hodge from /app
RUN cd /app && npm link && cd /test-workspace && npm link hodge

# Set up test environment
COPY scripts/docker-test.js ./test.js

CMD ["node", "test.js"]
```

### docker-compose.yml:
```yaml
version: '3.8'
services:
  hodge-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
      - ./bin:/app/bin
      - ./test-workspace:/test-workspace
    environment:
      - NODE_ENV=development
    command: npm run watch
    
  test-runner:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./test-results:/test-results
    depends_on:
      - hodge-dev
```

### Scripts for testing:
```json
{
  "scripts": {
    "test:docker": "docker-compose up --build",
    "test:docker:clean": "docker-compose down -v",
    "test:docker:shell": "docker-compose run hodge-dev sh"
  }
}
```

### Test runner script:
```javascript
// scripts/docker-test.js
const hodge = require('hodge');
const fs = require('fs');

async function runTests() {
  console.log('🐳 Docker Test Environment');
  console.log('========================');
  
  // Test initialization
  console.log('Testing hodge init...');
  await hodge.init({ 
    name: 'test-project',
    pm: 'linear' 
  });
  
  // Test explore mode
  console.log('Testing explore mode...');
  await hodge.explore('docker-test-feature');
  
  // Test build mode
  console.log('Testing build mode...');
  await hodge.build('docker-test-feature');
  
  // Verify files created
  const files = [
    '.hodge/standards.md',
    '.hodge/decisions.md',
    '.hodge/features/docker-test-feature/context.md'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} created`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
  
  console.log('\n✨ Tests complete!');
}

runTests().catch(console.error);
```

## Pros
- Complete isolation from host system
- Reproducible environment
- Can test multiple Node versions
- No global npm pollution
- Easy cleanup (docker-compose down)
- Can simulate production environment

## Cons
- Requires Docker installation
- Slower iteration (container rebuild)
- More complex setup
- Overkill for simple testing
- Platform differences (Windows Docker)

## Compatibility with Current Stack
- ✅ Full isolation ensures compatibility
- ✅ Can test different environments
- ⚠️  Adds Docker as dependency
- ⚠️  May be too heavy for quick iterations