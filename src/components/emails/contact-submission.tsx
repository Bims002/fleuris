import * as React from 'react';

interface ContactSubmissionEmailProps {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const ContactSubmissionEmail: React.FC<ContactSubmissionEmailProps> = ({
    name,
    email,
    subject,
    message,
}) => (
    <html>
        <head>
            <meta charSet="utf-8" />
        </head>
        <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #9333ea', paddingBottom: '20px' }}>
                <h1 style={{ color: '#9333ea', margin: '0', fontSize: '28px' }}>Nouveau message de contact 📩</h1>
            </div>

            <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>De :</strong> {name}</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>Email :</strong> {email}</p>
                <p style={{ margin: '0' }}><strong>Sujet :</strong> {subject}</p>
            </div>

            <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fff' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Message :</h3>
                <p style={{ margin: '0', whiteSpace: 'pre-wrap' }}>{message}</p>
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                <p>Fleuris - Notification Formulaire de Contact</p>
            </div>
        </body>
    </html>
);
