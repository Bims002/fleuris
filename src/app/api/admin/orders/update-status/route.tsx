import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend } from "@/lib/resend";
import { OrderShippedEmail } from "@/components/emails/order-shipped";
import { orderStatusSchema } from "@/lib/validations";
import { apiRateLimiter, getClientIp } from "@/lib/rate-limit";
import React from "react"; // Explicit React import for JSX

export async function POST(req: NextRequest) {
    // Rate limiting
    const ip = getClientIp(req)
    const rateLimitResult = apiRateLimiter.check(ip)

    if (!rateLimitResult.success) {
        return new NextResponse('Too many requests', {
            status: 429,
            headers: {
                'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
            }
        })
    }

    try {
        const body = await req.json();

        // Valider les données avec Zod
        const { orderId, status } = orderStatusSchema.parse(body);

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (updateError) {
            console.error(`❌ Failed to update order ${orderId} to ${status}:`, updateError);
            return new NextResponse("Failed to update status", { status: 500 });
        }

        console.log(`✅ Order ${orderId} status manually updated to ${status} by admin`);

        if (status === 'shipped') {
            try {
                // Déterminer l'email du client
                let clientEmail = order.recipient_email;

                // Si pas d'email dans la commande, tenter de le récupérer via l'ID utilisateur
                if (!clientEmail && order.user_id) {
                    const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
                    clientEmail = authUser?.email;
                }

                if (clientEmail) {
                    await resend.emails.send({
                        from: 'Fleuris <commandes@fleuris.store>',
                        to: clientEmail,
                        subject: 'Votre commande est en route ! 🚚',
                        react: <OrderShippedEmail
                            orderId={order.id}
                            trackingToken={order.tracking_token}
                            customerName={order.recipient_name}
                            recipientName={order.recipient_name}
                            deliveryDate={order.delivery_date}
                        />
                    });
                    console.log(`📧 Shipped email sent to ${clientEmail}`);
                } else {
                    console.warn(`⚠️ No email found for order ${order.id}, skipping notification.`);
                }
            } catch (emailError) {
                console.error("❌ Failed to send email", emailError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        // Erreur de validation Zod
        if (error.name === 'ZodError') {
            return new NextResponse(
                JSON.stringify({ error: 'Validation error', details: error.errors }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
}
