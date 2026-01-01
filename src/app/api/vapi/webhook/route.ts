// Vapi.ai Webhook Handler for AI Call Events
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateCommunicationSummary } from '@/app/actions/communications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, call } = body;

    const supabase = await createClient();

    // Handle different Vapi event types
    switch (type) {
      case 'call.started':
        // Call has started
        console.log('Vapi call started:', call.id);
        break;

      case 'call.ended':
        // Call has ended, process transcript and generate summary
        if (call.transcript && call.id) {
          // Find communication record
          const { data: communications } = await supabase
            .from('crm_communications')
            .select('id')
            .eq('type', 'ai_call')
            .order('created_at', { ascending: false })
            .limit(10);

          if (communications && communications.length > 0) {
            // Update the most recent AI call with transcript
            const transcript = call.transcript
              .map((t: any) => `${t.role}: ${t.content}`)
              .join('\n');

            await updateCommunicationSummary(communications[0].id, transcript);
          }

          // Update with recording URL if available
          if (call.recordingUrl) {
            await supabase
              .from('crm_communications')
              .update({
                recording_url: call.recordingUrl,
                duration_seconds: call.duration,
              })
              .eq('id', communications?.[0]?.id);
          }
        }
        break;

      case 'transcript.updated':
        // Real-time transcript update (optional)
        console.log('Transcript updated:', call.id);
        break;

      default:
        console.log('Unknown Vapi event:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
