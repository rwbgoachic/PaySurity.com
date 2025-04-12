/**
 * Generate Legal Test Report
 * 
 * This script runs the legal system tests and generates a detailed report
 * in a format that can be saved to JSON, CSV, or displayed in the console.
 * 
 * Usage: npx tsx scripts/generate-legal-test-report.ts [format]
 * where format is one of: json, csv, console (default: console)
 */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { runLegalSystemTests } from '../server/services/testing/test-legal-system';

interface ReportSummary {
  timestamp: Date;
  totalServices: number;
  passedServices: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  services: {
    name: string;
    passed: boolean;
    testCount: number;
    passedCount: number;
    groups: {
      name: string;
      passed: boolean;
      testCount: number;
      passedCount: number;
      tests: {
        name: string;
        passed: boolean;
        error: string | null;
      }[];
    }[];
  }[];
}

/**
 * Run all tests and generate a report summary
 */
async function generateReport(): Promise<ReportSummary> {
  try {
    const reports = await runLegalSystemTests();
    
    const summary: ReportSummary = {
      timestamp: new Date(),
      totalServices: reports.length,
      passedServices: reports.filter(r => r.passed).length,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      passRate: 0,
      services: []
    };
    
    for (const report of reports) {
      const service = {
        name: report.serviceName,
        passed: report.passed,
        testCount: 0,
        passedCount: 0,
        groups: []
      };
      
      for (const group of report.testGroups) {
        const groupTests = group.tests || [];
        const testCount = groupTests.length;
        const passedCount = groupTests.filter(t => t.passed).length;
        
        service.testCount += testCount;
        service.passedCount += passedCount;
        
        service.groups.push({
          name: group.name,
          passed: group.passed,
          testCount: testCount,
          passedCount: passedCount,
          tests: groupTests.map(t => ({
            name: t.name,
            passed: t.passed,
            error: t.error
          }))
        });
      }
      
      summary.totalTests += service.testCount;
      summary.passedTests += service.passedCount;
      summary.services.push(service);
    }
    
    summary.failedTests = summary.totalTests - summary.passedTests;
    summary.passRate = summary.totalTests > 0 
      ? Math.round((summary.passedTests / summary.totalTests) * 100) 
      : 0;
    
    return summary;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

/**
 * Display report in console
 */
function displayConsoleReport(summary: ReportSummary): void {
  console.log(chalk.blue.bold('\n===== LEGAL SYSTEM TEST REPORT ====='));
  console.log(chalk.gray(`Generated: ${summary.timestamp.toLocaleString()}`));
  console.log(`\nOverall Results:`);
  console.log(`  Services: ${summary.passedServices}/${summary.totalServices} passed`);
  console.log(`  Tests: ${summary.passedTests}/${summary.totalTests} passed (${summary.passRate}%)`);
  
  console.log('\nService Details:');
  for (const service of summary.services) {
    const serviceIcon = service.passed ? chalk.green('✓') : chalk.red('✗');
    console.log(`\n${serviceIcon} ${chalk.bold(service.name)}`);
    console.log(`  Pass Rate: ${Math.round((service.passedCount / service.testCount) * 100)}% (${service.passedCount}/${service.testCount})`);
    
    for (const group of service.groups) {
      const groupIcon = group.passed ? chalk.green('✓') : chalk.red('✗');
      console.log(`\n  ${groupIcon} ${chalk.bold(group.name)}`);
      console.log(`    Pass Rate: ${Math.round((group.passedCount / group.testCount) * 100)}% (${group.passedCount}/${group.testCount})`);
      
      // Show test details, with failures highlighted
      for (const test of group.tests) {
        const testIcon = test.passed ? chalk.green('✓') : chalk.red('✗');
        console.log(`    ${testIcon} ${test.name}`);
        
        if (!test.passed && test.error) {
          console.log(`      ${chalk.yellow('Error:')} ${test.error}`);
        }
      }
    }
  }
  
  console.log('\nSummary:');
  
  console.log(`Total Services: ${summary.totalServices}`);
  console.log(`Passed Services: ${summary.passedServices}`);
  console.log(`Failed Services: ${summary.totalServices - summary.passedServices}`);
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed Tests: ${summary.passedTests}`);
  console.log(`Failed Tests: ${summary.failedTests}`);
  console.log(`Pass Rate: ${summary.passRate}%`);
  
  console.log(chalk.blue.bold('\n=============================\n'));
}

/**
 * Generate JSON report
 */
function generateJsonReport(summary: ReportSummary): void {
  const reportDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const reportPath = path.join(reportDir, `legal-test-report-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));
  
  console.log(chalk.green(`\nJSON report generated: ${reportPath}`));
}

/**
 * Generate CSV report
 */
function generateCsvReport(summary: ReportSummary): void {
  const reportDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const reportPath = path.join(reportDir, `legal-test-report-${timestamp}.csv`);
  
  let csvContent = 'Service,Group,Test,Passed,Error\n';
  
  for (const service of summary.services) {
    for (const group of service.groups) {
      for (const test of group.tests) {
        // Escape quotes in CSV
        const testName = test.name.replace(/"/g, '""');
        const errorMessage = test.error ? test.error.replace(/"/g, '""') : '';
        
        csvContent += `"${service.name}","${group.name}","${testName}","${test.passed}","${errorMessage}"\n`;
      }
    }
  }
  
  // Add summary row
  csvContent += `\n"SUMMARY","","","",""`;
  csvContent += `\n"Total Services","${summary.totalServices}","","",""`;
  csvContent += `\n"Passed Services","${summary.passedServices}","","",""`;
  csvContent += `\n"Failed Services","${summary.totalServices - summary.passedServices}","","",""`;
  csvContent += `\n"Total Tests","${summary.totalTests}","","",""`;
  csvContent += `\n"Passed Tests","${summary.passedTests}","","",""`;
  csvContent += `\n"Failed Tests","${summary.failedTests}","","",""`;
  csvContent += `\n"Pass Rate","${summary.passRate}%","","",""`;
  
  fs.writeFileSync(reportPath, csvContent);
  
  console.log(chalk.green(`\nCSV report generated: ${reportPath}`));
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const format = process.argv[2] || 'console';
    console.log(chalk.blue.bold('Generating Legal System Test Report...'));
    
    const summary = await generateReport();
    
    switch (format.toLowerCase()) {
      case 'json':
        generateJsonReport(summary);
        break;
      case 'csv':
        generateCsvReport(summary);
        break;
      case 'console':
      default:
        displayConsoleReport(summary);
        break;
    }
    
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('Error generating report:'), error);
    process.exit(1);
  }
}

// Run the main function
main();