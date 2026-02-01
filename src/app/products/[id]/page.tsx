
import { createClient } from '@supabase/supabase-js'
import { ProductDetails } from '@/components/products/product-details'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Initialiser Supabase Admin pour le serveur (Lecture publique)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Props = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getProduct(id: string) {
    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    return product
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) {
        return {
            title: 'Produit Introuvable | Fleuris',
        }
    }

    return {
        title: `${product.name} | Fleuris`,
        description: product.description,
        openGraph: {
            title: product.name,
            description: product.description,
            images: product.images || [],
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params
    const product = await getProduct(id)

    if (!product) {
        notFound()
    }

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images || [product.imageUrl],
        "description": product.description,
        "sku": product.id,
        "brand": {
            "@type": "Brand",
            "name": "Fleuris"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://fleuris.store/products/${product.id}`,
            "priceCurrency": "EUR",
            "price": product.price,
            "availability": product.track_stock && product.stock_quantity === 0
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <ProductDetails product={product} />
        </>
    )
}
