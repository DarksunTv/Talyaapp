'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProjectHeader } from '@/components/projects/project-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, FileSignature, Image as ImageIcon, MessageSquare, Ruler, Activity, Plus } from 'lucide-react'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project with related data
  const { data: project } = await supabase
    .from('crm_projects')
    .select(`
      *,
      customer:crm_customers(id, name, email, phone),
      estimates:crm_estimates(id, total, status, created_at),
      contracts:crm_contracts(id, status, created_at),
      photos:crm_photos(id, url, category),
      measurements:crm_measurements(id, area, created_at)
    `)
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <ProjectHeader project={project} />

      {/* Tabs */}
      <ProjectTabs project={project} />
    </div>
  )
}

function ProjectTabs({ project }: { project: any }) {
  const [activeTab, setActiveTab] = useState('estimates')

  const estimates = project.estimates || []
  const contracts = project.contracts || []
  const photos = project.photos || []
  const measurements = project.measurements || []

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="estimates" active={activeTab === 'estimates'}>
          <FileText className="h-4 w-4 mr-2" />
          Estimates ({estimates.length})
        </TabsTrigger>
        <TabsTrigger value="contracts" active={activeTab === 'contracts'}>
          <FileSignature className="h-4 w-4 mr-2" />
          Contracts ({contracts.length})
        </TabsTrigger>
        <TabsTrigger value="photos" active={activeTab === 'photos'}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Photos ({photos.length})
        </TabsTrigger>
        <TabsTrigger value="chat" active={activeTab === 'chat'}>
          <MessageSquare className="h-4 w-4 mr-2" />
          AI Chat
        </TabsTrigger>
        <TabsTrigger value="measurements" active={activeTab === 'measurements'}>
          <Ruler className="h-4 w-4 mr-2" />
          Measurements
        </TabsTrigger>
        <TabsTrigger value="activity" active={activeTab === 'activity'}>
          <Activity className="h-4 w-4 mr-2" />
          Activity
        </TabsTrigger>
      </TabsList>

      {/* Estimates Tab */}
      <TabsContent value="estimates">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Estimates</CardTitle>
              <CardDescription>Manage project estimates and pricing</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Estimate
            </Button>
          </CardHeader>
          <CardContent>
            {estimates.length > 0 ? (
              <div className="space-y-4">
                {estimates.map((estimate: any) => (
                  <Card key={estimate.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Estimate #{estimate.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(estimate.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${estimate.total.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground capitalize">{estimate.status}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No estimates yet</p>
                <p className="text-sm mt-2">Create your first estimate for this project</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Contracts Tab */}
      <TabsContent value="contracts">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>View and manage project contracts</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Contract
            </Button>
          </CardHeader>
          <CardContent>
            {contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.map((contract: any) => (
                  <Card key={contract.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Contract #{contract.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(contract.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{contract.status}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Contract
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileSignature className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contracts yet</p>
                <p className="text-sm mt-2">Generate a contract from an estimate</p>
              </div>
            )}
          </CardContent>
        </Card>
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
              <Plus className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </CardHeader>
          <CardContent>
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo: any) => (
                  <div key={photo.id} className="aspect-square bg-muted rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No photos yet</p>
                <p className="text-sm mt-2">Upload project photos to document progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Chat Tab */}
      <TabsContent value="chat">
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Ask questions about this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>AI Chat coming soon</p>
              <p className="text-sm mt-2">Get project insights and recommendations</p>
            </div>
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
              <Plus className="h-4 w-4 mr-2" />
              Add Measurement
            </Button>
          </CardHeader>
          <CardContent>
            {measurements.length > 0 ? (
              <div className="space-y-4">
                {measurements.map((measurement: any) => (
                  <Card key={measurement.id}>
                    <CardContent className="p-4">
                      <p className="font-medium">{measurement.area} sq ft</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(measurement.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No measurements yet</p>
                <p className="text-sm mt-2">Add roof measurements for accurate estimates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Activity Tab */}
      <TabsContent value="activity">
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Project history and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No activity yet</p>
              <p className="text-sm mt-2">Activity will appear as you work on this project</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
