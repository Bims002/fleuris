'use client'

import React from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart-context";
import { createClient } from "@/utils/supabase/client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormTextarea, FormSelect } from '@/components/ui/form-fields';
import { Loader2, ShieldCheck } from 'lucide-react';
import { getMinDeliveryDate } from '@/lib/date-utils';
import { Honeypot } from '@/components/ui/honeypot';

// Schéma de validation pour le checkout
const checkoutFormSchema = z.object({
    // Recipient
    recipientFirstName: z.string().min(2, 'Le prénom est requis'),
    recipientLastName: z.string().min(2, 'Le nom est requis'),
    recipientPhone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro invalide (ex: 0612345678)'),
    recipientAddress: z.string().min(5, 'L\'adresse est requise'),
    recipientCity: z.string().min(2, 'La ville est requise'),
    recipientZip: z.string().regex(/^\d{5}$/, 'Code postal invalide'),

    // Delivery
    deliveryDate: z.string().min(1, 'Date requise'),
    deliveryTime: z.enum(['morning', 'afternoon'] as const),

    // Message
    cardMessage: z.string().max(200, 'Maximum 200 caractères').optional().or(z.literal('')),

    // Sender (Buyer)
    senderFirstName: z.string().min(2, 'Le prénom est requis'),
    senderLastName: z.string().min(2, 'Le nom est requis'),
    senderEmail: z.string().email('Email invalide'),
    senderPhone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro invalide'),

    website_url: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutFormSchema>

// Helper pour masquer la date au format JJ/MM/AAAA
const maskDate = (value: string) => {
    let v = value.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) {
        return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
        return `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    return v;
}

export function CheckoutForm({ totalAmount, clientSecret }: { totalAmount: number; clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const { items } = useCart();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutFormSchema),
        mode: 'onBlur',
        defaultValues: {
            deliveryTime: 'morning',
        }
    })

    const [message, setMessage] = React.useState<string | null>(null);
    const cardMessage = watch('cardMessage')
    const honey = watch('website_url')

    const onSubmit = async (data: CheckoutFormData) => {
        if (!stripe || !elements) {
            return;
        }

        // Honeypot check
        if (honey) {
            console.warn('Bot detected via honeypot');
            setMessage("Une activité inhabituelle a été détectée. Veuillez rafraîchir la page.");
            return;
        }

        try {
            const supabase = createClient()

            // Get current user (optional - guest checkout allowed)
            const { data: { user } } = await supabase.auth.getUser()

            const recipientName = `${data.recipientFirstName} ${data.recipientLastName}`
            const address = `${data.recipientAddress}, ${data.recipientZip} ${data.recipientCity}`
            const senderName = `${data.senderFirstName} ${data.senderLastName}`

            // Generate a simple tracking token
            const trackingToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

            // Extract PaymentIntent ID from clientSecret
            const stripePaymentId = clientSecret.split('_secret')[0]

            // Create Order in Supabase
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    recipient_email: data.senderEmail, // Buyer email for receipt
                    tracking_token: trackingToken,
                    stripe_payment_id: stripePaymentId,
                    status: 'pending',
                    total_amount: Math.round(totalAmount * 100), // cents
                    recipient_name: recipientName,
                    recipient_address: address,
                    recipient_phone: data.recipientPhone,
                    sender_name: senderName,
                    sender_phone: data.senderPhone,
                    delivery_date: data.deliveryDate.split('/').reverse().join('-'), // YYYY-MM-DD
                    delivery_time: data.deliveryTime,
                    card_message: data.cardMessage || null,
                })
                .select()
                .single()

            if (orderError) throw new Error(orderError.message)

            // Insert Order Items
            if (items.length > 0) {
                const orderItems = items.map(item => ({
                    order_id: order.id,
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price_at_purchase: Math.round(item.price * 100)
                }))

                const { error: itemsError } = await supabase
                    .from('order_items')
                    .insert(orderItems)

                if (itemsError) console.error('Error creating items', itemsError)
            }

            // Proceed to Payment
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`,
                },
            });

            if (error) {
                if (error.type === "card_error" || error.type === "validation_error") {
                    setMessage(error.message || "Une erreur est survenue.");
                } else {
                    setMessage("Une erreur inattendue est survenue.");
                }
            }

        } catch (error: any) {
            console.error('Checkout error:', error)
            setMessage(error.message || "Une erreur est survenue.")
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            <Honeypot {...register('website_url')} />

            {message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium text-center">{message}</p>
                </div>
            )}

            <div className="space-y-8">
                {/* 1. Destinataire (Pour la livraison) */}
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">1</span>
                        Informations du Destinataire
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Prénom du destinataire"
                            {...register('recipientFirstName')}
                            error={errors.recipientFirstName}
                            placeholder="Julie"
                            required
                        />
                        <FormInput
                            label="Nom du destinataire"
                            {...register('recipientLastName')}
                            error={errors.recipientLastName}
                            placeholder="Dupont"
                            required
                        />
                    </div>
                    <div className="mt-4 space-y-4">
                        <FormInput
                            label="Adresse de livraison"
                            {...register('recipientAddress')}
                            error={errors.recipientAddress}
                            placeholder="123 rue de la Paix"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Ville"
                                {...register('recipientCity')}
                                error={errors.recipientCity}
                                placeholder="Paris"
                                required
                            />
                            <FormInput
                                label="Code Postal"
                                {...register('recipientZip')}
                                error={errors.recipientZip}
                                placeholder="75000"
                                required
                            />
                        </div>
                        <FormInput
                            label="Téléphone du destinataire"
                            {...register('recipientPhone')}
                            error={errors.recipientPhone}
                            placeholder="06 12 34 56 78"
                            required
                        />
                    </div>
                </section>

                {/* 2. Détails de Livraison */}
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">2</span>
                        Date & Moment de Livraison
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Date de livraison"
                            {...register('deliveryDate')}
                            placeholder="JJ/MM/AAAA"
                            error={errors.deliveryDate}
                            required
                            onChange={(e) => {
                                const masked = maskDate(e.target.value)
                                e.target.value = masked
                                register('deliveryDate').onChange(e)
                            }}
                        />

                        <FormSelect
                            label="Moment souhaité"
                            {...register('deliveryTime')}
                            error={errors.deliveryTime}
                            required
                            options={[
                                { label: 'Matin (8h - 13h)', value: 'morning' },
                                { label: 'Après-midi (14h - 19h)', value: 'afternoon' }
                            ]}
                        />
                    </div>
                </section>

                {/* 3. Message */}
                <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">3</span>
                        Message sur la Carte
                    </h3>
                    <FormTextarea
                        label="Votre mot pour le destinataire"
                        {...register('cardMessage')}
                        placeholder="Écrivez un petit mot doux pour accompagner vos fleurs..."
                        rows={3}
                        error={errors.cardMessage}
                    />
                    <div className="flex justify-between items-center text-[10px] md:text-xs mt-1 px-1">
                        <p className="text-gray-700 font-medium">
                            Sera écrit à la main sur une jolie carte.
                        </p>
                        <span className={(cardMessage || '').length > 180 ? "text-orange-600 font-bold" : "text-gray-600"}>
                            {(cardMessage || '').length}/200
                        </span>
                    </div>
                </section>

                {/* 4. Expéditeur (L'acheteur) */}
                <section className="pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">4</span>
                        Informations de l'Expéditeur
                    </h3>
                    <p className="text-sm text-gray-700 mb-6 italic font-medium">
                        Ces informations servent à la facturation et à vous envoyer le reçu de paiement.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Votre Prénom"
                            {...register('senderFirstName')}
                            error={errors.senderFirstName}
                            placeholder="Jean"
                            required
                        />
                        <FormInput
                            label="Votre Nom"
                            {...register('senderLastName')}
                            error={errors.senderLastName}
                            placeholder="Dupont"
                            required
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            label="Votre Email"
                            type="email"
                            {...register('senderEmail')}
                            error={errors.senderEmail}
                            placeholder="jean.dupont@exemple.com"
                            required
                        />
                        <FormInput
                            label="Votre Téléphone"
                            {...register('senderPhone')}
                            error={errors.senderPhone}
                            placeholder="06 12 34 56 78"
                            required
                        />
                    </div>
                </section>

                {/* 5. Paiement */}
                <section className="bg-gray-50 rounded-3xl p-4 md:p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm shadow-md">5</span>
                        Paiement Sécurisé
                    </h3>

                    <div className="p-4 md:p-6 bg-white rounded-2xl shadow-inner border border-gray-100">
                        <PaymentElement options={{ layout: 'tabs' }} />
                    </div>

                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center text-gray-800 font-medium mb-2">
                            <span>Sous-total</span>
                            <span>{totalAmount.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-800 font-medium pb-4 border-b border-gray-100">
                            <span>Livraison</span>
                            <span className="text-green-700 font-bold">Gratuite</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-2">
                            <span>Total</span>
                            <span>{totalAmount.toFixed(2)} €</span>
                        </div>

                        <button
                            type="submit"
                            disabled={!stripe || isSubmitting}
                            className="w-full mt-6 py-4 px-6 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Traitement...</span>
                                </div>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5" />
                                    Payer {totalAmount.toFixed(2)} €
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-gray-700 font-medium mt-4 flex items-center justify-center gap-2">
                            <ShieldCheck size={14} className="text-green-700" />
                            Paiement 100% sécurisé via Stripe
                        </p>
                    </div>
                </section>
            </div>
        </form>
    );
}


