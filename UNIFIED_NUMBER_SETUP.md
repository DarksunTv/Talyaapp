# Unified Phone Number Setup Guide

## Overview
Your Twilio number is now configured as the **main business number** for all communications:
- ✅ SMS messages
- ✅ Manual outbound calls
- ✅ AI-powered calls (shows Twilio number as caller ID)
- ✅ Incoming calls (smart routing)

## What Changed

### 1. AI Calls Now Show Your Twilio Number
When you initiate an AI call, customers will see your **Twilio number** instead of a separate Vapi number.

### 2. Smart Call Routing
Incoming calls to your Twilio number are automatically routed based on:
- **Business Hours** (9 AM - 5 PM EST, Mon-Fri)
- **Routing Mode** (configurable)

### 3. Three Routing Modes

Set `CALL_ROUTING_MODE` in your `.env.local`:

**Option 1: Smart Routing (Recommended)**
```env
CALL_ROUTING_MODE=smart
```
- During business hours → Routes to your phone
- Outside business hours → Routes to AI assistant
- Weekends → Routes to AI assistant

**Option 2: Always AI**
```env
CALL_ROUTING_MODE=always_ai
```
- All incoming calls go to AI assistant
- Great for testing or if you want AI to handle everything

**Option 3: Always Human**
```env
CALL_ROUTING_MODE=always_human
```
- All incoming calls forward to your phone
- AI only used for outbound calls you initiate

## Required Environment Variables

Add to your `.env.local`:

```env
# Your main business number (Twilio)
TWILIO_PHONE_NUMBER=+1234567890

# Where to forward calls when routing to human
FORWARDING_PHONE_NUMBER=+1234567890  # Your personal/office phone

# Routing mode
CALL_ROUTING_MODE=smart

# App URL for webhooks
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Twilio Console Configuration

### Update Voice Webhook
1. Go to Twilio Console → Phone Numbers → Active Numbers
2. Select your Twilio number
3. Under "Voice & Fax" section:
   - **A Call Comes In**: Webhook
   - **URL**: `https://yourdomain.com/api/twilio/voice`
   - **HTTP**: POST

4. Under "Status Callback":
   - **URL**: `https://yourdomain.com/api/twilio/status`
   - **Events**: All events

### SMS Webhook (Already Configured)
Should already be set to: `https://yourdomain.com/api/twilio/webhook`

## How It Works

### Outbound Calls (You → Customer)

**Manual Call:**
```
You click "Make Call" → Twilio initiates call → Customer sees your Twilio number
```

**AI Call:**
```
You click "AI Caller" → Vapi initiates call → Customer sees your Twilio number (unified!)
```

### Inbound Calls (Customer → You)

**During Business Hours (Smart Mode):**
```
Customer calls Twilio number → Smart router checks time → Forwards to your phone
```

**Outside Business Hours (Smart Mode):**
```
Customer calls Twilio number → Smart router checks time → Routes to AI assistant
```

## Testing

### Test Outbound AI Call
1. Go to a customer detail page
2. Click "Communications" tab
3. Click "AI Caller" button
4. Customer will receive call from your Twilio number
5. AI assistant will have conversation context

### Test Inbound Call Routing
1. Call your Twilio number during business hours
2. Should forward to your `FORWARDING_PHONE_NUMBER`
3. Call outside business hours
4. Should route to AI assistant

### Test SMS (Unchanged)
1. Send SMS from customer page
2. Customer receives from Twilio number
3. Customer can reply to same number

## Business Hours Configuration

Default hours are set in `src/app/api/twilio/voice-router/route.ts`:

```typescript
const BUSINESS_HOURS = {
  start: 9,  // 9 AM
  end: 17,   // 5 PM
  days: [1, 2, 3, 4, 5], // Monday-Friday (0=Sunday, 6=Saturday)
};
```

You can modify these to match your business schedule.

## Troubleshooting

### AI Calls Not Showing Twilio Number
- Check that `TWILIO_PHONE_NUMBER` is set in `.env.local`
- Verify Vapi has permission to use your Twilio number as caller ID
- May need to verify number ownership in Vapi dashboard

### Incoming Calls Not Routing Correctly
- Verify webhook URL in Twilio console
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Ensure `CALL_ROUTING_MODE` is set
- Check server logs for routing decisions

### Calls Going to Voicemail
- Verify `FORWARDING_PHONE_NUMBER` is correct
- Check that your phone can receive calls
- Increase timeout in router (currently 30 seconds)

## Benefits of Unified Number

✅ **Professional**: One consistent number for all communications
✅ **Customer Experience**: Customers only need to remember one number
✅ **Tracking**: All interactions tied to same number in CRM
✅ **Flexibility**: Easy to switch between AI and human handling
✅ **Cost Effective**: No need for multiple phone numbers

## Next Steps

1. ✅ Update `.env.local` with routing configuration
2. ✅ Configure Twilio webhook to point to `/api/twilio/voice`
3. ✅ Test outbound AI call (should show Twilio number)
4. ✅ Test inbound call routing
5. ✅ Adjust business hours if needed
6. ✅ Choose your preferred routing mode

---

**Your Twilio number is now your unified business number!** 🎉
