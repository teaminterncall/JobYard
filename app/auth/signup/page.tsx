'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setLoading(true)
        setError(null)

        // Add basic validation
        const password = formData.get('password') as string
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            setLoading(false)
            return
        }

        const result = await signUp(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Join Job Yard to find your next great opportunity
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Auth Credentials */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Account Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Password *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="full_name">Full Name *</label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                required
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="phone">Phone Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="college">College/University</label>
                            <input
                                id="college"
                                name="college"
                                type="text"
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="State University"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="degree">Degree</label>
                            <input
                                id="degree"
                                name="degree"
                                type="text"
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="B.S. Computer Science"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="graduation_year">Graduation Year</label>
                            <input
                                id="graduation_year"
                                name="graduation_year"
                                type="number"
                                min="1950" max="2030"
                                className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="2024"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="bio">Professional Bio</label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Tell us a bit about your experience..."
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full py-6 text-base mt-4"
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>

            <div className="mt-8 text-center text-sm">
                <Link
                    href="/auth/login"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                    Already have an account? Sign in
                </Link>
            </div>
        </div>
    )
}
