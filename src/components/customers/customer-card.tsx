import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MapPin, MoreVertical } from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  projects_count?: number
  last_contact?: string
  status?: 'active' | 'inactive'
}

interface CustomerCardProps {
  customer: Customer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const initials = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <Link href={`/dashboard/customers/${customer.id}`}>
                <h3 className="font-semibold hover:text-primary transition-colors">
                  {customer.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{customer.address}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Projects: </span>
              <span className="font-medium">{customer.projects_count || 0}</span>
            </div>
            {customer.last_contact && (
              <div>
                <span className="text-muted-foreground">Last Contact: </span>
                <span className="font-medium">{customer.last_contact}</span>
              </div>
            )}
          </div>
          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
            {customer.status || 'active'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
