'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { ArrowLeft, MapPin, CreditCard, Mail } from 'lucide-react'
import Image from 'next/image'

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [order, setOrder] = useState<any>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchOrderDetails = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            // Fetch Order Info
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id) // Security check
                .single()

            if (orderError || !orderData) {
                console.error(orderError)
                router.push('/account/orders')
                return
            }

            setOrder(orderData)

            // Fetch Order Items with Product details
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select(`
                    *,
                    product:products (
                        name,
                        images
                    )
                `)
                .eq('order_id', id)

            if (itemsData) setItems(itemsData)
            setLoading(false)
        }

        fetchOrderDetails()
    }, [id, router, supabase])

    if (loading) return <div className="min-h-screen bg-white pt-32 text-center text-gray-500">Chargement...</div>

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-12 px-6 max-w-3xl mx-auto">
                <Link href="/account/orders" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Retour à mes commandes
                </Link>

                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 font-serif">Commande #{order.id.slice(0, 8)}</h1>
                                <p className="text-sm text-gray-500">
                                    Effectuée le {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.status === 'paid' ? 'Payée' : order.status === 'pending' ? 'En attente' : order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="font-medium text-gray-900 mb-4">Articles commandés</h2>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-start gap-4">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                        {item.product?.images?.[0] && (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.product?.name || 'Produit inconnu'}</h3>
                                        <p className="text-xs text-gray-500 uppercase mt-1">Taille: {item.size}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.price / 100)}
                                        </div>
                                        <div className="text-xs text-gray-500">x{item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                            <span className="font-medium text-gray-500">Total</span>
                            <span className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(order.total_amount / 100)}
                            </span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-6 grid md:grid-cols-2 gap-8 bg-gray-50/30">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin size={16} className="text-purple-600" />
                                Adresse de livraison
                            </h3>
                            <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100">
                                <p className="font-medium text-gray-900 mb-1">{order.recipient_name}</p>
                                <p className="whitespace-pre-line">{order.shipping_address}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <CreditCard size={16} className="text-purple-600" />
                                Informations
                            </h3>
                            <div className="text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-100 space-y-2">
                                <div className="flex justify-between">
                                    <span>Méthode</span>
                                    <span className="font-medium">Carte Bancaire</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Email confirmation</span>
                                    <span className="font-medium text-gray-900">{order.customer_email || 'Non renseigné'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
