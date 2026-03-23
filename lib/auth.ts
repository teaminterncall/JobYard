import { createServerSupabaseClient } from './supabase'

export async function getUser() {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
        console.error('Error fetching user:', error.message)
        return null
    }

    return user
}

export async function getSession() {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
        console.error('Error fetching session:', error.message)
        return null
    }

    return session
}
