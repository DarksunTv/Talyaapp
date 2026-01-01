'use server'

import { createClient } from '@supabase/supabase-js'

export async function createCompanyAndProfile(
  userId: string,
  email: string,
  name: string,
  companyName: string
) {
  // Check for required env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars:', { 
      hasUrl: !!supabaseUrl, 
      hasServiceKey: !!serviceRoleKey 
    })
    return { error: 'Server configuration error. Please check environment variables.' }
  }

  // Use service role to bypass RLS during signup
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

  try {
    // 1. Create company
    const subdomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    const { data: company, error: companyError } = await supabaseAdmin
      .from('crm_companies')
      .insert({
        name: companyName,
        subdomain,
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      return { error: 'Failed to create company: ' + companyError.message }
    }

    // 2. Create profile with admin role
    const { error: profileError } = await supabaseAdmin
      .from('crm_profiles')
      .insert({
        id: userId,
        company_id: company.id,
        email,
        name,
        role: 'admin',
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Cleanup: delete the company if profile creation fails
      await supabaseAdmin.from('crm_companies').delete().eq('id', company.id)
      return { error: 'Failed to create profile: ' + profileError.message }
    }

    return { success: true, companyId: company.id }
  } catch (error) {
    console.error('Signup error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
