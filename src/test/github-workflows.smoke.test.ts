import { describe, expect } from 'vitest';
import { readFileSync } from 'fs';
import { smokeTest } from './helpers';
import yaml from 'js-yaml';

describe('HODGE-329: TruffleHog CI configuration', () => {
  smokeTest('should have valid YAML syntax in quality workflow', () => {
    const workflowContent = readFileSync('.github/workflows/quality.yml', 'utf8');

    // Should parse without errors
    expect(() => yaml.load(workflowContent)).not.toThrow();

    const workflow = yaml.load(workflowContent) as any;
    expect(workflow).toBeDefined();
    expect(workflow.jobs).toBeDefined();
  });

  smokeTest('should have TruffleHog step without BASE/HEAD parameters', () => {
    const workflowContent = readFileSync('.github/workflows/quality.yml', 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    // Find the security job
    expect(workflow.jobs.security).toBeDefined();
    const securitySteps = workflow.jobs.security.steps;

    // Find the TruffleHog step
    const truffleHogStep = securitySteps.find((step: any) => step.uses?.includes('trufflehog'));

    expect(truffleHogStep).toBeDefined();
    expect(truffleHogStep.with).toBeDefined();

    // Should NOT have base or head parameters
    expect(truffleHogStep.with.base).toBeUndefined();
    expect(truffleHogStep.with.head).toBeUndefined();
  });

  smokeTest('should have required TruffleHog parameters', () => {
    const workflowContent = readFileSync('.github/workflows/quality.yml', 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    const securitySteps = workflow.jobs.security.steps;
    const truffleHogStep = securitySteps.find((step: any) => step.uses?.includes('trufflehog'));

    // Should have path parameter
    expect(truffleHogStep.with.path).toBe('./');

    // Should use trufflesecurity/trufflehog action
    expect(truffleHogStep.uses).toContain('trufflesecurity/trufflehog');
  });

  smokeTest('should use TruffleHog main version for latest updates', () => {
    const workflowContent = readFileSync('.github/workflows/quality.yml', 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    const securitySteps = workflow.jobs.security.steps;
    const truffleHogStep = securitySteps.find((step: any) => step.uses?.includes('trufflehog'));

    // Should use @main for latest security updates
    expect(truffleHogStep.uses).toBe('trufflesecurity/trufflehog@main');
  });

  smokeTest('should have security job with checkout step', () => {
    const workflowContent = readFileSync('.github/workflows/quality.yml', 'utf8');
    const workflow = yaml.load(workflowContent) as any;

    const securitySteps = workflow.jobs.security.steps;

    // Should have checkout step before TruffleHog
    const checkoutStep = securitySteps.find((step: any) => step.uses?.includes('checkout'));

    expect(checkoutStep).toBeDefined();
    expect(checkoutStep.name).toBe('Checkout code');
  });
});
