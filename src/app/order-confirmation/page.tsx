'use client'

import { Navbar } from '@/components/navbar'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { useCart } from '@/context/cart-context'
import Link from 'next/link'
import { CheckCircle, Home } from 'lucide-react'
import { motion } from 'framer-motion'
// Note: Client-side check only for display. Server-side verification is recommended for valid orders.

function ConfirmationContent() {
    const searchParams = useSearchParams()
    const { clearCart } = useCart()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
    const redirectStatus = searchParams.get('redirect_status')

    useEffect(() => {
        if (redirectStatus === 'succeeded') {
            setStatus('success')
            clearCart()
        } else if (redirectStatus === 'failed') {
            setStatus('error')
        } else {
            setStatus('loading')
        }
    }, [redirectStatus, clearCart])

    return (
        <div className="max-w-xl w-full text-center space-y-8">

            {status === 'success' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 font-serif">Merci pour votre commande !</h1>
                    <p className="text-gray-600 text-lg">
                        Votre transaction a été validée avec succès. Vous recevrez bientôt un email de confirmation avec les détails de la livraison.
                    </p>
                    <div className="pt-8">
                        <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl">
                            <Home size={20} /> Retour à l'accueil
                        </Link>
                    </div>
                </motion.div>
            )}

            {status === 'error' && (
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-red-600 font-serif">Oups, un problème est survenu.</h1>
                    <p className="text-gray-600">
                        Le paiement n'a pas pu être finalisé. Veuillez réessayer ou utiliser un autre moyen de paiement.
                    </p>
                    <div className="pt-8">
                        <Link href="/checkout" className="inline-block px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all">
                            Réessayer le paiement
                        </Link>
                    </div>
                </div>
            )}

            {status === 'loading' && !redirectStatus && (
                <div className="space-y-6">
                    <p className="text-gray-500">En attente de détails...</p>
                    <Link href="/" className="text-purple-600 hover:underline">Retourner à la boutique</Link>
                </div>
            )}
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-4 flex items-center justify-center min-h-[80vh]">
                <Suspense fallback={<div className="text-center">Chargement...</div>}>
                    <ConfirmationContent />
                </Suspense>
            </div>
        </main>
    )
}
