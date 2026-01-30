'use client'

import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart-context";

export function CheckoutForm({ totalAmount }: { totalAmount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart } = useCart();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/order-confirmation`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs" as const,
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Shipping Info - Simple wrapper for MVP, real address element can be used too */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Informations de livraison</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Prénom" className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 transition-all" required />
                    <input type="text" placeholder="Nom" className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 transition-all" required />
                </div>
                <input type="text" placeholder="Adresse complète" className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 transition-all" required />

                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Code Postal" className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 transition-all" required />
                    <input type="text" placeholder="Ville" className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 transition-all" required />
                </div>

                <textarea placeholder="Message pour la carte (Optionnel)" className="w-full p-3 bg-gray-50 rounded-xl border-transparent focus:border-purple-500 focus:bg-white focus:ring-0 transition-all h-24" />
            </div>

            <div className="border-t border-gray-100 pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Paiement Sécurisé</h2>
                <PaymentElement id="payment-element" options={paymentElementOptions} />
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-gray-900 text-white rounded-full py-4 font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
                <span id="button-text">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Traitement...
                        </div>
                    ) : (
                        `Payer ${totalAmount.toFixed(2)} €`
                    )}
                </span>
            </button>

            {/* Show any error or success messages */}
            {message && <div id="payment-message" className="text-red-500 text-center text-sm">{message}</div>}
        </form>
    );
}
