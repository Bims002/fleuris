
import { Metadata } from 'next'
import { ProductCatalog } from '@/components/products/product-catalog'

export const metadata: Metadata = {
    title: 'Nos Bouquets & Plantes - Collection Saison',
    description: 'Parcourez notre collection de fleurs fraîches. Bouquets ronds, grandes roses, plantes vertes. Livraison express.',
}

export default function ProductsPage() {
    return <ProductCatalog />
}
