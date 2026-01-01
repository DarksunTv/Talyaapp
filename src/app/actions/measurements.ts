'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateTotalSquareFeet, type MeasurementData } from '@/lib/konva/measurement'

/**
 * Save measurement to database
 */
export async function saveMeasurement(
  projectId: string,
  measurementData: MeasurementData,
  imageUrl?: string
) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    // Calculate total square footage
    const totalSqft = calculateTotalSquareFeet(measurementData)

    // Save to database
    const { data, error } = await supabase
      .from('crm_measurements')
      .insert({
        project_id: projectId,
        measurement_type: 'manual',
        image_url: imageUrl,
        data: measurementData,
        total_sqft: totalSqft,
        waste_factor: measurementData.wasteFactor,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Save measurement error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to save measurement' }
  }
}

/**
 * Get measurements for a project
 */
export async function getProjectMeasurements(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crm_measurements')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get measurements:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

/**
 * Delete a measurement
 */
export async function deleteMeasurement(measurementId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('crm_measurements')
    .delete()
    .eq('id', measurementId)

  if (error) {
    console.error('Failed to delete measurement:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Update measurement
 */
export async function updateMeasurement(
  measurementId: string,
  measurementData: MeasurementData
) {
  const supabase = await createClient()

  try {
    // Calculate total square footage
    const totalSqft = calculateTotalSquareFeet(measurementData)

    const { data, error } = await supabase
      .from('crm_measurements')
      .update({
        data: measurementData,
        total_sqft: totalSqft,
        waste_factor: measurementData.wasteFactor,
      })
      .eq('id', measurementId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Update measurement error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update measurement' }
  }
}
