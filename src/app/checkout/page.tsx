'use client'

import { Navbar } from '@/components/navbar'
import { useCart } from '@/context/cart-context'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'
import { CheckoutForm } from '@/components/checkout-form'

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { totalValues } = useCart()
    const [clientSecret, setClientSecret] = useState<string>('')

    const shippingCost = 0
    const totalAmount = totalValues.price + shippingCost

    useEffect(() => {
        if (totalValues.price > 0) {
            // Create PaymentIntent as soon as the page loads
            fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: totalAmount }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }
    }, [totalValues.price, totalAmount]);

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
                                <CheckoutForm totalAmount={totalAmount} />
                            </Elements>
                        ) : (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
