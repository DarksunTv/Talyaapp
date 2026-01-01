import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

async function seedSimple() {
  console.log('🌱 Starting simple database seed...\\n')

  try {
    // 1. Create/get company
    console.log('📦 Creating company...')
    let company
    const { data: existingCompany } = await supabase
      .from('crm_companies')
      .select('*')
      .limit(1)
      .single()

    if (existingCompany) {
      company = existingCompany
      console.log(`✅ Using existing company: ${company.name}\\n`)
    } else {
      const { data: newCompany, error } = await supabase
        .from('crm_companies')
        .insert({
          name: 'Talya Roofing',
          subdomain: 'talya',
        })
        .select()
        .single()

      if (error) throw error
      company = newCompany
      console.log(`✅ Created company: ${company.name}\\n`)
    }

    // 2. Create customers (minimal fields)
    console.log('👥 Creating customers...')
    const customerData = [
      { name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', address: '123 Main St, Austin, TX 78701', company_id: company.id },
      { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678', address: '456 Oak Ave, Austin, TX 78702', company_id: company.id },
      { name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 345-6789', address: '789 Pine Rd, Austin, TX 78703', company_id: company.id },
      { name: 'Emily Davis', email: 'emily.davis@email.com', phone: '(555) 456-7890', address: '321 Elm St, Austin, TX 78704', company_id: company.id },
      { name: 'David Wilson', email: 'dwilson@email.com', phone: '(555) 567-8901', address: '654 Maple Dr, Austin, TX 78705', company_id: company.id },
    ]

    const { data: customers, error: customersError } = await supabase
      .from('crm_customers')
      .insert(customerData)
      .select()

    if (customersError) throw customersError
    console.log(`✅ Created ${customers.length} customers\\n`)

    // 3. Create projects (minimal fields)
    console.log('📁 Creating projects...')
    const projectData = [
      { name: 'Roof Replacement - Main St', customer_id: customers[0].id, address: customers[0].address, status: 'completed', company_id: company.id },
      { name: 'Storm Damage Repair - Oak Ave', customer_id: customers[1].id, address: customers[1].address, status: 'production', company_id: company.id },
      { name: 'New Construction - Pine Rd', customer_id: customers[2].id, address: customers[2].address, status: 'contract', company_id: company.id },
      { name: 'Leak Repair - Elm St', customer_id: customers[3].id, address: customers[3].address, status: 'proposal', company_id: company.id },
      { name: 'Roof Inspection - Maple Dr', customer_id: customers[4].id, address: customers[4].address, status: 'inspection', company_id: company.id },
    ]

    const { data: projects, error: projectsError } = await supabase
      .from('crm_projects')
      .insert(projectData)
      .select()

    if (projectsError) throw projectsError
    console.log(`✅ Created ${projects.length} projects\\n`)

    // Summary
    console.log('🎉 Database seeding completed successfully!\\n')
    console.log('📊 Summary:')
    console.log(`   - Company: 1`)
    console.log(`   - Customers: ${customers.length}`)
    console.log(`   - Projects: ${projects.length}`)
    console.log('\\n✨ You can now view the data in your application!')
    console.log('\\n👉 Navigate to http://localhost:3000/dashboard to see your data!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedSimple()
