'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActivityAction } from '@/types'

interface LogActivityParams {
  action: ActivityAction
  projectId?: string
  entityType?: string
  entityId?: string
  details?: Record<string, unknown>
}

export async function logActivity({
  action,
  projectId,
  entityType,
  entityId,
  details
}: LogActivityParams) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get user's profile to get company_id
  const { data: profile } = await supabase
    .from('crm_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  // Insert activity log
  const { error } = await supabase
    .from('crm_activity_logs')
    .insert({
      company_id: profile.company_id,
      project_id: projectId || null,
      user_id: user.id,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || null,
    })

  if (error) {
    console.error('Failed to log activity:', error)
    return { error: error.message }
  }

  return { success: true }
}

// Helper function to get activity feed for a project
export async function getProjectActivity(projectId: string, limit = 20) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crm_activity_logs')
    .select(`
      *,
      user:crm_profiles(name, email, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to get activity:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}
