// src/adapters/claude.js
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import Anthropic from '@anthropic-ai/sdk';
import { ContextBuilder } from '../core/context-builder.js';
import { StandardsEngine } from '../core/standards-engine.js';
import { PatternLearner } from '../core/pattern-learner.js';

export class ClaudeAdapter {
  constructor(config = {}) {
    this.config = {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229',
      maxTokens: 4000,
      ...config,
    };

    // Check for Claude Code CLI vs API
    this.mode = this.detectMode();

    if (this.mode === 'api') {
      this.client = new Anthropic({
        apiKey: this.config.apiKey,
      });
    }

    this.contextBuilder = new ContextBuilder();
    this.standardsEngine = new StandardsEngine();
    this.patternLearner = new PatternLearner();
  }

  detectMode() {
    // Check for Claude Code CLI
    try {
      const { execSync } = require('child_process');
      execSync('which claude', { stdio: 'ignore' });
      return 'cli';
    } catch {
      // Check for API key
      if (this.config.apiKey) {
        return 'api';
      }
      return 'manual';
    }
  }

  async startSession(context, options) {
    const spinner = ora('Preparing Claude session...').start();

    try {
      // Build the full prompt with context
      const prompt = await this.buildPrompt(context, options);

      // Save prompt for reference
      const promptFile = await this.savePrompt(prompt, options);
      spinner.succeed('Context prepared');

      // Start appropriate session type
      switch (this.mode) {
        case 'cli':
          return await this.startCLISession(promptFile, options);
        case 'api':
          return await this.startAPISession(prompt, options);
        default:
          return await this.startManualSession(promptFile, options);
      }
    } catch (error) {
      spinner.fail('Failed to start Claude session');
      throw error;
    }
  }

  async buildPrompt(context, options) {
    let prompt = `# Hodge Development Session

Mode: ${options.mode}
Feature/Topic: ${options.feature || options.topic}
Temperature: ${options.temperature}

`;

    // Add mode-specific instructions
    if (options.mode === 'explore') {
      prompt += this.getExploreInstructions(context);
    } else if (options.mode === 'ship') {
      prompt += this.getShipInstructions(context);
    }

    // Add tech stack context
    if (context.techStack?.length > 0) {
      prompt += `\n## Tech Stack\n`;
      prompt += context.techStack.map((tech) => `- ${tech}`).join('\n');
      prompt += '\n';
    }

    // Add standards (enforcement varies by mode)
    if (context.standards?.length > 0) {
      const enforcement = options.mode === 'ship' ? 'MUST FOLLOW' : 'SUGGESTED';
      prompt += `\n## Standards (${enforcement})\n\n`;

      for (const standard of context.standards) {
        prompt += `### ${standard.name}\n`;
        if (standard.rules) {
          for (const rule of standard.rules) {
            prompt += `- ${rule}\n`;
          }
        }
        prompt += '\n';
      }
    }

    // Add patterns
    if (context.patterns?.length > 0) {
      const requirement = options.mode === 'ship' ? 'MUST USE' : 'AVAILABLE';
      prompt += `\n## Patterns (${requirement})\n\n`;

      for (const pattern of context.patterns) {
        prompt += `### ${pattern.name}\n`;
        prompt += `Type: ${pattern.type}\n`;
        if (pattern.file) {
          prompt += `Example: ${pattern.file}\n`;
        }
        prompt += '\n';
      }
    }

    // Add decisions
    if (context.decisions?.length > 0) {
      prompt += `\n## Project Decisions\n\n`;
      prompt += `These decisions have been made and should ${options.mode === 'ship' ? 'MUST' : 'SHOULD'} be followed:\n\n`;

      for (const decision of context.decisions) {
        prompt += `- ${decision}\n`;
      }
      prompt += '\n';
    }

    // Add task if specified
    if (options.task) {
      prompt += `\n## Task\n\n${options.task}\n`;
    }

    // Add pattern to follow if specified
    if (options.likePattern) {
      prompt += `\n## Follow Pattern\n\nUse the same pattern as: ${options.likePattern}\n`;
    }

    // Add test requirements for ship mode
    if (options.mode === 'ship' && !options.skipTests) {
      prompt += `\n## Testing Requirements\n\n`;
      prompt += `- Write comprehensive tests for all functionality\n`;
      prompt += `- Include unit tests and integration tests\n`;
      prompt += `- Test error cases and edge cases\n`;
      prompt += `- Follow existing test patterns\n`;
      prompt += `- Aim for >80% coverage\n`;
    }

    return prompt;
  }

  getExploreInstructions(context) {
    return `## Exploration Mode Instructions

You are in EXPLORATION mode. Your approach should be:

1. **Creative and Open**: Suggest multiple approaches and alternatives
2. **Standards as Guidelines**: Follow standards where they make sense, but feel free to experiment
3. **Pattern Awareness**: Use existing patterns as starting points, but can diverge
4. **Learning Focus**: Point out trade-offs, considerations, and what we're learning
5. **Prototype Quality**: Code can be quick and experimental, not production-ready

Key behaviors:
- Suggest 2-3 different approaches when relevant
- Explain pros and cons of each approach
- Use the tech stack as a foundation but can suggest additions
- Point out what we're learning from this exploration
- Flag interesting discoveries or insights
- Keep code simple and focused on proving concepts

Remember: We're exploring to learn, not building for production yet.
`;
  }

  getShipInstructions(context) {
    return `## Ship Mode Instructions

You are in SHIP mode. Your code MUST be production-ready:

1. **Standards Enforcement**: STRICTLY follow all coding standards
2. **Pattern Compliance**: MUST use established patterns exactly
3. **Decision Adherence**: MUST respect all project decisions
4. **Quality Requirements**: 
   - Comprehensive error handling
   - Input validation
   - Proper TypeScript types
   - Performance optimization
   - Security best practices
5. **Testing**: Include tests for all functionality

Key requirements:
- NO deviations from established standards
- USE existing patterns without modification
- INCLUDE error handling for all edge cases
- WRITE clean, maintainable, documented code
- ADD logging and monitoring where appropriate
- ENSURE accessibility and responsive design
- VALIDATE all inputs and outputs
- OPTIMIZE for performance

Remember: This code is going to production. Quality is non-negotiable.
`;
  }

  async startCLISession(promptFile, options) {
    console.log(chalk.blue('\n🐱 Starting Claude Code session...\n'));

    const args = ['--system-prompt-file', promptFile, '--model', this.config.model];

    // Add temperature
    args.push('--temperature', options.temperature.toString());

    // Add mode-specific flags
    if (options.mode === 'ship') {
      args.push('--strict-mode');
      if (!options.skipTests) {
        args.push('--require-tests');
      }
    }

    // Add files if specified
    if (options.files?.length > 0) {
      args.push('--files', ...options.files);
    }

    // Launch Claude Code
    const claude = spawn('claude', args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        HODGE_MODE: options.mode,
        HODGE_SESSION: 'true',
      },
    });

    return new Promise((resolve, reject) => {
      claude.on('exit', (code) => {
        if (code === 0) {
          console.log(chalk.green('\n✓ Claude session completed'));

          // Save any patterns if in ship mode
          if (options.mode === 'ship') {
            this.checkForNewPatterns();
          }

          resolve();
        } else {
          reject(new Error(`Claude exited with code ${code}`));
        }
      });
    });
  }

  async startAPISession(prompt, options) {
    console.log(chalk.blue('\n🐱 Starting Claude API session...\n'));

    if (options.interactive !== false) {
      // Interactive conversation mode
      return await this.interactiveAPISession(prompt, options);
    } else {
      // Single response mode
      return await this.singleAPIResponse(prompt, options);
    }
  }

  async interactiveAPISession(initialPrompt, options) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let messages = [{ role: 'user', content: initialPrompt }];

    console.log(chalk.gray('Interactive session started. Type "exit" to end.\n'));

    while (true) {
      // Get Claude's response
      const response = await this.callAPI(messages, options);
      console.log(chalk.cyan('\nClaude:'), response);

      // Get user input
      const userInput = await new Promise((resolve) => {
        rl.question(chalk.green('\nYou: '), resolve);
      });

      if (userInput.toLowerCase() === 'exit') {
        break;
      }

      messages.push({ role: 'assistant', content: response });
      messages.push({ role: 'user', content: userInput });
    }

    rl.close();
    console.log(chalk.green('\n✓ Session ended'));
  }

  async singleAPIResponse(prompt, options) {
    const response = await this.callAPI([{ role: 'user', content: prompt }], options);

    console.log(response);

    // Save response if needed
    if (options.output) {
      await fs.writeFile(options.output, response);
      console.log(chalk.green(`\n✓ Response saved to ${options.output}`));
    }

    return response;
  }

  async callAPI(messages, options) {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        messages: messages,
        max_tokens: this.config.maxTokens,
        temperature: options.temperature || 0.5,
      });

      return response.content[0].text;
    } catch (error) {
      console.error(chalk.red('API Error:'), error.message);
      throw error;
    }
  }

  async startManualSession(promptFile, options) {
    console.log(chalk.yellow('\n📋 Manual Mode\n'));
    console.log(chalk.gray('Claude is not available via CLI or API.\n'));
    console.log(chalk.gray('1. Copy the context from:'), chalk.blue(promptFile));
    console.log(chalk.gray('2. Paste into claude.ai or your preferred interface'));
    console.log(chalk.gray('3. Work with Claude using the provided context\n'));

    // Try to copy to clipboard
    try {
      const content = await fs.readFile(promptFile, 'utf8');
      const { execSync } = require('child_process');

      if (process.platform === 'darwin') {
        execSync('pbcopy', { input: content });
        console.log(chalk.green('✓ Context copied to clipboard'));
      } else if (process.platform === 'linux') {
        execSync('xclip -selection clipboard', { input: content });
        console.log(chalk.green('✓ Context copied to clipboard'));
      } else if (process.platform === 'win32') {
        execSync('clip', { input: content });
        console.log(chalk.green('✓ Context copied to clipboard'));
      }
    } catch (error) {
      console.log(chalk.gray('Could not copy to clipboard automatically'));
      console.log(chalk.gray('Please copy manually from the file above'));
    }
  }

  async savePrompt(prompt, options) {
    const timestamp = Date.now();
    const filename = `${options.mode}-${options.feature || options.topic}-${timestamp}.md`;
    const filepath = path.join('.hodge', 'explore', filename);

    await fs.ensureDir(path.dirname(filepath));
    await fs.writeFile(filepath, prompt);

    return filepath;
  }

  async exploreApproaches(topic, context, numApproaches = 3) {
    console.log(chalk.blue(`\n🔍 Exploring ${numApproaches} approaches for: ${topic}\n`));

    const prompt = `Please explore ${numApproaches} different approaches for: ${topic}

For each approach, provide:
1. A brief description (2-3 sentences)
2. Key implementation details
3. Pros (2-3 points)
4. Cons (2-3 points)
5. When to use this approach
6. A simple code example or structure

Context:
- Tech Stack: ${context.techStack?.join(', ') || 'Not specified'}
- Existing Patterns: ${context.patterns?.length || 0} patterns available
- Constraints: Consider existing decisions

Format each approach clearly with headers.`;

    if (this.mode === 'api') {
      const response = await this.callAPI([{ role: 'user', content: prompt }], {
        temperature: 0.7,
      });

      console.log(response);
      return this.parseApproaches(response);
    } else if (this.mode === 'cli') {
      // Save prompt and launch Claude
      const promptFile = await this.savePrompt(prompt, {
        mode: 'explore',
        topic: `${topic}-approaches`,
      });

      await this.startCLISession(promptFile, {
        mode: 'explore',
        temperature: 0.7,
      });
    } else {
      // Manual mode
      console.log(chalk.yellow('Please ask Claude to explore approaches with this prompt:\n'));
      console.log(prompt);
    }
  }

  parseApproaches(response) {
    // Parse structured response into approach objects
    const approaches = [];
    const sections = response.split(/Approach \d+/i);

    for (let i = 1; i < sections.length && i <= 3; i++) {
      approaches.push({
        number: i,
        content: sections[i].trim(),
      });
    }

    return approaches;
  }

  async generateTests(context, options = {}) {
    console.log(chalk.green('\n🧪 Generating tests...\n'));

    const prompt = `Generate comprehensive tests for the current implementation.

Requirements:
1. Follow the existing test patterns in the project
2. Include unit tests for all functions/components
3. Include integration tests for API routes
4. Test error cases and edge cases
5. Use the project's test framework and utilities
6. Aim for >80% coverage
7. Follow the naming convention for test files

${
  context.patterns?.length > 0
    ? 'Use these test patterns:\n' +
      context.patterns
        .filter((p) => p.type === 'test')
        .map((p) => `- ${p.name}`)
        .join('\n')
    : ''
}

Generate production-ready tests that follow all project standards.`;

    if (this.mode === 'api') {
      const response = await this.callAPI([{ role: 'user', content: prompt }], {
        temperature: 0.3,
      });

      return response;
    } else {
      const promptFile = await this.savePrompt(prompt, {
        mode: 'ship',
        feature: 'tests',
      });

      console.log(chalk.gray('Generate tests using this context:'));
      console.log(chalk.blue(promptFile));
    }
  }

  async validateCode(code, standards) {
    console.log(chalk.cyan('\n🔍 Validating code against standards...\n'));

    const prompt = `Review this code for compliance with project standards:

\`\`\`
${code}
\`\`\`

Standards to check:
${standards.map((s) => `- ${s.name}: ${s.rules.join(', ')}`).join('\n')}

Identify any violations and suggest fixes.`;

    if (this.mode === 'api') {
      const response = await this.callAPI([{ role: 'user', content: prompt }], {
        temperature: 0.2,
      });

      return this.parseValidation(response);
    } else {
      console.log(chalk.gray('Please validate using this prompt:'));
      console.log(prompt);
    }
  }

  parseValidation(response) {
    const validation = {
      valid: !response.toLowerCase().includes('violation'),
      violations: [],
      suggestions: [],
    };

    // Extract violations and suggestions from response
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.includes('Violation:') || line.includes('Error:')) {
        validation.violations.push(line);
      }
      if (line.includes('Suggestion:') || line.includes('Fix:')) {
        validation.suggestions.push(line);
      }
    }

    return validation;
  }

  async checkForNewPatterns() {
    // Check if any new patterns emerged from the session
    const recentFiles = await this.getRecentlyModifiedFiles();

    if (recentFiles.length > 0) {
      console.log(chalk.gray('\nChecking for new patterns...'));

      const patterns = await this.patternLearner.extract({
        from: recentFiles,
        minOccurrences: 2,
      });

      if (patterns.length > 0) {
        console.log(chalk.green(`Found ${patterns.length} potential patterns`));
        console.log(chalk.gray('Run "hodge learn" to save them'));
      }
    }
  }

  async getRecentlyModifiedFiles() {
    const { execSync } = require('child_process');
    try {
      // Get files modified in the last hour
      const files = execSync(
        'find . -type f -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -mmin -60'
      )
        .toString()
        .split('\n')
        .filter((f) => f && !f.includes('node_modules') && !f.includes('.hodge'));

      return files;
    } catch {
      return [];
    }
  }

  // Helper method for ship mode with pattern
  async shipWithPattern(feature, patternName, context) {
    console.log(chalk.blue(`\n🚀 Shipping ${feature} using ${patternName} pattern\n`));

    // Load the specific pattern
    const patterns = await this.patternLearner.loadAll();
    const pattern = patterns.find((p) => p.name === patternName || p.file?.includes(patternName));

    if (!pattern) {
      console.log(chalk.yellow(`Pattern "${patternName}" not found`));
      return;
    }

    const prompt = `
Create ${feature} following this exact pattern:

\`\`\`
${pattern.content}
\`\`\`

Requirements:
1. Use the EXACT same structure and style
2. Follow all the patterns conventions
3. Adapt only the business logic for ${feature}
4. Include the same error handling approach
5. Include similar tests
6. Maintain the same quality level

This is SHIP mode - the code must be production-ready and follow all standards.`;

    return await this.startSession(context, {
      mode: 'ship',
      feature,
      task: prompt,
      temperature: 0.3,
    });
  }

  // Helper for reviewing code
  async reviewCode(code, context) {
    console.log(chalk.cyan('\n🔍 Reviewing code...\n'));

    const prompt = `Review this code for production readiness:

\`\`\`
${code}
\`\`\`

Check for:
1. Standards compliance
2. Security vulnerabilities  
3. Performance issues
4. Error handling completeness
5. Test coverage
6. Accessibility
7. Type safety
8. Documentation

Provide specific, actionable feedback.`;

    if (this.mode === 'api') {
      const response = await this.callAPI([{ role: 'user', content: prompt }], {
        temperature: 0.3,
      });

      return response;
    } else {
      console.log(chalk.gray('Review using this prompt:'));
      console.log(prompt);
    }
  }
}

// Export factory function
export function createClaudeAdapter(config) {
  return new ClaudeAdapter(config);
}

// Export class for extension
export default ClaudeAdapter;
