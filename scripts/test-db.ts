import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔍 Testing Supabase Connection...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('📡 Connecting to Supabase...')
    
    // Test connection by querying a table
    const { data, error } = await supabase
      .from('crm_companies')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Connection failed:', error.message)
      process.exit(1)
    }

    console.log('✅ Successfully connected to Supabase!')
    
    // Check tables
    console.log('\n📊 Checking database tables...')
    
    const tables = [
      'crm_companies',
      'crm_profiles',
      'crm_customers',
      'crm_projects',
      'crm_estimates',
      'crm_contracts',
      'crm_communications',
      'crm_photos',
      'crm_measurements',
      'crm_chat_messages',
      'crm_activity_logs'
    ]

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1)
      const status = error ? '❌' : '✅'
      console.log(`  ${status} ${table}`)
    }

    console.log('\n✅ Database test complete!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

testConnection()
