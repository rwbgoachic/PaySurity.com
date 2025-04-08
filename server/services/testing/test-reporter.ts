/**
 * Test Reporter Service
 * 
 * This module is responsible for generating formatted test reports
 * in various formats (HTML, JSON, Console) and saving them to disk.
 */

import { TestReport } from './test-delivery-service';
import * as fs from 'fs';
import * as path from 'path';

export class TestReporter {
  /**
   * Generate a console report from test results
   */
  generateConsoleReport(report: TestReport): string {
    let output = '';
    
    // Header
    output += `\n=== TEST REPORT: ${report.name} ===\n`;
    output += `Time: ${report.timestamp.toLocaleString()}\n`;
    output += `Overall Result: ${report.passed ? 'PASSED' : 'FAILED'}\n\n`;
    
    // Summary
    const totalGroups = report.testGroups.length;
    const passedGroups = report.testGroups.filter(g => g.passed).length;
    
    let totalTests = 0;
    let passedTests = 0;
    
    report.testGroups.forEach(group => {
      totalTests += group.tests.length;
      passedTests += group.tests.filter(t => t.passed).length;
    });
    
    output += `Test Groups: ${passedGroups}/${totalGroups} passed (${Math.round(passedGroups / totalGroups * 100)}%)\n`;
    output += `Individual Tests: ${passedTests}/${totalTests} passed (${Math.round(passedTests / totalTests * 100)}%)\n\n`;
    
    // Detailed results
    report.testGroups.forEach(group => {
      output += `>> ${group.name}: ${group.passed ? 'PASSED' : 'FAILED'}\n`;
      
      group.tests.forEach(test => {
        output += `   ${test.passed ? '✓' : '✗'} ${test.name}\n`;
        
        if (!test.passed) {
          output += `     - Description: ${test.description}\n`;
          output += `     - Expected: ${test.expected}\n`;
          output += `     - Actual: ${test.actual}\n`;
          
          if (test.error) {
            output += `     - Error: ${(test.error as Error).message}\n`;
            if ((test.error as Error).stack) {
              output += `     - Stack: ${(test.error as Error).stack?.split('\n')[1]?.trim() || ''}\n`;
            }
          }
        }
      });
      
      output += '\n';
    });
    
    return output;
  }
  
  /**
   * Generate an HTML report from test results
   */
  generateHtmlReport(report: TestReport): string {
    const totalGroups = report.testGroups.length;
    const passedGroups = report.testGroups.filter(g => g.passed).length;
    
    let totalTests = 0;
    let passedTests = 0;
    
    report.testGroups.forEach(group => {
      totalTests += group.tests.length;
      passedTests += group.tests.filter(t => t.passed).length;
    });
    
    const passPercentage = Math.round(passedTests / totalTests * 100);
    
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Report: ${report.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
          }
          h1, h2 {
            color: #2c3e50;
          }
          .summary {
            background-color: #f8f9fa;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .progress-container {
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            margin: 10px 0;
          }
          .progress-bar {
            height: 100%;
            border-radius: 10px;
            background-color: ${passPercentage > 80 ? '#28a745' : passPercentage > 60 ? '#ffc107' : '#dc3545'};
          }
          .test-group {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
          }
          .group-header {
            padding: 10px 15px;
            background-color: ${report.passed ? '#d4edda' : '#f8d7da'};
            color: ${report.passed ? '#155724' : '#721c24'};
            font-weight: bold;
            border-bottom: 1px solid #ddd;
          }
          .test-list {
            padding: 0;
            margin: 0;
            list-style-type: none;
          }
          .test-item {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
          }
          .test-item:last-child {
            border-bottom: none;
          }
          .test-name {
            font-weight: bold;
            display: flex;
            align-items: center;
          }
          .test-result {
            margin-left: 10px;
            font-size: 12px;
            padding: 3px 8px;
            border-radius: 3px;
            background-color: #e9ecef;
          }
          .pass {
            background-color: #d4edda;
            color: #155724;
          }
          .fail {
            background-color: #f8d7da;
            color: #721c24;
          }
          .test-details {
            margin-top: 10px;
            padding-left: 20px;
            font-size: 14px;
            color: #666;
          }
          .test-detail {
            margin: 5px 0;
          }
          .stack-trace {
            font-family: monospace;
            white-space: pre-wrap;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            margin-top: 5px;
          }
          .timestamp {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Test Report: ${report.name}</h1>
        <div class="timestamp">Generated on: ${report.timestamp.toLocaleString()}</div>
        
        <div class="summary">
          <h2>Summary</h2>
          <p>Overall Result: <strong class="${report.passed ? 'pass' : 'fail'}">${report.passed ? 'PASSED' : 'FAILED'}</strong></p>
          <p>Test Groups: ${passedGroups}/${totalGroups} passed (${Math.round(passedGroups / totalGroups * 100)}%)</p>
          <p>Individual Tests: ${passedTests}/${totalTests} passed (${passPercentage}%)</p>
          
          <div class="progress-container">
            <div class="progress-bar" style="width: ${passPercentage}%"></div>
          </div>
        </div>
        
        <h2>Detailed Results</h2>
    `;
    
    report.testGroups.forEach(group => {
      const groupPassRate = Math.round(group.tests.filter(t => t.passed).length / group.tests.length * 100);
      
      html += `
        <div class="test-group">
          <div class="group-header">
            ${group.passed ? '✓' : '✗'} ${group.name} (${groupPassRate}% passed)
          </div>
          <ul class="test-list">
      `;
      
      group.tests.forEach(test => {
        html += `
          <li class="test-item">
            <div class="test-name">
              ${test.passed ? '✓' : '✗'} ${test.name}
              <span class="test-result ${test.passed ? 'pass' : 'fail'}">${test.passed ? 'PASS' : 'FAIL'}</span>
            </div>
        `;
        
        if (!test.passed) {
          html += `
            <div class="test-details">
              <div class="test-detail"><strong>Description:</strong> ${test.description}</div>
              <div class="test-detail"><strong>Expected:</strong> ${test.expected}</div>
              <div class="test-detail"><strong>Actual:</strong> ${test.actual}</div>
          `;
          
          if (test.error) {
            html += `
              <div class="test-detail"><strong>Error:</strong> ${(test.error as Error).message}</div>
            `;
            
            if ((test.error as Error).stack) {
              html += `
                <div class="stack-trace">${(test.error as Error).stack}</div>
              `;
            }
          }
          
          html += `</div>`;
        }
        
        html += `</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    });
    
    html += `
      </body>
      </html>
    `;
    
    return html;
  }
  
  /**
   * Save a report to disk
   */
  saveReport(report: TestReport, format: 'console' | 'html' | 'json' = 'html', filePath: string): void {
    // Create directories if they don't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    let content: string;
    
    switch (format) {
      case 'html':
        content = this.generateHtmlReport(report);
        break;
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
      case 'console':
        content = this.generateConsoleReport(report);
        break;
    }
    
    fs.writeFileSync(filePath, content);
  }
}

export const testReporter = new TestReporter();