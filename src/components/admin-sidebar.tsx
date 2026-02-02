'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, LogOut, Home, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminSidebarProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Produits', href: '/admin/products', icon: Package },
        { name: 'Commandes', href: '/admin/orders', icon: ShoppingCart },
    ]

    return (
        <aside className={`
            fixed lg:sticky top-0 left-0 bottom-0 w-64 bg-gray-900 text-white min-h-screen flex flex-col z-[60] transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold font-serif flex items-center gap-2">
                    <span>Fleuris</span>
                    <span className="text-xs bg-purple-600 px-2 py-0.5 rounded text-white font-sans font-medium">Admin</span>
                </Link>
                {/* Close btn on mobile */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <Home size={20} />
                    <span>Retour Site</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    )
}
