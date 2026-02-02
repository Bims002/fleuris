'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Product } from '@/types/product' // Ensure this type matches your DB or create a new one for DB row
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Extend Product type if necessary or use the generated Database type
// For now, let's assume specific shape or cast
type ProductRow = {
    id: string
    name: string
    price: number
    category: string | null
    is_available: boolean
    images: string[] | null
    description: string | null
    stock_quantity: number
    track_stock: boolean
    low_stock_threshold: number
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<ProductRow[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching products:', error)
        } else {
            setProducts(data || [])
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Erreur lors de la suppression')
            console.error(error)
        } else {
            setProducts(products.filter(p => p.id !== id))
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-serif">Produits</h1>
                    <p className="text-gray-500">Gérez le catalogue de votre boutique.</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
                >
                    <Plus size={20} />
                    Nouveau Produit
                </Link>
            </header>

            {/* Filters & Search */}
            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un bouquet..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Image</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Nom</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Catégorie</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Prix</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Stock</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Chargement...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Aucun produit trouvé.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                                                {product.images?.[0] ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 capitalize">
                                                {product.category || 'Non classé'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {(product.price / 100).toFixed(2)} €
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {product.track_stock ? (
                                                <span className={product.stock_quantity <= product.low_stock_threshold ? 'text-orange-600 font-medium' : ''}>
                                                    {product.stock_quantity}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">∞</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {!product.is_available ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Désactivé
                                                </span>
                                            ) : product.track_stock && product.stock_quantity === 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Rupture
                                                </span>
                                            ) : product.track_stock && product.stock_quantity <= product.low_stock_threshold ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    Stock faible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Disponible
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="inline-flex p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="inline-flex p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Chargement...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Aucun produit trouvé.</div>
                ) : (
                    filteredProducts.map((product) => (
                        <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200 flex-shrink-0">
                                    {product.images?.[0] ? (
                                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                                    <p className="text-sm text-purple-600 font-medium capitalize">{product.category || 'Non classé'}</p>
                                    <p className="text-gray-900 font-bold">{(product.price / 100).toFixed(2)} €</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Statut</span>
                                    {!product.is_available ? (
                                        <span className="text-xs font-bold text-gray-500">Désactivé</span>
                                    ) : product.track_stock && product.stock_quantity === 0 ? (
                                        <span className="text-xs font-bold text-red-600">Rupture de stock</span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-600">Disponible ({product.stock_quantity})</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/products/${product.id}`}
                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-purple-50 hover:text-purple-600"
                                    >
                                        <Edit size={20} />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
