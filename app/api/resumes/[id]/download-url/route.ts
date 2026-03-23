import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createServerSupabaseClient()

        // Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch the DB record for the resume
        const { data: resume, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
        }

        // Permissions check: User can only download their own resume (unless admin)
        // We fetch user profile to see if they're admin
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (resume.user_id !== user.id && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Generate signed download URL (valid for 60 seconds)
        const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('resumes')
            .createSignedUrl(resume.file_path, 60)

        if (signedUrlError) {
            return NextResponse.json({ error: signedUrlError.message }, { status: 500 })
        }

        return NextResponse.json({ downloadUrl: signedUrlData.signedUrl })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
