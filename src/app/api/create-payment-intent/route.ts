import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';

export async function POST(request: Request) {
    try {
        const { amount } = await request.json();

        // Verification basique du montant (Minimum 50cts pour Stripe)
        if (!amount || amount < 0.5) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
        }

        // Création du PaymentIntent
        // Note: Dans une vraie app, on recalculerait le montant total depuis la BDD ici
        // pour éviter que le client ne modifie le prix.
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe attend des centimes
            currency: 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Internal Error:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error}` },
            { status: 500 }
        );
    }
}
