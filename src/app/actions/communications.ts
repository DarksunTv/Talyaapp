'use server';

import { createClient } from '@/lib/supabase/server';
import { twilioService } from '@/lib/twilio/service';
import { vapiService } from '@/lib/vapi/service';
import { aiSummarizer } from '@/lib/ai/summarizer';
import { logActivity } from './activity';

export interface SendSMSParams {
  customerId: string;
  projectId?: string;
  phoneNumber: string;
  message: string;
}

export interface MakeCallParams {
  customerId: string;
  projectId?: string;
  phoneNumber: string;
}

export interface MakeAICallParams {
  customerId: string;
  projectId?: string;
  phoneNumber: string;
  customerName: string;
}

/**
 * Send SMS to customer via Twilio
 */
export async function sendSMS({ customerId, projectId, phoneNumber, message }: SendSMSParams) {
  const supabase = await createClient();
  
  // Get current user and company
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('crm_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  try {
    // Send SMS via Twilio
    const result = await twilioService.sendSMS({
      to: phoneNumber,
      message,
    });

    // Log communication in database
    const { data: communication, error } = await supabase
      .from('crm_communications')
      .insert({
        company_id: profile.company_id,
        customer_id: customerId,
        project_id: projectId,
        type: 'sms',
        direction: 'outbound',
        content: message,
        twilio_sid: result.sid,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity({
      action: 'sms.sent',
      entityType: 'customer',
      entityId: customerId,
      details: {
        message: message.substring(0, 100),
        phone: phoneNumber,
      },
    });

    return { success: true, communication };
  } catch (error) {
    console.error('Send SMS error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send SMS');
  }
}

/**
 * Make voice call via Twilio
 */
export async function makeCall({ customerId, projectId, phoneNumber }: MakeCallParams) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('crm_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  try {
    // Initiate call via Twilio
    const result = await twilioService.makeCall({
      to: phoneNumber,
    });

    // Log communication
    const { data: communication, error } = await supabase
      .from('crm_communications')
      .insert({
        company_id: profile.company_id,
        customer_id: customerId,
        project_id: projectId,
        type: 'call',
        direction: 'outbound',
        twilio_sid: result.sid,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity({
      action: 'call.initiated',
      entityType: 'customer',
      entityId: customerId,
      details: {
        phone: phoneNumber,
      },
    });

    return { success: true, communication };
  } catch (error) {
    console.error('Make call error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to make call');
  }
}

/**
 * Make AI call via Vapi with customer context memory
 */
export async function makeAICall({ customerId, projectId, phoneNumber, customerName }: MakeAICallParams) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('crm_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  try {
    // Get previous interactions for context
    const { data: previousInteractions } = await supabase
      .from('crm_communications')
      .select('type, content, ai_summary, created_at')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Generate customer context using AI
    let customerContext = '';
    if (previousInteractions && previousInteractions.length > 0) {
      customerContext = await aiSummarizer.generateCustomerContext(
        previousInteractions.map(i => ({
          type: i.type,
          content: i.content || i.ai_summary || '',
          created_at: i.created_at,
        }))
      );
    }

    // Get project details if available
    let projectDetails = '';
    if (projectId) {
      const { data: project } = await supabase
        .from('crm_projects')
        .select('name, status, address')
        .eq('id', projectId)
        .single();

      if (project) {
        projectDetails = `Project: ${project.name} (${project.status}) at ${project.address}`;
      }
    }

    // Initiate AI call with context
    const result = await vapiService.makeAICall({
      phoneNumber,
      customerContext: {
        name: customerName,
        previousInteractions: customerContext,
        projectDetails,
      },
    });

    // Log communication
    const { data: communication, error } = await supabase
      .from('crm_communications')
      .insert({
        company_id: profile.company_id,
        customer_id: customerId,
        project_id: projectId,
        type: 'ai_call',
        direction: 'outbound',
        content: `AI call initiated with context: ${customerContext.substring(0, 200)}`,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity({
      action: 'ai_call.initiated',
      entityType: 'customer',
      entityId: customerId,
      details: {
        phone: phoneNumber,
        callId: result.callId,
        hasContext: !!customerContext,
      },
    });

    return { success: true, communication, callId: result.callId };
  } catch (error) {
    console.error('Make AI call error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to make AI call');
  }
}

/**
 * Get all communications for a customer
 */
export async function getCustomerCommunications(customerId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('crm_communications')
    .select(`
      *,
      created_by_profile:crm_profiles!crm_communications_created_by_fkey(name, email)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}

/**
 * Update communication with AI summary (called after call completes)
 */
export async function updateCommunicationSummary(communicationId: string, transcript: string) {
  const supabase = await createClient();
  
  try {
    // Generate AI summary
    const summary = await aiSummarizer.summarizeCall(transcript);

    // Update communication record
    const { error } = await supabase
      .from('crm_communications')
      .update({
        content: transcript,
        ai_summary: JSON.stringify(summary),
      })
      .eq('id', communicationId);

    if (error) throw error;

    return { success: true, summary };
  } catch (error) {
    console.error('Update summary error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update summary');
  }
}
