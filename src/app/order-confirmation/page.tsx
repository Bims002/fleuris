'use client'

import { Navbar } from '@/components/navbar'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useCart } from '@/context/cart-context'
import Link from 'next/link'
import { CheckCircle, Package, MapPin, Calendar, Clock, MessageSquare, ArrowRight, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { formatDeliveryDate, formatDeliveryTime } from '@/lib/date-utils'
import Image from 'next/image'
import { trackPurchase } from '@/lib/analytics'

interface OrderDetails {
    id: string
    tracking_token: string
    total_amount: number
    delivery_date: string
    delivery_time: string
    recipient_name: string
    recipient_address: string
    card_message?: string
    order_items: Array<{
        quantity: number
        price_at_purchase: number
        products: {
            name: string
            images: string[]
        }
    }>
}

function ConfirmationContent() {
    const searchParams = useSearchParams()
    const { clearCart } = useCart()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)

    const redirectStatus = searchParams.get('redirect_status')
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        async function loadOrderDetails() {
            if (redirectStatus === 'succeeded') {
                setStatus('success')
                clearCart()

                // Essayer de récupérer les détails de la commande (optionnel)
                if (sessionId) {
                    try {
                        const supabase = createClient()
                        const { data: orders, error } = await supabase
                            .from('orders')
                            .select(`
                                id,
                                tracking_token,
                                total_amount,
                                delivery_date,
                                delivery_time,
                                recipient_name,
                                recipient_address,
                                card_message,
                                order_items (
                                    quantity,
                                    price_at_purchase,
                                    products (
                                        name,
                                        images
                                    )
                                )
                            `)
                            .eq('stripe_payment_id', sessionId)
                            .order('created_at', { ascending: false })
                            .limit(1)

                        if (error) {
                            console.error('Erreur RLS ou requête:', error)
                            // Continuer quand même, la commande est validée
                        } else if (orders && orders.length > 0) {
                            const orderData = orders[0] as any
                            setOrderDetails(orderData)

                            // Track purchase event
                            trackPurchase(
                                orderData.id,
                                orderData.total_amount / 100,
                                orderData.order_items.map((item: any) => ({
                                    id: item.products.id,
                                    name: item.products.name,
                                    price: item.price_at_purchase / 100,
                                    quantity: item.quantity
                                }))
                            )
                        }
                    } catch (error) {
                        console.error('Erreur chargement commande:', error)
                        // Continuer quand même, la commande est validée
                    }
                }
            } else if (redirectStatus === 'failed') {
                setStatus('error')
            } else {
                // Pas de redirect_status, rester en loading
                setStatus('loading')
            }
        }

        loadOrderDetails()
    }, [redirectStatus, sessionId, clearCart])

    if (status === 'loading') {
        return (
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement de votre commande...</p>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="max-w-xl w-full text-center space-y-6 bg-white rounded-3xl p-12 shadow-lg">
                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-red-600 font-serif">Paiement échoué</h1>
                <p className="text-gray-600">
                    Le paiement n'a pas pu être finalisé. Veuillez réessayer ou utiliser un autre moyen de paiement.
                </p>
                <div className="pt-4">
                    <Link href="/checkout" className="inline-block px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-lg">
                        Réessayer le paiement
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl w-full space-y-8">
            {/* Success Header */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-8 shadow-lg text-center"
            >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 font-serif mb-3">
                    Commande confirmée !
                </h1>
                <p className="text-gray-600 text-lg mb-2">
                    Merci pour votre confiance. Votre commande a été validée avec succès.
                </p>
                {orderDetails && (
                    <p className="text-sm text-gray-500">
                        Numéro de commande : <span className="font-mono font-semibold">#{orderDetails.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                )}
            </motion.div>

            {/* Tracking Link */}
            {orderDetails && orderDetails.tracking_token && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 shadow-lg border-2 border-purple-200"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                🔗 Suivez votre commande
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Conservez ce lien pour suivre l'état de votre commande à tout moment :
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/track-order/${orderDetails.tracking_token}`}
                                    className="flex-1 text-sm text-gray-700 bg-transparent outline-none"
                                    onClick={(e) => e.currentTarget.select()}
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/track-order/${orderDetails.tracking_token}`)
                                        alert('Lien copié !')
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Copier
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                📧 Ce lien vous a également été envoyé par email
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {orderDetails && (
                <>
                    {/* Delivery Information */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl p-8 shadow-lg"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6 flex items-center gap-3">
                            <Package className="text-purple-600" size={28} />
                            Informations de livraison
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Adresse de livraison</p>
                                    <p className="font-medium text-gray-900">{orderDetails.recipient_name}</p>
                                    <p className="text-gray-600">{orderDetails.recipient_address}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Date de livraison</p>
                                    <p className="font-medium text-gray-900">
                                        {formatDeliveryDate(orderDetails.delivery_date)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock size={16} className="text-gray-400" />
                                        <p className="text-gray-600 text-sm">
                                            {formatDeliveryTime(orderDetails.delivery_time as 'morning' | 'afternoon')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {orderDetails.card_message && (
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-start gap-3">
                                    <MessageSquare className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-2">Message personnalisé</p>
                                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                            <p className="text-gray-700 italic">"{orderDetails.card_message}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Order Items */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-3xl p-8 shadow-lg"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 font-serif mb-6">Votre commande</h2>

                        <div className="space-y-4">
                            {orderDetails.order_items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.products.images?.[0] && (
                                            <Image
                                                src={item.products.images[0]}
                                                alt={item.products.name}
                                                width={80}
                                                height={80}
                                                className="object-cover w-full h-full"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.products.name}</h3>
                                        <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">
                                            {(item.price_at_purchase / 100).toFixed(2)} €
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    {(orderDetails.total_amount / 100).toFixed(2)} €
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Livraison gratuite incluse</p>
                        </div>
                    </motion.div>
                </>
            )}

            {/* Action Buttons */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <Link
                    href="/account/orders"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                    <Package size={20} />
                    Suivre ma commande
                    <ArrowRight size={20} />
                </Link>
                <Link
                    href="/products"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-full font-bold hover:border-gray-300 transition-all"
                >
                    <ShoppingBag size={20} />
                    Continuer mes achats
                </Link>
            </motion.div>

            {/* Email Confirmation Notice */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-purple-50 border border-purple-100 rounded-2xl p-6 text-center"
            >
                <p className="text-purple-900 font-medium mb-1">
                    📧 Un email de confirmation vous a été envoyé
                </p>
                <p className="text-sm text-purple-700">
                    Vérifiez votre boîte de réception pour tous les détails de votre commande
                </p>
            </motion.div>
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-32 pb-20 px-4 flex items-center justify-center">
                <Suspense fallback={
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Chargement...</p>
                    </div>
                }>
                    <ConfirmationContent />
                </Suspense>
            </div>
        </main>
    )
}
