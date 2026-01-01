// Twilio Webhook Handler for SMS and Call Status Updates
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { twilioService } from '@/lib/twilio/service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    // Validate Twilio signature for security
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;
    
    if (!twilioService.validateWebhook(signature, url, params)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = await createClient();

    // Handle incoming SMS
    if (params.MessageSid && params.From && params.Body) {
      // Find customer by phone number
      const { data: customer } = await supabase
        .from('crm_customers')
        .select('id, company_id')
        .eq('phone', params.From)
        .single();

      if (customer) {
        // Log incoming SMS
        await supabase
          .from('crm_communications')
          .insert({
            company_id: customer.company_id,
            customer_id: customer.id,
            type: 'sms',
            direction: 'inbound',
            content: params.Body,
            twilio_sid: params.MessageSid,
          });
      }

      // Respond with TwiML (optional auto-reply)
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>Thank you for your message. We'll get back to you soon!</Message>
        </Response>`,
        {
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
