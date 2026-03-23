import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
    const user = await getUser()

    if (!user) {
        redirect('/auth')
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <p className="mb-4">Welcome back, {user.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold mb-2">Total Jobs</h2>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold mb-2">Active Listings</h2>
                    <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold mb-2">Applications</h2>
                    <p className="text-3xl font-bold text-purple-600">0</p>
                </div>
            </div>
        </div>
    )
}
