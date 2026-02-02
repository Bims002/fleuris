
import { Metadata } from 'next'
import { ProductCatalog } from '@/components/products/product-catalog'

export const metadata: Metadata = {
    title: 'Nos Bouquets & Plantes - Collection Saison',
    description: 'Parcourez notre collection de fleurs fraîches. Bouquets ronds, grandes roses, plantes vertes. Livraison express.',
}

import { Suspense } from 'react'

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white" />}>
            <ProductCatalog />
        </Suspense>
    )
}
