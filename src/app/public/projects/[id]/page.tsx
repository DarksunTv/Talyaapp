import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Calendar } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { id } = await params;
  const { data: project } = await supabase
    .from('crm_projects')
    .select('name, address, company_id, crm_companies!inner(name)')
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const title = `${project.name} | ${(project as any).crm_companies?.name || 'Roofing Project'}`;
  const description = `Roofing project at ${project.address}. Professional roofing services.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PublicProjectPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: project } = await supabase
    .from('crm_projects')
    .select(`
      *,
      crm_customers!inner(name),
      crm_photos(url, caption, photo_type),
      crm_companies!inner(name, settings)
    `)
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!project) {
    notFound();
  }

  const beforePhotos = (project as any).crm_photos?.filter((p: any) => p.photo_type === 'before') || [];
  const afterPhotos = (project as any).crm_photos?.filter((p: any) => p.photo_type === 'after') || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">{(project as any).crm_companies?.name || 'Roofing Company'}</h1>
          <p className="text-muted-foreground">Professional Roofing Services</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{project.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Completed: {new Date(project.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>Contact us</span>
              </div>
            </CardContent>
          </Card>

          {/* Before Photos */}
          {beforePhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Before</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {beforePhotos.map((photo: any, index: number) => (
                    <div key={index} className="relative aspect-video">
                      <Image
                        src={photo.url}
                        alt={photo.caption || 'Before photo'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* After Photos */}
          {afterPhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>After</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {afterPhotos.map((photo: any, index: number) => (
                    <div key={index} className="relative aspect-video">
                      <Image
                        src={photo.url}
                        alt={photo.caption || 'After photo'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schema.org markup */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: (project as any).crm_companies?.name || 'Roofing Company',
                description: `Roofing project: ${project.name}`,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: project.address,
                },
              }),
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {(project as any).crm_companies?.name || 'Roofing Company'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
