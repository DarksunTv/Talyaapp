// Twilio Call Status Webhook Handler
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

    // Validate Twilio signature
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;
    
    if (!twilioService.validateWebhook(signature, url, params)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = await createClient();
    const callSid = params.CallSid;
    const callStatus = params.CallStatus;
    const callDuration = params.CallDuration ? parseInt(params.CallDuration) : null;
    const recordingUrl = params.RecordingUrl;

    // Find communication record by Twilio SID
    const { data: communication } = await supabase
      .from('crm_communications')
      .select('*')
      .eq('twilio_sid', callSid)
      .single();

    if (communication) {
      // Update communication with call details
      const updates: any = {};

      if (callDuration) {
        updates.duration_seconds = callDuration;
      }

      if (recordingUrl) {
        updates.recording_url = recordingUrl;
      }

      if (callStatus === 'completed') {
        updates.content = `Call completed (${callDuration}s)`;
      }

      await supabase
        .from('crm_communications')
        .update(updates)
        .eq('id', communication.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Twilio status webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
