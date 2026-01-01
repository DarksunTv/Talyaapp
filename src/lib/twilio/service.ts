// Twilio Service Wrapper
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('Twilio credentials not configured');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Export client for direct use
export const twilioClient = client;

export interface SendSMSParams {
  to: string;
  message: string;
}

export interface MakeCallParams {
  to: string;
  callbackUrl?: string;
}

export const twilioService = {
  /**
   * Send SMS message via Twilio
   */
  async sendSMS({ to, message }: SendSMSParams) {
    if (!client || !twilioPhoneNumber) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const result = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: to,
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Initiate voice call via Twilio
   */
  async makeCall({ to, callbackUrl }: MakeCallParams) {
    if (!client || !twilioPhoneNumber) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const result = await client.calls.create({
        to: to,
        from: twilioPhoneNumber,
        url: callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true,
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      console.error('Twilio call error:', error);
      throw new Error(`Failed to make call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Validate webhook signature for security
   */
  validateWebhook(signature: string, url: string, params: Record<string, string>) {
    if (!authToken) {
      return false;
    }
    return twilio.validateRequest(authToken, signature, url, params);
  },
};
