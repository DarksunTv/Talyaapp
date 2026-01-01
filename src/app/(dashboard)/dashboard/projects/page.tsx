import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const statusConfig = {
  lead: { label: 'Lead', color: 'bg-gray-500', textColor: 'text-gray-500' },
  inspection: { label: 'Inspection', color: 'bg-blue-500', textColor: 'text-blue-500' },
  proposal: { label: 'Proposal', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  contract: { label: 'Contract', color: 'bg-orange-500', textColor: 'text-orange-500' },
  production: { label: 'Production', color: 'bg-purple-500', textColor: 'text-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500', textColor: 'text-green-500' },
}

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('crm_projects')
    .select(`
      *,
      customer:crm_customers(name, phone)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Group projects by status for Kanban view
  const projectsByStatus = projects?.reduce((acc, project) => {
    const status = project.status || 'lead'
    if (!acc[status]) acc[status] = []
    acc[status].push(project)
    return acc
  }, {} as Record<string, typeof projects>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage roofing projects and jobs</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs for view modes */}
      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TabsList>

        {/* Kanban View */}
        <TabsContent value="kanban">
          <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="min-w-[280px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-3 w-3 rounded-full ${config.color}`} />
                  <h3 className="font-semibold">{config.label}</h3>
                  <span className="text-muted-foreground text-sm">
                    ({projectsByStatus?.[status]?.length || 0})
                  </span>
                </div>
                <div className="space-y-3">
                  {projectsByStatus?.[status]?.map((project: any) => (
                    <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-1">{project.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {project.customer?.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {project.address}
                          </p>
                          {project.insurance_claim_number && (
                            <div className="mt-2 inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                              Insurance
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {(!projectsByStatus?.[status] || projectsByStatus[status].length === 0) && (
                    <div className="border border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                      No projects
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${statusConfig[project.status as keyof typeof statusConfig]?.color}`} />
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {project.customer?.name} • {project.address}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm capitalize">{project.status}</p>
                        {project.insurance_claim_number && (
                          <p className="text-xs text-blue-600">Insurance</p>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No projects yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
