'use client'

import { motion } from 'framer-motion'
import { Product } from '@/types/product'
import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

interface ProductCardProps {
    product: Product
    index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
    const [imageError, setImageError] = useState(false)
    const { addItem } = useCart()
    const { toggleFavorite, isFavorite } = useWishlist()
    const router = useRouter()
    const isOutOfStock = product.track_stock !== false && product.stock_quantity === 0
    const favorited = isFavorite(product.id)

    const handleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(product.id)
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        // ... existing handleAddToCart logic ...
        e.preventDefault()
        e.stopPropagation()

        addItem({
            product: {
                ...product,
                imageUrl: product.imageUrl || '/placeholder-1.jpg'
            },
            quantity: 1,
            selectedSize: 'classic',
            price: product.price
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
            <Link href={`/products/${product.id}`} className="block h-full">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {(!imageError && (product.imageUrl || product.images?.[0])) ? (
                        <Image
                            src={product.imageUrl || product.images?.[0] || '/placeholder-1.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                            <span className="sr-only">{product.name}</span>
                            <span className="text-2xl font-serif opacity-20">Fleuris</span>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900 shadow-sm">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
                        </div>
                        <button
                            onClick={handleFavorite}
                            className={`p-2 rounded-full backdrop-blur-sm transition-all shadow-sm ${favorited
                                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                    : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
                                }`}
                        >
                            <Heart size={18} fill={favorited ? "currentColor" : "none"} strokeWidth={favorited ? 0 : 2} />
                        </button>
                    </div>

                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform -rotate-12 uppercase tracking-wider">
                                Indisponible
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="mb-2 text-xs font-medium text-purple-600 uppercase tracking-wide">
                        {product.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {product.description}
                    </p>

                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`w-full py-3 flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-95 z-20 relative ${isOutOfStock
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-purple-600 shadow-sm hover:shadow-md'
                            }`}
                    >
                        <ShoppingBag size={18} />
                        {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
                    </button>
                </div>
            </Link>
        </motion.div>
    )
}
