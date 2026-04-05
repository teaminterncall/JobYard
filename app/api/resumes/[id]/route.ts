import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function DELETE(
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

        // Permissions check: User can only delete their own resume (unless admin)
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (resume.user_id !== user.id && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 1. Delete from Supabase Storage
        const { error: storageError } = await supabase
            .storage
            .from('resumes')
            .remove([resume.file_path])

        if (storageError) {
            return NextResponse.json({ error: storageError.message }, { status: 500 })
        }

        // 2. Delete from Database
        const { error: dbError } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id)

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 500 })
        }

        return NextResponse.json({ message: 'Resume deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
