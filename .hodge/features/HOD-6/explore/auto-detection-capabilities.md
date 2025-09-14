# Auto-Detection Capabilities for hodge init

## What Can Be Auto-Detected

### 1. Project Name (Yes, we can detect this!)
```typescript
// Detection priority order:
1. package.json -> name field
2. pyproject.toml -> project.name field  
3. Cargo.toml -> package.name field
4. .git/config -> remote origin URL -> extract repo name
5. Directory name (fallback)

// Example:
detectProjectName(): string {
  // Node.js project
  if (exists('package.json')) {
    return JSON.parse(readFile('package.json')).name;
  }
  
  // Python project
  if (exists('pyproject.toml')) {
    return parseToml('pyproject.toml').project?.name;
  }
  
  // Git repository
  const gitRemote = execSync('git config --get remote.origin.url');
  if (gitRemote) {
    // Extract from: https://github.com/user/my-project.git
    return extractRepoName(gitRemote);
  }
  
  // Fallback to directory
  return path.basename(process.cwd());
}
```

### 2. Project Type & Language
```typescript
detectProjectType(): ProjectType {
  // Check for language-specific files
  if (exists('package.json')) return 'node';
  if (exists('requirements.txt') || exists('pyproject.toml')) return 'python';
  if (exists('Cargo.toml')) return 'rust';
  if (exists('go.mod')) return 'go';
  if (exists('pom.xml')) return 'java';
  if (exists('Gemfile')) return 'ruby';
  
  // Check by file extensions
  const files = glob('**/*.{ts,js,py,rs,go,java,rb}');
  return inferFromExtensions(files);
}
```

### 3. PM Tool Configuration
```typescript
detectPMTool(): PMTool | null {
  // Check environment variables
  if (process.env.LINEAR_API_KEY) return 'linear';
  if (process.env.GITHUB_TOKEN) return 'github';
  if (process.env.JIRA_API_TOKEN) return 'jira';
  
  // Check git remote
  const remote = execSync('git config --get remote.origin.url');
  if (remote?.includes('github.com')) return 'github';
  if (remote?.includes('gitlab.com')) return 'gitlab';
  
  // Check for config files
  if (exists('.github/')) return 'github';
  if (exists('.gitlab-ci.yml')) return 'gitlab';
  
  return null;
}
```

### 4. Testing Framework
```typescript
detectTestRunner(): string | null {
  // Node.js
  const pkg = readPackageJson();
  if (pkg?.scripts?.test) {
    if (pkg.scripts.test.includes('jest')) return 'jest';
    if (pkg.scripts.test.includes('vitest')) return 'vitest';
    if (pkg.scripts.test.includes('mocha')) return 'mocha';
  }
  
  // Python
  if (exists('pytest.ini') || exists('tox.ini')) return 'pytest';
  if (exists('setup.cfg') && readFile('setup.cfg').includes('unittest')) return 'unittest';
  
  return null;
}
```

### 5. Code Style & Linting
```typescript
detectCodeStyle(): CodeStyle {
  // JavaScript/TypeScript
  if (exists('.eslintrc')) return { linter: 'eslint', config: '.eslintrc' };
  if (exists('.prettierrc')) return { formatter: 'prettier', config: '.prettierrc' };
  
  // Python
  if (exists('.flake8')) return { linter: 'flake8', config: '.flake8' };
  if (exists('pyproject.toml') && hasSection('[tool.black]')) return { formatter: 'black' };
  
  // Rust
  if (exists('rustfmt.toml')) return { formatter: 'rustfmt', config: 'rustfmt.toml' };
  
  return {};
}
```

### 6. Build Tools & Package Managers
```typescript
detectPackageManager(): string {
  // Node.js
  if (exists('pnpm-lock.yaml')) return 'pnpm';
  if (exists('yarn.lock')) return 'yarn';
  if (exists('package-lock.json')) return 'npm';
  if (exists('bun.lockb')) return 'bun';
  
  // Python
  if (exists('Pipfile')) return 'pipenv';
  if (exists('poetry.lock')) return 'poetry';
  if (exists('requirements.txt')) return 'pip';
  
  return 'unknown';
}
```

### 7. Git Configuration
```typescript
detectGitConfig(): GitInfo {
  return {
    isRepo: exists('.git'),
    branch: execSync('git branch --show-current'),
    remote: execSync('git config --get remote.origin.url'),
    hasCommits: execSync('git rev-list --count HEAD') > 0,
    gitignore: exists('.gitignore')
  };
}
```

### 8. IDE/Editor Configuration
```typescript
detectIDEConfig(): IDEInfo {
  return {
    vscode: exists('.vscode/'),
    idea: exists('.idea/'),
    editorconfig: exists('.editorconfig'),
    devcontainer: exists('.devcontainer/'),
    codespaces: exists('.devcontainer/devcontainer.json')
  };
}
```

### 9. CI/CD Pipeline
```typescript
detectCIPipeline(): CIInfo {
  return {
    githubActions: exists('.github/workflows/'),
    gitlab: exists('.gitlab-ci.yml'),
    circleci: exists('.circleci/'),
    jenkins: exists('Jenkinsfile'),
    travis: exists('.travis.yml')
  };
}
```

### 10. Framework Detection
```typescript
detectFrameworks(): Framework[] {
  const frameworks = [];
  const pkg = readPackageJson();
  
  // Frontend frameworks
  if (pkg?.dependencies?.react) frameworks.push('react');
  if (pkg?.dependencies?.vue) frameworks.push('vue');
  if (pkg?.dependencies?.['@angular/core']) frameworks.push('angular');
  if (pkg?.dependencies?.next) frameworks.push('nextjs');
  
  // Backend frameworks
  if (pkg?.dependencies?.express) frameworks.push('express');
  if (pkg?.dependencies?.fastify) frameworks.push('fastify');
  if (pkg?.dependencies?.['@nestjs/core']) frameworks.push('nestjs');
  
  // Python frameworks
  if (exists('manage.py')) frameworks.push('django');
  if (hasPackage('flask')) frameworks.push('flask');
  if (hasPackage('fastapi')) frameworks.push('fastapi');
  
  return frameworks;
}
```

## Revised One-Question Approach

Given all this detection capability, we could actually make it:

### Scenario A: Empty Directory
```bash
$ hodge init
? Project name: (my-project) █
```

### Scenario B: Existing Project (All Detected)
```bash
$ hodge init

Detected project configuration:
  ✓ Name: my-awesome-app (from package.json)
  ✓ Type: Node.js with TypeScript
  ✓ PM: Linear (from environment)
  ✓ Test: Vitest
  ✓ Style: ESLint + Prettier

? Initialize Hodge with detected settings? (Y/n) █
```

### Scenario C: Partial Detection
```bash
$ hodge init

Detected:
  ✓ Name: my-app (from package.json)
  ✓ Type: Node.js
  ✗ PM tool not found

? Initialize Hodge? (Y/n) █
```

## The Real "One Question"

The one question becomes:
- **New project**: "Project name?"
- **Existing project**: "Initialize with detected settings?"

This is even better than asking for name when we can detect it!