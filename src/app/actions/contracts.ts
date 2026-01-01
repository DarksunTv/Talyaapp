'use server'

import { createClient } from '@/lib/supabase/server'
import { logActivity } from './activity'
import { renderContractTemplate, generateLineItemsTable, getContractTemplate, type ContractVariables } from '@/lib/contracts/templates'

/**
 * Create contract from estimate
 */
export async function createContractFromEstimate(
  estimateId: string,
  templateId: string = 'default'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('crm_profiles')
    .select('company_id, name')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }

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

    // Get company info
    const { data: company } = await supabase
      .from('crm_companies')
      .select('name, settings')
      .eq('id', profile.company_id)
      .single()

    if (!company) throw new Error('Company not found')

    // Get contract template
    const template = getContractTemplate(templateId)
    if (!template) throw new Error('Template not found')

    // Prepare variables
    const variables: ContractVariables = {
      customer_name: estimate.project.customer.name,
      customer_address: estimate.project.customer.address,
      customer_phone: estimate.project.customer.phone || 'N/A',
      customer_email: estimate.project.customer.email || 'N/A',
      project_address: estimate.project.address,
      project_name: estimate.project.name,
      estimate_total: estimate.total.toFixed(2),
      estimate_date: new Date(estimate.created_at).toLocaleDateString(),
      company_name: company.name,
      company_phone: company.settings?.phone || 'N/A',
      today_date: new Date().toLocaleDateString(),
      line_items_table: generateLineItemsTable(estimate.line_items),
    }

    // Render contract
    const content = renderContractTemplate(template.content, variables)

    // Create contract
    const { data: contract, error } = await supabase
      .from('crm_contracts')
      .insert({
        project_id: estimate.project_id,
        estimate_id: estimateId,
        company_id: profile.company_id,
        template_id: templateId,
        content,
        status: 'draft',
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // Log activity
    await logActivity({
      projectId: estimate.project_id,
      action: 'contract.created',
      entityType: 'contract',
      entityId: contract.id,
      details: { estimateId },
    })

    return { success: true, data: contract }
  } catch (error) {
    console.error('Create contract error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to create contract' }
  }
}

/**
 * Get all contracts for a project
 */
export async function getProjectContracts(projectId: string) {
  const supabase = await createClient()

  const { data, error} = await supabase
    .from('crm_contracts')
    .select(`
      *,
      estimate:crm_estimates(*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get contracts:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

/**
 * Update contract status
 */
export async function updateContractStatus(
  contractId: string,
  status: 'draft' | 'sent' | 'viewed' | 'signed'
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('crm_contracts')
      .update({ status })
      .eq('id', contractId)
      .select()
      .single()

    if (error) throw error

    // Log activity
    const { data: contract } = await supabase
      .from('crm_contracts')
      .select('project_id')
      .eq('id', contractId)
      .single()

    if (contract) {
      await logActivity({
        projectId: contract.project_id,
        action: `contract.${status}` as any,
        entityType: 'contract',
        entityId: contractId,
        details: { status },
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Update contract status error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update status' }
  }
}

/**
 * Delete a contract
 */
export async function deleteContract(contractId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('crm_contracts')
    .delete()
    .eq('id', contractId)

  if (error) {
    console.error('Failed to delete contract:', error)
    return { error: error.message }
  }

  return { success: true }
}
