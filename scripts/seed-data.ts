import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  generateCustomers,
  generateProjects,
  generateEstimateLineItems,
  generateCommunications,
  generateChatMessages,
  getOrCreateCompany,
} from './seed-helpers.js'

// Environment variables should be loaded by tsx automatically from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Make sure .env.local contains:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n')

  try {
    // 1. Get or create company
    console.log('📦 Creating company...')
    const company = await getOrCreateCompany()
    console.log(`✅ Company: ${company.name}\n`)

    // 2. Create customers
    console.log('👥 Creating customers...')
    const customerData = generateCustomers().map(c => ({
      ...c,
      company_id: company.id,
    }))

    const { data: customers, error: customersError } = await supabase
      .from('crm_customers')
      .insert(customerData)
      .select()

    if (customersError) throw customersError
    console.log(`✅ Created ${customers.length} customers\n`)

    // 3. Create projects
    console.log('📁 Creating projects...')
    const projectData = generateProjects(customers).map(p => ({
      ...p,
      company_id: company.id,
    }))

    const { data: projects, error: projectsError } = await supabase
      .from('crm_projects')
      .insert(projectData)
      .select()

    if (projectsError) throw projectsError
    console.log(`✅ Created ${projects.length} projects\n`)

    // 4. Create estimates
    console.log('💰 Creating estimates...')
    const estimateData = projects.slice(0, 5).map((project, index) => ({
      project_id: project.id,
      customer_id: project.customer_id,
      company_id: company.id,
      line_items: generateEstimateLineItems(),
      subtotal: 10000 + (index * 1000),
      tax: (10000 + (index * 1000)) * 0.0825,
      total: (10000 + (index * 1000)) * 1.0825,
      status: index < 2 ? 'sent' : 'draft',
      notes: 'Standard roofing estimate with premium materials',
    }))

    const { data: estimates, error: estimatesError } = await supabase
      .from('crm_estimates')
      .insert(estimateData)
      .select()

    if (estimatesError) throw estimatesError
    console.log(`✅ Created ${estimates.length} estimates\n`)

    // 5. Create contracts
    console.log('📄 Creating contracts...')
    const contractData = estimates.slice(0, 3).map((estimate, index) => ({
      estimate_id: estimate.id,
      project_id: estimate.project_id,
      customer_id: estimate.customer_id,
      company_id: company.id,
      content: `This is a roofing contract for project ${estimate.project_id}`,
      status: index === 0 ? 'signed' : 'sent',
    }))

    const { data: contracts, error: contractsError } = await supabase
      .from('crm_contracts')
      .insert(contractData)
      .select()

    if (contractsError) throw contractsError
    console.log(`✅ Created ${contracts.length} contracts\n`)

    // 6. Create communications
    console.log('💬 Creating communications...')
    const communicationData = generateCommunications(customers).map(c => ({
      ...c,
      company_id: company.id,
    }))

    const { data: communications, error: communicationsError } = await supabase
      .from('crm_communications')
      .insert(communicationData)
      .select()

    if (communicationsError) throw communicationsError
    console.log(`✅ Created ${communications.length} communications\n`)

    // 7. Create chat messages
    console.log('💭 Creating chat messages...')
    const chatData = generateChatMessages(projects).map(m => ({
      ...m,
      company_id: company.id,
    }))

    const { data: chatMessages, error: chatError } = await supabase
      .from('crm_chat_messages')
      .insert(chatData)
      .select()

    if (chatError) throw chatError
    console.log(`✅ Created ${chatMessages.length} chat messages\n`)

    // 8. Create activity logs
    console.log('📊 Creating activity logs...')
    const activityData = [
      ...customers.map(c => ({
        company_id: company.id,
        user_id: null,
        action: 'customer.created',
        entity_type: 'customer',
        entity_id: c.id,
        metadata: { customer_name: c.name },
      })),
      ...projects.map(p => ({
        company_id: company.id,
        user_id: null,
        action: 'project.created',
        entity_type: 'project',
        entity_id: p.id,
        metadata: { project_name: p.name },
      })),
      ...estimates.map(e => ({
        company_id: company.id,
        user_id: null,
        action: 'estimate.created',
        entity_type: 'estimate',
        entity_id: e.id,
        metadata: { total: e.total },
      })),
    ]

    const { data: activities, error: activitiesError } = await supabase
      .from('crm_activity_logs')
      .insert(activityData)
      .select()

    if (activitiesError) throw activitiesError
    console.log(`✅ Created ${activities.length} activity logs\n`)

    // Summary
    console.log('🎉 Database seeding completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   - Company: 1`)
    console.log(`   - Customers: ${customers.length}`)
    console.log(`   - Projects: ${projects.length}`)
    console.log(`   - Estimates: ${estimates.length}`)
    console.log(`   - Contracts: ${contracts.length}`)
    console.log(`   - Communications: ${communications.length}`)
    console.log(`   - Chat Messages: ${chatMessages.length}`)
    console.log(`   - Activity Logs: ${activities.length}`)
    console.log('\n✨ You can now view the data in your application!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
