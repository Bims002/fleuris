'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { useCart } from '@/context/cart-context'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'next/navigation'
import { CheckoutForm } from '@/components/checkout-form'
import { trackBeginCheckout } from '@/lib/analytics'
import { AlertCircle } from 'lucide-react'

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : Promise.resolve(null);

export default function CheckoutPage() {
    const router = useRouter()
    const { totalValues, items } = useCart()
    const [clientSecret, setClientSecret] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    const shippingCost = 0
    const totalAmount = totalValues.price + shippingCost

    // Track begin checkout
    useEffect(() => {
        if (items.length > 0) {
            trackBeginCheckout(items, totalValues.price)
        }
    }, [])

    useEffect(() => {
        if (totalValues.price > 0) {
            setError(null)
            // Create PaymentIntent as soon as the page loads
            fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: totalAmount }),
            })
                .then(async (res) => {
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement')
                    return data
                })
                .then((data) => setClientSecret(data.clientSecret))
                .catch((err) => {
                    console.error('Stripe Error:', err)
                    setError(err.message)
                });
        }
    }, [totalAmount, totalValues.price]);

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#9333ea', // Purple-600
            colorBackground: '#ffffff',
            colorText: '#1f2937',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 font-serif mb-8 text-center">Finaliser la commande</h1>

                    <div className="bg-white rounded-3xl p-8 shadow-sm">
                        {clientSecret ? (
                            <Elements options={options} stripe={stripePromise}>
                                <CheckoutForm totalAmount={totalAmount} clientSecret={clientSecret} />
                            </Elements>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle size={32} />
                                </div>
                                <p className="text-gray-900 font-bold mb-2">Impossible d'initier le paiement</p>
                                <p className="text-sm text-gray-500 mb-6">{error}</p>
                                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold">Réessayer</button>
                            </div>
                        ) : totalValues.price === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-900 font-bold mb-4">Votre panier est vide.</p>
                                <button onClick={() => router.push('/products')} className="px-6 py-2 bg-purple-600 text-white rounded-full font-bold">Voir nos produits</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                <p className="text-gray-800 font-bold">Chargement du paiement sécurisé...</p>
                                <p className="text-xs text-gray-500">Si le chargement persiste, vérifiez votre connexion ou contactez-nous.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-xs text-purple-600 font-bold underline"
                                >
                                    Actualiser la page
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
