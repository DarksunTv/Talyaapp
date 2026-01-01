# Environment Variables Setup for Phase 3

Add these variables to your `.env.local` file:

## Twilio Configuration
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Required from Twilio Console:**
- Account SID: Found in your Twilio Console Dashboard
- Auth Token: Found in your Twilio Console Dashboard
- Phone Number: Your Twilio phone number (format: +1234567890)

## Vapi.ai Configuration
```env
VAPI_API_KEY=your_vapi_api_key
VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id
VAPI_ASSISTANT_ID=your_vapi_assistant_id
```

**Required from Vapi Dashboard:**
- API Key: From Vapi.ai dashboard settings
- Phone Number ID: Your Vapi phone number ID
- Assistant ID: We'll create this after setting up the assistant

## Google Gemini AI
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

**Required from Google AI Studio:**
- Get your API key from: https://makersuite.google.com/app/apikey

## Application URL
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, update this to your actual domain.

## Call Routing Configuration
```env
# Routing mode: 'smart', 'always_ai', or 'always_human'
CALL_ROUTING_MODE=smart

# Phone number to forward calls to (for human routing)
FORWARDING_PHONE_NUMBER=+1234567890
```

**Routing Modes:**
- `smart`: AI outside business hours (9 AM - 5 PM EST, Mon-Fri), human during business hours
- `always_ai`: All incoming calls go to AI assistant
- `always_human`: All incoming calls forward to your phone
