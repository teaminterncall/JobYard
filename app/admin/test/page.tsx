'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ApiTestPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const getProfile = async () => {
        setLoading(true)
        setMessage('')
        setProfile(null)

        try {
            const res = await fetch('/api/profile')
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to fetch')

            setProfile(data.profile)
            setMessage('✅ Profile fetched successfully!')
        } catch (err: any) {
            setMessage(`❌ Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async () => {
        setLoading(true)
        setMessage('')
        setProfile(null)

        // Generate some random data so we can see the update actually worked
        const randomSec = new Date().getSeconds()
        const updateBody = {
            full_name: `Test Name Updated-${randomSec}`,
            graduation_year: 2026,
            bio: `This bio was updated by the API test UI at second ${randomSec}`
        }

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateBody)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update: ' + JSON.stringify(data.details))
            }

            setProfile(data.profile)
            setMessage('✅ Profile updated successfully!')
        } catch (err: any) {
            setMessage(`❌ Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Profile API Tester</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Click the buttons below to test the endpoints. Your browser handles passing the Supabase Auth cookies automatically!
                </p>
            </div>

            <div className="flex gap-4 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <Button onClick={getProfile} disabled={loading}>
                    {loading ? 'Fetching...' : 'GET /api/profile'}
                </Button>
                <Button onClick={updateProfile} disabled={loading} variant="secondary">
                    {loading ? 'Updating...' : 'PUT /api/profile (Mock Data)'}
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-md font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message}
                </div>
            )}

            {profile && (
                <div className="border rounded-md shadow-sm dark:border-zinc-800 overflow-hidden">
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 border-b dark:border-zinc-800">
                        <h2 className="font-semibold text-sm text-zinc-600 dark:text-zinc-400">JSON Response:</h2>
                    </div>
                    <pre className="p-4 bg-zinc-950 text-emerald-400 overflow-x-auto text-sm">
                        {JSON.stringify(profile, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}
