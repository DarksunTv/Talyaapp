import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, MapPin, Calendar, Edit, Trash2, MessageSquare, PhoneCall } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
  status?: 'active' | 'inactive'
  projects_count?: number
}

interface CustomerHeaderProps {
  customer: Customer
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6 flex-1">
            {/* Avatar */}
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Customer Info */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status || 'active'}
                </Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${customer.email}`} className="hover:text-primary transition-colors">
                    {customer.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${customer.phone}`} className="hover:text-primary transition-colors">
                    {customer.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{customer.address}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {customer.projects_count !== undefined && (
                <div className="text-sm text-muted-foreground">
                  {customer.projects_count} project{customer.projects_count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
            <Button variant="outline">
              <PhoneCall className="h-4 w-4 mr-2" />
              Call
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
