import * as React from 'react';

interface AdminNewOrderEmailProps {
    orderId: string;
    customerName: string;
    totalAmount: number;
    items: Array<{
        name: string;
        quantity: number;
    }>;
}

export const AdminNewOrderEmail: React.FC<AdminNewOrderEmailProps> = ({
    orderId,
    customerName,
    totalAmount,
    items,
}) => (
    <html>
        <head>
            <meta charSet="utf-8" />
        </head>
        <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #9333ea', paddingBottom: '20px' }}>
                <h1 style={{ color: '#9333ea', margin: '0', fontSize: '28px' }}>Nouvelle Commande ! 💰</h1>
            </div>

            <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                    Une nouvelle commande vient d'être payée par <strong>{customerName}</strong>.
                </p>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                    ID Commande : #{orderId.slice(0, 8)}<br />
                    Montant total : <strong>{totalAmount.toFixed(2)}€</strong>
                </p>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#333', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Articles commandés</h3>
                <ul style={{ listStyle: 'none', padding: '0', margin: '15px 0' }}>
                    {items.map((item, index) => (
                        <li key={index} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <strong>{item.quantity}x</strong> {item.name}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders`} style={{ backgroundColor: '#9333ea', color: 'white', padding: '14px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                    📦 Gérer la commande
                </a>
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                <p>Fleuris - Notification Système</p>
            </div>
        </body>
    </html>
);
