import * as React from 'react';

interface OrderShippedEmailProps {
    orderId: string;
    customerName: string;
    recipientName: string;
    deliveryDate: string;
}

export const OrderShippedEmail: React.FC<OrderShippedEmailProps> = ({
    orderId,
    customerName,
    recipientName,
    deliveryDate,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#1f2937', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#9333ea', textAlign: 'center' }}>Votre commande est en route ! 🚚</h1>
        <p>Bonjour {customerName},</p>
        <p>Bonne nouvelle ! Votre commande <strong>#{orderId.slice(0, 8)}</strong> a été confiée à notre équipe de livraison.</p>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', margin: '20px 0' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Détails de la livraison</h3>
            <p style={{ margin: '5px 0' }}><strong>Destinataire :</strong> {recipientName}</p>
            <p style={{ margin: '5px 0' }}><strong>Date de livraison prévue :</strong> {new Date(deliveryDate).toLocaleDateString()}</p>
        </div>

        <p>Nous faisons tout notre possible pour que ce moment soit parfait.</p>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${orderId}`} style={{ backgroundColor: '#9333ea', color: 'white', padding: '12px 24px', borderRadius: '9999px', textDecoration: 'none', fontWeight: 'bold' }}>
                Suivre ma commande
            </a>
        </div>

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
        <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
            Merci de votre confiance,<br />
            L'équipe Fleuris
        </p>
    </div>
);
