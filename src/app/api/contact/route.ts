
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { ContactSubmissionEmail } from "@/components/emails/contact-submission";
import { contactSchema } from "@/lib/validations";
import { render } from '@react-email/render';
import * as React from 'react';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = contactSchema.parse(body);

        const notificationEmail = process.env.NOTIFICATION_EMAIL || 'bjimeme@gmail.com';

        const emailElement = React.createElement(ContactSubmissionEmail, {
            name: validatedData.name,
            email: validatedData.email,
            subject: validatedData.subject,
            message: validatedData.message,
        });

        const emailHtml = await render(emailElement);

        await resend.emails.send({
            from: 'Fleuris <site@fleuris.store>',
            to: notificationEmail,
            subject: `Nouveau message: ${validatedData.subject}`,
            html: emailHtml,
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Contact API Error:', error);
        return new NextResponse(
            JSON.stringify({ error: error.message || 'Failed to send message' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
