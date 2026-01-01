'use server'

import { createClient } from '@/lib/supabase/server'
import { twilioClient } from '@/lib/twilio/service'

export interface NotificationData {
  type: 'sms' | 'email';
  title: string;
  message: string;
  scheduledFor?: Date;
  projectId?: string;
  customerId?: string;
}

/**
 * Schedule a notification
 */
export async function scheduleNotification(data: NotificationData) {
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
    const { data: notification, error } = await supabase
      .from('crm_notifications')
      .insert({
        company_id: profile.company_id,
        user_id: user.id,
        project_id: data.projectId,
        customer_id: data.customerId,
        type: data.type,
        title: data.title,
        message: data.message,
        scheduled_for: data.scheduledFor?.toISOString(),
        status: data.scheduledFor ? 'pending' : 'sent',
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    // If no schedule, send immediately
    if (!data.scheduledFor) {
      await sendNotificationNow(notification.id)
    }

    return { success: true, data: notification }
  } catch (error) {
    console.error('Schedule notification error:', error)
    return { error: error instanceof Error ? error.message : 'Failed to schedule notification' }
  }
}

/**
 * Send notification immediately
 */
async function sendNotificationNow(notificationId: string) {
  const supabase = await createClient()

  try {
    // Get notification with customer data
    const { data: notification } = await supabase
      .from('crm_notifications')
      .select(`
        *,
        customer:crm_customers(phone, email)
      `)
      .eq('id', notificationId)
      .single()

    if (!notification) throw new Error('Notification not found')

    let success = false

    if (notification.type === 'sms' && notification.customer?.phone) {
      try {
        if (!twilioClient) {
          throw new Error('Twilio client not initialized')
        }
        await twilioClient.messages.create({
          to: notification.customer.phone,
          from: process.env.TWILIO_PHONE_NUMBER,
          body: notification.message,
        })
        success = true
      } catch (error) {
        console.error('SMS send error:', error)
      }
    } else if (notification.type === 'email' && notification.customer?.email) {
      // TODO: Implement email sending with SendGrid or Resend
      success = true
    }

    // Update notification status
    await supabase
      .from('crm_notifications')
      .update({
        status: success ? 'sent' : 'failed',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId)

    return { success }
  } catch (error) {
    console.error('Send notification error:', error)
    
    // Mark as failed
    await supabase
      .from('crm_notifications')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', notificationId)

    return { success: false }
  }
}

/**
 * Get notifications for a project
 */
export async function getProjectNotifications(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crm_notifications')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get notifications:', error)
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

/**
 * Cancel scheduled notification
 */
export async function cancelNotification(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('crm_notifications')
    .update({ status: 'cancelled' })
    .eq('id', notificationId)
    .eq('status', 'pending')

  if (error) {
    console.error('Failed to cancel notification:', error)
    return { error: error.message }
  }

  return { success: true }
}
