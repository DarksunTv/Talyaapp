'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Bot } from 'lucide-react';
import { SMSDialog } from './sms-dialog';
import { CallDialog } from './call-dialog';
import { InteractionHistory } from './interaction-history';

interface CustomerCommunicationsProps {
  customerId: string;
  customerName: string;
  phoneNumber: string;
}

export function CustomerCommunications({ customerId, customerName, phoneNumber }: CustomerCommunicationsProps) {
  const [smsOpen, setSmsOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Send messages or make calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setSmsOpen(true)} disabled={!phoneNumber}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
            <Button onClick={() => setCallOpen(true)} variant="outline" disabled={!phoneNumber}>
              <Phone className="h-4 w-4 mr-2" />
              Make Call
            </Button>
            <Button onClick={() => setCallOpen(true)} variant="outline" disabled={!phoneNumber}>
              <Bot className="h-4 w-4 mr-2" />
              AI Caller
            </Button>
          </div>
          {!phoneNumber && (
            <p className="text-sm text-muted-foreground mt-3">
              Add a phone number to enable communication features
            </p>
          )}
        </CardContent>
      </Card>

      {/* Interaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction History</CardTitle>
          <CardDescription>All communications with this customer</CardDescription>
        </CardHeader>
        <CardContent>
          <InteractionHistory customerId={customerId} />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SMSDialog
        open={smsOpen}
        onOpenChange={setSmsOpen}
        customerId={customerId}
        customerName={customerName}
        phoneNumber={phoneNumber}
      />
      <CallDialog
        open={callOpen}
        onOpenChange={setCallOpen}
        customerId={customerId}
        customerName={customerName}
        phoneNumber={phoneNumber}
      />
    </div>
  );
}
