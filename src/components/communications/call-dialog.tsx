'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { makeCall, makeAICall } from '@/app/actions/communications';
import { Loader2, Phone, Bot } from 'lucide-react';

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  projectId?: string;
  customerName: string;
  phoneNumber: string;
}

export function CallDialog({ open, onOpenChange, customerId, projectId, customerName, phoneNumber }: CallDialogProps) {
  const [loading, setLoading] = useState(false);
  const [callType, setCallType] = useState<'manual' | 'ai'>('manual');

  const handleCall = async () => {
    setLoading(true);
    try {
      if (callType === 'manual') {
        await makeCall({
          customerId,
          projectId,
          phoneNumber,
        });
        alert('Call initiated! Check your phone.');
      } else {
        await makeAICall({
          customerId,
          projectId,
          phoneNumber,
          customerName,
        });
        alert('AI call initiated! The customer will receive a call shortly.');
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Call error:', error);
      alert('Failed to initiate call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Call {customerName}</DialogTitle>
          <DialogDescription>
            Calling: {phoneNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Call Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Call Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCallType('manual')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  callType === 'manual'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Phone className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Manual Call</div>
                <div className="text-xs text-gray-500 mt-1">
                  You make the call
                </div>
              </button>

              <button
                onClick={() => setCallType('ai')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  callType === 'ai'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Bot className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">AI Caller</div>
                <div className="text-xs text-gray-500 mt-1">
                  AI makes the call
                </div>
              </button>
            </div>
          </div>

          {/* AI Call Info */}
          {callType === 'ai' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm">
                <strong>AI Caller Features:</strong>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>• Remembers previous conversations</li>
                  <li>• Natural, human-like interaction</li>
                  <li>• Automatic call summary</li>
                  <li>• Project context awareness</li>
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCall} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  {callType === 'ai' ? (
                    <Bot className="mr-2 h-4 w-4" />
                  ) : (
                    <Phone className="mr-2 h-4 w-4" />
                  )}
                  Initiate Call
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
