'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Clock, CheckCircle, Truck, Package, XCircle } from 'lucide-react'

// Define Order Type based on DB
type Order = {
    id: string
    created_at: string
    status: 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
    total_amount: number
    recipient_name: string
    recipient_address: string
    delivery_date: string
}

const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    paid: { label: 'Payée', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    preparing: { label: 'En préparation', color: 'bg-purple-100 text-purple-800', icon: Package },
    shipped: { label: 'Expédiée', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
    delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching orders:', error)
        } else {
            setOrders(data || [])
        }
        setLoading(false)
    }

    const updateStatus = async (orderId: string, newStatus: string) => {
        setLoading(true) // Optional: show loading state during update
        try {
            const res = await fetch('/api/admin/orders/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus })
            })

            if (!res.ok) throw new Error('Failed to update')

            // Optimistic update or refetch
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o))

            if (newStatus === 'shipped') {
                alert('Statut mis à jour ! Email "Expédié" envoyé au client. 📧')
            }
        } catch (error) {
            console.error(error)
            alert('Erreur lors de la mise à jour du statut')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 font-serif">Commandes</h1>
                <p className="text-gray-500">Suivi et gestion des livraisons.</p>
            </header>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Client / Destinataire</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Livraison</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Total</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chargement...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Aucune commande pour le moment.</td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const status = statusConfig[order.status] || statusConfig.pending
                                    const StatusIcon = status.icon

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                                <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString().slice(0, 5)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{order.recipient_name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[150px]">{order.recipient_address}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(order.delivery_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {(order.total_amount / 100).toFixed(2)} €
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="pending">En attente</option>
                                                    <option value="paid">Payée</option>
                                                    <option value="preparing">En préparation</option>
                                                    <option value="shipped">Expédiée</option>
                                                    <option value="delivered">Livrée</option>
                                                    <option value="cancelled">Annulée</option>
                                                </select>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
