import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Users, DollarSign, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get counts for stats cards
  const { count: projectCount } = await supabase
    .from('crm_projects')
    .select('*', { count: 'exact', head: true })

  const { count: customerCount } = await supabase
    .from('crm_customers')
    .select('*', { count: 'exact', head: true })

  const { data: recentProjects } = await supabase
    .from('crm_projects')
    .select(`
      *,
      customer:crm_customers(name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      title: 'Total Projects',
      value: projectCount || 0,
      description: 'Active and completed',
      icon: FolderKanban,
      color: 'text-blue-600',
    },
    {
      title: 'Customers',
      value: customerCount || 0,
      description: 'Total customers',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Revenue',
      value: '$0',
      description: 'This month',
      icon: DollarSign,
      color: 'text-yellow-600',
    },
    {
      title: 'Growth',
      value: '0%',
      description: 'vs last month',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ]

  const statusColors: Record<string, string> = {
    lead: 'bg-gray-500',
    inspection: 'bg-blue-500',
    proposal: 'bg-yellow-500',
    contract: 'bg-orange-500',
    production: 'bg-purple-500',
    completed: 'bg-green-500',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to TalyaCRM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Latest projects added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects && recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-3 w-3 rounded-full ${statusColors[project.status] || 'bg-gray-400'}`}
                    />
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.customer?.name || 'No customer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {project.address}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects yet</p>
              <p className="text-sm">Create your first project to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
