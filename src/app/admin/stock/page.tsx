'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Package, AlertTriangle, TrendingDown, Plus, Search } from 'lucide-react'
import { getLowStockProducts, addStock } from '@/lib/stock-manager'

type Product = {
    id: string
    name: string
    stock_quantity: number
    low_stock_threshold: number
    track_stock: boolean
}

export default function AdminStockPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [restockingProduct, setRestockingProduct] = useState<string | null>(null)
    const [restockQuantity, setRestockQuantity] = useState<number>(10)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/admin/login')
            return
        }

        // Charger tous les produits
        const { data: allProducts } = await supabase
            .from('products')
            .select('id, name, stock_quantity, low_stock_threshold, track_stock')
            .eq('track_stock', true)
            .order('name')

        setProducts(allProducts || [])

        // Charger produits en stock faible
        const lowStock = await getLowStockProducts()
        setLowStockProducts(lowStock as Product[])

        setLoading(false)
    }

    async function handleRestock(productId: string) {
        try {
            await addStock(productId, restockQuantity, 'Réapprovisionnement manuel')
            alert(`Stock ajouté avec succès : +${restockQuantity}`)
            setRestockingProduct(null)
            loadData() // Recharger les données
        } catch (error: any) {
            alert(`Erreur : ${error.message}`)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-serif mb-2">
                        Gestion du Stock
                    </h1>
                    <p className="text-gray-500">
                        Gérez les niveaux de stock de vos produits
                    </p>
                </div>

                {/* Alertes Stock Faible */}
                {lowStockProducts.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-orange-600" size={24} />
                            <h2 className="text-lg font-semibold text-orange-900">
                                Alertes Stock Faible ({lowStockProducts.length})
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {lowStockProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-lg p-4 border border-orange-200">
                                    <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-orange-600 font-medium">
                                            Stock : {product.stock_quantity}
                                        </span>
                                        <button
                                            onClick={() => setRestockingProduct(product.id)}
                                            className="text-sm bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700 transition-colors"
                                        >
                                            Réapprovisionner
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Statistiques */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="text-purple-600" size={24} />
                            <h3 className="font-semibold text-gray-700">Produits Suivis</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingDown className="text-orange-600" size={24} />
                            <h3 className="font-semibold text-gray-700">Stock Faible</h3>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{lowStockProducts.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="text-red-600" size={24} />
                            <h3 className="font-semibold text-gray-700">Ruptures</h3>
                        </div>
                        <p className="text-3xl font-bold text-red-600">
                            {products.filter(p => p.stock_quantity === 0).length}
                        </p>
                    </div>
                </div>

                {/* Recherche */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                {/* Liste des Produits - Desktop */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Produit</th>
                                <th className="px-6 py-4 text-center font-semibold text-gray-700">Stock Actuel</th>
                                <th className="px-6 py-4 text-center font-semibold text-gray-700">Seuil d'Alerte</th>
                                <th className="px-6 py-4 text-center font-semibold text-gray-700">Statut</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map(product => {
                                const isLowStock = product.stock_quantity <= product.low_stock_threshold
                                const isOutOfStock = product.stock_quantity === 0

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${isOutOfStock ? 'text-red-600' :
                                                isLowStock ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-500">
                                            {product.low_stock_threshold}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOutOfStock ? 'bg-red-100 text-red-800' :
                                                isLowStock ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {isOutOfStock ? 'Rupture' : isLowStock ? 'Stock faible' : 'En stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setRestockingProduct(product.id)}
                                                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                <Plus size={16} />
                                                Ajouter
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredProducts.map(product => {
                        const isLowStock = product.stock_quantity <= product.low_stock_threshold
                        const isOutOfStock = product.stock_quantity === 0

                        return (
                            <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isOutOfStock ? 'bg-red-100 text-red-800' :
                                        isLowStock ? 'bg-orange-100 text-orange-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {isOutOfStock ? 'Rupture' : isLowStock ? 'Stock faible' : 'En stock'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-50">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Stock Actuel</p>
                                        <p className={`text-lg font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                                            {product.stock_quantity}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Seuil d'Alerte</p>
                                        <p className="text-lg font-bold text-gray-900">{product.low_stock_threshold}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setRestockingProduct(product.id)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
                                >
                                    <Plus size={18} />
                                    Ajouter du stock
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Modal Réapprovisionnement */}
            {restockingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Réapprovisionner</h3>
                        <p className="text-gray-600 mb-4">
                            Produit : <strong>{products.find(p => p.id === restockingProduct)?.name}</strong>
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantité à ajouter
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={restockQuantity}
                                onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRestockingProduct(null)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleRestock(restockingProduct)}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
