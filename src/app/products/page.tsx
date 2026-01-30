'use client'

import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { FilterDropdown } from '@/components/filter-dropdown'
import { Product } from '@/types/product'
import { useState, useMemo } from 'react'

const DUMMY_PRODUCTS: Product[] = [
    { id: '1', name: 'Bouquet Printanier', description: 'Tulipes et jonquilles.', price: 35.00, imageUrl: '', category: 'anniversaire' },
    { id: '2', name: 'Rose Éternelle', description: 'Rose rouge préservée.', price: 49.99, imageUrl: '', category: 'amour' },
    { id: '3', name: 'Orchidée Blanche', description: 'Élégance pure.', price: 28.50, imageUrl: '', category: 'deuil' },
    { id: '4', name: 'Coffret Lavande', description: 'Senteurs de Provence.', price: 42.00, imageUrl: '', category: 'remerciements' },
    { id: '5', name: 'Pivoines Royales', description: 'Bouquet généreux.', price: 55.00, imageUrl: '', category: 'amour' },
    { id: '6', name: 'Lys Majestueux', description: 'Pour les grandes occasions.', price: 60.00, imageUrl: '', category: 'anniversaire' },
]

export default function ProductsPage() {
    const [occasionFilter, setOccasionFilter] = useState<string | null>(null)
    const [priceFilter, setPriceFilter] = useState<string | null>(null)

    const filteredProducts = useMemo(() => {
        return DUMMY_PRODUCTS.filter(product => {
            if (occasionFilter && product.category !== occasionFilter) return false

            if (priceFilter) {
                if (priceFilter === 'low' && product.price > 40) return false
                if (priceFilter === 'mid' && (product.price <= 40 || product.price > 60)) return false
                if (priceFilter === 'high' && product.price <= 60) return false
            }

            return true
        })
    }, [occasionFilter, priceFilter])

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <section className="pt-32 pb-12 px-6 md:px-12 bg-white border-b border-gray-50">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">Notre Collection</h1>

                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Filters */}
                        <FilterDropdown
                            label="Occasion"
                            activeValue={occasionFilter}
                            onChange={setOccasionFilter}
                            options={[
                                { label: 'Anniversaire', value: 'anniversaire' },
                                { label: 'Amour & Romance', value: 'amour' },
                                { label: 'Remerciements', value: 'remerciements' },
                                { label: 'Deuil', value: 'deuil' },
                            ]}
                        />

                        <FilterDropdown
                            label="Prix"
                            activeValue={priceFilter}
                            onChange={setPriceFilter}
                            options={[
                                { label: 'Moins de 40€', value: 'low' },
                                { label: '40€ - 60€', value: 'mid' },
                                { label: 'Plus de 60€', value: 'high' },
                            ]}
                        />

                        {/* Reset Filter Button if any active */}
                        {(occasionFilter || priceFilter) && (
                            <button
                                onClick={() => { setOccasionFilter(null); setPriceFilter(null); }}
                                className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-12 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                            {filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-500 text-lg">Aucun bouquet ne correspond à vos critères.</p>
                            <button
                                onClick={() => { setOccasionFilter(null); setPriceFilter(null); }}
                                className="mt-4 text-purple-600 font-medium hover:text-purple-700"
                            >
                                Voir tout le catalogue
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
