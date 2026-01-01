import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { CustomerCard } from '@/components/customers/customer-card'
import { Users, Search, Plus, Filter } from 'lucide-react'
import Link from 'next/link'

export default async function CustomersPage() {
  const supabase = await createClient()
  
  // Fetch customers (will work when data is added)
  const { data: customers } = await supabase
    .from('crm_customers')
    .select('*, projects:crm_projects(count)')
    .order('created_at', { ascending: false })

  const hasCustomers = customers && customers.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Customer List */}
      {hasCustomers ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={{
                ...customer,
                projects_count: customer.projects?.[0]?.count || 0,
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-6">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No customers yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get started by adding your first customer. You can track their projects,
                communications, and more.
              </p>
            </div>
            <Link href="/dashboard/customers/new">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Customer
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Footer */}
      {hasCustomers && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
