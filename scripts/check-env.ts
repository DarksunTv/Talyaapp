import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Environment variables checker
const requiredEnvVars = {
  'Supabase': [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ],
  'Twilio': [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  ],
  'Vapi.ai': [
    'VAPI_API_KEY',
    'VAPI_PHONE_NUMBER_ID',
    'VAPI_ASSISTANT_ID'
  ],
  'OpenRouter AI': [
    'OPENROUTER_API_KEY'
  ],
  'Google Maps': [
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'
  ],
  'App Config': [
    'NEXT_PUBLIC_APP_URL'
  ]
}

console.log('🔍 Checking Environment Variables...\n')

let allPresent = true
let missingVars: string[] = []

for (const [category, vars] of Object.entries(requiredEnvVars)) {
  console.log(`📦 ${category}:`)
  
  for (const varName of vars) {
    const value = process.env[varName]
    const status = value ? '✅' : '❌'
    const display = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'NOT SET'
    
    console.log(`  ${status} ${varName}: ${value ? '✓' : 'MISSING'}`)
    
    if (!value) {
      allPresent = false
      missingVars.push(varName)
    }
  }
  console.log('')
}

if (allPresent) {
  console.log('✅ All environment variables are set!')
  console.log('\n🚀 Ready to start testing!')
  process.exit(0)
} else {
  console.log('❌ Missing environment variables:')
  missingVars.forEach(v => console.log(`   - ${v}`))
  console.log('\n📝 Please add these to your .env.local file')
  console.log('\n💡 Tip: Check .env.example for reference')
  process.exit(1)
}
