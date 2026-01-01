// Public API for projects - No authentication required
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch project only if it's public
    const { data: project, error } = await supabase
      .from('crm_projects')
      .select(`
        *,
        customer:crm_customers(name, address),
        photos:crm_photos(url, caption, photo_type),
        company:crm_companies(name, settings)
      `)
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found or not public' },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const publicProject = {
      id: project.id,
      name: project.name,
      address: project.address,
      status: project.status,
      photos: project.photos,
      company: {
        name: project.company.name,
        phone: project.company.settings?.phone,
      },
      // Only include customer name if they approved
      customerName: project.customer?.name,
    };

    return NextResponse.json(publicProject);
  } catch (error) {
    console.error('Public API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
