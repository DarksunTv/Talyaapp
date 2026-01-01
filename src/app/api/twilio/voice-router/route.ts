// Smart Call Router - Routes incoming calls to AI or human agents
import { NextRequest, NextResponse } from 'next/server';

// Business hours configuration (EST)
const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
  days: [1, 2, 3, 4, 5], // Monday-Friday
};

/**
 * Check if current time is within business hours
 */
function isBusinessHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();

  return BUSINESS_HOURS.days.includes(day) && 
         hour >= BUSINESS_HOURS.start && 
         hour < BUSINESS_HOURS.end;
}

/**
 * Smart call router - decides whether to route to AI or human
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From')?.toString() || '';
    const to = formData.get('To')?.toString() || '';

    // Get routing preference from environment or default to smart routing
    const routingMode = process.env.CALL_ROUTING_MODE || 'smart';

    let routeToAI = false;

    switch (routingMode) {
      case 'always_ai':
        // Always route to AI
        routeToAI = true;
        break;

      case 'always_human':
        // Always route to human (forward to your phone)
        routeToAI = false;
        break;

      case 'smart':
      default:
        // Smart routing: AI outside business hours, human during business hours
        routeToAI = !isBusinessHours();
        break;
    }

    if (routeToAI) {
      // Route to AI - Return TwiML to gather info and forward to Vapi
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">Thank you for calling. Please hold while we connect you to our AI assistant.</Say>
          <Pause length="1"/>
          <Say voice="alice">Our AI assistant will help you with your roofing needs.</Say>
          <Redirect>${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice-ai</Redirect>
        </Response>`,
        {
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    } else {
      // Route to human - Forward to your business phone
      const forwardingNumber = process.env.FORWARDING_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER;
      
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">Thank you for calling. Please hold while we connect you to a representative.</Say>
          <Dial timeout="30" record="record-from-answer">
            <Number>${forwardingNumber}</Number>
          </Dial>
          <Say voice="alice">Sorry, no one is available right now. Please leave a message after the beep.</Say>
          <Record maxLength="120" transcribe="true" />
        </Response>`,
        {
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }
  } catch (error) {
    console.error('Call router error:', error);
    
    // Fallback to voicemail
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">We're experiencing technical difficulties. Please leave a message after the beep.</Say>
        <Record maxLength="120" transcribe="true" />
      </Response>`,
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}
