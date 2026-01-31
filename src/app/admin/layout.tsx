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
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar />
            <div className="flex-1 ml-64">
                {/* Header avec logout */}
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Administration Fleuris</h2>
                    <div className="flex items-center gap-4">
                        {userEmail && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User size={16} />
                                <span>{userEmail}</span>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            Déconnexion
                        </button>
                    </div>
                </header>

                {/* Contenu */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
