# Phase 4 Environment Variables

Add these to your `.env.local` file:

## Google Vision API (Photo AI Analysis)
```env
# Get from Google Cloud Console: https://console.cloud.google.com/apis/credentials
GOOGLE_VISION_API_KEY=your_vision_api_key_here
```

**How to get Vision API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Cloud Vision API"
4. Go to "APIs & Services" → "Credentials"
5. Create "API Key"
6. Copy the key

## Feature Toggles (Optional)
```env
# Enable/disable AI features for cost control
ENABLE_PHOTO_AI_ANALYSIS=true
ENABLE_CHAT_AI=true
```

## Notes
- **Google Gemini API Key**: Already configured from Phase 3 (`GOOGLE_GEMINI_API_KEY`)
- **Vision API Costs**: ~$1.50 per 1,000 images analyzed
- **Caching**: Analysis results are cached in database to avoid re-analyzing
