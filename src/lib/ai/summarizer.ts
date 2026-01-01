// Google Gemini AI Service for Summarization
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Google Gemini API key not configured');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

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

export const aiSummarizer = {
  /**
   * Summarize call transcript with key insights
   */
  async summarizeCall(transcript: string): Promise<CallSummary> {
    if (!genAI) {
      throw new Error('Gemini API not configured');
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
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
    if (!genAI) {
      throw new Error('Gemini API not configured');
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const conversationText = messages.join('\n');
      const prompt = `Analyze this SMS conversation between a roofing company and a customer:

${conversationText}

Provide a JSON response with:
1. summary: Brief summary of the conversation
2. sentiment: Overall sentiment (positive, neutral, or negative)
3. topics: Array of main topics discussed

Return ONLY valid JSON, no markdown formatting.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
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
    if (!genAI || interactions.length === 0) {
      return '';
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const interactionHistory = interactions.map(i => 
        `[${i.type.toUpperCase()}] ${new Date(i.created_at).toLocaleDateString()}: ${i.content}`
      ).join('\n');

      const prompt = `Based on these previous interactions with a customer, create a brief context summary (2-3 sentences) that an AI caller should know:

${interactionHistory}

Focus on: customer preferences, previous concerns, project status, and communication style.
Keep it concise and actionable.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Context generation error:', error);
      return '';
    }
  },
};
