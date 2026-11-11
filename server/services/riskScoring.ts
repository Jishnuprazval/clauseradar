import { CONTRACT_RULES, DetectedClause, RiskSeverity } from './ruleEngine';

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export type RiskLevel = 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Very High Risk';

export interface RiskScoreResult {
  riskScore: number;
  riskLevel: RiskLevel;
  totalIssues: number;
  severityBreakdown: SeverityBreakdown;
  summary: string;
}

export function calculateRiskScore(detectedClauses: DetectedClause[]): RiskScoreResult {
  const breakdown: SeverityBreakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const clause of detectedClauses) {
    const sev = clause.severity;
    if (sev === 'Critical') breakdown.critical++;
    else if (sev === 'High') breakdown.high++;
    else if (sev === 'Medium') breakdown.medium++;
    else if (sev === 'Low') breakdown.low++;
  }

  let calculatedScore = 0;

  if (detectedClauses.length === 0) {
    calculatedScore = 5; // Clean baseline
  } else {
    // Weighted scoring reflecting real-world contract liability:
    // Critical issues (Service bonds, wage forfeiture) must immediately trigger Very High / High Risk!
    // High issues (Non-competes, 90-day notice, IP transfer) must trigger High Risk!
    let points = 0;

    // Critical: 40 points each (floor of 75 if at least 1 critical)
    points += breakdown.critical * 35;
    // High: 20 points each (floor of 52 if at least 1 high)
    points += breakdown.high * 20;
    // Medium: 10 points each
    points += breakdown.medium * 10;
    // Low: 5 points each
    points += breakdown.low * 5;

    // Enforce realistic safety floors:
    // 1 Critical clause alone is a severe red flag (Score: 78 - 95, Very High Risk)
    if (breakdown.critical >= 2) {
      points = Math.max(points, 88);
    } else if (breakdown.critical === 1) {
      points = Math.max(points, 78);
    } else if (breakdown.high >= 2) {
      // 2 High issues -> Very High Risk (75+)
      points = Math.max(points, 75);
    } else if (breakdown.high === 1) {
      // 1 High issue -> High Risk (55 - 65)
      points = Math.max(points, 56);
    } else if (breakdown.medium >= 2) {
      // 2 Medium issues -> Moderate/High Risk (45 - 52)
      points = Math.max(points, 45);
    } else if (breakdown.medium === 1) {
      // 1 Medium issue -> Moderate Risk (32)
      points = Math.max(points, 32);
    } else if (breakdown.low > 0) {
      points = Math.max(points, 18);
    }

    calculatedScore = points;
  }

  const riskScore = Math.min(100, Math.max(0, Math.round(calculatedScore)));

  let riskLevel: RiskLevel = 'Low Risk';
  if (riskScore >= 75) {
    riskLevel = 'Very High Risk';
  } else if (riskScore >= 50) {
    riskLevel = 'High Risk';
  } else if (riskScore >= 25) {
    riskLevel = 'Moderate Risk';
  } else {
    riskLevel = 'Low Risk';
  }

  // Generate automated executive summary
  let summary = '';
  if (detectedClauses.length === 0) {
    summary =
      'No explicit red flag clauses were detected by the automated rule screening engine. However, review all obligations and consider having a legal mentor inspect the agreement before signing.';
  } else if (breakdown.critical > 0 || riskScore >= 75) {
    const items = [];
    if (breakdown.critical > 0) items.push(`${breakdown.critical} critical penalty/bond clause(s)`);
    if (breakdown.high > 0) items.push(`${breakdown.high} high-severity restriction(s)`);
    summary = `CRITICAL RISK DETECTED: This agreement contains ${items.join(' and ')}. Terms such as mandatory service bonds, liquidated exit damages, or wage deductions create substantial personal financial liability. Do NOT sign without seeking removal or formal renegotiation of these terms.`;
  } else if (breakdown.high > 0 || riskScore >= 50) {
    summary = `HIGH RISK DETECTED: Found ${detectedClauses.length} significant concern(s), notably around non-compete restraints, excessive notice periods, or unilateral term modifications. These clauses significantly restrict your professional rights and require negotiation before signing.`;
  } else if (breakdown.medium > 0 || riskScore >= 25) {
    summary = `MODERATE RISK IDENTIFIED: Found ${detectedClauses.length} clause(s) that warrant clarification, such as automatic renewals, data collection, or broad indemnification provisions. Discuss these terms with the drafting party to secure balanced protections.`;
  } else {
    summary = `LOW RISK DETECTED: Found ${detectedClauses.length} minor contractual item(s). These appear to be low-severity standard provisions that can be addressed via routine conversation with the other party.`;
  }

  return {
    riskScore,
    riskLevel,
    totalIssues: detectedClauses.length,
    severityBreakdown: breakdown,
    summary,
  };
}
