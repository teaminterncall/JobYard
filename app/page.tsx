import Link from "next/link"
import { ApiTester } from "@/components/ApiTester"
import { getUser } from "@/lib/auth"
import { createServerSupabaseClient } from "@/lib/supabase"
import { logout } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function Home(
  props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams

  // ULTIMATE FAILSAFE: If Supabase strict-matching drops the user on the root with a code,
  // we catch it and force it through the callback pipeline to solidify the session!
  if (searchParams?.code) {
    redirect(`/auth/callback?code=${searchParams.code}`)
  }

  const user = await getUser()
  let profile = null

  if (user) {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
    profile = data
  }

  return (
    <div className="flex min-h-screen flex-col font-sans bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-xl tracking-tight">JOB YARD</div>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-zinc-500">
                Hi, {profile?.full_name || user.email} {profile?.role === 'admin' && '(Admin)'}
              </span>
              {profile?.role === 'admin' && (
                <Link href="/admin" className="text-sm font-medium hover:text-blue-600 transition-colors">Dashboard</Link>
              )}
              <form action={logout}>
                <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-blue-600 transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="text-sm font-medium hover:text-blue-600 transition-colors">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Find the right <span className="text-blue-600">gig</span>.
            <br /> Build your career.
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400">
            Welcome to Job Yard. The best place to find top tech jobs, freelance gigs, and opportunities tailored for you.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!user ? (
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
              >
                Get Started
              </Link>
            ) : (
              <div className="px-8 py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium rounded-full cursor-default">
                You're Signed In!
              </div>
            )}
          </div>
        </div>

        {/* API Tester UI Embedded Right In Home Page */}
        <div className="mt-16 w-full max-w-3xl">
          <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-8" />
          <ApiTester />
        </div>
      </main>

      <footer className="w-full py-6 text-center text-sm text-zinc-500 border-t border-zinc-200 dark:border-zinc-800">
        &copy; {new Date().getFullYear()} Job Yard. All rights reserved.
      </footer>
    </div>
  )
}
