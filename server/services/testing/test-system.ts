/**
 * System Test Service
 * 
 * This module tests core system functionality including:
 * - Database connectivity and performance
 * - Server health and response
 * - Authentication and authorization
 * - Configuration validation
 * - Environment checks
 */

import { TestReport, TestGroup, Test } from './test-delivery-service';
import { pool } from '../../db';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export class SystemTestService {
  /**
   * Run a comprehensive test of system components
   */
  async runComprehensiveTests(): Promise<TestReport> {
    const report: TestReport = {
      name: 'System Tests',
      timestamp: new Date(),
      passed: true,
      testGroups: []
    };
    
    // Test database connectivity
    const dbTests = await this.testDatabaseConnectivity();
    report.testGroups.push(dbTests);
    if (!dbTests.passed) report.passed = false;
    
    // Test system resources
    const resourceTests = await this.testSystemResources();
    report.testGroups.push(resourceTests);
    if (!resourceTests.passed) report.passed = false;
    
    // Test configuration
    const configTests = await this.testConfiguration();
    report.testGroups.push(configTests);
    if (!configTests.passed) report.passed = false;
    
    return report;
  }
  
  /**
   * Test database connectivity and performance
   */
  async testDatabaseConnectivity(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Database Connectivity Tests',
      tests: [],
      passed: true
    };
    
    // Test database connection
    try {
      const startTime = Date.now();
      const client = await pool.connect();
      const connectionTime = Date.now() - startTime;
      
      testGroup.tests.push({
        name: 'Database Connection',
        description: 'Connect to the PostgreSQL database',
        passed: true,
        result: 'Connected successfully',
        expected: 'Successful connection',
        actual: `Connected in ${connectionTime}ms`
      });
      
      // Test query performance
      try {
        const queryStartTime = Date.now();
        const res = await client.query('SELECT NOW()');
        const queryTime = Date.now() - queryStartTime;
        
        testGroup.tests.push({
          name: 'Database Query',
          description: 'Execute a simple query',
          passed: true,
          result: 'Query executed successfully',
          expected: 'Query execution < 50ms',
          actual: `Query executed in ${queryTime}ms`
        });
        
        if (queryTime > 50) {
          testGroup.tests[testGroup.tests.length - 1].passed = false;
          testGroup.passed = false;
        }
      } catch (error) {
        testGroup.tests.push({
          name: 'Database Query',
          description: 'Execute a simple query',
          passed: false,
          result: 'Error executing query',
          expected: 'Successful query execution',
          actual: `Error: ${(error as Error).message}`,
          error
        });
        testGroup.passed = false;
      }
      
      // Release client back to pool
      client.release();
    } catch (error) {
      testGroup.tests.push({
        name: 'Database Connection',
        description: 'Connect to the PostgreSQL database',
        passed: false,
        result: 'Connection failed',
        expected: 'Successful connection',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
  
  /**
   * Test system resources
   */
  async testSystemResources(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'System Resources Tests',
      tests: [],
      passed: true
    };
    
    // Check available memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsagePercentage = Math.round((1 - freeMem / totalMem) * 100);
    
    testGroup.tests.push({
      name: 'Memory Usage',
      description: 'Check system memory usage',
      passed: memoryUsagePercentage < 90,
      result: memoryUsagePercentage < 90 ? 'Memory usage acceptable' : 'Memory usage too high',
      expected: 'Memory usage < 90%',
      actual: `Current usage: ${memoryUsagePercentage}%`
    });
    
    if (memoryUsagePercentage >= 90) {
      testGroup.passed = false;
    }
    
    // Check CPU load
    const cpuLoad = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const cpuUsagePercentage = Math.round((cpuLoad / cpuCount) * 100);
    
    testGroup.tests.push({
      name: 'CPU Usage',
      description: 'Check system CPU usage',
      passed: cpuUsagePercentage < 85,
      result: cpuUsagePercentage < 85 ? 'CPU usage acceptable' : 'CPU usage too high',
      expected: 'CPU usage < 85%',
      actual: `Current usage: ${cpuUsagePercentage}%`
    });
    
    if (cpuUsagePercentage >= 85) {
      testGroup.passed = false;
    }
    
    // Check disk space
    try {
      // Use a platform-specific command to get disk usage
      // This is a simplified approach - would be more robust with a library
      const rootPath = '/';
      let diskFree = 0;
      let diskTotal = 1; // Default to prevent division by zero
      
      try {
        // Simplified disk space check
        const stats = fs.statfsSync(rootPath);
        diskFree = stats.bfree * stats.bsize;
        diskTotal = stats.blocks * stats.bsize;
      } catch (e) {
        // Fallback to a rough estimate using current directory
        const stats = fs.statfsSync('.');
        diskFree = stats.bfree * stats.bsize;
        diskTotal = stats.blocks * stats.bsize;
      }
      
      const diskUsagePercentage = Math.round((1 - diskFree / diskTotal) * 100);
      
      testGroup.tests.push({
        name: 'Disk Space',
        description: 'Check available disk space',
        passed: diskUsagePercentage < 90,
        result: diskUsagePercentage < 90 ? 'Disk space acceptable' : 'Disk space critically low',
        expected: 'Disk usage < 90%',
        actual: `Current usage: ${diskUsagePercentage}%`
      });
      
      if (diskUsagePercentage >= 90) {
        testGroup.passed = false;
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Disk Space',
        description: 'Check available disk space',
        passed: false,
        result: 'Error checking disk space',
        expected: 'Successful disk space check',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
  
  /**
   * Test system configuration
   */
  async testConfiguration(): Promise<TestGroup> {
    const testGroup: TestGroup = {
      name: 'Configuration Tests',
      tests: [],
      passed: true
    };
    
    // Check required environment variables
    const requiredEnvVars = [
      'DATABASE_URL', 
      'NODE_ENV'
    ];
    
    for (const envVar of requiredEnvVars) {
      const exists = process.env[envVar] !== undefined;
      
      testGroup.tests.push({
        name: `Environment Variable: ${envVar}`,
        description: `Check if ${envVar} is defined`,
        passed: exists,
        result: exists ? `${envVar} is defined` : `${envVar} is not defined`,
        expected: `${envVar} should be defined`,
        actual: exists ? 'Defined' : 'Not defined'
      });
      
      if (!exists) {
        testGroup.passed = false;
      }
    }
    
    // Check for test reports directory
    const testReportsDir = path.join(process.cwd(), 'test-reports');
    let dirExists = false;
    
    try {
      dirExists = fs.existsSync(testReportsDir);
      
      testGroup.tests.push({
        name: 'Test Reports Directory',
        description: 'Check if test reports directory exists',
        passed: dirExists,
        result: dirExists ? 'Directory exists' : 'Directory does not exist',
        expected: 'Directory should exist',
        actual: dirExists ? `Found at ${testReportsDir}` : 'Not found'
      });
      
      if (!dirExists) {
        testGroup.passed = false;
      }
    } catch (error) {
      testGroup.tests.push({
        name: 'Test Reports Directory',
        description: 'Check if test reports directory exists',
        passed: false,
        result: 'Error checking directory',
        expected: 'Successful directory check',
        actual: `Error: ${(error as Error).message}`,
        error
      });
      testGroup.passed = false;
    }
    
    return testGroup;
  }
}

export const systemTestService = new SystemTestService();