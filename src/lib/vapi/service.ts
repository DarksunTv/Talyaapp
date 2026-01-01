// Vapi.ai Service Wrapper for AI Calling
export interface VapiCallParams {
  phoneNumber: string;
  assistantId?: string;
  customerContext?: {
    name: string;
    previousInteractions?: string;
    projectDetails?: string;
  };
}

export interface VapiAssistantConfig {
  name: string;
  model: {
    provider: string;
    model: string;
    temperature: number;
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  firstMessage: string;
  systemPrompt: string;
}

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = 'https://api.vapi.ai';

if (!VAPI_API_KEY) {
  console.warn('Vapi API key not configured');
}

export const vapiService = {
  /**
   * Initiate AI call with customer context
   */
  async makeAICall({ phoneNumber, assistantId, customerContext }: VapiCallParams) {
    if (!VAPI_API_KEY) {
      throw new Error('Vapi API key not configured');
    }

    const assistant = assistantId || process.env.VAPI_ASSISTANT_ID;
    if (!assistant) {
      throw new Error('Vapi assistant ID not configured');
    }

    try {
      // Build context-aware system prompt
      let contextPrompt = '';
      if (customerContext) {
        contextPrompt = `
Customer Information:
- Name: ${customerContext.name}
${customerContext.previousInteractions ? `- Previous Interactions: ${customerContext.previousInteractions}` : ''}
${customerContext.projectDetails ? `- Current Project: ${customerContext.projectDetails}` : ''}

Use this context to have a personalized conversation. Reference previous interactions naturally.
`;
      }

      const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId: assistant,
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
          customer: {
            number: phoneNumber,
          },
          // Use Twilio number as caller ID for unified experience
          callerIdNumber: process.env.TWILIO_PHONE_NUMBER,
          assistantOverrides: customerContext ? {
            variableValues: {
              customerContext: contextPrompt,
            },
          } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vapi API error: ${error}`);
      }

      const data = await response.json();
      return {
        success: true,
        callId: data.id,
        status: data.status,
      };
    } catch (error) {
      console.error('Vapi call error:', error);
      throw new Error(`Failed to initiate AI call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Create or update Vapi assistant with roofing-specific prompts
   */
  async createAssistant(config: VapiAssistantConfig) {
    if (!VAPI_API_KEY) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vapi API error: ${error}`);
      }

      const data = await response.json();
      return {
        success: true,
        assistantId: data.id,
      };
    } catch (error) {
      console.error('Vapi assistant creation error:', error);
      throw new Error(`Failed to create assistant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get call details and transcript
   */
  async getCall(callId: string) {
    if (!VAPI_API_KEY) {
      throw new Error('Vapi API key not configured');
    }

    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vapi API error: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Vapi get call error:', error);
      throw new Error(`Failed to get call details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};
