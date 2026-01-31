'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { TrendingUp, ShoppingBag, Package } from 'lucide-react'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        ordersCount: 0,
        productsCount: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)

            // 1. Fetch Orders for Revenue & Count
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('total_amount')

            // 2. Fetch Products Count
            const { count: productsCount, error: productsError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            if (ordersError || productsError) {
                console.error('Error fetching stats', ordersError, productsError)
            }

            const totalRevenue = (orders || []).reduce((acc, order) => acc + (order.total_amount || 0), 0)

            setStats({
                revenue: totalRevenue / 100, // Convert cents to EUR
                ordersCount: orders?.length || 0,
                productsCount: productsCount || 0
            })
            setLoading(false)
        }

        fetchStats()
    }, [])

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 font-serif">Tableau de bord</h1>
                <p className="text-gray-500">Bienvenue dans l'interface d'administration.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CA Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Chiffre d'Affaires</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {loading ? '...' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.revenue)}
                        </p>
                        <div className="mt-4 text-xs text-green-600 font-medium flex items-center gap-1">
                            <TrendingUp size={14} />
                            <span>Total cumulé</span>
                        </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <TrendingUp size={24} />
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Commandes</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {loading ? '...' : stats.ordersCount}
                        </p>
                        <div className="mt-4 text-xs text-blue-600 font-medium flex items-center gap-1">
                            <ShoppingBag size={14} />
                            <span>Total commandes</span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <ShoppingBag size={24} />
                    </div>
                </div>

                {/* Products Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Produits</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {loading ? '...' : stats.productsCount}
                        </p>
                        <div className="mt-4 text-xs text-purple-600 font-medium flex items-center gap-1">
                            <Package size={14} />
                            <span>Dans le catalogue</span>
                        </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <Package size={24} />
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center py-20">
                <p className="text-gray-400">Les graphiques détaillés arrivent bientôt.</p>
            </div>
        </div>
    )
}
