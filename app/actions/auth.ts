'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/admin')
}

export async function signUp(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Profile fields
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const college = formData.get('college') as string
    const degree = formData.get('degree') as string
    const graduation_year = formData.get('graduation_year') ? parseInt(formData.get('graduation_year') as string) : null
    const bio = formData.get('bio') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = await createServerSupabaseClient()

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return { error: authError.message }
    }

    if (authData.user) {
        // 2. Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            full_name: full_name || null,
            phone: phone || null,
            college: college || null,
            degree: degree || null,
            graduation_year: graduation_year,
            bio: bio || null,
            role: 'user' // Default role
        })

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // Note: In a production app, you might want a more robust saga here
            // to handle partial failures.
            return { error: 'Account created, but profile setup failed. Contact admin.' }
        }
    }

    revalidatePath('/', 'layout')
    redirect('/admin')
}

export async function logout() {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/auth/login')
}

export async function signInWithGoogle() {
    const supabase = await createServerSupabaseClient()

    // Bulletproof Dynamic Origin Extraction
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https')
    const origin = `${protocol}://${host}`

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Google OAuth error:', error)
        redirect('/auth/login?error=oauth_failed')
    }

    if (data.url) {
        redirect(data.url)
    }
}
