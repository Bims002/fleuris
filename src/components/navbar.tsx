'use client'

import Link from 'next/link'
import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
    const { totalValues } = useCart()

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent font-serif">
                        Fleuris
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                            Produits
                        </Link>

                        <div className="flex items-center space-x-4">
                            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors">
                                <ShoppingCart size={20} />
                                <AnimatePresence>
                                    {totalValues.count > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-purple-600 rounded-full"
                                        >
                                            {totalValues.count}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                            <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                                <User size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}
