'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const projectStatuses = [
  { value: 'lead', label: 'Lead' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'contract', label: 'Contract' },
  { value: 'production', label: 'Production' },
  { value: 'completed', label: 'Completed' },
]

const insuranceCompanies = [
  'State Farm',
  'Allstate',
  'USAA',
  'Liberty Mutual',
  'Farmers',
  'Nationwide',
  'Progressive',
  'Travelers',
  'American Family',
  'Other',
]

interface Customer {
  id: string
  name: string
  address: string
}

export default function NewProjectPage() {
  const [name, setName] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState('lead')
  const [isInsurance, setIsInsurance] = useState(false)
  const [insuranceCompany, setInsuranceCompany] = useState('')
  const [claimNumber, setClaimNumber] = useState('')
  const [adjusterName, setAdjusterName] = useState('')
  const [adjusterPhone, setAdjusterPhone] = useState('')
  const [adjusterEmail, setAdjusterEmail] = useState('')
  const [deductible, setDeductible] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Load customers for dropdown
    const loadCustomers = async () => {
      const { data } = await supabase
        .from('crm_customers')
        .select('id, name, address')
        .is('deleted_at', null)
        .order('name')
      
      if (data) setCustomers(data)
    }
    loadCustomers()

    // Pre-select customer if passed in URL
    const preselectedCustomer = searchParams.get('customer')
    if (preselectedCustomer) {
      setCustomerId(preselectedCustomer)
    }
  }, [searchParams])

  // Auto-fill address when customer is selected
  useEffect(() => {
    if (customerId) {
      const customer = customers.find(c => c.id === customerId)
      if (customer && !address) {
        setAddress(customer.address)
        if (!name) setName(`${customer.name} - Roof Project`)
      }
    }
  }, [customerId, customers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const projectData: Record<string, unknown> = {
      name,
      customer_id: customerId,
      address,
      status,
    }

    if (isInsurance) {
      projectData.insurance_company = insuranceCompany || null
      projectData.insurance_claim_number = claimNumber || null
      projectData.adjuster_name = adjusterName || null
      projectData.adjuster_phone = adjusterPhone || null
      projectData.adjuster_email = adjusterEmail || null
      projectData.deductible = deductible ? parseFloat(deductible) : null
      projectData.claim_status = 'filed'
    }

    const { error } = await supabase
      .from('crm_projects')
      .insert(projectData)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/projects')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Project</h1>
          <p className="text-muted-foreground">Create a new roofing project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Basic details about the project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="customer" className="text-sm font-medium">
                Customer <span className="text-destructive">*</span>
              </label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                required
              >
                <option value="">Select customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Project Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                placeholder="e.g., Smith Residence - Roof Replacement"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Project Address <span className="text-destructive">*</span>
              </label>
              <Input
                id="address"
                placeholder="123 Main St, City, State ZIP"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {projectStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Insurance Claim</CardTitle>
                <CardDescription>Is this an insurance job?</CardDescription>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInsurance}
                  onChange={(e) => setIsInsurance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardHeader>
          
          {isInsurance && (
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="insuranceCompany" className="text-sm font-medium">
                    Insurance Company
                  </label>
                  <select
                    id="insuranceCompany"
                    value={insuranceCompany}
                    onChange={(e) => setInsuranceCompany(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select company...</option>
                    {insuranceCompanies.map((company) => (
                      <option key={company} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="claimNumber" className="text-sm font-medium">
                    Claim Number
                  </label>
                  <Input
                    id="claimNumber"
                    placeholder="e.g., CLM-123456"
                    value={claimNumber}
                    onChange={(e) => setClaimNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="adjusterName" className="text-sm font-medium">
                    Adjuster Name
                  </label>
                  <Input
                    id="adjusterName"
                    placeholder="John Smith"
                    value={adjusterName}
                    onChange={(e) => setAdjusterName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="adjusterPhone" className="text-sm font-medium">
                    Adjuster Phone
                  </label>
                  <Input
                    id="adjusterPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={adjusterPhone}
                    onChange={(e) => setAdjusterPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="adjusterEmail" className="text-sm font-medium">
                    Adjuster Email
                  </label>
                  <Input
                    id="adjusterEmail"
                    type="email"
                    placeholder="adjuster@insurance.com"
                    value={adjusterEmail}
                    onChange={(e) => setAdjusterEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="deductible" className="text-sm font-medium">
                  Deductible ($)
                </label>
                <Input
                  id="deductible"
                  type="number"
                  placeholder="1000"
                  value={deductible}
                  onChange={(e) => setDeductible(e.target.value)}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
          <Link href="/dashboard/projects">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
