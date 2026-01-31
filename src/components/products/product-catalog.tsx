'use client'

import { Navbar } from '@/components/navbar'
import { ProductCard } from '@/components/product-card'
import { FilterDropdown } from '@/components/filter-dropdown'
import { Product } from '@/types/product'
import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'

export function ProductCatalog() {
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [occasionFilter, setOccasionFilter] = useState<string | null>(null)
    const [priceFilter, setPriceFilter] = useState<string | null>(null)
    const supabase = createClient()


    // Initialize filters from URL params
    useEffect(() => {
        const category = searchParams.get('category')
        const occasion = searchParams.get('occasion')

        if (category) {
            setOccasionFilter(category)
        }
        if (occasion) {
            setOccasionFilter(occasion)
        }
    }, [searchParams])

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_available', true)
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Error fetching products:", error)
                // alert("Erreur: " + error.message) // Less intrusive generic error handling preferred in prod
            }

            if (data) {
                // Adapter les données de la DB vers le type Product
                const formattedProducts = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: p.price / 100, // DB stores cents, frontend uses euros
                    category: p.category,
                    imageUrl: p.images?.[0] || '',
                    images: p.images
                }))
                setProducts(formattedProducts)
            }
            setLoading(false)
        }
        fetchProducts()
    }, [])

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (occasionFilter && product.category !== occasionFilter) return false

            if (priceFilter) {
                if (priceFilter === 'low' && product.price > 40) return false
                if (priceFilter === 'mid' && (product.price <= 40 || product.price > 60)) return false
                if (priceFilter === 'high' && product.price <= 60) return false
            }

            return true
        })
    }, [products, occasionFilter, priceFilter])

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
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Chargement des fleurs...</div>
                    ) : (
                        <>
                            {/* Temporary Debug Info */}
                            <div className="text-xs text-gray-400 text-center mb-4">
                                {products.length} produits trouvés. {occasionFilter ? `Filtre: ${occasionFilter}` : ''}
                            </div>

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
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}
