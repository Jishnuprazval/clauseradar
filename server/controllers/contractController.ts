import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { db } from '../config/db';
import { extractTextFromPdfBuffer } from '../services/pdfService';
import { analyzeContractWithRules } from '../services/ruleEngine';
import { calculateRiskScore } from '../services/riskScoring';
import { enhanceAnalysisWithGemini } from '../services/explanationService';
import { DEMO_INTERNSHIP_CONTRACT } from '../data/demoContract';

export async function uploadPdfContract(req: AuthRequest, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Please upload a valid PDF contract file.' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Unsupported file type. Only PDF contracts are accepted.' });
    }

    const { contractName, contractType } = req.body;
    const resolvedName = (contractName && contractName.trim()) || file.originalname.replace(/\.pdf$/i, '');
    const resolvedType = contractType || 'Employment Agreement';

    // Extract text from PDF
    const extractionResult = await extractTextFromPdfBuffer(file.buffer);
    const extractedText = extractionResult.text;

    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({
        error: 'Unable to extract text from this PDF. Please ensure the document contains selectable text and is not an image-only scan.',
      });
    }

    const userId = req.user?.userId || 'guest-user-' + Date.now();

    // Save contract
    const contract = await db.createContract({
      userId,
      contractName: resolvedName,
      contractType: resolvedType,
      originalFileName: file.originalname,
      extractedText,
      status: 'analyzed',
    });

    // Run custom rule-based detection engine
    const detectedClauses = analyzeContractWithRules(extractedText);
    const scoreResult = calculateRiskScore(detectedClauses);

    // Run optional Gemini AI plain-language enhancement
    const aiEnhancement = await enhanceAnalysisWithGemini(resolvedType, extractedText, detectedClauses);

    let finalSummary = scoreResult.summary;
    if (aiEnhancement?.executiveSummary) {
      if (scoreResult.riskScore >= 50) {
        finalSummary = `${scoreResult.summary} (AI Note: ${aiEnhancement.executiveSummary})`;
      } else {
        finalSummary = aiEnhancement.executiveSummary;
      }
    }

    // Save analysis record
    const analysis = await db.createAnalysis({
      userId,
      contractId: contract._id,
      contractName: contract.contractName,
      contractType: contract.contractType,
      riskScore: scoreResult.riskScore,
      riskLevel: scoreResult.riskLevel,
      totalIssues: scoreResult.totalIssues,
      severityBreakdown: scoreResult.severityBreakdown,
      detectedClauses,
      analysisSummary: finalSummary,
      aiEnhancement: aiEnhancement || undefined,
    });

    return res.status(201).json({
      message: 'Contract analyzed successfully',
      contractId: contract._id,
      analysisId: analysis._id,
      analysis,
      contract,
    });
  } catch (error: any) {
    console.error('Error analyzing uploaded PDF:', error);
    return res.status(500).json({ error: error.message || 'Failed to process and analyze PDF contract.' });
  }
}

export async function analyzeTextContract(req: AuthRequest, res: Response) {
  try {
    const { contractName, contractType, contractText } = req.body;

    if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 20) {
      return res.status(400).json({
        error: 'Contract text must be at least 20 characters long to perform meaningful risk analysis.',
      });
    }

    const resolvedName = (contractName && contractName.trim()) || 'Pasted Agreement ' + new Date().toLocaleDateString();
    const resolvedType = contractType || 'Other';
    const userId = req.user?.userId || 'guest-user-' + Date.now();

    // Save contract
    const contract = await db.createContract({
      userId,
      contractName: resolvedName,
      contractType: resolvedType,
      originalFileName: 'text_input.txt',
      extractedText: contractText.trim(),
      status: 'analyzed',
    });

    // Run custom rule engine
    const detectedClauses = analyzeContractWithRules(contractText);
    const scoreResult = calculateRiskScore(detectedClauses);

    // Run optional Gemini plain language enhancement
    const aiEnhancement = await enhanceAnalysisWithGemini(resolvedType, contractText, detectedClauses);

    let finalSummary = scoreResult.summary;
    if (aiEnhancement?.executiveSummary) {
      if (scoreResult.riskScore >= 50) {
        finalSummary = `${scoreResult.summary} (AI Note: ${aiEnhancement.executiveSummary})`;
      } else {
        finalSummary = aiEnhancement.executiveSummary;
      }
    }

    // Save analysis
    const analysis = await db.createAnalysis({
      userId,
      contractId: contract._id,
      contractName: contract.contractName,
      contractType: contract.contractType,
      riskScore: scoreResult.riskScore,
      riskLevel: scoreResult.riskLevel,
      totalIssues: scoreResult.totalIssues,
      severityBreakdown: scoreResult.severityBreakdown,
      detectedClauses,
      analysisSummary: finalSummary,
      aiEnhancement: aiEnhancement || undefined,
    });

    return res.status(201).json({
      message: 'Contract analyzed successfully',
      contractId: contract._id,
      analysisId: analysis._id,
      analysis,
      contract,
    });
  } catch (error: any) {
    console.error('Error analyzing contract text:', error);
    return res.status(500).json({ error: 'Failed to process contract text.' });
  }
}

export async function getSampleDemo(req: AuthRequest, res: Response) {
  return res.json({
    contractName: 'Sample Apex Internship Agreement',
    contractType: 'Internship Offer Letter',
    contractText: DEMO_INTERNSHIP_CONTRACT,
    description:
      'Contains realistic high-risk clauses including a 2-year service bond, $3,500 penalty, 90-day notice, unilateral salary deductions, and restrictive non-compete terms.',
  });
}

export async function getUserContracts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId || 'guest-user';
    const contracts = await db.getUserContracts(userId);
    return res.json({ contracts });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch contracts.' });
  }
}

export async function getContractById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const contract = await db.getContractById(id, userId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found or access unauthorized.' });
    }
    return res.json({ contract });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to load contract.' });
  }
}

export async function deleteContract(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const success = await db.deleteContract(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Contract not found or not owned by user.' });
    }
    return res.json({ message: 'Contract and associated analysis deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete contract.' });
  }
}
