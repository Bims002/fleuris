'use client'

import { motion } from 'framer-motion'
import { Product } from '@/types/product'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
    product: Product
    index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
    const { addItem } = useCart()
    const router = useRouter()

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault() // Empêcher la navigation si on clique sur le bouton
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

        // Optionnel : Feedback visuel ou redirection immédiate
        // router.push('/cart') 
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
                    {/* Placeholder image logic if no real image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                        {/* Simple visual placeholder */}
                        <span className="sr-only">{product.name}</span>
                    </div>
                    {/* Real image would go here */}
                    {/* <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> */}

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-900 shadow-sm">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(product.price)}
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-2 text-xs font-medium text-purple-600 uppercase tracking-wide">
                        {product.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {product.description}
                    </p>

                    <button
                        onClick={handleAddToCart}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors active:scale-95 z-20 relative"
                    >
                        <ShoppingBag size={18} />
                        Ajouter au panier
                    </button>
                </div>
            </Link>
        </motion.div>
    )
}
