// Test type definitions
export interface TestSuite {
  id: string;
  name: string;
  lastRun: string;
  testCount: number;
  passRate: number;
  executionTime: number;
  complexity: 'low' | 'medium' | 'high';
  priority: number;
  failureImpact: 'low' | 'medium' | 'high';
  coverage: number;
  trend: { x: string; y: number }[];
  tags: string[];
  dependencies: string[];
  failureReason?: string;
  group?: string;
  enabled?: boolean;
  schedule?: TestSchedule;
  lastErrors?: TestError[];
  criticalPath?: boolean;
  parallelizable?: boolean;
  successRate?: number; // Historical success rate
  avgExecutionTime?: number; // Average execution time
  // Root cause data
  errorPatterns?: {
    pattern: string;
    occurrences: number;
    firstSeen: string;
    lastSeen: string;
  }[];
  // Performance data
  bottlenecks?: {
    area: string;
    impact: number;
    suggestion: string;
  }[];
}

export interface TestRecommendation {
  testSuiteId: string;
  score: number;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  predictedSuccessRate: number;
  estimatedDuration: number;
  optimizationSuggestions?: string[];
  relatedTests?: string[];
}

export interface TestSchedule {
  enabled: boolean;
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  time?: string;
  days?: string[];
  onCodeChange?: boolean;
  onDeploy?: boolean;
  lastScheduledRun?: string;
  nextScheduledRun?: string;
}

export interface TestError {
  message: string;
  location: string;
  timestamp: string;
  stackTrace?: string;
  frequency?: number;
  relatedErrors?: string[];
  potentialFix?: string;
}

export interface TestReport {
  id: string;
  date: string;
  testSuiteId: string;
  duration: number;
  passRate: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  errors: TestError[];
  exportFormats: ('pdf' | 'csv' | 'json')[];
}

export interface RootCauseAnalysis {
  testSuiteId: string;
  commonPatterns: string[];
  suggestedFixes: string[];
  relatedIssues: string[];
  confidence: number;
}

export interface TestGroup {
  id: string;
  name: string;
  description?: string;
  testSuiteIds: string[];
  tags?: string[];
}

/**
 * Advanced Test Recommendation Engine
 * Uses rule-based algorithms and local intelligence to provide comprehensive testing features
 */
export class TestRecommendationService {
  // FEATURE: Test Scheduling
  generateSchedule(suite: TestSuite, pattern: 'daily' | 'weekly' | 'monthly' | 'custom', options: any = {}): TestSchedule {
    const now = new Date();
    let nextRun: Date;
    
    switch (pattern) {
      case 'daily':
        nextRun = new Date(now);
        nextRun.setDate(nextRun.getDate() + 1);
        nextRun.setHours(options.hour || 0, options.minute || 0, 0, 0);
        break;
      
      case 'weekly':
        nextRun = new Date(now);
        // Get next occurrence of the specified day (0 = Sunday, 6 = Saturday)
        const dayOfWeek = options.day || 1; // Default to Monday
        const daysUntilNext = (dayOfWeek + 7 - now.getDay()) % 7 || 7; // If today, then next week
        nextRun.setDate(nextRun.getDate() + daysUntilNext);
        nextRun.setHours(options.hour || 0, options.minute || 0, 0, 0);
        break;
      
      case 'monthly':
        nextRun = new Date(now);
        // Set to next month, same day (or last day of month if day doesn't exist)
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(Math.min(options.day || 1, this.getLastDayOfMonth(nextRun)));
        nextRun.setHours(options.hour || 0, options.minute || 0, 0, 0);
        break;
      
      case 'custom':
        // Custom schedules can be implemented as needed
        nextRun = new Date(now);
        nextRun.setDate(nextRun.getDate() + (options.interval || 1));
        nextRun.setHours(options.hour || 0, options.minute || 0, 0, 0);
        break;
    }
    
    return {
      enabled: true,
      pattern,
      time: `${options.hour || 0}:${options.minute || 0}`,
      days: options.days || [],
      onCodeChange: options.onCodeChange || false,
      onDeploy: options.onDeploy || false,
      lastScheduledRun: now.toISOString(),
      nextScheduledRun: nextRun.toISOString()
    };
  }
  
  private getLastDayOfMonth(date: Date): number {
    const nextMonth = new Date(date);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(0);
    return nextMonth.getDate();
  }
  
  // FEATURE: Root Cause Analysis
  analyzeRootCause(suite: TestSuite): RootCauseAnalysis {
    if (!suite.lastErrors || suite.lastErrors.length === 0) {
      return {
        testSuiteId: suite.id,
        commonPatterns: [],
        suggestedFixes: [],
        relatedIssues: [],
        confidence: 0
      };
    }
    
    // Extract common error patterns
    const errorMessages = suite.lastErrors.map(e => e.message);
    const commonPatterns = this.extractCommonPatterns(errorMessages);
    
    // Generate suggested fixes based on error patterns
    const suggestedFixes = this.generateSuggestedFixes(commonPatterns, suite);
    
    // Find related issues by examining error stack traces and locations
    const relatedIssues = this.findRelatedIssues(suite.lastErrors, suite);
    
    // Calculate confidence based on pattern strength and consistency
    const confidence = Math.min(95, commonPatterns.length * 15 + 40);
    
    return {
      testSuiteId: suite.id,
      commonPatterns,
      suggestedFixes,
      relatedIssues,
      confidence
    };
  }
  
  private extractCommonPatterns(errorMessages: string[]): string[] {
    const patterns: string[] = [];
    
    // Count occurrences of key phrases
    const phraseCounts = new Map<string, number>();
    
    for (const message of errorMessages) {
      // Extract key phrases (simplistic approach)
      const key = message
        .toLowerCase()
        .replace(/[0-9]+/g, 'N') // Replace numbers with N
        .replace(/[^a-z0-9 ]/g, ' ') // Replace non-alphanumeric with spaces
        .split(' ')
        .filter(word => word.length > 3) // Only consider words of reasonable length
        .slice(0, 5) // Take first 5 significant words
        .join(' ');
      
      phraseCounts.set(key, (phraseCounts.get(key) || 0) + 1);
    }
    
    // Find the most common patterns
    const sortedPatterns = Array.from(phraseCounts.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // Take patterns that occur in at least 25% of errors
    const threshold = Math.max(1, Math.floor(errorMessages.length * 0.25));
    
    sortedPatterns.forEach(([pattern, count]) => {
      if (count >= threshold) {
        patterns.push(pattern);
      }
    });
    
    return patterns;
  }
  
  private generateSuggestedFixes(patterns: string[], suite: TestSuite): string[] {
    const fixes: string[] = [];
    
    // Simplistic pattern-to-fix mapping
    for (const pattern of patterns) {
      if (pattern.includes('timeout')) {
        fixes.push('Increase timeout thresholds in the test configuration');
      }
      
      if (pattern.includes('connection') || pattern.includes('network')) {
        fixes.push('Check network connectivity and DNS resolution');
      }
      
      if (pattern.includes('database') || pattern.includes('sql')) {
        fixes.push('Verify database connection settings and ensure the database is accessible');
      }
      
      if (pattern.includes('null') || pattern.includes('undefined')) {
        fixes.push('Check for null or undefined values in the code path');
      }
      
      if (pattern.includes('memory') || pattern.includes('heap')) {
        fixes.push('Optimize memory usage or increase memory allocation');
      }
    }
    
    // Add generic fixes if no specific ones were found
    if (fixes.length === 0) {
      if (suite.complexity === 'high') {
        fixes.push('Refactor complex test logic into smaller, more manageable tests');
      }
      
      if (suite.passRate < 50) {
        fixes.push('Review test data and preconditions to ensure they match the expected state');
      }
      
      fixes.push('Run tests with verbose logging to gather more detailed error information');
    }
    
    return fixes;
  }
  
  private findRelatedIssues(errors: TestError[], suite: TestSuite): string[] {
    const relatedIssues: string[] = [];
    
    // Look for common code locations
    const locations = errors.map(e => e.location);
    const locationCounts = new Map<string, number>();
    
    locations.forEach(loc => {
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
    });
    
    // Find hot spots (locations with multiple errors)
    const hotspots = Array.from(locationCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([loc, _]) => loc);
    
    if (hotspots.length > 0) {
      relatedIssues.push(`Code hotspots detected in: ${hotspots.join(', ')}`);
    }
    
    // Check for dependency-related issues
    if (suite.dependencies && suite.dependencies.length > 0) {
      relatedIssues.push(`Check dependent test suites: ${suite.dependencies.join(', ')}`);
    }
    
    return relatedIssues;
  }
  
  // FEATURE: Enhanced Reporting
  generateReport(suite: TestSuite): TestReport {
    const passedTests = Math.round((suite.testCount * suite.passRate) / 100);
    const failedTests = suite.testCount - passedTests;
    
    return {
      id: `report-${suite.id}-${Date.now()}`,
      date: new Date().toISOString(),
      testSuiteId: suite.id,
      duration: suite.executionTime,
      passRate: suite.passRate,
      passedTests,
      failedTests,
      skippedTests: 0, // Placeholder, would be determined by actual test data
      errors: suite.lastErrors || [],
      exportFormats: ['pdf', 'csv', 'json']
    };
  }
  
  // FEATURE: Performance Optimization
  analyzePerformance(suite: TestSuite): any {
    // Calculate test efficiency
    const testsPerSecond = suite.testCount / suite.executionTime;
    const efficiencyRating = this.getEfficiencyRating(testsPerSecond, suite.complexity);
    
    // Identify potential for parallelization
    const parallelizationPotential = suite.parallelizable ? 'high' : 'low';
    
    // Generate optimization suggestions
    const optimizations = this.generateOptimizationSuggestions(suite);
    
    // Estimate potential time savings
    const potentialTimeSavings = this.estimatePotentialTimeSavings(suite, optimizations);
    
    return {
      testSuiteId: suite.id,
      testsPerSecond,
      efficiencyRating,
      parallelizationPotential,
      optimizations,
      potentialTimeSavings
    };
  }
  
  private getEfficiencyRating(testsPerSecond: number, complexity: 'low' | 'medium' | 'high'): string {
    let threshold = 0;
    
    switch (complexity) {
      case 'low': threshold = 2.0; break;
      case 'medium': threshold = 1.0; break;
      case 'high': threshold = 0.5; break;
    }
    
    if (testsPerSecond > threshold * 2) return 'excellent';
    if (testsPerSecond > threshold) return 'good';
    if (testsPerSecond > threshold / 2) return 'fair';
    return 'poor';
  }
  
  private generateOptimizationSuggestions(suite: TestSuite): string[] {
    const suggestions: string[] = [];
    
    // Check for slow tests
    if (suite.executionTime > 60 && suite.testCount < 50) {
      suggestions.push('Tests are running slowly. Consider optimizing test setup/teardown.');
    }
    
    // Check for parallelization potential
    if (!suite.parallelizable && suite.testCount > 20) {
      suggestions.push('Tests could benefit from parallelization. Review for independent test cases.');
    }
    
    // Check for critical path optimization
    if (suite.criticalPath && suite.executionTime > 30) {
      suggestions.push('This is on the critical test path. Prioritize optimizing these tests.');
    }
    
    // Check for dependency optimization
    if (suite.dependencies && suite.dependencies.length > 2) {
      suggestions.push('Test has many dependencies. Consider reducing coupling between test suites.');
    }
    
    // Generic optimization suggestions
    suggestions.push('Review setup/teardown to minimize redundant operations.');
    
    return suggestions;
  }
  
  private estimatePotentialTimeSavings(suite: TestSuite, optimizations: string[]): number {
    // Simplistic estimate
    let savingsFactor = 0;
    
    if (optimizations.some(opt => opt.includes('parallelization'))) {
      savingsFactor += 0.3; // Estimate 30% reduction with parallelization
    }
    
    if (optimizations.some(opt => opt.includes('setup/teardown'))) {
      savingsFactor += 0.15; // Estimate 15% reduction with setup/teardown optimization
    }
    
    if (optimizations.some(opt => opt.includes('coupling'))) {
      savingsFactor += 0.1; // Estimate 10% reduction by reducing coupling
    }
    
    return Math.round(suite.executionTime * savingsFactor);
  }
  
  // FEATURE: Test Management
  organizeTestGroups(testSuites: TestSuite[]): TestGroup[] {
    const groups: TestGroup[] = [];
    
    // Group by explicit group name
    const groupedByName = new Map<string, TestSuite[]>();
    
    testSuites.forEach(suite => {
      if (suite.group) {
        if (!groupedByName.has(suite.group)) {
          groupedByName.set(suite.group, []);
        }
        groupedByName.get(suite.group)!.push(suite);
      }
    });
    
    // Convert to TestGroup objects
    groupedByName.forEach((suites, name) => {
      groups.push({
        id: `group-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        testSuiteIds: suites.map(s => s.id),
        tags: this.extractCommonTags(suites)
      });
    });
    
    // Group by common tags for tests that don't have an explicit group
    const ungroupedTests = testSuites.filter(suite => !suite.group);
    
    // Group by primary tag
    const groupedByTag = new Map<string, TestSuite[]>();
    
    ungroupedTests.forEach(suite => {
      if (suite.tags && suite.tags.length > 0) {
        const primaryTag = suite.tags[0];
        if (!groupedByTag.has(primaryTag)) {
          groupedByTag.set(primaryTag, []);
        }
        groupedByTag.get(primaryTag)!.push(suite);
      }
    });
    
    // Convert tag groups to TestGroup objects
    groupedByTag.forEach((suites, tag) => {
      // Only create a group if there are multiple tests with this tag
      if (suites.length > 1) {
        groups.push({
          id: `group-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Tests`,
          description: `Tests related to ${tag}`,
          testSuiteIds: suites.map(s => s.id),
          tags: [tag, ...this.extractCommonTags(suites).filter(t => t !== tag)]
        });
      }
    });
    
    return groups;
  }
  
  private extractCommonTags(suites: TestSuite[]): string[] {
    if (suites.length === 0) return [];
    
    // Start with the tags from the first suite
    let commonTags = [...(suites[0].tags || [])];
    
    // Find intersection with tags from all other suites
    for (let i = 1; i < suites.length; i++) {
      const suiteTags = suites[i].tags || [];
      commonTags = commonTags.filter(tag => suiteTags.includes(tag));
    }
    
    return commonTags;
  }
  // Generate test recommendations based on test suite data
  generateRecommendations(testSuites: TestSuite[]): TestRecommendation[] {
    if (!testSuites || testSuites.length === 0) {
      return [];
    }
    
    const recommendations: TestRecommendation[] = testSuites.map(suite => {
      // Calculate base score from multiple factors
      const failureRisk = 100 - suite.passRate;
      const coverageScore = suite.coverage * 0.5; // Higher coverage is better but weighted less
      const complexityFactor = this.getComplexityFactor(suite.complexity);
      const impactFactor = this.getImpactFactor(suite.failureImpact);
      const trendFactor = this.getTrendFactor(suite.trend);
      const dependencyFactor = this.getDependencyFactor(suite, testSuites);
      
      // Calculate the recommendation score (0-100)
      let score = (
        failureRisk * 0.35 + // Failing tests get higher priority
        (suite.priority * 20) * 0.25 + // User-set priority (converted to 0-100 scale)
        impactFactor * 0.15 +
        complexityFactor * 0.10 +
        trendFactor * 0.10 +
        dependencyFactor * 0.05
      );
      
      // Normalize score to 0-100 range
      score = Math.min(100, Math.max(0, score));
      score = Math.round(score);
      
      // Predict success rate
      const predictedSuccessRate = this.predictSuccessRate(suite);
      
      // Estimate duration based on historical data
      const estimatedDuration = suite.executionTime;
      
      // Determine priority level
      const priority = this.determinePriority(score);
      
      // Generate reason
      const reason = this.generateReason(suite, score, trendFactor);
      
      return {
        testSuiteId: suite.id,
        score,
        reason,
        priority,
        predictedSuccessRate,
        estimatedDuration
      };
    });
    
    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score);
  }
  
  // Predict the success rate based on trend and current pass rate
  private predictSuccessRate(suite: TestSuite): number {
    const trend = suite.trend;
    
    if (!trend || trend.length < 2) {
      return suite.passRate;
    }
    
    // Calculate trend direction and momentum
    const recentValues = trend.slice(-3); // Last 3 data points
    const trendDirection = recentValues[recentValues.length - 1].y - recentValues[0].y;
    
    // Use trend to adjust prediction slightly
    let prediction = suite.passRate + (trendDirection * 0.3);
    
    // Clamp within reasonable range
    prediction = Math.min(100, Math.max(0, prediction));
    prediction = Math.round(prediction);
    
    return prediction;
  }
  
  // Determine priority level based on score
  private determinePriority(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
  
  // Generate a human-readable reason for the recommendation
  private generateReason(suite: TestSuite, score: number, trendFactor: number): string {
    const reasons: string[] = [];
    
    // Check failure rate
    if (suite.passRate < 100) {
      reasons.push(`${100 - suite.passRate}% failure rate detected.`);
    } else {
      reasons.push(`Consistent 100% pass rate.`);
    }
    
    // Check trend
    if (trendFactor > 10) {
      reasons.push(`Improving trend in recent runs.`);
    } else if (trendFactor < -10) {
      reasons.push(`Deteriorating trend in recent runs.`);
    } else {
      reasons.push(`Stable performance trend.`);
    }
    
    // Check coverage
    if (suite.coverage < 70) {
      reasons.push(`Low test coverage (${suite.coverage}%).`);
    }
    
    // Check failure impact
    if (suite.failureImpact === 'high') {
      reasons.push(`High business impact area.`);
    }
    
    // Check dependencies
    if (suite.dependencies?.length > 0) {
      reasons.push(`Dependencies on other test suites.`);
    }
    
    // Add failure reason if available
    if (suite.failureReason) {
      reasons.push(`Previous failure: ${suite.failureReason}.`);
    }
    
    // Combine reasons into a single string
    return reasons.join(' ');
  }
  
  // Get factor based on complexity
  private getComplexityFactor(complexity: 'low' | 'medium' | 'high'): number {
    switch (complexity) {
      case 'high': return 80;
      case 'medium': return 50;
      case 'low': return 20;
      default: return 50;
    }
  }
  
  // Get factor based on failure impact
  private getImpactFactor(impact: 'low' | 'medium' | 'high'): number {
    switch (impact) {
      case 'high': return 100;
      case 'medium': return 60;
      case 'low': return 30;
      default: return 60;
    }
  }
  
  // Analyze trend to produce a trend factor
  private getTrendFactor(trend: { x: string; y: number }[]): number {
    if (!trend || trend.length < 2) {
      return 0; // Neutral factor if no trend data
    }
    
    // Calculate trend slope
    const firstValue = trend[0].y;
    const lastValue = trend[trend.length - 1].y;
    const trendDirection = lastValue - firstValue;
    
    // Normalize to a factor between -50 and 50
    return Math.max(-50, Math.min(50, trendDirection * 10));
  }
  
  // Calculate dependency factor
  private getDependencyFactor(suite: TestSuite, allSuites: TestSuite[]): number {
    if (!suite.dependencies || suite.dependencies.length === 0) {
      return 0;
    }
    
    // If this suite is depended upon by many others, it gets a higher score
    const dependentSuites = allSuites.filter(s => 
      s.dependencies && s.dependencies.includes(suite.id)
    );
    
    return Math.min(100, dependentSuites.length * 20);
  }
  
  // Detect anomalies in test data
  detectAnomalies(testSuites: TestSuite[]): any[] {
    const anomalies = [];
    
    for (const suite of testSuites) {
      // Look for significant changes in pass rate
      if (suite.trend && suite.trend.length > 2) {
        const prevValue = suite.trend[suite.trend.length - 2].y;
        const currValue = suite.trend[suite.trend.length - 1].y;
        const change = Math.abs(currValue - prevValue);
        
        if (change > 15) {
          anomalies.push({
            type: currValue > prevValue ? 'improvement' : 'deterioration',
            testSuiteId: suite.id,
            change: change,
            message: `${change}% ${currValue > prevValue ? 'increase' : 'decrease'} in pass rate for ${suite.name}`,
            confidence: Math.min(99, 70 + change),
            severity: change > 25 ? 'high' : 'medium'
          });
        }
      }
      
      // Look for low coverage
      if (suite.coverage < 60 && suite.failureImpact === 'high') {
        anomalies.push({
          type: 'coverage',
          testSuiteId: suite.id,
          message: `Low test coverage (${suite.coverage}%) in critical area: ${suite.name}`,
          confidence: 90,
          severity: 'high'
        });
      }
      
      // Look for slow tests
      if (suite.executionTime > 100 && suite.testCount < 50) {
        anomalies.push({
          type: 'performance',
          testSuiteId: suite.id,
          message: `Slow execution (${suite.executionTime}s) for ${suite.name} with only ${suite.testCount} tests`,
          confidence: 85,
          severity: 'medium'
        });
      }
      
      // Check if high priority tests are failing
      if (suite.passRate < 90 && suite.priority > 3 && suite.failureImpact === 'high') {
        anomalies.push({
          type: 'critical-failure',
          testSuiteId: suite.id,
          message: `High priority test suite ${suite.name} has ${100 - suite.passRate}% failure rate`,
          confidence: 95,
          severity: 'high'
        });
      }
    }
    
    return anomalies;
  }
  
  // Analyze test correlations
  analyzeCorrelations(testSuites: TestSuite[]): any[] {
    const correlations = [];
    
    // Find tests with similar failure patterns
    for (let i = 0; i < testSuites.length; i++) {
      for (let j = i + 1; j < testSuites.length; j++) {
        const suiteA = testSuites[i];
        const suiteB = testSuites[j];
        
        // Skip perfect tests
        if (suiteA.passRate === 100 || suiteB.passRate === 100) {
          continue;
        }
        
        // Check if trends are similar
        const corrScore = this.calculateTrendCorrelation(suiteA.trend, suiteB.trend);
        
        if (corrScore > 0.7) {
          correlations.push({
            testSuiteIdA: suiteA.id,
            testSuiteIdB: suiteB.id,
            score: Math.round(corrScore * 100),
            message: `Strong correlation between failures in ${suiteA.name} and ${suiteB.name}`,
            confidence: Math.round(corrScore * 90),
            type: 'failure-correlation'
          });
        }
      }
    }
    
    return correlations;
  }
  
  // Calculate correlation between two trends
  private calculateTrendCorrelation(trendA: { x: string; y: number }[], trendB: { x: string; y: number }[]): number {
    if (!trendA || !trendB || trendA.length < 3 || trendB.length < 3) {
      return 0;
    }
    
    // Simplistic correlation measure for demonstration
    // In a real implementation, would use Pearson correlation
    let similarities = 0;
    const length = Math.min(trendA.length, trendB.length);
    
    for (let i = 1; i < length; i++) {
      const dirA = trendA[i].y - trendA[i-1].y;
      const dirB = trendB[i].y - trendB[i-1].y;
      
      // If directions match (both increasing or both decreasing)
      if ((dirA > 0 && dirB > 0) || (dirA < 0 && dirB < 0)) {
        similarities++;
      }
    }
    
    return similarities / (length - 1);
  }
}

// Create a singleton instance
export const testRecommendationService = new TestRecommendationService();