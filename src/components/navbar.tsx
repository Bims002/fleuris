'use client'

import Link from 'next/link'
import { ShoppingCart, User, LogOut, Package, Shield, Menu, X, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export function Navbar() {
    const { totalValues } = useCart()
    const [user, setUser] = useState<any>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false)
        setIsMenuOpen(false)
    }, [pathname])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        setIsMenuOpen(false)
    }

    const navLinks = [
        { name: 'Nos Bouquets', href: '/products' },
        { name: 'Occasions', href: '/products' }, // Could be a specific route later
        { name: 'Plantes', href: '/products?category=plantes' },
        { name: 'À Propos', href: '/about' },
    ]

    return (
        <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-serif hover:opacity-80 transition-opacity">
                            Fleuris
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>

                    {/* Icons & Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4">

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-full">
                            <ShoppingCart size={22} strokeWidth={2} />
                            <AnimatePresence>
                                {totalValues.count > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute top-0 right-0 inline-flex items-center justify-center bg-purple-600 text-white text-[10px] font-bold w-5 h-5 rounded-full border-2 border-white"
                                    >
                                        {totalValues.count}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* User Menu (Desktop) */}
                        <div className="hidden md:block relative">
                            {user ? (
                                <>
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-2 text-gray-600 hover:text-purple-600 transition-colors focus:outline-none hover:bg-purple-50 rounded-full"
                                    >
                                        <User size={22} strokeWidth={2} />
                                    </button>

                                    <AnimatePresence>
                                        {isMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.1 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-sm font-semibold text-gray-900">Mon Compte</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                </div>

                                                <div className="py-1">
                                                    <Link
                                                        href="/account/orders"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                    >
                                                        <Package size={16} />
                                                        Mes Commandes
                                                    </Link>

                                                    <Link
                                                        href="/admin"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                    >
                                                        <Shield size={16} />
                                                        Administration
                                                    </Link>
                                                </div>

                                                <div className="border-t border-gray-100 mt-1 pt-1">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                                    >
                                                        <LogOut size={16} />
                                                        Se déconnecter
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                <Link href="/login" className="p-2 text-gray-600 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-full">
                                    <User size={22} strokeWidth={2} />
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-lg"
                    >
                        <div className="px-4 py-4 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-900 font-medium"
                                >
                                    {link.name}
                                    <ChevronRight size={16} className="text-gray-400" />
                                </Link>
                            ))}

                            <div className="h-px bg-gray-100 my-2" />

                            {user ? (
                                <>
                                    <Link href="/account/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 text-gray-900">
                                        <span className="flex items-center gap-3">
                                            <Package size={18} className="text-purple-600" />
                                            Mes Commandes
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut size={18} />
                                        Se déconnecter
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" className="flex items-center justify-center w-full bg-gray-900 text-white py-3 rounded-xl font-medium">
                                    Se connecter
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
