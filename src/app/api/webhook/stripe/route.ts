
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation";
import { AdminNewOrderEmail } from "@/components/emails/admin-new-order";
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

    console.log(`🔔 Received Stripe event: ${event.type}`);

    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`💰 PaymentIntent Succeeded: ${paymentIntent.id}`);

            // Find order by payment intent ID
            const { data: orders, error: findError } = await supabase
                .from("orders")
                .select(`
                    *,
                    order_items (
                        *,
                        products (name)
                    )
                `)
                .eq("stripe_payment_id", paymentIntent.id)
                .limit(1);

            if (findError) {
                console.error(`❌ Database error finding order:`, findError);
                return new NextResponse("Database Error", { status: 500 });
            }

            if (!orders || orders.length === 0) {
                console.error(`⚠️ Order not found for stripe_payment_id: ${paymentIntent.id}`);
                // Re-essayer avec metadata ?
                const orderIdFromMetadata = paymentIntent.metadata.orderId;
                if (orderIdFromMetadata) {
                    console.log(`🔍 Attempting to find order by metadata ID: ${orderIdFromMetadata}`);
                    // On pourrait ajouter une logique de retry ici
                }
                return new NextResponse("Order not found", { status: 404 });
            }

            const order = orders[0];
            console.log(`📦 Found Order: ${order.id} (Status: ${order.status})`);

            if (order.status === 'paid') {
                console.log(`ℹ️ Order ${order.id} is already marked as paid. Skipping.`);
                break;
            }

            // Update order status to 'paid'
            const { error: updateError } = await supabase
                .from("orders")
                .update({
                    status: "paid",
                    stripe_payment_id: paymentIntent.id
                })
                .eq("id", order.id);

            if (updateError) {
                console.error(`❌ Error updating order ${order.id}:`, updateError);
                return new NextResponse("Database Error", { status: 500 });
            }

            console.log(`✅ Order ${order.id} status updated to 'paid'`);

            // Deduct stock for each order item
            try {
                console.log(`📉 Starting stock deduction for Order ${order.id}...`);
                const { deductStock } = await import('@/lib/stock-manager');

                for (const item of order.order_items) {
                    try {
                        await deductStock(item.product_id, item.quantity, order.id);
                        console.log(`📦 Stock deducted for product ${item.product_id}: -${item.quantity}`);
                    } catch (stockError: any) {
                        console.error(`❌ Failed to deduct stock for product ${item.product_id}:`, stockError);
                    }
                }
            } catch (error) {
                console.error('❌ Error in stock deduction block:', error);
            }

            // Send confirmation email
            try {
                console.log(`📧 Preparing confirmation email for Order ${order.id}...`);
                let customerEmail = paymentIntent.receipt_email || order.recipient_email;

                if (!customerEmail && order.user_id) {
                    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(order.user_id);
                    customerEmail = authUser?.email;
                }

                if (customerEmail) {
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

                    console.log(`📧 Confirmation email successfully sent to ${customerEmail}`);
                } else {
                    console.warn(`⚠️ No customer email found for Order ${order.id}`);
                }

                // Send notification to admin (SANS notifier le client)
                const adminEmail = process.env.NOTIFICATION_EMAIL || 'bjimeme@gmail.com';
                const adminEmailElement = React.createElement(AdminNewOrderEmail, {
                    orderId: order.id,
                    customerName: order.recipient_name,
                    totalAmount: order.total_amount / 100,
                    items: order.order_items.map((item: any) => ({
                        name: item.products.name,
                        quantity: item.quantity,
                    })),
                });

                const adminEmailHtml = await render(adminEmailElement);

                await resend.emails.send({
                    from: 'Fleuris <alertes@fleuris.store>',
                    to: adminEmail,
                    subject: `Nouvelle commande ! #${order.id.slice(0, 8)} 💰`,
                    html: adminEmailHtml,
                });
                console.log(`📧 Admin notification sent to ${adminEmail}`);
            } catch (emailError) {
                console.error("❌ Error in email sending block:", emailError);
            }
            break;

        default:
            console.log(`ℹ️ Unhandled event type ${event.type}`);
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
}
