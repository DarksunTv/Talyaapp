// Activity formatting utilities
import type { ActivityAction } from '@/types';

// Helper to format activity messages
export function formatActivityMessage(action: ActivityAction, details?: Record<string, unknown>): string {
  const messages: Record<string, string> = {
    'project.created': 'created this project',
    'project.updated': 'updated project details',
    'project.status_changed': `changed status to ${String(details?.new_status || 'unknown')}`,
    'status_changed': `changed status to ${String(details?.new_status || 'unknown')}`,
    'customer.created': 'added a new customer',
    'customer.updated': 'updated customer information',
    'photo.uploaded': `uploaded ${Number(details?.count) || 1} photo(s)`,
    'estimate.created': 'created an estimate',
    'estimate.sent': 'sent the estimate to customer',
    'contract.created': 'created a contract',
    'contract.signed': 'contract was signed',
    'communication.logged': `logged a ${String(details?.type || 'communication')}`,
    'sms.sent': 'sent an SMS',
    'call.initiated': 'initiated a call',
    'call.completed': 'completed a call',
    'ai_call.initiated': 'initiated an AI call',
    'ai_call.completed': 'completed an AI call',
    'note.added': 'added a note',
  };

  return messages[action] || action;
}
