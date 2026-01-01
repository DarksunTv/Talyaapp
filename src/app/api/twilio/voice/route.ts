// Twilio Voice TwiML Response - Redirects to Smart Router
import { NextResponse } from 'next/server';

export async function POST() {
  // Redirect all incoming calls to the smart router
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Redirect>${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice-router</Redirect>
    </Response>`,
    {
      headers: { 'Content-Type': 'text/xml' },
    }
  );
}
