export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DetectedClause {
  ruleId: string;
  riskCategory: string;
  matchedClauseText: string;
  pageNumber: number | null;
  startIndex: number;
  endIndex: number;
  severity: RiskSeverity;
  riskExplanation: string;
  whyItMatters: string;
  suggestedQuestions: string[];
  suggestedNegotiationPoints: string[];
}

export interface RuleDefinition {
  ruleId: string;
  category: string;
  severity: RiskSeverity;
  patterns: RegExp[];
  negativePatterns?: RegExp[];
  riskExplanation: string;
  whyItMatters: string;
  suggestedQuestions: string[];
  suggestedNegotiationPoints: string[];
}

export const CONTRACT_RULES: RuleDefinition[] = [
  // 1. Service Bond & Retention Penalties (Critical)
  {
    ruleId: 'RULE_SERVICE_BOND',
    category: 'Service Bond & Exit Penalties',
    severity: 'Critical',
    patterns: [
      /(?:service\s+bond|retention\s+agreement|mandatory\s+commitment|mandatory\s+service|mandatory\s+retention|training\s+bond|employment\s+bond|bond\s+period)/i,
      /(?:agree(?:s)?\s+to\s+serve\s+for\s+(?:a\s+)?(?:minimum\s+)?period|commit(?:s)?\s+to\s+remain\s+with|must\s+work\s+for\s+(?:a\s+minimum\s+of|at\s+least)\s*(?:\d+|one|two|three)\s*(?:years|months|yrs))/i,
      /(?:liquidated\s+damages|reimburse(?:ment)?\s+(?:of\s+)?training\s+(?:cost|fee|expense)|training\s+reimbursement|pay\s+(?:the\s+company|a\s+penalty|as\s+damages)\s+of\s+[\$£€₹\d]+)/i,
      /(?:early\s+(?:exit|termination)\s+(?:fee|penalty|charge)|pay\s+[\$£€₹\d]+\s+(?:if|upon|in\s+the\s+event\s+of\s+resignation)|penalty\s+of\s+[\$£€₹\d]+)/i,
      /(?:should\s+(?:the\s+)?(?:employee|intern|contractor)\s+(?:resign|terminate|leave)\s+(?:before|within|prior\s+to)|fail(?:s)?\s+to\s+complete\s+the\s+full\s+(?:term|duration|period))/i,
      /(?:cannot\s+(?:leave|resign|quit)\s+(?:before|prior\s+to|within)\s*(?:\d+|one|two|three)\s*(?:years|months|yrs))/i,
    ],
    negativePatterns: [
      /(?:no\s+bond|without\s+any\s+bond|at-will\s+employment\s+without\s+penalty)/i,
    ],
    riskExplanation:
      'This clause binds you to remain with the employer for a fixed duration, imposing severe financial liquidated damages, exit fees, or training repayments for early resignation.',
    whyItMatters:
      'Service bonds restrict your career mobility and trap you in toxic, underpaid, or abusive environments under the threat of aggressive personal financial collection.',
    suggestedQuestions: [
      'Is there an initial mutual trial period where either party can separate without financial penalty?',
      'Can you itemize the exact certified training courses that justify this reimbursement claim?',
      'Does the repayment amount depreciate on a prorated monthly basis over the served duration?'
    ],
    suggestedNegotiationPoints: [
      'Insist on removing all liquidated damages clauses in favor of standard at-will employment.',
      'Propose a prorated linear reduction of any training costs (e.g., reduced by 1/12th each month served).',
      'Add an express exemption if resignation occurs due to employer breach, harassment, or delayed compensation.'
    ]
  },

  // 2. Non-Compete Restrictions (High)
  {
    ruleId: 'RULE_NON_COMPETE',
    category: 'Non-Compete Restrictions',
    severity: 'High',
    patterns: [
      /(?:non-compete|non\s+compete|covenant\s+not\s+to\s+compete|restraint\s+of\s+trade|competition\s+clause)/i,
      /(?:shall\s+not|will\s+not|agrees?\s+not\s+to|cannot|must\s+not)(?:\s+directly\s+or\s+indirectly)?\s*(?:engage\s+in|work\s+for|join|be\s+employed\s+by|consult\s+with|perform\s+services\s+for)\s*(?:any\s+)?(?:competitor|competing|competing\s+business|similar\s+business)/i,
      /(?:for\s+(?:a\s+period\s+of\s+)?(?:\d+|twelve|twenty-four|six)\s+months\s+(?:following|after)\s+(?:termination|cessation|separation|leaving|resignation))/i,
      /(?:within\s+a\s+(?:\d+|fifty|hundred)\s*-?\s*mile\s+radius|in\s+the\s+company's\s+active\s+(?:international\s+)?markets)/i,
      /(?:restricted\s+from\s+joining\s+competitors|post-employment\s+competition)/i,
    ],
    negativePatterns: [
      /(?:non-compete\s+clauses\s+are\s+excluded|no\s+restriction\s+on\s+future\s+employment)/i
    ],
    riskExplanation:
      'This clause restricts your legal right to work for industry competitors, freelance, or start a similar business after separating from the organization.',
    whyItMatters:
      'Overly broad non-competes can effectively prevent you from earning a livelihood in your domain, forcing prolonged unemployment without compensatory garden pay.',
    suggestedQuestions: [
      'Will the company disburse 100% garden leave salary during any enforced post-employment restriction?',
      'Can we attach an explicit list of 3-5 direct named competitors rather than a blanket industry ban?',
      'Does this restriction remain active if employment is terminated by the company without cause?'
    ],
    suggestedNegotiationPoints: [
      'Reduce the non-compete duration to 3 months or eliminate it entirely for junior or intern positions.',
      'Narrow the scope to specifically designated direct competitors rather than the broader software sector.',
      'Ensure the non-compete becomes immediately null and void if you are laid off or terminated without cause.'
    ]
  },

  // 3. Salary Deductions & Wage Forfeiture (Critical)
  {
    ruleId: 'RULE_SALARY_DEDUCTIONS',
    category: 'Salary Deductions & Forfeiture',
    severity: 'Critical',
    patterns: [
      /(?:deduct(?:ion)?|withhold(?:ing)?|forfeit(?:ure)?|fine|dock(?:ing)?)\s+(?:from\s+)?(?:the\s+)?(?:employee'?s?\s+)?(?:monthly\s+)?(?:stipend|salary|wage|pay|final\s+settlement|deposit)/i,
      /(?:any\s+amounts\s+deemed\s+necessary|deemed\s+by\s+management\s+to\s+cover\s+(?:any\s+)?(?:operational\s+errors|losses|depreciation|mistakes))/i,
      /(?:penalty\s+charges|financial\s+fines|forfeiture\s+of\s+earned\s+(?:wages|salary|stipend))/i,
      /(?:discretionary\s+deduction|payroll\s+withholding\s+for\s+damage|recover\s+damages\s+from\s+salary)/i,
      /(?:forfeit\s+(?:entire\s+)?security\s+deposit|deposit\s+forfeiture|penalty\s+deducted\s+from\s+pay)/i
    ],
    negativePatterns: [
      /(?:statutory\s+tax\s+deductions|deductions\s+required\s+by\s+law|as\s+authorized\s+in\s+writing\s+by\s+employee)/i
    ],
    riskExplanation:
      'The company reserves unilateral power to deduct, withhold, or forfeit your earned salary or deposit for subjective damages, mistakes, or company losses.',
    whyItMatters:
      'Arbitrary wage deductions violate labor statutes in many jurisdictions, leaving you vulnerable to sudden pay cuts or withholding of final severance settlements.',
    suggestedQuestions: [
      'What objective evidentiary standard and formal dispute hearing must precede any proposed payroll deduction?',
      'Is there an independent escalation mechanism to challenge contested wage withholdings?'
    ],
    suggestedNegotiationPoints: [
      'Limit deductions strictly to mandatory statutory income taxes or explicit case-by-case written employee consent.',
      'Strike out all clauses permitting forfeiture of earned wages, stipends, or final settlement checks.'
    ]
  },

  // 4. Excessive or Unpaid Notice Period (High)
  {
    ruleId: 'RULE_UNPAID_NOTICE',
    category: 'Excessive / Unpaid Notice Period',
    severity: 'High',
    patterns: [
      /(?:ninety\s*\(?90\)?\s*days\s+(?:written\s+)?notice|notice\s+period\s+of\s+90\s+days|three\s*\(?3\)?\s*months\s+notice|60\s+days\s+notice|90\s+days\s+notice)/i,
      /(?:waive\s+(?:the\s+)?notice\s+period\s+without\s+(?:any\s+)?obligation\s+to\s+pay\s+salary\s+in\s+lieu)/i,
      /(?:unpaid\s+notice\s+period|working\s+without\s+compensation\s+during\s+notice|forfeiture\s+of\s+salary\s+in\s+lieu)/i,
      /(?:resignation\s+during\s+the\s+first\s+\d+\s+months\s+is\s+strictly\s+prohibited|cannot\s+resign\s+during\s+probation)/i
    ],
    riskExplanation:
      'This clause establishes an excessively long notice duration (e.g., 90 days), prohibits resignation during early stages, or allows the company to release you immediately without compensation.',
    whyItMatters:
      'A 90-day notice barrier often causes prospective employers to rescind job offers. Conversely, immediate termination without pay in lieu leaves you instantly income-less.',
    suggestedQuestions: [
      'Is the notice period mutual and reciprocal between both company and employee?',
      'Will the company disburse full compensation if it chooses to waive the notice period early?'
    ],
    suggestedNegotiationPoints: [
      'Adjust notice period to a standard 15–30 days during probation or internship, and 30 days for permanent full-time employment.',
      'Mandate that if the employer waives the notice duration, full salary in lieu of notice must be paid.'
    ]
  },

  // 5. Unilateral Contract Modification (High)
  {
    ruleId: 'RULE_UNILATERAL_MODIFICATION',
    category: 'Unilateral Modification',
    severity: 'High',
    patterns: [
      /(?:unilateral(?:ly)?\s+(?:right|modify|change|alter)|modify\s+.*?\s+at\s+its\s+sole\s+discretion)/i,
      /(?:reserves\s+the\s+right\s+to\s+(?:amend|alter|decrease|change|modify|reduce|adjust)\s+.*?(?:without\s+(?:prior\s+)?(?:consultation|notice|consent)|at\s+(?:its\s+)?sole\s+discretion|at\s+any\s+time))/i,
      /(?:reduce|decrease|alter|change|amend)\s+(?:compensation|salary|terms|wages|hours)\s+.*?(?:at\s+(?:its\s+)?sole\s+discretion|without\s+(?:prior\s+)?(?:notice|consent))/i,
      /(?:at\s+its\s+sole\s+discretion\s+and\s+without\s+liability|change\s+terms\s+without\s+notice)/i,
      /(?:company\s+may\s+alter\s+compensation\s+tiers|modify\s+terms\s+unilaterally)/i
    ],
    riskExplanation:
      'The contract grants one party the unilateral authority to alter terms, pay rates, duties, or policies without requiring your advance agreement or consent.',
    whyItMatters:
      'This eliminates contractual certainty, allowing management to reduce compensation, alter hours, or add burdensome duties at will.',
    suggestedQuestions: [
      'Why is mutual written consent not required for material adjustments to compensation or core responsibilities?',
      'What minimum guaranteed advance notice is provided before any company policy amendment takes effect?'
    ],
    suggestedNegotiationPoints: [
      'Require mutual written agreement signed by both parties for any material change to pay, responsibilities, or terms.',
      'Include an unconditional right to terminate without penalty if unfavorable contract amendments are introduced.'
    ]
  },

  // 6. Overreaching Intellectual Property (High)
  {
    ruleId: 'RULE_IP_OWNERSHIP',
    category: 'Intellectual Property Ownership',
    severity: 'High',
    patterns: [
      /(?:all\s+(?:worldwide\s+)?rights,\s*title,\s*and\s*interest\s+in\s+any\s+and\s+all\s+inventions)/i,
      /(?:whether\s+developed\s+on\s+company\s+premises.*?or\s+independently\s+on\s+personal\s+equipment)/i,
      /(?:during\s+off-duty\s+hours|personal\s+time\s+and\s+personal\s+devices|unrelated\s+to\s+the\s+company's\s+business)/i,
      /(?:assign(?:s)?\s+all\s+(?:prior|future|personal)\s+inventions|irrevocably\s+transfers\s+all\s+(?:future\s+)?creative\s+materials)/i,
      /(?:all\s+code,\s*inventions,\s*and\s*ideas\s+created\s+at\s+any\s+time)/i
    ],
    negativePatterns: [
      /(?:excluding\s+inventions\s+developed\s+on\s+personal\s+time\s+without\s+company\s+equipment|inventions\s+unrelated\s+to\s+company\s+business\s+are\s+excluded)/i
    ],
    riskExplanation:
      'The company claims total ownership over everything you produce—including independent side projects built on your own time, using your personal devices.',
    whyItMatters:
      'Signing broad IP assignments can forfeit ownership of personal open-source projects, personal side businesses, prior inventions, and independent creative works.',
    suggestedQuestions: [
      'Can we attach an Exhibit listing my pre-existing personal inventions and repositories to formally carve them out?',
      'Does the assignment apply solely to work developed within the direct scope of assigned company duties?'
    ],
    suggestedNegotiationPoints: [
      'Confine IP assignment exclusively to work created during working hours, using employer assets, and directly related to company business.',
      'Insert an explicit carve-out protecting personal hobbies, independent side projects, and prior inventions created off-duty.'
    ]
  },

  // 7. Termination Restrictions & Exit Bans (High)
  {
    ruleId: 'RULE_TERMINATION_RESTRICTIONS',
    category: 'Termination Restrictions',
    severity: 'High',
    patterns: [
      /(?:resignation\s+.*?\s+is\s+strictly\s+prohibited|shall\s+not\s+have\s+the\s+right\s+to\s+terminate)/i,
      /(?:without\s+prior\s+written\s+board\s+consent|subject\s+to\s+approval\s+by\s+management)/i,
      /(?:lock-in\s+period\s+of|cannot\s+resign\s+during|prohibited\s+from\s+resigning)/i,
      /(?:company\s+may\s+terminate\s+at\s+will.*?employee\s+may\s+not)/i,
      /(?:employee\s+cannot\s+terminate\s+this\s+agreement)/i
    ],
    riskExplanation:
      'The contract restricts your basic right to resign, making exit conditional upon board or manager approval or imposing an enforced lock-in.',
    whyItMatters:
      'Forced labor or requiring management permission to quit violates standard statutory employment rights. You cannot be legally compelled to work against your will.',
    suggestedQuestions: [
      'Under what clear conditions can an employee resign if the employer breaches its commitments?',
      'Why is management or board approval mandated before a resignation is processed?'
    ],
    suggestedNegotiationPoints: [
      'Ensure an unequivocal right to resign with standard reasonable notice (e.g., 14 to 30 days).',
      'Remove all clauses requiring employer approval or board consent before a resignation is accepted.'
    ]
  },

  // 8. Unlimited Liability & Indemnification (Medium)
  {
    ruleId: 'RULE_LIABILITY_INDEMNIFICATION',
    category: 'Liability and Indemnification',
    severity: 'Medium',
    patterns: [
      /(?:fully\s+indemnify,\s*defend,\s*and\s*hold\s+harmless|agree(?:s)?\s+to\s+indemnify\s+and\s+hold\s+harmless)/i,
      /(?:against\s+all\s+damages,\s*liabilities,\s*and\s+legal\s+expenses\s+incurred)/i,
      /(?:unlimited\s+personal\s+liability|solely\s+liable\s+for\s+any\s+and\s+all\s+losses|personally\s+liable\s+for\s+all\s+losses)/i,
      /(?:waives\s+all\s+claims\s+and\s+statutory\s+rights|hold\s+the\s+company\s+harmless\s+from\s+any\s+negligence)/i,
      /(?:indemnifies\s+the\s+company\s+against\s+third-party\s+claims)/i
    ],
    riskExplanation:
      'This clause imposes one-sided personal indemnification obligations on you for company damages, third-party disputes, or legal defense costs.',
    whyItMatters:
      'Uncapped personal indemnity can expose an individual worker or freelancer to ruinous financial liability for normal operational disputes.',
    suggestedQuestions: [
      'Is the company covered by corporate liability insurance that covers team members and contractors?',
      'Can personal liability be capped at the total fees paid under this agreement?'
    ],
    suggestedNegotiationPoints: [
      'Make indemnification mutual rather than purely one-sided.',
      'Cap total liability to the amount of compensation paid over the preceding 3 to 6 months.',
      'Exclude ordinary negligence, limiting indemnification solely to proven willful misconduct or fraud.'
    ]
  },

  // 9. Automatic Renewal & Evergreen Traps (Medium)
  {
    ruleId: 'RULE_AUTO_RENEWAL',
    category: 'Automatic Renewal',
    severity: 'Medium',
    patterns: [
      /(?:automatic(?:ally)?\s+renew(?:s|ed|al)?|evergreen\s+clause|shall\s+automatically\s+extend|auto-renew)/i,
      /(?:unless\s+(?:either\s+party\s+)?gives\s+written\s+notice\s+at\s+least\s+\d+\s+days\s+prior)/i,
      /(?:renew(?:s)?\s+for\s+successive\s+(?:one-year|annual|monthly)\s+periods)/i,
      /(?:automatically\s+roll\s+over)/i
    ],
    negativePatterns: [
      /(?:will\s+not\s+automatically\s+renew|requires\s+mutual\s+written\s+agreement\s+to\s+renew)/i
    ],
    riskExplanation:
      'The contract automatically renews for successive multi-month or annual terms unless you provide notice during a narrow opt-out window.',
    whyItMatters:
      'Missing the narrow cancellation window locks you into subsequent contract terms, recurring fees, or service commitments without explicit re-consent.',
    suggestedQuestions: [
      'What is the exact deadline and procedure for declining automatic extension?',
      'Does the provider deliver advance reminder notices before the renewal window closes?'
    ],
    suggestedNegotiationPoints: [
      'Require the other party to deliver written reminder notice 30 days prior to the auto-renewal deadline.',
      'Allow cancellation with 30 days notice at any point during renewed terms without termination penalties.'
    ]
  },

  // 10. Data Sharing & Personal Surveillance (Medium)
  {
    ruleId: 'RULE_DATA_PERMISSIONS',
    category: 'Data Sharing Permissions',
    severity: 'Medium',
    patterns: [
      /(?:unrestricted\s+rights\s+to\s+monitor|monitor,\s*record,\s*process,\s*store)/i,
      /(?:personal\s+device\s+telemetry|browsing\s+activity\s+and\s+personal\s+identifiers)/i,
      /(?:transmit\s+.*?\s+to\s+third-party\s+(?:offshore\s+)?marketing|share\s+personal\s+data\s+with\s+affiliates\s+and\s+third\s+parties\s+without\s+(?:further\s+)?notice)/i,
      /(?:irrevocable(?:,\s*unrestricted)?\s+rights\s+to\s+(?:collect|share|monetize)\s+(?:personal|user)\s+data)/i,
      /(?:surveillance\s+of\s+personal\s+devices|monitor\s+personal\s+communications)/i
    ],
    riskExplanation:
      'This provision grants broad permission to collect, monitor, track personal devices, or sell/transfer your personal data to third parties without further consent.',
    whyItMatters:
      'Broad data rights infringe on your privacy rights and may permit invasive surveillance of personal devices or sharing of sensitive credentials.',
    suggestedQuestions: [
      'Does company monitoring apply strictly to company-owned devices or to personal devices as well?',
      'Which specific third-party entities receive personal data, and for what defined operational purpose?'
    ],
    suggestedNegotiationPoints: [
      'Explicitly restrict employer monitoring solely to company-owned hardware and corporate network access.',
      'Remove all clauses permitting transfer or commercialization of employee/user personal data with marketing affiliates.'
    ]
  }
];

/**
 * Robust extraction of the sentence or clause surrounding the regex match.
 */
function extractClauseSnippet(text: string, matchIndex: number, matchLength: number): { snippet: string; start: number; end: number } {
  // Look backward for sentence boundary (. ! ? \n)
  let start = matchIndex;
  while (start > 0 && start > matchIndex - 140) {
    const char = text[start - 1];
    if (char === '\n' || char === '.' || char === ';') {
      break;
    }
    start--;
  }

  // Look forward for sentence boundary
  let end = matchIndex + matchLength;
  while (end < text.length && end < matchIndex + matchLength + 160) {
    const char = text[end];
    if (char === '\n' || char === '.' || char === ';') {
      end++; // Include the punctuation
      break;
    }
    end++;
  }

  let snippet = text.substring(start, end).trim();
  // Clean leading punctuation
  snippet = snippet.replace(/^[\.\;\:\s\-]+/, '');

  if (snippet.length < 10) {
    snippet = text.substring(Math.max(0, matchIndex - 30), Math.min(text.length, matchIndex + matchLength + 60)).trim();
  }

  return { snippet, start, end };
}

/**
 * Analyzes contract text against configured rules.
 * Also includes general danger keyword heuristics to guarantee zero false-safe reports on dangerous clauses.
 */
export function analyzeContractWithRules(fullText: string): DetectedClause[] {
  if (!fullText || typeof fullText !== 'string' || !fullText.trim()) {
    return [];
  }

  const detected: DetectedClause[] = [];
  const normalizedText = fullText;

  // 1. Run Configured Deterministic Rules
  for (const rule of CONTRACT_RULES) {
    // Check if any negative pattern exempts this rule
    let hasNegativeMatch = false;
    if (rule.negativePatterns) {
      for (const neg of rule.negativePatterns) {
        if (neg.test(normalizedText)) {
          hasNegativeMatch = true;
          break;
        }
      }
    }

    if (hasNegativeMatch) {
      continue;
    }

    for (const pattern of rule.patterns) {
      const match = pattern.exec(normalizedText);
      if (match && match.index !== undefined) {
        const { snippet, start, end } = extractClauseSnippet(normalizedText, match.index, match[0].length);
        const approxPage = Math.max(1, Math.floor(start / 2200) + 1);

        const isDuplicate = detected.some(
          d => d.ruleId === rule.ruleId || Math.abs(d.startIndex - start) < 60
        );

        if (!isDuplicate && snippet.length >= 10) {
          detected.push({
            ruleId: rule.ruleId,
            riskCategory: rule.category,
            matchedClauseText: snippet,
            pageNumber: approxPage,
            startIndex: start,
            endIndex: end,
            severity: rule.severity,
            riskExplanation: rule.riskExplanation,
            whyItMatters: rule.whyItMatters,
            suggestedQuestions: rule.suggestedQuestions,
            suggestedNegotiationPoints: rule.suggestedNegotiationPoints,
          });
          break; // move to next rule once detected
        }
      }
    }
  }

  // 2. Safety Net Heuristic: If zero rules matched but text contains blatant danger words (e.g. penalty, damages, bond, forfeit)
  if (detected.length === 0) {
    const dangerRegex = /(?:penalty\s+(?:of|amount)|liquidated\s+damages|must\s+pay|forfeiture|indemnify|non-compete|lock-in|bond)/i;
    const fallbackMatch = dangerRegex.exec(normalizedText);
    if (fallbackMatch && fallbackMatch.index !== undefined) {
      const { snippet, start, end } = extractClauseSnippet(normalizedText, fallbackMatch.index, fallbackMatch[0].length);
      detected.push({
        ruleId: 'RULE_HIGH_RISK_FINANCIAL_OBLIGATION',
        riskCategory: 'High-Risk Obligation / Penalty',
        matchedClauseText: snippet,
        pageNumber: 1,
        startIndex: start,
        endIndex: end,
        severity: 'High',
        riskExplanation: 'This clause contains restrictive terms concerning financial penalties, liquidated damages, or mandatory lock-in requirements.',
        whyItMatters: 'Mandatory penalties or indemnities can expose you to unexpected out-of-pocket liabilities.',
        suggestedQuestions: [
          'What exact circumstances trigger this penalty or financial liability?',
          'Can this obligation be waived or capped to a nominal sum?'
        ],
        suggestedNegotiationPoints: [
          'Propose striking out the penalty language entirely.',
          'Cap maximum liability to a small mutually agreed limit.'
        ]
      });
    }
  }

  return detected;
}
