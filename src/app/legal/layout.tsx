import { Navbar } from '@/components/navbar'

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24">
                <div className="max-w-3xl mx-auto prose prose-purple prose-lg">
                    {children}
                </div>
            </div>
        </main>
    )
}
