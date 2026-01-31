'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { ArrowLeft, Package, MapPin, Calendar, Clock, MessageSquare, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { formatDeliveryDate, formatDeliveryTime } from '@/lib/date-utils'

type OrderItem = {
    id: string
    product_id: string
    quantity: number
    price_at_purchase: number
    products: {
        name: string
        images: string[]
    }
}

type Order = {
    id: string
    created_at: string
    status: string
    total_amount: number
    recipient_name: string
    recipient_address: string
    delivery_date: string
    delivery_time: 'morning' | 'afternoon'
    card_message: string | null
    order_items: OrderItem[]
}

const STATUS_TIMELINE = {
    pending: { label: 'En attente', step: 1 },
    processing: { label: 'En préparation', step: 2 },
    shipped: { label: 'Expédiée', step: 3 },
    delivered: { label: 'Livrée', step: 4 },
}

export default function OrderDetailsPage() {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    useEffect(() => {
        async function loadOrder() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login?redirect=/account/orders')
                return
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (name, images)
                    )
                `)
                .eq('id', params.id)
                .eq('user_id', user.id)
                .single()

            if (error || !data) {
                console.error('Error loading order:', error)
                router.push('/account/orders')
            } else {
                setOrder(data as Order)
            }

            setLoading(false)
        }

        loadOrder()
    }, [params.id, router, supabase])

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-32 pb-20 px-4 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </main>
        )
    }

    if (!order) return null

    const currentStep = STATUS_TIMELINE[order.status as keyof typeof STATUS_TIMELINE]?.step || 1

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/account/orders" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
                            <ArrowLeft size={20} />
                            Retour aux commandes
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">
                            Commande #{order.id.slice(0, 8)}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Suivi de commande</h2>
                        <div className="flex justify-between items-center">
                            {Object.entries(STATUS_TIMELINE).map(([key, { label, step }]) => (
                                <div key={key} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        {step}
                                    </div>
                                    <p className={`text-xs mt-2 text-center ${step <= currentStep ? 'text-purple-600 font-medium' : 'text-gray-400'
                                        }`}>
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Livraison */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-purple-600" />
                                Informations de livraison
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Destinataire</p>
                                    <p className="font-medium text-gray-900">{order.recipient_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Adresse</p>
                                    <p className="font-medium text-gray-900">{order.recipient_address}</p>
                                </div>
                                <div className="pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                                        <Calendar size={16} />
                                        <span className="font-medium">{formatDeliveryDate(order.delivery_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock size={16} />
                                        <span>{formatDeliveryTime(order.delivery_time)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message personnalisé */}
                        {order.card_message && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MessageSquare size={20} className="text-purple-600" />
                                    Message personnalisé
                                </h2>
                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                    <p className="text-gray-700 italic">"{order.card_message}"</p>
                                </div>
                            </div>
                        )}

                        {/* Paiement */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-purple-600" />
                                Paiement
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sous-total</span>
                                    <span className="font-medium">{(order.total_amount / 100).toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Livraison</span>
                                    <span className="font-medium">Gratuite</span>
                                </div>
                                <div className="pt-2 border-t border-gray-100 flex justify-between">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-bold text-lg text-purple-600">
                                        {(order.total_amount / 100).toFixed(2)}€
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Produits */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={20} className="text-purple-600" />
                            Produits commandés
                        </h2>
                        <div className="space-y-4">
                            {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.products.name}</h3>
                                        <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            {(item.price_at_purchase / 100).toFixed(2)}€
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {((item.price_at_purchase / 100) / item.quantity).toFixed(2)}€ / unité
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
