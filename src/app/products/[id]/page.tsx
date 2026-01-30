'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { motion } from 'framer-motion'
import { Star, Truck, ShieldCheck, Heart, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'

// Mock Data Service (simulating DB fetch)
const getProduct = (id: string) => {
    // In a real app, fetch from Supabase here
    return {
        id,
        name: 'Bouquet Printanier',
        price: 35.00,
        description: "Une symphonie de couleurs pour célébrer le renouveau. Composé de tulipes frangées, de jonquilles éclatantes et de touches de feuillage eucalyptus.",
        longDescription: "Nos artisans fleuristes sélectionnent chaque tige avec soin pour garantir une fraîcheur exceptionnelle. Ce bouquet 'Printanier' est pensé pour évoluer : les tulipes continueront de grandir légèrement en vase, offrant un spectacle vivant et changeant au fil des jours. Idéal pour illuminer un intérieur ou transmettre un message d'optimisme.",
        images: ['/placeholder-1.jpg', '/placeholder-detail-1.jpg', '/placeholder-detail-2.jpg'],
        category: 'Anniversaire',
        rating: 4.8,
        reviews: 124
    }
}

export default function ProductPage() {
    const params = useParams()
    const router = useRouter()
    const { addItem } = useCart()

    const product = getProduct(params.id as string)

    const [quantity, setQuantity] = useState(1)
    const [selectedSize, setSelectedSize] = useState<'classic' | 'generous' | 'exceptional'>('classic')

    const sizeMultipliers = {
        classic: 1,
        generous: 1.4,
        exceptional: 1.8
    }

    const basePrice = product.price
    const unitPrice = basePrice * sizeMultipliers[selectedSize]
    const currentPriceDisplay = unitPrice.toFixed(2)
    const totalPriceDisplay = (unitPrice * quantity).toFixed(2)

    const handleAddToCart = () => {
        addItem({
            product: {
                ...product,
                price: basePrice,
                imageUrl: product.images[0] // Fallback
            },
            quantity,
            selectedSize,
            price: unitPrice
        })
        router.push('/cart')
    }

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
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-serif italic text-2xl">
                                Visuel Principal HD
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-100 flex items-center justify-center text-gray-300 text-xs">
                                    Vue {i}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info & Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col h-full"
                    >
                        {/* Breadcrumb / Category */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <Link href="/products" className="hover:text-purple-600 transition-colors">Boutique</Link>
                            <span>/</span>
                            <span className="text-purple-600 font-medium">{product.category}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-serif mb-4 leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" className={i < Math.floor(product.rating) ? "" : "text-gray-200 fill-gray-200"} />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500 underline underline-offset-2 decoration-gray-200">{product.reviews} avis</span>
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
                            <p>{product.longDescription}</p>
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
                        <div className="flex gap-4 mb-10">
                            <div className="flex items-center bg-gray-100 rounded-full px-4 border border-gray-200 shrink-0">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:text-purple-600 transition-colors">
                                    <Minus size={16} />
                                </button>
                                <span className="w-8 text-center font-medium mx-2">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:text-purple-600 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
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
                                    <p className="text-xs text-gray-500 mt-1">Directement de nos artisans.</p>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </main>
    )
}
