'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Truck, ShieldCheck, Heart, Minus, Plus, Package, AlertCircle, X, ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { Navbar } from '@/components/navbar'
import { getStockStatus, checkStockAvailability } from '@/lib/stock-manager'
import { trackProductView, trackAddToCart } from '@/lib/analytics'

export function ProductDetails({ product }: { product: any }) {
    const router = useRouter()
    const { addItem } = useCart()
    const { toggleFavorite, isFavorite } = useWishlist()
    const isFavorited = isFavorite(product.id)

    // Selection states
    const [quantity, setQuantity] = useState(1)
    const [selectedSize, setSelectedSize] = useState<'standard' | 'voluminous'>('standard')
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [stockError, setStockError] = useState<string | null>(null)
    const [showAddedModal, setShowAddedModal] = useState(false)

    // Stock status
    const stockStatus = getStockStatus(
        product.stock_quantity || 0,
        product.low_stock_threshold || 5,
        product.track_stock !== false
    )

    // Track product view on mount (simplified)
    useEffect(() => {
        trackProductView({ id: product.id, name: product.name, price: product.price, category: product.category })
    }, [product])

    if (!product) return <div className="min-h-screen pt-32 text-center text-gray-500">Produit introuvable</div>

    const basePrice = (selectedSize === 'voluminous' && product.price_voluminous)
        ? product.price_voluminous / 100
        : product.price / 100

    const optionsPrice = (product.options || [])
        .filter((opt: any) => selectedOptions.includes(opt.id))
        .reduce((sum: number, opt: any) => sum + (opt.price / 100), 0)

    const unitPrice = basePrice + optionsPrice
    const currentPriceDisplay = unitPrice.toFixed(2)
    const totalPriceDisplay = (unitPrice * quantity).toFixed(2)

    const toggleOption = (optionId: string) => {
        setSelectedOptions(prev =>
            prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
        )
    }

    const handleAddToCart = async () => {
        if (product.track_stock !== false) {
            try {
                const stockCheck = await checkStockAvailability(product.id, quantity)
                if (!stockCheck.available) {
                    setStockError(`Stock insuffisant. Seulement ${stockCheck.currentStock} disponible(s).`)
                    return
                }
            } catch (error) {
                setStockError('Erreur de stock'); return
            }
        }

        setStockError(null)
        trackAddToCart({ id: product.id, name: product.name, price: basePrice, category: product.category }, quantity, selectedSize)

        addItem({
            product: {
                ...product,
                price: basePrice,
                imageUrl: product.images?.[0] || '/placeholder-1.jpg'
            },
            quantity,
            selectedSize,
            selectedOptions, // Ajout des options au panier
            price: unitPrice
        })

        setShowAddedModal(true)
    }

    const rating = product.rating || 4.8
    const reviews = product.reviews || 124

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">

                    {/* Left: Images Gallery */}
                    <div className="space-y-4 md:space-y-6">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden shadow-lg">
                            <Image src={product.images?.[0] || '/placeholder-1.jpg'} alt={product.name} fill className="object-cover" />
                        </motion.div>
                        <div className="grid grid-cols-3 gap-4">
                            {product.images?.map((img: string, i: number) => (
                                <div key={i} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
                                    <Image src={img} alt="Vue" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                            <Link href="/products" className="hover:text-purple-600">Boutique</Link>
                            <span>/</span>
                            <span className="text-purple-600 font-medium capitalize">{product.category}</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 font-serif mb-4 leading-tight">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            {stockStatus.available ? (
                                <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                    <Package size={14} /> {stockStatus.label}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full text-sm font-medium">
                                    <AlertCircle size={14} /> {stockStatus.label}
                                </span>
                            )}
                            <div className="flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(rating) ? "currentColor" : "none"} className={i < Math.floor(rating) ? "" : "text-gray-200"} />)}
                                </div>
                                <span className="text-xs text-gray-500">{reviews} avis</span>
                            </div>
                        </div>

                        <div className="text-3xl font-bold text-gray-900 mb-8">{currentPriceDisplay} €</div>

                        <p className="text-lg text-gray-700 mb-8 italic">"{product.description}"</p>

                        {/* Size Selector */}
                        {product.pricing_type === 'tiered' && (
                            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-900 mb-4 uppercase tracking-wider">Taille du bouquet</span>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setSelectedSize('standard')}
                                        className={`py-4 rounded-xl font-bold border-2 transition-all ${selectedSize === 'standard' ? 'border-purple-600 bg-white text-purple-900 shadow-sm' : 'border-transparent bg-white text-gray-500 hover:border-gray-200'}`}
                                    >
                                        Standard
                                    </button>
                                    <button
                                        onClick={() => setSelectedSize('voluminous')}
                                        className={`py-4 rounded-xl font-bold border-2 transition-all ${selectedSize === 'voluminous' ? 'border-purple-600 bg-white text-purple-900 shadow-sm' : 'border-transparent bg-white text-gray-500 hover:border-gray-200'}`}
                                    >
                                        Volumineux
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-3 text-center">
                                    {selectedSize === 'standard' ? '~20-25 tiges' : '~35-40 tiges'}
                                </p>
                            </div>
                        )}

                        {/* Options Selector */}
                        {product.options && product.options.length > 0 && (
                            <div className="mb-8 p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                                <span className="block text-xs font-semibold text-purple-900 mb-4 uppercase tracking-wider">Options & Accessoires</span>
                                <div className="space-y-3">
                                    {product.options.map((opt: any) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => toggleOption(opt.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all bg-white ${selectedOptions.includes(opt.id) ? 'border-purple-600 shadow-sm' : 'border-transparent hover:border-purple-200'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedOptions.includes(opt.id) ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'}`}>
                                                    {selectedOptions.includes(opt.id) && <Plus size={14} />}
                                                </div>
                                                <span className={`font-medium ${selectedOptions.includes(opt.id) ? 'text-purple-900' : 'text-gray-700'}`}>{opt.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900">+{(opt.price / 100).toFixed(2)} €</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Area */}
                        <div className="flex gap-4 mb-10">
                            <div className="flex items-center bg-gray-100 rounded-full px-4 border-2 border-gray-300">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-700 hover:text-purple-600"><Minus size={18} strokeWidth={2.5} /></button>
                                <span className="w-8 text-center font-bold text-lg text-gray-900">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-700 hover:text-purple-600"><Plus size={18} strokeWidth={2.5} /></button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={!stockStatus.available}
                                className="flex-1 bg-gray-900 text-white rounded-full py-4 font-bold hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                            >
                                {stockStatus.available ? `Ajouter au panier • ${totalPriceDisplay} €` : 'Rupture de stock'}
                            </button>
                        </div>

                        {/* Reassurance */}
                        <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-200">
                            <div className="flex items-start gap-3">
                                <Truck className="text-purple-700 shrink-0" size={24} strokeWidth={2.5} />
                                <div><h4 className="font-bold text-sm text-gray-900">Livraison Rapide</h4><p className="text-sm text-gray-700">Sous 24-48h.</p></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-green-700 shrink-0" size={24} strokeWidth={2.5} />
                                <div><h4 className="font-bold text-sm text-gray-900">Fraîcheur</h4><p className="text-sm text-gray-700">Garantie 7 jours.</p></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal (Simplified) */}
                <AnimatePresence>
                    {showAddedModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingCart size={40} /></div>
                                <h3 className="text-2xl font-bold mb-2">Ajouté !</h3>
                                <p className="text-gray-600 mb-8">Le bouquet est dans votre panier.</p>
                                <div className="space-y-3">
                                    <button onClick={() => router.push('/cart')} className="w-full py-4 bg-gray-900 text-white rounded-full font-bold">Voir mon panier</button>
                                    <button onClick={() => setShowAddedModal(false)} className="w-full py-4 bg-white border border-gray-200 rounded-full font-bold">Continuer</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    )
}
