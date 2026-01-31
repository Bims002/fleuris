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
                <div className="max-w-3xl mx-auto">
                    <article className="space-y-6 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-6 [&_h1]:font-serif [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-8 [&_h3]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_p]:text-gray-600 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-4 [&_li]:text-base [&_li]:leading-7 [&_li]:text-gray-600 [&_li]:mb-2 [&_strong]:font-semibold [&_strong]:text-gray-900">
                        {children}
                    </article>
                </div>
            </div>
        </main>
    )
}
