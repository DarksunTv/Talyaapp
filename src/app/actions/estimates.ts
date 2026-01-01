'use server'

import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activity'

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string; // 'sq ft', 'linear ft', 'each', etc.
  unitPrice: number;
  total: number;
}

export interface EstimateData {
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  notes?: string;
  validUntil?: string;
}

/**
 * Create a new estimate
 */
export async function createEstimate(projectId: string, estimateData: EstimateData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('crm_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

  try {
    const { data, error } = await supabase
      .from('crm_estimates')
      .insert({
        project_id: projectId,
        company_id: profile.company_id,
        line_items: estimateData.lineItems,
        subtotal: estimateData.subtotal,
        tax: estimateData.tax,
        total: estimateData.total,
        notes: estimateData.notes,
        valid_until: estimateData.validUntil,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity({
      projectId,
      action: 'estimate.created',
      entityType: 'estimate',
      entityId: data.id,
      details: { total: estimateData.total },
    })

    return { success: true, data }
  } catch (error) {
    console.error('Create estimate error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create estimate' }
  }
}

/**
 * Update an existing estimate
 */
export async function updateEstimate(estimateId: string, estimateData: EstimateData) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('crm_estimates')
      .update({
        line_items: estimateData.lineItems,
        subtotal: estimateData.subtotal,
        tax: estimateData.tax,
        total: estimateData.total,
        notes: estimateData.notes,
        valid_until: estimateData.validUntil,
        updated_at: new Date().toISOString(),
      })
      .eq('id', estimateId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Update estimate error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update estimate' }
  }
}

/**
 * Get all estimates for a project
 */
export async function getProjectEstimates(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crm_estimates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get estimates:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

/**
 * Update estimate status
 */
export async function updateEstimateStatus(
  estimateId: string,
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('crm_estimates')
      .update({ status })
      .eq('id', estimateId)
      .select()
      .single()

    if (error) throw error

    // Log activity
    const { data: estimate } = await supabase
      .from('crm_estimates')
      .select('project_id')
      .eq('id', estimateId)
      .single()

    if (estimate) {
      await logActivity({
        projectId: estimate.project_id,
        action: `estimate.${status}` as any,
        entityType: 'estimate',
        entityId: estimateId,
        details: { status },
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Update estimate status error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update status' }
  }
}

/**
 * Send estimate to customer
 */
export async function sendEstimate(estimateId: string) {
  const supabase = await createClient()

  try {
    // Get estimate with project and customer data
    const { data: estimate } = await supabase
      .from('crm_estimates')
      .select(`
        *,
        project:crm_projects(
          *,
          customer:crm_customers(*)
        )
      `)
      .eq('id', estimateId)
      .single()

    if (!estimate) throw new Error('Estimate not found')

    // Update status to sent
    await updateEstimateStatus(estimateId, 'sent')

    // TODO: Send email/SMS to customer with estimate
    // This would integrate with your email service (SendGrid, etc.)
    // For now, just mark as sent

    return { success: true }
  } catch (error) {
    console.error('Send estimate error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to send estimate' }
  }
}

/**
 * Delete an estimate
 */
export async function deleteEstimate(estimateId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('crm_estimates')
    .delete()
    .eq('id', estimateId)

  if (error) {
    console.error('Failed to delete estimate:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Calculate estimate totals
 */
export function calculateEstimateTotals(lineItems: LineItem[], taxRate: number = 0) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}
