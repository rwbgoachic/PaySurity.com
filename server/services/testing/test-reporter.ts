/**
 * Test Reporter Service
 * 
 * This module provides reporting capabilities for test results,
 * with formatting for various output formats including console, HTML,
 * and JSON.
 */

import { TestReport, TestGroup, Test } from './test-delivery-service';
import * as fs from 'fs';
import * as path from 'path';

export class TestReporter {
  /**
   * Generate a formatted console report
   */
  generateConsoleReport(report: TestReport): string {
    let output = `=== ${report.name} ===\n`;
    output += `Time: ${report.timestamp.toISOString()}\n`;
    output += `Overall Status: ${report.passed ? 'PASSED' : 'FAILED'}\n\n`;
    
    for (const group of report.testGroups) {
      output += this.formatTestGroup(group);
    }
    
    return output;
  }
  
  /**
   * Generate an HTML report
   */
  generateHtmlReport(report: TestReport): string {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.name}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 1200px; margin: 0 auto; }
          .report-header { margin-bottom: 20px; }
          .report-header h1 { margin-bottom: 5px; }
          .report-summary { font-size: 1.1em; margin-bottom: 10px; }
          .passed { color: #2ecc71; }
          .failed { color: #e74c3c; }
          .test-group { background: #f9f9f9; border-radius: 4px; padding: 15px; margin-bottom: 15px; }
          .test-group-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .test-group-title { font-size: 1.2em; font-weight: bold; }
          .test-list { border-top: 1px solid #eee; padding-top: 10px; }
          .test-item { padding: 8px 0; border-bottom: 1px solid #eee; }
          .test-name { font-weight: bold; }
          .test-details { margin-top: 5px; }
          .test-error { background: #ffecec; border-radius: 3px; padding: 10px; margin-top: 8px; white-space: pre-wrap; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="report-header">
            <h1>${report.name}</h1>
            <div class="report-summary">
              Time: ${report.timestamp.toLocaleString()}
            </div>
            <div class="report-summary ${report.passed ? 'passed' : 'failed'}">
              Overall Status: ${report.passed ? 'PASSED' : 'FAILED'}
            </div>
          </div>
    `;
    
    for (const group of report.testGroups) {
      html += this.formatTestGroupHtml(group);
    }
    
    html += `
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Save the report to disk
   */
  saveReport(report: TestReport, format: 'console' | 'html' | 'json', filePath: string): void {
    let content: string;
    
    switch (format) {
      case 'console':
        content = this.generateConsoleReport(report);
        break;
      case 'html':
        content = this.generateHtmlReport(report);
        break;
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content);
  }
  
  /**
   * Format a test group for console output
   */
  private formatTestGroup(group: TestGroup): string {
    let output = `\n## ${group.name}\n`;
    output += `Status: ${group.passed ? 'PASSED' : 'FAILED'}\n\n`;
    
    for (const test of group.tests) {
      output += this.formatTest(test);
    }
    
    return output;
  }
  
  /**
   * Format a test for console output
   */
  private formatTest(test: Test): string {
    let output = `- ${test.name}: ${test.passed ? 'PASSED' : 'FAILED'}\n`;
    output += `  Description: ${test.description}\n`;
    output += `  Result: ${test.result}\n`;
    output += `  Expected: ${test.expected}\n`;
    output += `  Actual: ${test.actual}\n`;
    
    if (test.error) {
      output += `  Error: ${test.error.message || test.error}\n`;
      if (test.error.stack) {
        output += `  Stack: ${test.error.stack}\n`;
      }
    }
    
    output += '\n';
    return output;
  }
  
  /**
   * Format a test group for HTML output
   */
  private formatTestGroupHtml(group: TestGroup): string {
    let html = `
      <div class="test-group">
        <div class="test-group-header">
          <div class="test-group-title">${group.name}</div>
          <div class="${group.passed ? 'passed' : 'failed'}">
            ${group.passed ? 'PASSED' : 'FAILED'}
          </div>
        </div>
        <div class="test-list">
    `;
    
    for (const test of group.tests) {
      html += this.formatTestHtml(test);
    }
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Format a test for HTML output
   */
  private formatTestHtml(test: Test): string {
    let html = `
      <div class="test-item">
        <div class="test-name ${test.passed ? 'passed' : 'failed'}">
          ${test.name}: ${test.passed ? 'PASSED' : 'FAILED'}
        </div>
        <div class="test-details">
          <div><strong>Description:</strong> ${test.description}</div>
          <div><strong>Result:</strong> ${test.result}</div>
          <div><strong>Expected:</strong> ${test.expected}</div>
          <div><strong>Actual:</strong> ${test.actual}</div>
    `;
    
    if (test.error) {
      html += `
        <div class="test-error">
          <strong>Error:</strong> ${test.error.message || test.error}
          ${test.error.stack ? `<div><strong>Stack:</strong> ${test.error.stack.replace(/\n/g, '<br>')}</div>` : ''}
        </div>
      `;
    }
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
}

export const testReporter = new TestReporter();