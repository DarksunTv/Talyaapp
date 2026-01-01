import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjectCard } from '@/components/projects/project-card'
import { FolderKanban, Search, Plus, LayoutGrid, List, Filter } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  // Fetch projects with customer info
  const { data: projects } = await supabase
    .from('crm_projects')
    .select('*, customer:crm_customers(name), photos:crm_photos(id)')
    .order('created_at', { ascending: false })

  const hasProjects = projects && projects.length > 0

  // Group projects by status for Kanban view
  const projectsByStatus = {
    lead: projects?.filter(p => p.status === 'lead') || [],
    inspection: projects?.filter(p => p.status === 'inspection') || [],
    proposal: projects?.filter(p => p.status === 'proposal') || [],
    contract: projects?.filter(p => p.status === 'contract') || [],
    production: projects?.filter(p => p.status === 'production') || [],
    completed: projects?.filter(p => p.status === 'completed') || [],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage roofing projects and jobs
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name, address, or customer..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <div className="flex border rounded-md">
              <Button variant="ghost" size="sm" className="rounded-r-none">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded-l-none border-l">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      {hasProjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.entries(projectsByStatus).map(([status, statusProjects]) => (
            <Card key={status} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="capitalize">{status}</span>
                  <Badge variant="secondary" className="ml-2">
                    {statusProjects.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pt-0">
                {statusProjects.length > 0 ? (
                  statusProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No {status} projects
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-6">
                <FolderKanban className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No projects yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create your first roofing project to start tracking progress, estimates,
                and communications.
              </p>
            </div>
            <Link href="/dashboard/projects/new">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats */}
      {hasProjects && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Total: {projects.length} project{projects.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-4">
            <span>Active: {projects.filter(p => p.status !== 'completed').length}</span>
            <span>Completed: {projectsByStatus.completed.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
