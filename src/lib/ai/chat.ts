// Gemini Chat Service - Context-aware conversations
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Google Gemini API key not configured');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProjectContext {
  projectName: string;
  customerName: string;
  status: string;
  address: string;
  insuranceInfo?: {
    claimNumber?: string;
    company?: string;
    status?: string;
  };
  recentActivity?: string[];
  photoCount?: number;
  communicationCount?: number;
}

/**
 * Generate context-aware chat response using Gemini
 */
export async function generateChatResponse(
  message: string,
  projectContext: ProjectContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API not initialized');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context prompt
    const contextPrompt = buildContextPrompt(projectContext);

    // Build conversation history
    const historyText = conversationHistory
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Combine everything
    const fullPrompt = `You are an AI assistant for a roofing CRM system. You help users manage their roofing projects.

PROJECT CONTEXT:
${contextPrompt}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ''}
USER QUESTION: ${message}

Provide a helpful, concise response based on the project context. If the question is about the project, use the context provided. If it's a general question, answer it professionally.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini chat error:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Build context prompt from project data
 */
function buildContextPrompt(context: ProjectContext): string {
  const parts: string[] = [];

  parts.push(`Project: ${context.projectName}`);
  parts.push(`Customer: ${context.customerName}`);
  parts.push(`Status: ${context.status}`);
  parts.push(`Address: ${context.address}`);

  if (context.insuranceInfo?.claimNumber) {
    parts.push(`\nInsurance Claim: ${context.insuranceInfo.claimNumber}`);
    if (context.insuranceInfo.company) {
      parts.push(`Insurance Company: ${context.insuranceInfo.company}`);
    }
    if (context.insuranceInfo.status) {
      parts.push(`Claim Status: ${context.insuranceInfo.status}`);
    }
  }

  if (context.photoCount !== undefined) {
    parts.push(`\nPhotos: ${context.photoCount} uploaded`);
  }

  if (context.communicationCount !== undefined) {
    parts.push(`Communications: ${context.communicationCount} interactions`);
  }

  if (context.recentActivity && context.recentActivity.length > 0) {
    parts.push(`\nRecent Activity:`);
    context.recentActivity.forEach((activity) => {
      parts.push(`- ${activity}`);
    });
  }

  return parts.join('\n');
}

/**
 * Generate suggested questions based on project status
 */
export function getSuggestedQuestions(projectStatus: string): string[] {
  const commonQuestions = [
    "What's the current status of this project?",
    "Summarize recent activity",
    "What are the next steps?",
  ];

  const statusSpecific: Record<string, string[]> = {
    lead: [
      "How should I follow up with this lead?",
      "What information do I need to collect?",
    ],
    inspection: [
      "What should I look for during inspection?",
      "How do I document damage?",
    ],
    proposal: [
      "What should be included in the proposal?",
      "How do I calculate the estimate?",
    ],
    contract: [
      "What documents are needed?",
      "How do I process the contract?",
    ],
    production: [
      "What's the project timeline?",
      "Are there any delays or issues?",
    ],
    completed: [
      "Was the project successful?",
      "What follow-up is needed?",
    ],
  };

  return [
    ...commonQuestions,
    ...(statusSpecific[projectStatus] || []),
  ];
}
