// OpenRouter AI Service for Summarization
// OpenRouter provides access to multiple AI models through a single API

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free';

if (!OPENROUTER_API_KEY) {
  console.warn('OpenRouter API key not configured');
}

export interface CallSummary {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  actionItems: string[];
  nextSteps: string[];
}

export interface SMSSummary {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
}

async function callOpenRouter(prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API not configured');
  }

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
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export const aiSummarizer = {
  /**
   * Summarize call transcript with key insights
   */
  async summarizeCall(transcript: string): Promise<CallSummary> {
    try {
      const prompt = `You are analyzing a phone call transcript between a roofing company representative and a customer. 

Transcript:
${transcript}

Provide a structured analysis in JSON format with:
1. summary: A concise 2-3 sentence summary of the call
2. keyPoints: Array of 3-5 key discussion points
3. sentiment: Overall customer sentiment (positive, neutral, or negative)
4. actionItems: Array of specific tasks or commitments made
5. nextSteps: Array of recommended follow-up actions

Return ONLY valid JSON, no markdown formatting.`;

      const response = await callOpenRouter(prompt);
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('AI summarization error:', error);
      // Return fallback summary
      return {
        summary: 'Call completed. Unable to generate AI summary.',
        keyPoints: [],
        sentiment: 'neutral',
        actionItems: [],
        nextSteps: [],
      };
    }
  },

  /**
   * Summarize SMS conversation thread
   */
  async summarizeSMS(messages: string[]): Promise<SMSSummary> {
    try {
      const conversationText = messages.join('\n');
      const prompt = `Analyze this SMS conversation between a roofing company and a customer:

${conversationText}

Provide a JSON response with:
1. summary: Brief summary of the conversation
2. sentiment: Overall sentiment (positive, neutral, or negative)
3. topics: Array of main topics discussed

Return ONLY valid JSON, no markdown formatting.`;

      const response = await callOpenRouter(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('AI SMS summarization error:', error);
      return {
        summary: 'SMS conversation',
        sentiment: 'neutral',
        topics: [],
      };
    }
  },

  /**
   * Generate customer context for AI caller
   */
  async generateCustomerContext(interactions: Array<{
    type: string;
    content: string;
    created_at: string;
  }>): Promise<string> {
    if (!OPENROUTER_API_KEY || interactions.length === 0) {
      return '';
    }

    try {
      const interactionHistory = interactions.map(i => 
        `[${i.type.toUpperCase()}] ${new Date(i.created_at).toLocaleDateString()}: ${i.content}`
      ).join('\n');

      const prompt = `Based on these previous interactions with a customer, create a brief context summary (2-3 sentences) that an AI caller should know:

${interactionHistory}

Focus on: customer preferences, previous concerns, project status, and communication style.
Keep it concise and actionable.`;

      return await callOpenRouter(prompt);
    } catch (error) {
      console.error('Context generation error:', error);
      return '';
    }
  },
};
