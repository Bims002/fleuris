'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin-sidebar'
import { LogOut, User } from 'lucide-react'
import { isAdminEmail } from '@/lib/auth'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user || !isAdminEmail(user.email)) {
                // Si on n'est pas sur la page de login, rediriger
                if (pathname !== '/admin/login') {
                    router.push('/admin/login')
                }
                setIsLoading(false)
                return
            }

            setUserEmail(user.email || null)
            setIsLoading(false)
        }

        checkAuth()
    }, [router, pathname, supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
    }

    // Page de login : pas de layout admin
    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Vérification des accès...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
            {/* Sidebar avec gestion mobile */}
            <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Admin */}
                <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        {/* Toggle Sidebar Mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 truncate">Administration Fleuris</h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {userEmail && (
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                                <User size={16} />
                                <span className="max-w-[150px] truncate">{userEmail}</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                        >
                            <LogOut size={16} />
                            <span className="hidden xs:inline">Déconnexion</span>
                        </button>
                    </div>
                </header>

                {/* Contenu */}
                <main className="p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
