import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('applied_date', { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { company_name, job_title, location, platform, apply_url, status, applied_date, notes } = body;

    if (!company_name || !job_title) {
       return NextResponse.json({ error: 'Company Name and Job Title are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert({
         user_id: user.id,
         company_name,
         job_title,
         location,
         platform: platform || 'External',
         apply_url,
         status: status || 'Applied',
         applied_date: applied_date || new Date().toISOString(),
         notes
      })
      .select('*')
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
