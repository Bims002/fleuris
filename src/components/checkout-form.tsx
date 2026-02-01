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
import { Loader2 } from 'lucide-react';
import { getMinDeliveryDate } from '@/lib/date-utils';

// Schéma de validation pour le checkout
const checkoutFormSchema = z.object({
    firstName: z.string()
        .min(2, 'Le prénom doit contenir au moins 2 caractères')
        .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
    lastName: z.string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    email: z.string()
        .email('Adresse email invalide'),
    address: z.string()
        .min(5, 'L\'adresse doit contenir au moins 5 caractères')
        .max(200, 'L\'adresse ne peut pas dépasser 200 caractères'),
    city: z.string()
        .min(2, 'La ville doit contenir au moins 2 caractères')
        .max(100, 'La ville ne peut pas dépasser 100 caractères'),
    zipCode: z.string()
        .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres requis)'),
    phone: z.string()
        .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro invalide (ex: 0612345678)')
        .optional()
        .or(z.literal('')),
    // Nouveaux champs de livraison
    deliveryDate: z.string()
        .min(1, 'La date de livraison est requise')
        .refine((date) => {
            const selected = new Date(date)
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)
            selected.setHours(0, 0, 0, 0)
            return selected >= tomorrow
        }, { message: 'La livraison doit être prévue au moins 24h à l\'avance' })
        .refine((date) => {
            const selected = new Date(date)
            return selected.getDay() !== 0 // 0 = dimanche
        }, { message: 'Pas de livraison le dimanche' }),
    deliveryTime: z.enum(['morning', 'afternoon'] as const),
    cardMessage: z.string()
        .max(200, 'Le message ne peut pas dépasser 200 caractères')
        .optional()
        .or(z.literal('')),
})

type CheckoutFormData = z.infer<typeof checkoutFormSchema>

export function CheckoutForm({ totalAmount }: { totalAmount: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const { clearCart, items } = useCart();

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

    const onSubmit = async (data: CheckoutFormData) => {
        if (!stripe || !elements) {
            return;
        }

        try {
            const supabase = createClient()

            // Get current user (optional - guest checkout allowed)
            const { data: { user } } = await supabase.auth.getUser()

            const recipientName = `${data.firstName} ${data.lastName}`
            const address = `${data.address}, ${data.zipCode} ${data.city}`

            // Create Order in Supabase with new fields
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null, // Allow null for guest checkout
                    // recipient_email: data.email, // TODO: Add after running migration
                    status: 'pending',
                    total_amount: Math.round(totalAmount * 100), // cents
                    recipient_name: recipientName,
                    recipient_address: address,
                    delivery_date: data.deliveryDate,
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Message d'erreur global */}
            {message && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{message}</p>
                </div>
            )}

            {/* Informations de livraison */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Informations de livraison</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                        label="Prénom"
                        type="text"
                        placeholder="Jean"
                        required
                        disabled={isSubmitting}
                        error={errors.firstName}
                        {...register('firstName')}
                    />

                    <FormInput
                        label="Nom"
                        type="text"
                        placeholder="Dupont"
                        required
                        disabled={isSubmitting}
                        error={errors.lastName}
                        {...register('lastName')}
                    />
                </div>

                <FormInput
                    label="Email"
                    type="email"
                    placeholder="jean@exemple.com"
                    required
                    disabled={isSubmitting}
                    error={errors.email}
                    {...register('email')}
                />

                <FormInput
                    label="Adresse"
                    type="text"
                    placeholder="123 Rue de la Paix"
                    required
                    disabled={isSubmitting}
                    error={errors.address}
                    {...register('address')}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                        label="Code postal"
                        type="text"
                        placeholder="75001"
                        required
                        disabled={isSubmitting}
                        error={errors.zipCode}
                        {...register('zipCode', {
                            onChange: (e) => {
                                // Validation onChange pour code postal
                                const value = e.target.value
                                if (value && !/^\d{0,5}$/.test(value)) {
                                    e.target.value = value.slice(0, -1)
                                }
                            }
                        })}
                    />

                    <FormInput
                        label="Ville"
                        type="text"
                        placeholder="Paris"
                        required
                        disabled={isSubmitting}
                        error={errors.city}
                        {...register('city')}
                    />
                </div>

                <FormInput
                    label="Téléphone (optionnel)"
                    type="tel"
                    placeholder="0612345678"
                    disabled={isSubmitting}
                    error={errors.phone}
                    {...register('phone')}
                />
            </div>

            {/* Date et créneau de livraison */}
            <div className="space-y-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Date de livraison</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput
                        label="Date souhaitée"
                        type="date"
                        min={getMinDeliveryDate()}
                        required
                        disabled={isSubmitting}
                        error={errors.deliveryDate}
                        {...register('deliveryDate')}
                    />

                    <FormSelect
                        label="Créneau horaire"
                        required
                        disabled={isSubmitting}
                        error={errors.deliveryTime}
                        options={[
                            { value: 'morning', label: 'Matin (9h-12h)' },
                            { value: 'afternoon', label: 'Après-midi (14h-18h)' },
                        ]}
                        {...register('deliveryTime')}
                    />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note :</strong> Les livraisons ne sont pas effectuées le dimanche.
                        Un délai minimum de 24h est requis pour préparer votre commande.
                    </p>
                </div>
            </div>

            {/* Message personnalisé */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Message personnalisé (optionnel)</h3>

                <FormTextarea
                    label="Message pour la carte"
                    rows={4}
                    placeholder="Joyeux anniversaire ! Avec toute mon affection..."
                    disabled={isSubmitting}
                    error={errors.cardMessage}
                    {...register('cardMessage')}
                />

                <div className="flex justify-between items-center text-sm">
                    <p className="text-gray-500">
                        Ce message sera imprimé sur une carte accompagnant votre bouquet
                    </p>
                    <p className={`font-medium ${(cardMessage?.length || 0) > 180 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {cardMessage?.length || 0}/200
                    </p>
                </div>
            </div>

            {/* Paiement Stripe */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Informations de paiement</h3>
                <PaymentElement />
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting || !stripe || !elements}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Traitement en cours...
                    </>
                ) : (
                    `Payer ${totalAmount.toFixed(2)}€`
                )}
            </button>

            <p className="text-center text-xs text-gray-500">
                Paiement sécurisé par Stripe • Vos données sont protégées
            </p>
        </form>
    );
}
