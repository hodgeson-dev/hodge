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

    const allPassedResults = [
      { type: 'testing' as const, tool: 'vitest', exitCode: 0, errorCount: 0, stdout: 'all good' },
      { type: 'linting' as const, tool: 'eslint', exitCode: 0, errorCount: 0, stdout: 'all good' },
      {
        type: 'type_checking' as const,
        tool: 'tsc',
        exitCode: 0,
        errorCount: 0,
        stdout: 'all good',
      },
      {
        type: 'formatting' as const,
        tool: 'prettier',
        exitCode: 0,
        errorCount: 0,
        stdout: 'all good',
      },
    ];

    const gateCheck = service.checkQualityGates(allPassedResults);

    expect(gateCheck.allPassed).toBe(true);
    expect(gateCheck.results).toEqual(allPassedResults);
  });

  smokeTest('should detect failures in quality gates', () => {
    const service = new HardenService();

    const someFailedResults = [
      { type: 'testing' as const, tool: 'vitest', exitCode: 0, errorCount: 0, stdout: 'all good' },
      {
        type: 'linting' as const,
        tool: 'eslint',
        exitCode: 1,
        errorCount: 5,
        stdout: 'errors found',
      },
      {
        type: 'type_checking' as const,
        tool: 'tsc',
        exitCode: 0,
        errorCount: 0,
        stdout: 'all good',
      },
      {
        type: 'formatting' as const,
        tool: 'prettier',
        exitCode: 0,
        errorCount: 0,
        stdout: 'all good',
      },
    ];

    const gateCheck = service.checkQualityGates(someFailedResults);

    expect(gateCheck.allPassed).toBe(false);
    expect(gateCheck.results).toEqual(someFailedResults);
  });

  smokeTest('should generate report data correctly', () => {
    const service = new HardenService();

    const validationResults = [
      {
        type: 'testing' as const,
        tool: 'vitest',
        exitCode: 0,
        errorCount: 0,
        stdout: 'all tests passed',
      },
      {
        type: 'linting' as const,
        tool: 'eslint',
        exitCode: 0,
        errorCount: 0,
        stdout: 'no lint errors',
      },
      {
        type: 'type_checking' as const,
        tool: 'tsc',
        exitCode: 0,
        errorCount: 0,
        stdout: 'no type errors',
      },
      {
        type: 'formatting' as const,
        tool: 'prettier',
        exitCode: 0,
        errorCount: 0,
        stdout: 'formatting ok',
      },
    ];

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

    const validationResults = [
      { type: 'testing' as const, tool: 'vitest', skipped: true, reason: 'tests skipped' },
      {
        type: 'linting' as const,
        tool: 'eslint',
        exitCode: 0,
        errorCount: 0,
        stdout: 'no lint errors',
      },
      {
        type: 'type_checking' as const,
        tool: 'tsc',
        exitCode: 0,
        errorCount: 0,
        stdout: 'no type errors',
      },
      {
        type: 'formatting' as const,
        tool: 'prettier',
        exitCode: 0,
        errorCount: 0,
        stdout: 'formatting ok',
      },
    ];

    const reportData = service.generateReportData('test-feature', validationResults, {
      skipTests: true,
    });

    expect(reportData.skipTests).toBe(true);
  });
});
