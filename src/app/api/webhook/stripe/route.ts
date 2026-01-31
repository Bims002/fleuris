
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/components/emails/order-confirmation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia',
    typescript: true,
});

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;
    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            // Fallback for local testing without webhook secret if strict verification isn't possible
            // But for production safety, we should error or warn.
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
        process.env.SUPABASE_SERVICE_ROLE_KEY as string // MUST use Service Role for admin updates bypass RLS
    );

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;

            // Metadata was set during checkout creation
            const orderId = session.metadata?.orderId;

            if (orderId) {
                console.log(`✅ Payment successful for Order ${orderId}`);

                const { error } = await supabase
                    .from("orders")
                    .update({
                        status: "paid",
                        stripe_payment_id: session.payment_intent as string
                    })
                    .eq("id", orderId);

                if (error) {
                    console.error(`❌ Error updating order ${orderId}:`, error);
                    return new NextResponse("Database Error", { status: 500 });
                }

                // Send Email Notification
                try {
                    const customerEmail = session.customer_details?.email;
                    const customerName = session.customer_details?.name || 'Client';

                    if (customerEmail) {
                        await resend.emails.send({
                            from: 'Fleuris <onboarding@resend.dev>', // Default testing domain
                            to: customerEmail,
                            subject: 'Confirmation de votre commande Fleuris 🌸',
                            react: OrderConfirmationEmail({
                                orderId,
                                customerName,
                                totalAmount: session.amount_total || 0
                            })
                        });
                        console.log(`📧 Email sent to ${customerEmail}`);
                    }
                } catch (emailError) {
                    console.error("❌ Error sending email:", emailError);
                    // Don't fail the webhook if email fails, just log it
                }
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse("Received", { status: 200 });
}
