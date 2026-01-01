import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, User, Edit, Trash2, Share2 } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  address: string
  status: string
  customer?: { name: string; id: string }
  created_at: string
  description?: string
}

interface ProjectHeaderProps {
  project: Project
}

const statusColors: Record<string, string> = {
  lead: 'bg-gray-500',
  inspection: 'bg-blue-500',
  proposal: 'bg-yellow-500',
  contract: 'bg-purple-500',
  production: 'bg-orange-500',
  completed: 'bg-green-500',
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const statusColor = statusColors[project.status] || 'bg-gray-500'

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            {/* Title and Status */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge className={statusColor}>
                {project.status}
              </Badge>
            </div>

            {/* Project Info */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{project.address}</span>
              </div>
              
              {project.customer && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <Link 
                    href={`/dashboard/customers/${project.customer.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {project.customer.name}
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
