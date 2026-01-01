# Call Forwarding Configuration - Using Twilio as Main Number

## Overview
Configure call forwarding so your **Twilio number** serves as the main business number for both manual calls and AI calls.

## Why This Setup?
- **Single Number**: Customers only see one phone number
- **Professional**: Consistent caller ID across all communications
- **Flexible**: Route calls to AI or humans based on your needs

## Configuration Steps

### Option 1: Forward Vapi Calls Through Twilio (Recommended)

Instead of having Vapi use its own number, configure it to use your Twilio number:

1. **In Vapi Dashboard:**
   - Go to Phone Numbers settings
   - Select "Use Custom Number"
   - Enter your Twilio phone number
   - Vapi will route calls through Twilio

2. **Update `.env.local`:**
```env
# Use same Twilio number for both
TWILIO_PHONE_NUMBER=+1234567890
VAPI_PHONE_NUMBER_ID=your_vapi_phone_id  # Still needed for Vapi API
```

### Option 2: Twilio Call Forwarding to Vapi

Configure Twilio to forward incoming calls to Vapi when needed:

1. **In Twilio Console:**
   - Go to Phone Numbers → Active Numbers
   - Select your number
   - Under "Voice & Fax" → "A Call Comes In"
   - Set webhook to: `https://yourdomain.com/api/twilio/voice-router`

2. **Create Smart Router:**
   - Create new API route: `src/app/api/twilio/voice-router/route.ts`
   - Route based on business hours, caller ID, or manual trigger
   - Forward to Vapi for AI handling or to your team

### Option 3: Conditional Forwarding

**Business Hours Logic:**
```typescript
// Pseudo-code for voice router
if (isBusinessHours && hasAvailableAgent) {
  // Forward to human agent
  forwardToAgent();
} else {
  // Forward to Vapi AI
  forwardToVapi();
}
```

## Implementation Notes

### Current Setup (Two Numbers)
- ✅ Works out of the box
- ✅ Easy to track AI vs manual calls
- ❌ Customers see two different numbers

### Unified Setup (One Number)
- ✅ Professional single number
- ✅ Better customer experience
- ⚠️ Requires additional configuration
- ⚠️ Need smart routing logic

## Recommended Approach

**Phase 1 (Current):** Use two separate numbers
- Get familiar with the system
- Test AI calling functionality
- Understand call flows

**Phase 2 (Future):** Implement unified number
- Once comfortable with features
- Add smart routing logic
- Configure call forwarding

## Code Changes Needed for Unified Number

If you want to implement this now, we would need to:

1. **Update Vapi Service** to use Twilio number for outbound caller ID
2. **Create Voice Router** API endpoint for intelligent call routing
3. **Add Business Logic** for when to use AI vs human
4. **Update Webhooks** to handle both scenarios

## Quick Win: Outbound Caller ID

You can configure Vapi to show your Twilio number as caller ID:

```typescript
// In src/lib/vapi/service.ts
const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    assistantId: assistant,
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    customer: {
      number: phoneNumber,
    },
    // Add this to use Twilio number as caller ID
    callerIdNumber: process.env.TWILIO_PHONE_NUMBER,
  }),
});
```

## Next Steps

Let me know if you want to:
1. **Keep current setup** (two numbers) - No changes needed
2. **Implement unified number** - I can add the routing logic and configuration

---

**Note:** For production, using a single main number (Twilio) with smart routing is the professional approach. The current two-number setup is perfect for development and testing.
