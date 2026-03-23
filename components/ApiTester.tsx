'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ApiTester() {
    const [dataPayload, setDataPayload] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [file, setFile] = useState<File | null>(null)

    const handleFetch = async (url: string, method: string, body?: any) => {
        setLoading(true)
        setMessage('')
        setDataPayload(null)

        try {
            const res = await fetch(url, {
                method,
                headers: body ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to fetch: ' + JSON.stringify(data.details))

            setDataPayload(data)
            setMessage(`✅ ${method} ${url} successful!`)
        } catch (err: any) {
            setMessage(`❌ Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const getProfile = () => handleFetch('/api/profile', 'GET')

    const updateProfile = () => {
        const randomSec = new Date().getSeconds()
        handleFetch('/api/profile', 'PUT', {
            full_name: `Test Name Updated-${randomSec}`,
            graduation_year: 2026,
            bio: `This bio was updated by the API test UI at second ${randomSec}`
        })
    }

    const getJobs = () => handleFetch('/api/jobs?limit=5', 'GET')

    const createJob = () => {
        const randomSec = new Date().getSeconds()
        handleFetch('/api/jobs', 'POST', {
            title: `Senior Engineer #${randomSec}`,
            company: 'Tech Corp ' + randomSec,
            description: 'Looking for an amazing engineer to build things.',
            job_type: 'Full-time',
            location: 'Remote',
            apply_url: 'https://example.com/apply',
            is_active: true
        })
    }

    // Resume Upload Testing Flow
    // Resume Upload Testing Flow
    const handleUpload = async () => {
        if (!file) {
            setMessage('❌ Error: Please select a file first.')
            return
        }

        setLoading(true)
        setMessage('⏳ Getting signed URL...')
        setDataPayload(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const uploadRes = await fetch('/api/resumes/upload', {
                method: 'POST',
                body: formData
            })

            const uploadData = await uploadRes.json()

            if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload resume')

            setDataPayload(uploadData)
            setMessage('✅ Resume fully uploaded and saved successfully!')
            setFile(null) // Reset file input

        } catch (err: any) {
            setMessage(`❌ Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const getResumes = () => handleFetch('/api/resumes', 'GET')

    const testDownloadResume = async () => {
        setLoading(true)
        setMessage('⏳ fetching resumes list...')
        setDataPayload(null)

        try {
            const listRes = await fetch('/api/resumes')
            const listData = await listRes.json()
            if (!listRes.ok) throw new Error(listData.error || 'Failed to fetch resumes')

            if (!listData.resumes || listData.resumes.length === 0) {
                throw new Error("You don't have any uploaded resumes to download yet!")
            }

            const latestResume = listData.resumes[0]
            setMessage(`⏳ Generating download URL for ${latestResume.id}...`)

            const dlRes = await fetch(`/api/resumes/${latestResume.id}/download-url`)
            const dlData = await dlRes.json()
            if (!dlRes.ok) throw new Error(dlData.error || 'Failed to generate download url')

            setDataPayload(dlData)
            setMessage('✅ Download URL generated! Opening in new tab...')
            
            // Open the secure URL!
            if (dlData.downloadUrl) {
                window.open(dlData.downloadUrl, '_blank')
            }
        } catch (err: any) {
            setMessage(`❌ Error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6 w-full text-left">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">API Tester</h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Click the buttons below to natively test your endpoints. Ensure you are logged in (as an admin for POST/PUT jobs).
                </p>
            </div>

            <div className="space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-lg border-b pb-2 dark:border-zinc-800">Profile Endpoints</h3>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={getProfile} disabled={loading}>GET /api/profile</Button>
                    <Button onClick={updateProfile} disabled={loading} variant="secondary">PUT /api/profile (Mock)</Button>
                </div>
            </div>

            <div className="space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-lg border-b pb-2 dark:border-zinc-800">Jobs Endpoints</h3>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={getJobs} disabled={loading}>GET /api/jobs</Button>
                    <Button onClick={createJob} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">POST /api/jobs (Admin)</Button>
                </div>
            </div>

            <div className="space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-lg border-b pb-2 dark:border-zinc-800">Resumes Endpoints</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".pdf,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="flex-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded-md p-2 bg-transparent"
                        />
                        <Button onClick={handleUpload} disabled={loading || !file} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? 'Uploading...' : 'Upload Real File'}
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                        <Button onClick={getResumes} disabled={loading} variant="outline">GET /api/resumes (List Mine)</Button>
                        <Button onClick={testDownloadResume} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">GET Download URL & Open</Button>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-md font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {message}
                </div>
            )}

            {dataPayload && (
                <div className="border rounded-md shadow-sm dark:border-zinc-800 overflow-hidden">
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 border-b dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-zinc-600 dark:text-zinc-400">JSON Response:</h3>
                    </div>
                    <pre className="p-4 bg-zinc-950 text-emerald-400 overflow-x-auto text-sm max-h-[500px] overflow-y-auto">
                        {JSON.stringify(dataPayload, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}
