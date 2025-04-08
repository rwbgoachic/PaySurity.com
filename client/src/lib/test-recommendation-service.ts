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
}

export interface TestRecommendation {
  testSuiteId: string;
  score: number;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  predictedSuccessRate: number;
  estimatedDuration: number;
}

/**
 * Local Test Recommendation Engine
 * Uses rule-based algorithms to provide test recommendations without external AI services
 */
export class TestRecommendationService {
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