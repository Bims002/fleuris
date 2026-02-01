
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation";
import { render } from '@react-email/render';
import { formatDeliveryDate, formatDeliveryTime } from "@/lib/date-utils";
import * as React from 'react';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature") as string;
    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.warn("STRIPE_WEBHOOK_SECRET is missing.");
            throw new Error("Missing STRIPE_WEBHOOK_SECRET");
        }

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        console.error(`Webhook Signature Error: ${error.message}`);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );

    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object as Stripe.PaymentIntent;

            // Find order by payment intent
            const { data: orders, error: findError } = await supabase
                .from("orders")
                .select(`
                    *,
                    order_items (
                        *,
                        products (name)
                    )
                `)
                .eq("status", "pending")
                .limit(1);

            if (findError || !orders || orders.length === 0) {
                console.error("Order not found for payment intent");
                return new NextResponse("Order not found", { status: 404 });
            }

            const order = orders[0];

            // Update order status
            const { error: updateError } = await supabase
                .from("orders")
                .update({
                    status: "processing",
                    stripe_payment_id: paymentIntent.id
                })
                .eq("id", order.id);

            if (updateError) {
                console.error(`Error updating order ${order.id}:`, updateError);
                return new NextResponse("Database Error", { status: 500 });
            }

            console.log(`✅ Payment successful for Order ${order.id}`);

            // Deduct stock for each order item
            try {
                const { deductStock } = await import('@/lib/stock-manager');

                for (const item of order.order_items) {
                    try {
                        await deductStock(item.product_id, item.quantity, order.id);
                        console.log(`📦 Stock deducted for product ${item.product_id}: -${item.quantity}`);
                    } catch (stockError: any) {
                        console.error(`❌ Failed to deduct stock for product ${item.product_id}:`, stockError);
                        // Continue with other items even if one fails
                    }
                }
            } catch (error) {
                console.error('❌ Error importing stock manager:', error);
                // Don't fail the webhook if stock deduction fails
            }


            // Send confirmation email
            try {
                const customerEmail = paymentIntent.receipt_email || order.recipient_email;

                if (customerEmail) {
                    // Utiliser React.createElement au lieu de JSX dans un fichier .ts
                    const emailElement = React.createElement(OrderConfirmationEmail, {
                        orderNumber: order.id.slice(0, 8),
                        customerName: order.recipient_name,
                        orderDate: new Date(order.created_at).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        deliveryDate: formatDeliveryDate(order.delivery_date),
                        deliveryTime: formatDeliveryTime(order.delivery_time),
                        deliveryAddress: order.recipient_address,
                        trackingToken: order.tracking_token,
                        cardMessage: order.card_message,
                        items: order.order_items.map((item: any) => ({
                            name: item.products.name,
                            quantity: item.quantity,
                            price: item.price_at_purchase / 100
                        })),
                        totalAmount: order.total_amount / 100
                    });

                    const emailHtml = await render(emailElement);

                    await resend.emails.send({
                        from: 'Fleuris <commandes@fleuris.store>',
                        to: customerEmail,
                        subject: `Confirmation de votre commande #${order.id.slice(0, 8)} 🌸`,
                        html: emailHtml
                    });

                    console.log(`📧 Confirmation email sent to ${customerEmail}`);
                }
            } catch (emailError) {
                console.error("❌ Error sending email:", emailError);
                // Don't fail the webhook if email fails
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse("Received", { status: 200 });
}
