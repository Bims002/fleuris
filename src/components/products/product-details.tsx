'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Truck, ShieldCheck, Heart, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { Navbar } from '@/components/navbar'

export function ProductDetails({ product }: { product: any }) {
    const router = useRouter()
    const { addItem } = useCart()

    // Selection states
    const [quantity, setQuantity] = useState(1)
    const [selectedSize, setSelectedSize] = useState<'classic' | 'generous' | 'exceptional'>('classic')

    if (!product) return <div className="min-h-screen pt-32 text-center text-gray-500">Produit introuvable</div>

    const sizeMultipliers = {
        classic: 1,
        generous: 1.4,
        exceptional: 1.8
    }

    const basePrice = product.price / 100 // Convert cents to euros
    const unitPrice = basePrice * sizeMultipliers[selectedSize]
    const currentPriceDisplay = unitPrice.toFixed(2)
    const totalPriceDisplay = (unitPrice * quantity).toFixed(2)

    const handleAddToCart = () => {
        addItem({
            product: {
                ...product,
                price: basePrice,
                imageUrl: product.images?.[0] || '/placeholder-1.jpg'
            },
            quantity,
            selectedSize,
            price: unitPrice
        })
        router.push('/cart')
    }

    // Mock extra data if missing (handling legacy data)
    const rating = product.rating || 4.8
    const reviews = product.reviews || 124
    const longDescription = product.longDescription || product.description

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="pt-32 pb-20 px-6 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* Left: Images Gallery */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden group shadow-lg"
                        >
                            <Image
                                src={product.images?.[0] || '/placeholder-1.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-10 mix-blend-multiply" />
                        </motion.div>

                        <div className="grid grid-cols-3 gap-4">
                            {product.images?.map((img: string, i: number) => (
                                <div key={i} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 relative">
                                    <Image src={img} alt={`Vue ${i + 1}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info & Actions */}
                    <div className="flex flex-col h-full relative z-10">
                        {/* Breadcrumb / Category */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <Link href="/products" className="hover:text-purple-600 transition-colors">Boutique</Link>
                            <span>/</span>
                            <span className="text-purple-600 font-medium capitalize">{product.category}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4 leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" className={i < Math.floor(rating) ? "" : "text-gray-200 fill-gray-200"} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 underline underline-offset-2 decoration-gray-200">{reviews} avis</span>
                        </div>

                        {/* Price section */}
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-3xl font-bold text-gray-900">{currentPriceDisplay} €</span>
                            {selectedSize !== 'classic' && (
                                <span className="text-sm text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                                    Taille {selectedSize === 'generous' ? 'Généreuse' : 'Exceptionnelle'}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="prose prose-gray text-gray-600 mb-10 leading-relaxed">
                            <p className="font-medium text-lg text-gray-800 mb-4">"{product.description}"</p>
                            <p>{longDescription}</p>
                        </div>

                        {/* Size Selector */}
                        <div className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <span className="block text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Choisir la taille</span>
                            <div className="grid grid-cols-3 gap-3">
                                {(['classic', 'generous', 'exceptional'] as const).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-3 px-2 rounded-xl text-sm font-medium transition-all border-2 ${selectedSize === size
                                            ? 'border-purple-600 bg-white text-purple-800 shadow-sm'
                                            : 'border-transparent bg-white text-gray-600 hover:border-gray-200'
                                            }`}
                                    >
                                        {size === 'classic' && 'Classique'}
                                        {size === 'generous' && 'Généreux'}
                                        {size === 'exceptional' && 'Exceptionnel'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                {selectedSize === 'classic' ? 'Environ 20 tiges' : selectedSize === 'generous' ? 'Environ 30 tiges (+40%)' : 'Environ 40 tiges (+80%)'}
                            </p>
                        </div>

                        {/* Actions: Quantity & Add to Cart */}
                        <div className="flex gap-4 mb-10 relative z-20">
                            <div className="flex items-center bg-white rounded-full px-4 border-2 border-gray-300 shrink-0 shadow-sm hover:border-purple-500 transition-colors">
                                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                                    <Minus size={20} strokeWidth={2.5} />
                                </button>
                                <span className="w-10 text-center font-bold text-gray-900 mx-2 text-lg">{quantity}</span>
                                <button type="button" onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                                    <Plus size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="flex-1 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3 relative z-30 cursor-pointer"
                            >
                                Ajouter au panier
                                <span className="font-normal text-gray-400">|</span>
                                {totalPriceDisplay} €
                            </button>

                            <button className="p-4 rounded-full border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                                <Heart size={24} />
                            </button>
                        </div>

                        {/* Reassurance */}
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                            <div className="flex items-start gap-3">
                                <Truck className="text-purple-600 mt-1" size={20} />
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Livraison Rapide</h4>
                                    <p className="text-xs text-gray-500 mt-1">En main propre sous 24h.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-green-600 mt-1" size={20} />
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm">Fraîcheur Garantie</h4>
                                    <p className="text-xs text-gray-500 mt-1">Sélectionnés avec soin.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}
