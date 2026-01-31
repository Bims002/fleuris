'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function DebugProducts() {
    const [products, setProducts] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        supabase.from('products').select('*').then(({ data, error }) => {
            if (error) console.error(error)
            else setProducts(data || [])
        })
    }, [])

    return (
        <div className="p-8">
            <h1>Debug Products ({products.length})</h1>
            <table className="w-full border">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price (Raw)</th>
                        <th>Available</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.category}</td>
                            <td>{p.price}</td>
                            <td>{p.is_available ? 'YES' : 'NO'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
