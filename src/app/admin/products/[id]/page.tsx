'use client'

import { ProductForm } from '@/components/admin/product-form'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function EditProductPage() {
    const params = useParams()
    const id = params.id as string
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchProduct = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching product', error)
            } else {
                setProduct(data)
            }
            setLoading(false)
        }
        fetchProduct()
    }, [id, supabase])

    if (loading) return <div>Chargement...</div>
    if (!product) return <div>Produit introuvable</div>

    // Adapter les données pour le formulaire si besoin (ex: price number -> string)
    const formattedData = {
        ...product,
        price: (product.price / 100).toString()
    }

    return <ProductForm initialData={formattedData} />
}
