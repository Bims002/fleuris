'use client'

import { Navbar } from '@/components/navbar'
import { useCart } from '@/context/cart-context'
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalValues } = useCart()

    const shippingCost = 0 // Livraison gratuite
    const totalWithShipping = (totalValues.price + shippingCost).toFixed(2)

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif mb-8">Votre Panier</h1>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                            <p className="text-gray-500 text-lg mb-6">Votre panier est vide pour le moment.</p>
                            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-black transition-colors">
                                Découvrir nos bouquets
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                            {/* Cart Items List */}
                            <div className="lg:col-span-8 space-y-6">
                                {items.map((item) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={`${item.product.id}-${item.selectedSize}`}
                                        className="bg-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                                    >
                                        {/* Image Thumbnail */}
                                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden relative">
                                            {/* Fallback image logic */}
                                            <div className="absolute inset-0 bg-gray-200" />
                                            {/* In real app: <Image src={item.product.images?.[0] || item.product.imageUrl} ... /> */}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 font-serif">{item.product.name}</h3>
                                                    <p className="text-sm text-gray-500 capitalize">Taille : {item.selectedSize === 'classic' ? 'Classique' : item.selectedSize === 'generous' ? 'Généreuse' : 'Exceptionnelle'}</p>
                                                </div>
                                                <p className="font-bold text-gray-900">{item.price.toFixed(2)} €</p>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-colors">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                                                        className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                                                    >
                                                        <Minus size={16} strokeWidth={2.5} />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                                                        className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                                                    >
                                                        <Plus size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>

                                                {/* Remove */}
                                                <button
                                                    onClick={() => removeItem(item.product.id, item.selectedSize)}
                                                    className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                                    aria-label="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Summary / Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-3xl p-8 shadow-sm sticky top-32">
                                    <h2 className="text-xl font-bold text-gray-900 font-serif mb-6">Récapitulatif</h2>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Sous-total</span>
                                            <span>{totalValues.price.toFixed(2)} €</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Livraison</span>
                                            <span>{shippingCost.toFixed(2)} €</span>
                                        </div>
                                        <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-gray-900">
                                            <span>Total</span>
                                            <span>{totalWithShipping} €</span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/checkout"
                                        className="w-full bg-gray-900 text-white rounded-full py-4 font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
                                    >
                                        Commander <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <p className="text-center text-xs text-gray-400 mt-4">
                                        Paiement sécurisé par Stripe. Livraison garantie 24/48h.
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
