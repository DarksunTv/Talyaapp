'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { sendSMS } from '@/app/actions/communications';
import { Loader2, Send } from 'lucide-react';

interface SMSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  projectId?: string;
  customerName: string;
  phoneNumber: string;
}

const SMS_TEMPLATES = [
  { label: 'Inspection Scheduled', text: 'Hi {name}, your roof inspection is scheduled for {date}. We look forward to seeing you!' },
  { label: 'Estimate Ready', text: 'Hi {name}, your roofing estimate is ready. Please check your email or give us a call to discuss.' },
  { label: 'Project Update', text: 'Hi {name}, just wanted to update you on your roofing project. {update}' },
  { label: 'Follow Up', text: 'Hi {name}, following up on our recent conversation. Do you have any questions?' },
];

export function SMSDialog({ open, onOpenChange, customerId, projectId, customerName, phoneNumber }: SMSDialogProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      await sendSMS({
        customerId,
        projectId,
        phoneNumber,
        message,
      });

      setMessage('');
      onOpenChange(false);
    } catch (error) {
      console.error('Send SMS error:', error);
      alert('Failed to send SMS. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: string) => {
    const filled = template
      .replace('{name}', customerName)
      .replace('{date}', new Date().toLocaleDateString())
      .replace('{update}', '');
    setMessage(filled);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send SMS to {customerName}</DialogTitle>
          <DialogDescription>
            Sending to: {phoneNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Templates */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Templates</label>
            <div className="flex flex-wrap gap-2">
              {SMS_TEMPLATES.map((template) => (
                <Button
                  key={template.label}
                  variant="outline"
                  size="sm"
                  onClick={() => useTemplate(template.text)}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <textarea
              className="w-full min-h-[120px] p-3 border rounded-md resize-none"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={160}
            />
            <div className="text-sm text-gray-500 mt-1">
              {message.length}/160 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={loading || !message.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send SMS
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
