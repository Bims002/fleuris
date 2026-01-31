
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

    return <ProductDetails product={product} />
}
