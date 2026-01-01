// AI Voice Handler - Connects call to Vapi AI assistant
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From')?.toString() || '';
    const callSid = formData.get('CallSid')?.toString() || '';

    // Try to find customer by phone number
    const supabase = await createClient();
    const { data: customer } = await supabase
      .from('crm_customers')
      .select('id, name, company_id')
      .eq('phone', from)
      .single();

    let customerContext = '';
    if (customer) {
      // Get recent interactions for context
      const { data: interactions } = await supabase
        .from('crm_communications')
        .select('type, content, ai_summary, created_at')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (interactions && interactions.length > 0) {
        customerContext = `Customer: ${customer.name}. Recent interactions: ${interactions.length} previous contacts.`;
      } else {
        customerContext = `Customer: ${customer.name}. First time caller.`;
      }
    } else {
      customerContext = 'New caller, no previous history.';
    }

    // Log the incoming call
    if (customer) {
      await supabase
        .from('crm_communications')
        .insert({
          company_id: customer.company_id,
          customer_id: customer.id,
          type: 'ai_call',
          direction: 'inbound',
          content: `Incoming AI call from ${from}`,
          twilio_sid: callSid,
        });
    }

    // Return TwiML to connect to Vapi
    // Note: This is a simplified version. For full Vapi integration,
    // you may need to use Vapi's SIP or WebRTC connection
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">Hello! I'm your AI assistant from Talya Roofing. How can I help you today?</Say>
        <Gather input="speech" timeout="3" action="${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice-ai-response">
          <Say voice="alice">Please tell me about your roofing needs.</Say>
        </Gather>
        <Say voice="alice">I didn't hear anything. Please call back when you're ready.</Say>
        <Hangup/>
      </Response>`,
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (error) {
    console.error('AI voice handler error:', error);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="alice">I'm sorry, I'm having trouble connecting right now. Please try again later.</Say>
        <Hangup/>
      </Response>`,
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}
