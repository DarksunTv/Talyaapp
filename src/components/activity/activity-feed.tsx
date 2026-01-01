import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatActivityMessage } from '@/lib/utils/activity'
import type { ActivityAction } from '@/types'
import { 
  FolderPlus, 
  Edit, 
  RefreshCw, 
  UserPlus, 
  Camera, 
  FileText, 
  Send, 
  CheckCircle, 
  Phone, 
  MessageSquare 
} from 'lucide-react'

interface ActivityFeedProps {
  activities: {
    id: string
    action: ActivityAction
    details?: Record<string, unknown>
    created_at: string
    user?: {
      name?: string
      email: string
      avatar_url?: string
    }
  }[]
}

const actionIcons: Record<string, React.ReactNode> = {
  'project.created': <FolderPlus className="h-4 w-4" />,
  'project.updated': <Edit className="h-4 w-4" />,
  'project.status_changed': <RefreshCw className="h-4 w-4" />,
  'customer.created': <UserPlus className="h-4 w-4" />,
  'customer.updated': <Edit className="h-4 w-4" />,
  'photo.uploaded': <Camera className="h-4 w-4" />,
  'estimate.created': <FileText className="h-4 w-4" />,
  'estimate.sent': <Send className="h-4 w-4" />,
  'contract.created': <FileText className="h-4 w-4" />,
  'contract.signed': <CheckCircle className="h-4 w-4" />,
  'communication.logged': <Phone className="h-4 w-4" />,
  'note.added': <MessageSquare className="h-4 w-4" />,
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Recent activity will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No activity yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Recent updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {/* Activity items */}
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-4 pl-10">
                {/* Icon */}
                <div className="absolute left-0 p-2 bg-background border rounded-full">
                  {actionIcons[activity.action] || <Edit className="h-4 w-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {activity.user?.name?.[0] || activity.user?.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {activity.user?.name || activity.user?.email || 'Unknown'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatActivityMessage(activity.action, activity.details as Record<string, unknown>)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
