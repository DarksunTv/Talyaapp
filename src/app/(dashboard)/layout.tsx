import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // DISABLED FOR LOCAL DEVELOPMENT
  // TODO: Re-enable authentication for production
  
  /* 
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with company info
  const { data: profile } = await supabase
    .from('crm_profiles')
    .select(`
      *,
      company:crm_companies(*)
    `)
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }
  */

  // Mock profile for local development
  const profile = {
    id: 'local-user',
    name: 'Local User',
    email: 'local@example.com',
    role: 'admin',
    company: {
      id: 'local-company',
      name: 'Local Company',
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar profile={profile} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
