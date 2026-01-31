'use client'

import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart-context";

import { createClient } from "@/utils/supabase/client";

export function CheckoutForm({ totalAmount }: { totalAmount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart, items } = useCart();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Capture form data immediately before any async operation
        const form = e.currentTarget as HTMLFormElement
        const formData = new FormData(form)
        const recipientName = `${formData.get('firstName')} ${formData.get('lastName')}`
        const address = `${formData.get('address')}, ${formData.get('zipCode')} ${formData.get('city')}`

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        // 1. Create Order in Supabase (Status: Pending)
        // ...

        try {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // If guest checkout is allowed, handle differently. But we assume auth based on requirements.
                setMessage("Vous devez être connecté pour commander.")
                setIsLoading(false)
                return
            }

            // Calcul total (double check)
            // totalAmount is passed as prop.

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    status: 'pending', // Will be updated to 'paid' by webhook or after success
                    total_amount: Math.round(totalAmount * 100), // cents
                    recipient_name: recipientName,
                    recipient_address: address,
                    delivery_date: new Date().toISOString() // Default to today/now for MVP or add date picker
                })
                .select()
                .single()

            if (orderError) throw new Error(orderError.message)

            // 2. Insert Order Items
            if (items.length > 0) {
                const orderItems = items.map(item => ({
                    order_id: order.id,
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price_at_purchase: Math.round(item.price * 100) // cents
                }))

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems)

                if (itemsError) console.error('Error creating items', itemsError)
                // We continue even if items fail for MVP, but ideally should rollback.
            }

            // Proceed to Payment
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
            });

            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An unexpected error occurred.");
            } else {
                setMessage("An unexpected error occurred.");
            }

        } catch (err: any) {
            console.error(err)
            setMessage(err.message || "Erreur lors de la création de la commande.")
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
                    <input name="firstName" type="text" placeholder="Prénom" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
                    <input name="lastName" type="text" placeholder="Nom" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
                </div>
                <input name="address" type="text" placeholder="Adresse complète" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />

                <div className="grid grid-cols-2 gap-4">
                    <input name="zipCode" type="text" placeholder="Code Postal" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
                    <input name="city" type="text" placeholder="Ville" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" required />
                </div>

                <textarea placeholder="Message pour la carte (Optionnel)" className="w-full p-3 h-24 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" />
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
