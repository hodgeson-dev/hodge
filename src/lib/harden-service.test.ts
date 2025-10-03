import { describe, it, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { HardenService } from './harden-service.js';

describe('HardenService - HODGE-321 Service Extraction', () => {
  smokeTest('should instantiate without errors', () => {
    const service = new HardenService();
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(HardenService);
  });

  smokeTest('should have runValidations method', () => {
    const service = new HardenService();
    expect(service.runValidations).toBeDefined();
    expect(typeof service.runValidations).toBe('function');
  });

  smokeTest('should have checkQualityGates method', () => {
    const service = new HardenService();
    expect(service.checkQualityGates).toBeDefined();
    expect(typeof service.checkQualityGates).toBe('function');
  });

  smokeTest('should have generateReportData method', () => {
    const service = new HardenService();
    expect(service.generateReportData).toBeDefined();
    expect(typeof service.generateReportData).toBe('function');
  });

  smokeTest('should check quality gates correctly', () => {
    const service = new HardenService();

    const allPassed = {
      tests: { passed: true, output: 'all good' },
      lint: { passed: true, output: 'all good' },
      typecheck: { passed: true, output: 'all good' },
      build: { passed: true, output: 'all good' },
    };

    const results = service.checkQualityGates(allPassed);

    expect(results.allPassed).toBe(true);
    expect(results.gates).toEqual(['tests', 'lint', 'typecheck', 'build']);
    expect(results.results).toEqual(allPassed);
  });

  smokeTest('should detect failures in quality gates', () => {
    const service = new HardenService();

    const someFailed = {
      tests: { passed: true, output: 'all good' },
      lint: { passed: false, output: 'errors found' },
      typecheck: { passed: true, output: 'all good' },
      build: { passed: true, output: 'all good' },
    };

    const results = service.checkQualityGates(someFailed);

    expect(results.allPassed).toBe(false);
    expect(results.gates).toEqual(['tests', 'lint', 'typecheck', 'build']);
  });

  smokeTest('should generate report data correctly', () => {
    const service = new HardenService();

    const validationResults = {
      tests: { passed: true, output: 'all tests passed' },
      lint: { passed: true, output: 'no lint errors' },
      typecheck: { passed: true, output: 'no type errors' },
      build: { passed: true, output: 'build succeeded' },
    };

    const reportData = service.generateReportData('test-feature', validationResults, {
      skipTests: false,
    });

    expect(reportData.feature).toBe('test-feature');
    expect(reportData.allPassed).toBe(true);
    expect(reportData.results).toEqual(validationResults);
    expect(reportData.skipTests).toBe(false);
    expect(reportData.timestamp).toBeDefined();
    expect(new Date(reportData.timestamp)).toBeInstanceOf(Date);
  });

  smokeTest('should handle skipTests option in report data', () => {
    const service = new HardenService();

    const validationResults = {
      tests: { passed: true, output: 'tests skipped' },
      lint: { passed: true, output: 'no lint errors' },
      typecheck: { passed: true, output: 'no type errors' },
      build: { passed: true, output: 'build succeeded' },
    };

    const reportData = service.generateReportData('test-feature', validationResults, {
      skipTests: true,
    });

    expect(reportData.skipTests).toBe(true);
  });
});
