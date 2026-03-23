import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/admin'

    if (code) {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user) {
            // Check if user has a profile, if not create one
            // This handles the OAuth first-time sign-in scenario
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single()

            if (!existingProfile) {
                console.log("Creating default profile for OAuth user:", user.email)
                await supabase.from('profiles').insert({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || null,
                    role: 'user', // Default role
                })
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=auth_error_callback`)
}
