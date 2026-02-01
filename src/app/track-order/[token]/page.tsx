'use client'

import { Navbar } from '@/components/navbar'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, Package, Truck, MapPin, Calendar, Clock, MessageSquare, Loader2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDeliveryDate, formatDeliveryTime } from '@/lib/date-utils'
import Image from 'next/image'
import Link from 'next/link'

interface OrderDetails {
    id: string
    status: string
    total_amount: number
    delivery_date: string
    delivery_time: string
    recipient_name: string
    recipient_address: string
    card_message?: string
    created_at: string
    order_items: Array<{
        quantity: number
        price_at_purchase: number
        products: {
            name: string
            images: string[]
        }
    }>
}

const statusConfig = {
    pending: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    confirmed: { label: 'Confirmée', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    preparing: { label: 'En préparation', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    shipped: { label: 'Expédiée', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    delivered: { label: 'Livrée', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
}

export default function TrackOrderPage({ params }: { params: { token: string } }) {
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadOrder() {
            try {
                const supabase = createClient()
                const { data: orders, error: fetchError } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        status,
                        total_amount,
                        delivery_date,
                        delivery_time,
                        recipient_name,
                        recipient_address,
                        card_message,
                        created_at,
                        order_items (
                            quantity,
                            price_at_purchase,
                            products (
                                name,
                                images
                            )
                        )
                    `)
                    .eq('tracking_token', params.token)
                    .single()

                if (fetchError || !orders) {
                    setError('Commande introuvable. Vérifiez votre lien de suivi.')
                } else {
                    setOrderDetails(orders as any)
                }
            } catch (err) {
                console.error('Erreur chargement commande:', err)
                setError('Une erreur est survenue lors du chargement de votre commande.')
            } finally {
                setLoading(false)
            }
        }

        loadOrder()
    }, [params.token])

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
                        <p className="text-gray-600">Chargement de votre commande...</p>
                    </div>
                </div>
            </main>
        )
    }

    if (error || !orderDetails) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
                <Navbar />
                <div className="container max-w-2xl px-4 py-16 mx-auto">
                    <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
                        <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">Commande introuvable</h1>
                        <p className="mb-6 text-gray-600">{error}</p>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 text-white transition-all duration-200 bg-purple-600 rounded-full hover:bg-purple-700"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    const statusInfo = statusConfig[orderDetails.status as keyof typeof statusConfig] || statusConfig.pending
    const StatusIcon = statusInfo.icon

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            <Navbar />

            <div className="container max-w-4xl px-4 py-16 mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="mb-2 text-4xl font-bold text-gray-900">Suivi de commande</h1>
                    <p className="text-gray-600">Commande #{orderDetails.id.slice(0, 8).toUpperCase()}</p>
                </motion.div>

                {/* Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`mb-8 p-6 rounded-2xl shadow-lg ${statusInfo.bg} border-2 border-${statusInfo.color.replace('text-', '')}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${statusInfo.bg}`}>
                            <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{statusInfo.label}</h2>
                            <p className="text-sm text-gray-600">
                                Commandé le {new Date(orderDetails.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Delivery Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white shadow-lg rounded-2xl"
                    >
                        <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                            <MapPin className="w-6 h-6 text-purple-600" />
                            Informations de livraison
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Destinataire</p>
                                <p className="font-semibold text-gray-900">{orderDetails.recipient_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Adresse</p>
                                <p className="text-gray-900">{orderDetails.recipient_address}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDeliveryDate(orderDetails.delivery_date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Créneau</p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDeliveryTime(orderDetails.delivery_time as 'morning' | 'afternoon')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-6 bg-white shadow-lg rounded-2xl"
                    >
                        <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900">
                            <Package className="w-6 h-6 text-purple-600" />
                            Résumé de la commande
                        </h3>
                        <div className="space-y-3">
                            {orderDetails.order_items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 pb-3 border-b last:border-0">
                                    <div className="relative w-16 h-16 overflow-hidden rounded-lg">
                                        <Image
                                            src={item.products.images?.[0] || '/placeholder-1.jpg'}
                                            alt={item.products.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{item.products.name}</p>
                                        <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {(item.price_at_purchase / 100).toFixed(2)} €
                                    </p>
                                </div>
                            ))}
                            <div className="flex justify-between pt-3 text-lg font-bold border-t-2">
                                <span>Total</span>
                                <span className="text-purple-600">
                                    {(orderDetails.total_amount / 100).toFixed(2)} €
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Card Message */}
                {orderDetails.card_message && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-6 mt-8 bg-white shadow-lg rounded-2xl"
                    >
                        <h3 className="flex items-center gap-2 mb-3 text-xl font-bold text-gray-900">
                            <MessageSquare className="w-6 h-6 text-purple-600" />
                            Message de la carte
                        </h3>
                        <p className="italic text-gray-700">"{orderDetails.card_message}"</p>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 text-white transition-all duration-200 bg-purple-600 rounded-full hover:bg-purple-700"
                    >
                        Retour à l'accueil
                    </Link>
                </motion.div>
            </div>
        </main>
    )
}
