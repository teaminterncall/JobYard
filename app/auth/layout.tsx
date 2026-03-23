import Link from "next/link"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
            <header className="p-6">
                <Link href="/" className="font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                    JOB YARD
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>
        </div>
    )
}
