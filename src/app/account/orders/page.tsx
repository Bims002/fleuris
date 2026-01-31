'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Package, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react'

type Order = {
    id: string
    created_at: string
    total_amount: number
    status: string
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (data) {
                setOrders(data)
            }
            setLoading(false)
        }

        fetchOrders()
    }, [router, supabase])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><CheckCircle size={12} /> Payé</span>
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"><Clock size={12} /> En attente</span>
            case 'cancelled':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"><XCircle size={12} /> Annulé</span>
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700">{status}</span>
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-12 px-6 max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-serif mb-2">Mes Commandes</h1>
                    <p className="text-gray-500">Retrouvez l'historique de vos achats chez Fleuris.</p>
                </header>

                {loading ? (
                    <div className="text-center py-12 text-gray-400">Chargement de vos commandes...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Aucune commande</h3>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande.</p>
                        <Link href="/products" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors">
                            Découvrir nos bouquets
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                href={`/account/orders/${order.id}`}
                                key={order.id}
                                className="block bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(order.total_amount / 100)}
                                            </div>
                                            <div className="text-xs text-gray-400">Total TTC</div>
                                        </div>
                                        <ChevronRight className="text-gray-300 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
