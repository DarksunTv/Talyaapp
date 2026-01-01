import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, Shield, DollarSign, Camera, FileText, Ruler, ClipboardList, Wrench, Receipt, FolderOpen } from 'lucide-react'
import Link from 'next/link'

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

const statusConfig = {
  lead: { label: 'Lead', color: 'bg-gray-500' },
  inspection: { label: 'Inspection', color: 'bg-blue-500' },
  proposal: { label: 'Proposal', color: 'bg-yellow-500' },
  contract: { label: 'Contract', color: 'bg-orange-500' },
  production: { label: 'Production', color: 'bg-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500' },
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('crm_projects')
    .select(`
      *,
      customer:crm_customers(*)
    `)
    .eq('id', id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get photos
  const { data: photos } = await supabase
    .from('crm_photos')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(6)

  const status = statusConfig[project.status as keyof typeof statusConfig]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <span className={`px-2 py-1 rounded-full text-xs text-white ${status?.color}`}>
                {status?.label}
              </span>
            </div>
            <p className="text-muted-foreground">{project.customer?.name}</p>
          </div>
        </div>
        <Link href={`/dashboard/projects/${id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{project.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/dashboard/customers/${project.customer?.id}`} className="font-medium text-primary hover:underline">
                  {project.customer?.name}
                </Link>
                {project.customer?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${project.customer.phone}`} className="hover:underline">
                      {project.customer.phone}
                    </a>
                  </div>
                )}
                {project.customer?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${project.customer.email}`} className="hover:underline">
                      {project.customer.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insurance Info */}
            {project.insurance_claim_number && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Insurance Claim
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Claim Number</p>
                      <p className="font-medium">{project.insurance_claim_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Insurance Company</p>
                      <p className="font-medium">{project.insurance_company || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adjuster</p>
                      <p className="font-medium">{project.adjuster_name || 'Not assigned'}</p>
                      {project.adjuster_phone && (
                        <a href={`tel:${project.adjuster_phone}`} className="text-sm text-primary hover:underline">
                          {project.adjuster_phone}
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deductible</p>
                      <p className="font-medium">
                        {project.deductible ? `$${project.deductible.toLocaleString()}` : 'Not set'}
                      </p>
                    </div>
                  </div>
                  {project.adjuster_meeting && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Adjuster Meeting</p>
                      <p className="text-muted-foreground">
                        {new Date(project.adjuster_meeting).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Photos</CardTitle>
                <CardDescription>Project photos and documentation</CardDescription>
              </div>
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
            </CardHeader>
            <CardContent>
              {photos && photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg bg-muted overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Project photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No photos uploaded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Measurements</CardTitle>
                <CardDescription>Roof measurements and calculations</CardDescription>
              </div>
              <Button>
                <Ruler className="h-4 w-4 mr-2" />
                Add Measurement
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No measurements yet</p>
                <p className="text-sm">Use the DIY tool to measure the roof</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs with placeholder content */}
        {['estimates', 'contracts', 'materials', 'workorders', 'invoices', 'documents'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{tab}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No {tab} yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
