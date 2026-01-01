// OpenRouter AI Chat Service - Context-aware conversations
// OpenRouter provides access to multiple AI models through a single API

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

if (!OPENROUTER_API_KEY) {
  console.warn('OpenRouter API key not configured');
}

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
 * Generate context-aware chat response using OpenRouter
 */
export async function generateChatResponse(
  message: string,
  projectContext: ProjectContext,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API not configured');
  }

  try {
    // Build context prompt
    const contextPrompt = buildContextPrompt(projectContext);

    // Build conversation history for OpenRouter format
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant for a roofing CRM system. You help users manage their roofing projects.

PROJECT CONTEXT:
${contextPrompt}

Provide helpful, concise responses based on the project context. If the question is about the project, use the context provided. If it's a general question, answer it professionally.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'TalyaCRM'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter chat error:', error);
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
