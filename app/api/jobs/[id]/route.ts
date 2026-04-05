import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { jobSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createServerSupabaseClient()

        const { data: job, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        return NextResponse.json({ job })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
        const rateLimitResult = rateLimit(ip, 'update_job', { limit: 15, windowMs: 60000 })
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
        }

        const { id } = await params
        const supabase = await createServerSupabaseClient()

        // Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin Check
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })
        }

        const body = await request.json()
        const validationResult = jobSchema.partial().safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: validationResult.error.format() },
                { status: 400 }
            )
        }

        // Update
        const { error: updateError } = await supabase
            .from('jobs')
            .update({
                ...validationResult.data
            })
            .eq('id', id)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
        const rateLimitResult = rateLimit(ip, 'delete_job', { limit: 10, windowMs: 60000 })
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
        }

        const { id } = await params
        const supabase = await createServerSupabaseClient()

        // Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin Check
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })
        }

        // Attempt to delete with select() to verify row was affected
        const { data, error: deleteError } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id)
            .select()

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ 
                error: 'Row not found or permission denied in Supabase RLS.',
                hint: 'Check if you have a DELETE policy on the "jobs" table for the "authenticated" role.'
            }, { status: 404 })
        }

        return NextResponse.json({ success: true, deleted: data[0] })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
