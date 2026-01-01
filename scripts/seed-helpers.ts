import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Environment variables should be loaded by dotenv from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// Sample data generators
export const generateCustomers = () => [
  { name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', address: '123 Main St, Austin, TX 78701' },
  { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678', address: '456 Oak Ave, Austin, TX 78702' },
  { name: 'Michael Brown', email: 'mbrown@email.com', phone: '(555) 345-6789', address: '789 Pine Rd, Austin, TX 78703' },
  { name: 'Emily Davis', email: 'emily.davis@email.com', phone: '(555) 456-7890', address: '321 Elm St, Austin, TX 78704' },
  { name: 'David Wilson', email: 'dwilson@email.com', phone: '(555) 567-8901', address: '654 Maple Dr, Austin, TX 78705' },
  { name: 'Jennifer Martinez', email: 'jmartinez@email.com', phone: '(555) 678-9012', address: '987 Cedar Ln, Austin, TX 78706' },
  { name: 'Robert Anderson', email: 'randerson@email.com', phone: '(555) 789-0123', address: '147 Birch Ct, Austin, TX 78707' },
  { name: 'Lisa Taylor', email: 'ltaylor@email.com', phone: '(555) 890-1234', address: '258 Spruce Way, Austin, TX 78708' },
  { name: 'James Thomas', email: 'jthomas@email.com', phone: '(555) 901-2345', address: '369 Willow Blvd, Austin, TX 78709' },
  { name: 'Mary Garcia', email: 'mgarcia@email.com', phone: '(555) 012-3456', address: '741 Ash Pkwy, Austin, TX 78710' },
]

export const projectStatuses = ['lead', 'inspection', 'proposal', 'contract', 'production', 'completed']

export const generateProjects = (customers: any[]) => [
  { name: 'Roof Replacement - Main St', customer_id: customers[0].id, address: customers[0].address, status: 'completed' },
  { name: 'Storm Damage Repair - Oak Ave', customer_id: customers[1].id, address: customers[1].address, status: 'production' },
  { name: 'New Construction - Pine Rd', customer_id: customers[2].id, address: customers[2].address, status: 'contract' },
  { name: 'Leak Repair - Elm St', customer_id: customers[3].id, address: customers[3].address, status: 'proposal' },
  { name: 'Roof Inspection - Maple Dr', customer_id: customers[4].id, address: customers[4].address, status: 'inspection' },
  { name: 'Shingle Replacement - Cedar Ln', customer_id: customers[5].id, address: customers[5].address, status: 'lead' },
  { name: 'Gutter Installation - Birch Ct', customer_id: customers[6].id, address: customers[6].address, status: 'completed' },
  { name: 'Roof Coating - Spruce Way', customer_id: customers[7].id, address: customers[7].address, status: 'production' },
  { name: 'Skylight Installation - Willow Blvd', customer_id: customers[8].id, address: customers[8].address, status: 'proposal' },
  { name: 'Emergency Repair - Ash Pkwy', customer_id: customers[9].id, address: customers[9].address, status: 'inspection' },
  { name: 'Re-roofing - Main St #2', customer_id: customers[0].id, address: customers[0].address, status: 'lead' },
  { name: 'Flat Roof Repair - Oak Ave #2', customer_id: customers[1].id, address: customers[1].address, status: 'contract' },
  { name: 'Ventilation Upgrade - Pine Rd', customer_id: customers[2].id, address: customers[2].address, status: 'completed' },
  { name: 'Chimney Flashing - Elm St', customer_id: customers[3].id, address: customers[3].address, status: 'production' },
  { name: 'Solar Panel Prep - Maple Dr', customer_id: customers[4].id, address: customers[4].address, status: 'proposal' },
]

export const generateEstimateLineItems = () => [
  { description: 'Architectural Shingles (30-year)', quantity: 25, unit: 'square', rate: 120 },
  { description: 'Underlayment', quantity: 2500, unit: 'sqft', rate: 0.50 },
  { description: 'Ice & Water Shield', quantity: 200, unit: 'sqft', rate: 1.25 },
  { description: 'Ridge Vent', quantity: 40, unit: 'ft', rate: 8 },
  { description: 'Drip Edge', quantity: 150, unit: 'ft', rate: 3 },
  { description: 'Labor - Tear Off', quantity: 1, unit: 'job', rate: 1500 },
  { description: 'Labor - Installation', quantity: 1, unit: 'job', rate: 3500 },
  { description: 'Disposal Fee', quantity: 1, unit: 'job', rate: 500 },
]

export const generateCommunications = (customers: any[]) => {
  const communications = []
  const types = ['sms', 'call', 'ai_call']
  const messages = [
    'Thanks for reaching out! We can schedule an inspection for next week.',
    'Your estimate is ready. Would you like me to email it to you?',
    'Just following up on the proposal we sent last week.',
    'The materials have arrived. We can start work on Monday.',
    'Project completed! Thank you for choosing us.',
  ]

  for (let i = 0; i < 30; i++) {
    const customer = customers[i % customers.length]
    const type = types[i % types.length]
    communications.push({
      customer_id: customer.id,
      type,
      direction: i % 2 === 0 ? 'outbound' : 'inbound',
      phone_number: customer.phone,
      message: type === 'sms' ? messages[i % messages.length] : null,
      duration: type !== 'sms' ? Math.floor(Math.random() * 300) + 60 : null,
      status: 'completed',
    })
  }
  return communications
}

export const generateChatMessages = (projects: any[]) => {
  const messages = []
  const userQuestions = [
    'What is the estimated timeline for this project?',
    'Can you provide more details about the materials?',
    'What is included in the warranty?',
    'Do you offer financing options?',
    'What happens if it rains during installation?',
  ]
  const aiResponses = [
    'Based on the project scope, the estimated timeline is 3-5 days, weather permitting.',
    'We use premium architectural shingles with a 30-year warranty. The underlayment is synthetic for superior protection.',
    'Our standard warranty covers workmanship for 10 years and materials are covered by manufacturer warranty.',
    'Yes, we offer financing through multiple providers with flexible payment plans.',
    'We monitor weather closely and will reschedule if rain is expected. All materials are protected during installation.',
  ]

  for (let i = 0; i < 10; i++) {
    const project = projects[i % projects.length]
    messages.push({
      project_id: project.id,
      role: 'user',
      content: userQuestions[i % userQuestions.length],
    })
    messages.push({
      project_id: project.id,
      role: 'assistant',
      content: aiResponses[i % aiResponses.length],
    })
  }
  return messages
}

export async function getOrCreateCompany() {
  // Check if company exists
  const { data: existingCompany } = await supabase
    .from('crm_companies')
    .select('*')
    .limit(1)
    .single()

  if (existingCompany) {
    return existingCompany
  }

  // Create company
  const { data: company, error } = await supabase
    .from('crm_companies')
    .insert({
      name: 'Talya Roofing',
      subdomain: 'talya',
      settings: {
        phone: '(555) 000-0000',
        email: 'info@talyaroofing.com',
        address: '100 Business Park Dr, Austin, TX 78701',
      },
    })
    .select()
    .single()

  if (error) throw error
  return company
}
