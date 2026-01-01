import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, User, MoreVertical, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  address: string
  status: string
  customer?: { name: string }
  photos?: any[]
  created_at: string
}

interface ProjectCardProps {
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

export function ProjectCard({ project }: ProjectCardProps) {
  const photoCount = project.photos?.length || 0
  const statusColor = statusColors[project.status] || 'bg-gray-500'

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <Link href={`/dashboard/projects/${project.id}`}>
        <CardContent className="p-0">
          {/* Image Placeholder */}
          <div className="relative h-40 bg-muted flex items-center justify-center overflow-hidden">
            {photoCount > 0 ? (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
            )}
            <div className="absolute top-2 right-2">
              <Badge className={statusColor}>
                {project.status}
              </Badge>
            </div>
            {photoCount > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {photoCount} photo{photoCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{project.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="line-clamp-1">{project.customer?.name || 'No customer'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
