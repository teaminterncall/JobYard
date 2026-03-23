import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { resumeSchema } from '@/lib/validations'

// GET /api/resumes -> Lists authenticated user's resumes
export async function GET(request: Request) {
    try {
        const supabase = await createServerSupabaseClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: resumes, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('user_id', user.id)
            .order('uploaded_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ resumes })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
