import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { profileSchema } from '@/lib/validations'

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient()

        // Require authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name, phone, college, degree, graduation_year, bio, role')
            .eq('id', user.id)
            .single()

        if (profileError) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        return NextResponse.json({ profile })
    } catch (error) {
        console.error('Profile GET error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createServerSupabaseClient()

        // Require authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate request body using Zod
        const validationResult = profileSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: validationResult.error.format() },
                { status: 400 }
            )
        }

        const updates = validationResult.data

        // Perform update
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                ...updates,
            })
            .eq('id', user.id)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ profile: updatedProfile })
    } catch (error) {
        console.error('Profile PUT error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
