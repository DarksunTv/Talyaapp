'use server'

import { createClient } from '@/lib/supabase/server'
import { generateChatResponse, getSuggestedQuestions, type ProjectContext } from '@/lib/ai/chat'

/**
 * Send chat message and get AI response
 */
export async function sendChatMessage(projectId: string, message: string) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get user's profile for company_id
  const { data: profile } = await supabase
    .from('crm_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  try {
    // Get project context
    const { data: project } = await supabase
      .from('crm_projects')
      .select(`
        *,
        customer:crm_customers(name, phone, email)
      `)
      .eq('id', projectId)
      .single()

    if (!project) return { error: 'Project not found' }

    // Get recent activity
    const { data: activities } = await supabase
      .from('crm_activity_logs')
      .select('action, details, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get photo count
    const { count: photoCount } = await supabase
      .from('crm_photos')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Get communication count
    const { count: commCount } = await supabase
      .from('crm_communications')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Get conversation history
    const { data: history } = await supabase
      .from('crm_chat_messages')
      .select('role, content')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .limit(10)

    // Build project context
    const projectContext: ProjectContext = {
      projectName: project.name,
      customerName: project.customer?.name || 'Unknown',
      status: project.status,
      address: project.address,
      insuranceInfo: project.insurance_claim_number ? {
        claimNumber: project.insurance_claim_number,
        company: project.insurance_company,
        status: project.claim_status,
      } : undefined,
      recentActivity: activities?.map(a => `${a.action}: ${JSON.stringify(a.details)}`),
      photoCount: photoCount || 0,
      communicationCount: commCount || 0,
    }

    // Generate AI response
    const response = await generateChatResponse(
      message,
      projectContext,
      history || []
    )

    // Save user message
    await supabase.from('crm_chat_messages').insert({
      company_id: profile.company_id,
      project_id: projectId,
      role: 'user',
      content: message,
      created_by: user.id,
    })

    // Save assistant response
    await supabase.from('crm_chat_messages').insert({
      company_id: profile.company_id,
      project_id: projectId,
      role: 'assistant',
      content: response,
      context_used: projectContext,
      created_by: user.id,
    })

    return { success: true, response }
  } catch (error) {
    console.error('Chat error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to send message' }
  }
}

/**
 * Get chat history for a project
 */
export async function getChatHistory(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crm_chat_messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to get chat history:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

/**
 * Clear chat history for a project
 */
export async function clearChatHistory(projectId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('crm_chat_messages')
    .delete()
    .eq('project_id', projectId)

  if (error) {
    console.error('Failed to clear chat history:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Get suggested questions for a project
 */
export async function getSuggestedQuestionsForProject(projectId: string) {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('crm_projects')
    .select('status')
    .eq('id', projectId)
    .single()

  if (!project) return { error: 'Project not found', data: null }

  const questions = getSuggestedQuestions(project.status)
  return { data: questions, error: null }
}
